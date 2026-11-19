using System;                  // Action, Exception
using System.Collections;      // IEnumerator
using Unity.InferenceEngine;   // ModelAsset, Worker, Tensor, TextureConverter
using UnityEngine;             // MonoBehaviour, RenderTexture, Graphics

// Teachable Machine object recognition running inside Unity Inference Engine (port of js/object-detector.js).
// The model is loaded once at startup; checkpoints call Begin/End. Without a model every call is a no-op
// and the visitor can still advance with the dots (same degradation as the web version).
public class ObjectRecognizer : MonoBehaviour
{
    public enum Status { Idle, Scanning, Confirmed } // #det-feedback data-status

    [SerializeField] ModelAsset model;                         // teachable_machine.onnx (NCHW RGB 0..1 -> probabilities)
    [SerializeField] string[] labels =                          // metadata.json "labels" order
        { "Ninguno", "PolvoDeMaquillaje", "Labial", "Sombras", "Pintucaritas", "Delineador1", "Delineador2", "BaseDeMaquillaje" };
    [SerializeField] float confidence = 0.78f;                  // _DET_CONFIDENCE
    [SerializeField] float holdSeconds = 1.5f;                  // _DET_HOLD_MS
    [SerializeField] float intervalSeconds = 0.28f;             // _DET_INTERVAL_MS (~3.5 fps)

    const int InputSize = 224;                                  // Teachable Machine image size

    public static ObjectRecognizer Instance { get; private set; } // single instance in Main.unity
    public event Action<Status> StatusChanged;                  // _detSetStatus
    public event Action<string, bool> Prediction;               // best class name, accepted (_detUpdateUI)
    public event Action<float> HoldProgress;                    // _detSetHoldProgress (0..1)

    public bool IsReady => _worker != null;                     // _detReady

    Worker _worker;              // inference worker
    Tensor<float> _input;        // reusable input tensor
    RenderTexture _crop;         // centered square crop of the camera
    string[] _accepted;          // labels that confirm the current checkpoint
    Action _onConfirmed;         // callback when the object was held long enough
    Coroutine _loop;             // detection loop
    float _holdStart = -1f;      // _detHoldStart, -1 = not detected

    // Loads the model once (web initObjectDetector).
    void Awake()
    {
        Instance = this;                                                            // checkpoints find it here
        if (model == null) { Debug.LogWarning("[Detector] No model assigned — recognition disabled."); return; } // degrade
        try
        {
            _worker = new Worker(ModelLoader.Load(model), PickBackend());                         // compile the graph
            _input = new Tensor<float>(new TensorShape(1, 3, InputSize, InputSize));               // [1, 3, 224, 224]
            _crop = new RenderTexture(InputSize, InputSize, 0);                                    // square frame
            Debug.Log("[Detector] Model ready — " + labels.Length + " classes, backend " + PickBackend()); // web log
        }
        catch (Exception e)
        {
            Debug.LogError("[Detector] Model failed to load: " + e.Message); // web console.error
            _worker = null;                                                  // stay disabled
        }
    }

    // WebGL has no compute shaders, so it runs on pixel shaders; desktop uses compute when available.
    static BackendType PickBackend()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        return BackendType.GPUPixel;                                                               // WebGL2 fragment shaders
#else
        return SystemInfo.supportsComputeShaders ? BackendType.GPUCompute : BackendType.GPUPixel;  // fastest available
#endif
    }

    // Starts analysing the camera for one of the accepted labels (web startDetecting). Returns false if unavailable.
    public bool Begin(string[] acceptedLabels, Action onConfirmed)
    {
        End();                                                                      // clear a previous loop
        if (!IsReady || acceptedLabels == null || acceptedLabels.Length == 0)       // model missing or nothing to look for
        {
            Debug.LogWarning("[Detector] Not available — detection loop skipped."); // web warning
            return false;
        }
        _accepted = acceptedLabels;                                                 // what counts as correct
        _onConfirmed = onConfirmed;                                                 // checkpoint exit
        _holdStart = -1f;                                                           // nothing detected yet
        SetStatus(Status.Scanning);                                                 // show the feedback widget
        _loop = StartCoroutine(DetectLoop());                                       // setInterval
        return true;
    }

    // Stops the loop and resets the feedback (web stopDetecting). Safe to call when idle.
    public void End()
    {
        if (_loop != null) { StopCoroutine(_loop); _loop = null; } // clearInterval
        _holdStart = -1f;                                           // reset hold
        HoldProgress?.Invoke(0f);                                   // empty bar
        SetStatus(Status.Idle);                                     // hide widget
    }

    // Classifies a camera frame every interval and confirms after a continuous hold.
    IEnumerator DetectLoop()
    {
        var wait = new WaitForSecondsRealtime(intervalSeconds);              // ~3.5 analyses per second
        while (true)
        {
            yield return wait;                                               // interval tick
            var camera = HandTrackingService.GetCameraTexture();             // same camera as hand tracking
            if (camera == null || camera.width <= 16) continue;              // camera not ready yet

            CropToSquare(camera);                                            // TM center crop
            TextureConverter.ToTensor(_crop, _input, new TextureTransform()); // RGB 0..1, NCHW
            _worker.Schedule(_input);                                        // run the network
            var output = _worker.PeekOutput() as Tensor<float>;              // probabilities on the device
            var awaiter = output.ReadbackAndCloneAsync().GetAwaiter();       // non-blocking GPU readback
            while (!awaiter.IsCompleted) yield return null;                  // wait without stalling the frame
            using var probabilities = awaiter.GetResult();                   // CPU copy
            var p = probabilities.DownloadToArray();                         // float[8]

            int best = 0;                                                    // predictions.reduce(max)
            for (int i = 1; i < p.Length; i++) if (p[i] > p[best]) best = i;
            string label = best < labels.Length ? labels[best] : "?";        // className
            bool detected = Array.IndexOf(_accepted, label) >= 0 && p[best] >= confidence; // accepted and confident
            Prediction?.Invoke(label, detected);                             // _detUpdateUI

            if (!detected)                                                   // lost or wrong object
            {
                if (_holdStart >= 0f) { _holdStart = -1f; HoldProgress?.Invoke(0f); } // restart the hold
                continue;
            }

            float now = Time.unscaledTime;                                   // hold clock
            if (_holdStart < 0f) _holdStart = now;                           // first positive frame
            HoldProgress?.Invoke(Mathf.Min((now - _holdStart) / holdSeconds, 1f)); // fill the bar
            if (now - _holdStart < holdSeconds) continue;                    // keep holding

            var callback = _onConfirmed;                                     // remember before clearing
            End();                                                           // stopDetecting()
            SetStatus(Status.Confirmed);                                     // _detSetStatus('confirmed')
            Debug.Log("[Detector] Object confirmed: " + label + " (" + (p[best] * 100f).ToString("F0") + "%)"); // web log
            callback?.Invoke();                                              // onDetected()
            yield break;                                                     // loop finished
        }
    }

    // Copies the centered square of the camera into the 224 x 224 input texture.
    void CropToSquare(Texture camera)
    {
        float aspect = (float)camera.width / camera.height;                          // camera proportions
        var scale = aspect > 1f ? new Vector2(1f / aspect, 1f) : new Vector2(1f, aspect); // visible fraction
        var offset = new Vector2((1f - scale.x) * 0.5f, (1f - scale.y) * 0.5f);      // centered
        Graphics.Blit(camera, _crop, scale, offset);                                 // crop + resize (bilinear)
    }

    // Raises StatusChanged.
    void SetStatus(Status status)
    {
        StatusChanged?.Invoke(status); // data-status attribute
    }

    // Releases GPU resources.
    void OnDestroy()
    {
        _worker?.Dispose();                      // network
        _input?.Dispose();                       // tensor
        if (_crop != null) _crop.Release();      // render texture
    }
}
