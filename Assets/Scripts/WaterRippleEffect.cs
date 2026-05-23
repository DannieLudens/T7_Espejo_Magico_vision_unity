using System.Collections.Concurrent;
using UnityEngine;
using UnityEngine.UI;
using Mediapipe.Tasks.Vision.HandLandmarker;

[RequireComponent(typeof(RawImage))]
public class WaterRippleEffect : MonoBehaviour
{
    [Header("Shader")]
    public Shader rippleShader;
    [Range(0.90f, 0.999f)] public float damping           = 0.97f;
    [Range(0.001f, 0.05f)] public float rippleStrength    = 0.02f;
    [Range(0.01f, 0.20f)]  public float interactionRadius = 0.06f;
    [Range(0.1f,  1.5f)]   public float rippleAmplitude   = 1.0f;
    public int  bufferSize        = 256;
    public bool useMouse          = true;
    public int  handLandmarkIndex = 9;

    private RawImage      _rawImage;
    private Material      _mat, _splashMat;
    private RenderTexture _bufA, _bufB, _outputRT;
    private Texture       _camTex;
    private bool          _ready = false;
    private int           _frame = 0;
    private ConcurrentQueue<Vector2> _queue = new ConcurrentQueue<Vector2>();
    private Vector2? _touch = null;

    void OnEnable()  => Mediapipe.Unity.Sample.HandLandmarkDetection.PinzaEventBus.OnResultado += OnHand;
    void OnDisable() => Mediapipe.Unity.Sample.HandLandmarkDetection.PinzaEventBus.OnResultado -= OnHand;

    void Start()
    {
        _rawImage = GetComponent<RawImage>();
        if (rippleShader == null) rippleShader = Shader.Find("Custom/WaterRippleEffect");
        if (rippleShader == null) { Debug.LogError("[WR] Shader null"); enabled = false; return; }
        _mat = new Material(rippleShader) { hideFlags = HideFlags.HideAndDontSave };
        var desc = new RenderTextureDescriptor(bufferSize, bufferSize, RenderTextureFormat.RFloat, 0) { sRGB = false };
        _bufA = new RenderTexture(desc); _bufA.Create();
        _bufB = new RenderTexture(desc); _bufB.Create();
        Graphics.Blit(Texture2D.blackTexture, _bufA);
        Graphics.Blit(Texture2D.blackTexture, _bufB);
        Debug.Log("[WR] Start OK");
    }

    void TryInit()
    {
        _frame++;
        var mpScreen = FindObjectOfType<Mediapipe.Unity.Screen>();
        Texture tex = mpScreen?.texture;
        if (_frame % 60 == 0)
            Debug.Log("[WR] TryInit f=" + _frame + " mpTex=" + (tex != null ? tex.GetType().Name + " " + tex.width : "null"));
        if (tex is RenderTexture) return;
        if (tex == null || tex.width <= 16) {
            foreach (var ri in FindObjectsOfType<RawImage>())
                if (ri.texture is WebCamTexture wct && wct.isPlaying && wct.width > 16) { tex = wct; break; }
        }
        if (tex == null || tex.width <= 16 || tex is RenderTexture) return;
        _camTex = tex;
        _outputRT = new RenderTexture(tex.width, tex.height, 0, RenderTextureFormat.ARGB32);
        _outputRT.Create();
        _rawImage.texture = _outputRT;
        _ready = true;
        Debug.Log("[WR] READY camTex=" + tex.GetType().Name + " " + tex.width + "x" + tex.height);
    }

    void LateUpdate()
    {
        if (!_ready) { TryInit(); return; }
        _frame++;
        while (_queue.TryDequeue(out var uv)) _touch = uv;
        if (useMouse && Input.GetMouseButton(0)) {
            var uv = MouseUV();
            if (uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1) _touch = uv;
        }
        if (_touch.HasValue) {
            if (_frame % 30 == 0) Debug.Log("[WR] Splash " + _touch.Value);
            Splash(_touch.Value); _touch = null;
        }
        _mat.SetTexture("_CurrentBuffer", _bufA);
        _mat.SetTexture("_PrevBuffer",    _bufB);
        _mat.SetFloat("_Damping", damping);
        var tmp = RenderTexture.GetTemporary(_bufA.descriptor);
        Graphics.Blit(null, tmp, _mat, 0);
        Graphics.Blit(_bufA, _bufB);
        Graphics.Blit(tmp, _bufA);
        RenderTexture.ReleaseTemporary(tmp);
        if (_camTex != null) {
            _mat.SetTexture("_MainTex",       _camTex);
            _mat.SetTexture("_CurrentBuffer", _bufA);
            _mat.SetFloat("_RippleStr", rippleStrength);
            Graphics.Blit(_camTex, _outputRT, _mat, 1);
        } else if (_frame % 60 == 0) Debug.LogWarning("[WR] _camTex null en LateUpdate");
    }

    void Splash(Vector2 uv)
    {
        var prev = RenderTexture.active;
        RenderTexture.active = _bufA;
        GL.PushMatrix();
        GL.LoadPixelMatrix(0, bufferSize, bufferSize, 0);
        float px = uv.x * bufferSize;
        float py = (1f - uv.y) * bufferSize;
        float r  = interactionRadius * bufferSize;
        SplashMat().SetPass(0);
        GL.Begin(GL.QUADS);
        GL.Color(new Color(rippleAmplitude, rippleAmplitude, rippleAmplitude, 1));
        GL.Vertex3(px-r, py-r, 0); GL.Vertex3(px+r, py-r, 0);
        GL.Vertex3(px+r, py+r, 0); GL.Vertex3(px-r, py+r, 0);
        GL.End();
        GL.PopMatrix();
        RenderTexture.active = prev;
    }

    Vector2 MouseUV()
    {
        var rt = _rawImage.rectTransform;
        var cam = _rawImage.canvas?.worldCamera;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(rt, Input.mousePosition, cam, out var local);
        var rect = rt.rect;
        return new Vector2((local.x - rect.x) / rect.width, (local.y - rect.y) / rect.height);
    }

    void OnHand(HandLandmarkerResult r)
    {
        if (r.handLandmarks == null || r.handLandmarks.Count == 0) return;
        var lm = r.handLandmarks[0].landmarks;
        if (lm.Count <= handLandmarkIndex) return;
        var p = lm[handLandmarkIndex];
        _queue.Enqueue(new Vector2(p.x, 1f - p.y));
    }

    Material SplashMat()
    {
        if (_splashMat == null) {
            _splashMat = new Material(Shader.Find("Hidden/Internal-Colored")) { hideFlags = HideFlags.HideAndDontSave };
            _splashMat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.One);
            _splashMat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.Zero);
            _splashMat.SetInt("_Cull",     (int)UnityEngine.Rendering.CullMode.Off);
            _splashMat.SetInt("_ZWrite",   0);
        }
        return _splashMat;
    }

    void OnDestroy()
    {
        if (_mat       != null) Destroy(_mat);
        if (_splashMat != null) Destroy(_splashMat);
        if (_bufA      != null) { _bufA.Release();     Destroy(_bufA); }
        if (_bufB      != null) { _bufB.Release();     Destroy(_bufB); }
        if (_outputRT  != null) { _outputRT.Release(); Destroy(_outputRT); }
    }
}
