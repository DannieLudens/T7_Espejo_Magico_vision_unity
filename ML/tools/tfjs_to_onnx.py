"""Convert the Teachable Machine TF.js layers model (MobileNetV2 + dense head) to ONNX without TensorFlow.

Rebuilds the Keras graph in PyTorch from model.json + weights.bin, then exports ONNX for Unity Inference Engine.
The exported model takes NCHW RGB in [0, 1] (Unity TextureConverter output) and applies the
Teachable Machine normalization ([-1, 1]) inside the graph.

Usage: python ML/tools/tfjs_to_onnx.py ML/TeachableMachine/tfjs ML/TeachableMachine/onnx/teachable_machine.onnx
"""
import json   # model.json parsing
import sys    # command line arguments
from pathlib import Path  # paths

import numpy as np                 # weight buffers
import torch                       # graph rebuild and ONNX export
import torch.nn.functional as F    # functional ops (pad, conv, relu)


def load_weights(folder):
    """Reads every tensor of weights.bin into a dict name -> numpy array, following the manifest order."""
    manifest = json.loads((folder / "model.json").read_text())["weightsManifest"]  # weight groups
    tensors = {}                                                                     # name -> array
    for group in manifest:                                                           # usually a single group
        data = b"".join((folder / p).read_bytes() for p in group["paths"])          # concatenated shards
        offset = 0                                                                   # read cursor
        for spec in group["weights"]:                                                # in manifest order
            count = int(np.prod(spec["shape"])) if spec["shape"] else 1             # number of floats
            arr = np.frombuffer(data, dtype=np.float32, count=count, offset=offset)  # float32 only in TM models
            tensors[spec["name"]] = arr.reshape(spec["shape"]).copy()                # keep Keras layout
            offset += count * 4                                                      # 4 bytes per float32
    return tensors


def same_padding(size, kernel, stride):
    """TensorFlow 'same' padding (pad_before, pad_after) for one spatial axis."""
    out = -(-size // stride)                                      # ceil(size / stride)
    total = max((out - 1) * stride + kernel - size, 0)            # total padding needed
    return total // 2, total - total // 2                         # TF puts the extra pixel after


class KerasGraph(torch.nn.Module):
    """Evaluates the functional Keras MobileNetV2 + GlobalAveragePooling + Dense head in NCHW."""

    def __init__(self, folder):
        super().__init__()
        topo = json.loads((folder / "model.json").read_text())["modelTopology"]   # Keras topology
        outer = topo["config"]["layers"]                                           # [feature extractor, head]
        body = outer[0]["config"]["layers"]                                         # [functional model, GAP]
        self.graph = body[0]["config"]                                              # functional MobileNetV2
        self.head = outer[1]["config"]["layers"]                                    # Dense layers
        self.w = {k: torch.from_numpy(v) for k, v in load_weights(folder).items()}  # weights as tensors

    def conv(self, x, name, cfg, depthwise):
        """Conv2D / DepthwiseConv2D with Keras padding semantics."""
        key = "depthwise_kernel" if depthwise else "kernel"                        # weight naming
        k = self.w[f"{name}/{key}"]                                                 # [kh, kw, in, out|mult]
        stride = cfg["strides"]                                                     # [sh, sw]
        if cfg["padding"] == "same":                                                # asymmetric TF padding
            ph = same_padding(x.shape[2], k.shape[0], stride[0])                    # height
            pw = same_padding(x.shape[3], k.shape[1], stride[1])                    # width
            x = F.pad(x, (pw[0], pw[1], ph[0], ph[1]))                              # left, right, top, bottom
        if depthwise:
            weight = k.permute(2, 3, 0, 1).reshape(-1, 1, k.shape[0], k.shape[1])   # [in*mult, 1, kh, kw]
            groups = x.shape[1]                                                     # one group per channel
        else:
            weight = k.permute(3, 2, 0, 1)                                          # [out, in, kh, kw]
            groups = 1                                                              # regular convolution
        bias = self.w.get(f"{name}/bias") if cfg.get("use_bias") else None          # optional bias
        return F.conv2d(x, weight, bias, stride=tuple(stride), groups=groups)       # convolution

    def batch_norm(self, x, name, cfg):
        """Inference BatchNormalization over the channel axis."""
        mean = self.w[f"{name}/moving_mean"]                                        # running mean
        var = self.w[f"{name}/moving_variance"]                                     # running variance
        gamma = self.w.get(f"{name}/gamma", torch.ones_like(mean))                  # scale (center/scale flags)
        beta = self.w.get(f"{name}/beta", torch.zeros_like(mean))                   # offset
        return F.batch_norm(x, mean, var, gamma, beta, False, 0.0, cfg["epsilon"])  # eval mode

    def forward(self, rgb01):
        """rgb01: [N, 3, 224, 224] in [0, 1] -> class probabilities [N, classes]."""
        values = {}                                                                 # layer name -> output
        x = rgb01 * 2.0 - 1.0                                                       # Teachable Machine: (p - 127.5) / 127.5
        for layer in self.graph["layers"]:                                          # topological order in Keras JSON
            cls, name, cfg = layer["class_name"], layer["name"], layer["config"]    # layer description
            inputs = [values[n[0]] for n in layer["inbound_nodes"][0]] if layer["inbound_nodes"] else [x] # inbound tensors
            if cls == "InputLayer":
                out = x                                                             # graph input
            elif cls == "ZeroPadding2D":
                (t, b), (l, r) = cfg["padding"]                                     # ((top, bottom), (left, right))
                out = F.pad(inputs[0], (l, r, t, b))                                # zero padding
            elif cls == "Conv2D":
                out = self.conv(inputs[0], name, cfg, depthwise=False)              # standard conv
            elif cls == "DepthwiseConv2D":
                out = self.conv(inputs[0], name, cfg, depthwise=True)               # depthwise conv
            elif cls == "BatchNormalization":
                out = self.batch_norm(inputs[0], name, cfg)                         # BN
            elif cls == "ReLU":
                out = torch.clamp(inputs[0], 0.0, cfg["max_value"]) if cfg.get("max_value") else F.relu(inputs[0]) # ReLU6
            elif cls == "Add":
                out = inputs[0]                                                     # residual sum
                for extra in inputs[1:]:
                    out = out + extra
            else:
                raise ValueError(f"Unsupported layer {cls} ({name})")              # fail loudly
            values[name] = out                                                      # store for later layers
        y = values[self.graph["output_layers"][0][0]].mean(dim=(2, 3))             # GlobalAveragePooling2D
        for dense in self.head:                                                     # Dense head
            name, cfg = dense["config"]["name"], dense["config"]                    # layer description
            y = y @ self.w[f"{name}/kernel"]                                        # [in, out] matmul
            if cfg.get("use_bias"):
                y = y + self.w[f"{name}/bias"]                                      # bias
            if cfg["activation"] == "relu":
                y = F.relu(y)                                                       # hidden activation
            elif cfg["activation"] == "softmax":
                y = torch.softmax(y, dim=1)                                         # class probabilities
        return y


def main():
    """Builds the graph, checks it runs and exports ONNX."""
    src = Path(sys.argv[1])                                                   # tfjs folder
    dst = Path(sys.argv[2])                                                   # output .onnx
    model = KerasGraph(src).eval()                                            # inference mode
    dummy = torch.rand(1, 3, 224, 224)                                        # NCHW sample in [0, 1]
    with torch.no_grad():
        probs = model(dummy)                                                  # sanity run
    print("output shape:", tuple(probs.shape), "sum:", float(probs.sum()))    # should be (1, 8) and 1.0
    dst.parent.mkdir(parents=True, exist_ok=True)                             # create output folder
    torch.onnx.export(model, dummy, str(dst), input_names=["image"], output_names=["probabilities"],
                      opset_version=15, dynamo=False)                          # opset supported by Inference Engine
    print("exported", dst)


if __name__ == "__main__":
    main()
