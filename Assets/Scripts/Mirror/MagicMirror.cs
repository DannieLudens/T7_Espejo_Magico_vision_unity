using UnityEngine;    // MonoBehaviour, RenderTexture, Graphics, Material
using UnityEngine.UI; // RawImage

// Water ripple magic mirror (port of the GPU mode of js/magic-mirror.js): a 160x120 wave simulation
// ping-pongs between three float render textures and refracts the mirrored webcam into a 640x480 canvas
// that the RawImage stretches over the whole scene, like the web <canvas>.
public class MagicMirror : MonoBehaviour
{
    public const int WorkWidth = 640;   // MM_WORK_W (canvas size)
    public const int WorkHeight = 480;  // MM_WORK_H
    public const int SimWidth = 160;    // MM_SIM_W (wave grid)
    public const int SimHeight = 120;   // MM_SIM_H
    const float SplashThreshold = 1.5f; // MM_SPLASH_THRESHOLD in sim pixels
    const float StepRate = 60f;         // requestAnimationFrame on a 60 Hz kiosk display

    // MM_DEFAULTS; the operator ripple panel (key C) can change them at runtime.
    public static readonly float DefaultDamping = 0.950f, DefaultSplashForce = 150f, DefaultSplashRadius = 3f, DefaultDisplacement = 0.5f, DefaultTint = 0.10f;

    [SerializeField] RawImage output;        // #mirror-canvas
    [SerializeField] Material waveMaterial;  // Hidden/EspejoMagico/MirrorWave
    [SerializeField] Material displayMaterial; // Hidden/EspejoMagico/MirrorDisplay

    public float Damping = DefaultDamping;           // _mmDamping
    public float SplashForce = DefaultSplashForce;   // _mmSplashF
    public float SplashRadius = DefaultSplashRadius; // _mmSplashR
    public float Displacement = DefaultDisplacement; // _mmDisp
    public float Tint = DefaultTint;                 // _mmTint

    RenderTexture[] _wave;       // _wTex (3 height fields)
    int _curr, _prev = 1, _next = 2; // ping-pong indices
    RenderTexture _canvas;       // display target (640x480)
    bool _active;                // between Begin and End
    float _stepClock;            // accumulated time for fixed-rate steps
    Vector2 _finger = new Vector2(-1f, -1f);     // _mmFX/_mmFY in sim pixels (top-down), -1 = no hand
    Vector2 _prevFinger = new Vector2(-1f, -1f); // _mmPrevFX/_mmPrevFY

    // Allocates the textures and starts simulating (web startMagicMirror).
    public void Begin()
    {
        if (_wave == null) Allocate();             // first use
        for (int i = 0; i < 3; i++) Clear(_wave[i]); // still water
        Clear(_canvas);                            // black until the first frame
        _curr = 0; _prev = 1; _next = 2;           // _wCurr/_wPrev/_wNext
        _finger = _prevFinger = new Vector2(-1f, -1f); // no hand yet
        _stepClock = 0f;                           // fresh timing
        output.texture = _canvas;                  // show the canvas
        _active = true;                            // start the loop
        Debug.Log("[MagicMirror] Iniciado: MODO GPU.");
    }

    // Stops the loop (web stopMagicMirror); the textures are kept for the next visit.
    public void End()
    {
        _active = false;                                // cancelAnimationFrame
        _finger = _prevFinger = new Vector2(-1f, -1f);  // _mmFX = _mmFY = -1
        Debug.Log("[MagicMirror] Detenido.");
    }

    // Converts a screen position to sim pixels over the canvas rect (web _mmHandMove).
    public void SetFinger(Vector2 screenPosition, Camera eventCamera)
    {
        var rect = output.rectTransform;                                                     // canvas element
        RectTransformUtility.ScreenPointToLocalPointInRectangle(rect, screenPosition, eventCamera, out var local); // to local space
        var r = rect.rect;                                                                   // getBoundingClientRect
        float fx = (local.x - r.xMin) / r.width * SimWidth;                                  // (x - left) / width * SIM_W
        float fy = (r.yMax - local.y) / r.height * SimHeight;                                // (y - top) / height * SIM_H (top-down)
        _finger = new Vector2(fx, fy);
    }

    // Forgets the finger so the next touch splashes immediately (web _mmHandLost).
    public void ClearFinger()
    {
        _finger = _prevFinger = new Vector2(-1f, -1f); // no hand
    }

    // Advances the simulation at a fixed 60 Hz and redraws the canvas.
    void Update()
    {
        if (!_active) return;                                     // idle
        _stepClock = Mathf.Min(_stepClock + Time.unscaledDeltaTime, 4f / StepRate); // never more than 4 catch-up steps
        bool stepped = false;                                     // redraw only after a step
        while (_stepClock >= 1f / StepRate)
        {
            _stepClock -= 1f / StepRate;                          // consume one frame
            Step();                                               // wave step pass
            stepped = true;
        }
        if (stepped) Draw();                                      // display pass
    }

    // One wave step with an optional splash under the finger (web _gpuFrame steps 2 and 4).
    void Step()
    {
        bool splash = false;                                                      // uHasSplash
        if (_finger.x >= 0f && _finger.y >= 0f)                                   // hand present
        {
            var d = _finger - _prevFinger;                                        // movement since the last splash
            bool moved = _prevFinger.x < 0f || d.sqrMagnitude >= SplashThreshold * SplashThreshold; // avoid flooding when still
            if (moved)
            {
                waveMaterial.SetVector("_SplashUV", new Vector4(_finger.x / SimWidth, 1f - _finger.y / SimHeight, 0f, 0f)); // y up
                waveMaterial.SetFloat("_SplashF", SplashForce);                   // uSplashF
                waveMaterial.SetFloat("_SplashR", SplashRadius);                  // uSplashR
                _prevFinger = _finger;                                            // remember the splash position
                splash = true;
            }
        }
        waveMaterial.SetFloat("_HasSplash", splash ? 1f : 0f);                    // uHasSplash
        waveMaterial.SetFloat("_Damping", Damping);                               // uDamping
        waveMaterial.SetTexture("_Prev", _wave[_prev]);                           // uPrev
        Graphics.Blit(_wave[_curr], _wave[_next], waveMaterial);                  // uCurr -> next

        int tmp = _prev; _prev = _curr; _curr = _next; _next = tmp;               // ping-pong
    }

    // Refracts the mirrored camera through the current heights into the canvas (web display pass).
    void Draw()
    {
        var camera = HandTrackingService.GetCameraTexture();                      // same webcam as hand tracking
        displayMaterial.SetTexture("_Wave", _wave[_curr]);                        // latest heights
        displayMaterial.SetFloat("_Disp", Displacement);                          // uDisp
        displayMaterial.SetFloat("_Tint", Tint);                                  // uTint
        Graphics.Blit(camera != null ? camera : Texture2D.blackTexture, _canvas, displayMaterial); // camera -> canvas
    }

    // Creates the three height fields and the canvas (web _startGPU).
    void Allocate()
    {
        var format = SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.RFloat) ? RenderTextureFormat.RFloat : RenderTextureFormat.RHalf; // R32F, half float where unsupported
        _wave = new RenderTexture[3];
        for (int i = 0; i < 3; i++)
        {
            _wave[i] = new RenderTexture(SimWidth, SimHeight, 0, format, RenderTextureReadWrite.Linear) // raw heights, no color conversion
            {
                name = "MirrorWave" + i,
                filterMode = FilterMode.Bilinear,   // LINEAR like the web textures
                wrapMode = TextureWrapMode.Clamp    // CLAMP_TO_EDGE
            };
            _wave[i].Create();
        }
        _canvas = new RenderTexture(WorkWidth, WorkHeight, 0, RenderTextureFormat.ARGB32) // 640x480 canvas
        {
            name = "MirrorCanvas",
            filterMode = FilterMode.Bilinear,       // CSS stretches the canvas smoothly
            wrapMode = TextureWrapMode.Clamp
        };
        _canvas.Create();
        waveMaterial.SetVector("_SimSize", new Vector4(SimWidth, SimHeight, 1f / SimWidth, 1f / SimHeight)); // grid constants
        displayMaterial.SetVector("_SimTexel", new Vector4(1f / SimWidth, 1f / SimHeight, WorkWidth, WorkHeight)); // shader constants
    }

    // Fills a render texture with zeros / black.
    static void Clear(RenderTexture target)
    {
        var previous = RenderTexture.active;          // restore afterwards
        RenderTexture.active = target;
        GL.Clear(false, true, Color.clear);           // texImage2D(null) starts at zero
        RenderTexture.active = previous;
    }

    // Frees the GPU memory.
    void OnDestroy()
    {
        if (_wave != null) foreach (var t in _wave) t.Release(); // height fields
        if (_canvas != null) _canvas.Release();                 // canvas
    }
}
