using System.Collections.Generic; // Dictionary
using UnityEngine;                // MonoBehaviour, RenderTexture, GL, Color

// AR makeup overlay painted from face landmarks (port of js/face-filter.js, the photobooth fallback
// when Snap Camera Kit is not available): lips, eyeshadow and blush per presenter preset.
// The overlay is a transparent render texture the size of the camera frame, in mirror view,
// drawn on top of the live view and into the captured photo.
public class MakeupFilter : MonoBehaviour
{
    [SerializeField] Material paintMaterial;   // Hidden/EspejoMagico/MakeupPaint (premultiplied)

    // ── Landmarks (MediaPipe Face Mesh indices) ──────────────
    static readonly int[] LipsOuter = { 61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146 }; // LIPS_OUTER
    static readonly int[] LipsInner = { 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95 }; // LIPS_INNER
    static readonly int[] LeftEye = { 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398 };            // LEFT_EYE
    static readonly int[] RightEye = { 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246 };              // RIGHT_EYE
    static readonly int[] LeftCheek = { 116, 123, 147, 187, 207 };   // LEFT_CHEEK_CENTER
    static readonly int[] RightCheek = { 345, 352, 376, 411, 427 };  // RIGHT_CHEEK_CENTER

    // One makeup look (MAKEUP_PRESETS entry); null parts are skipped.
    class Preset
    {
        public Color? LipsOuter, LipsInner;   // lips.outer / lips.inner
        public Color? Eyeshadow;              // eyeshadow.color
        public float EyeshadowRadius;         // eyeshadow.radius
        public Color? Blush;                  // blush.color
        public float BlushRadius;             // blush.radius
    }

    // rgba(r, g, b, a) helper.
    static Color Rgba(int r, int g, int b, float a) => new Color(r / 255f, g / 255f, b / 255f, a);

    // MAKEUP_PRESETS from js/face-filter.js.
    static readonly Dictionary<string, Preset> Presets = new Dictionary<string, Preset>
    {
        ["p_noticias"] = new Preset // look profesional TV
        {
            LipsOuter = Rgba(210, 75, 110, 0.80f), LipsInner = Rgba(190, 55, 90, 0.70f),
            Eyeshadow = Rgba(160, 110, 180, 0.45f), EyeshadowRadius = 0.55f,
            Blush = Rgba(240, 150, 140, 0.35f), BlushRadius = 0.10f
        },
        ["ph_noticias"] = new Preset // maquillaje masculino de TV (muy sutil)
        {
            LipsOuter = Rgba(170, 95, 85, 0.30f), LipsInner = Rgba(155, 80, 75, 0.22f),
            Blush = Rgba(200, 155, 135, 0.18f), BlushRadius = 0.09f
        },
        ["p_cmoda"] = new Preset // look dramático editorial
        {
            LipsOuter = Rgba(155, 15, 55, 0.90f), LipsInner = Rgba(130, 10, 45, 0.80f),
            Eyeshadow = Rgba(195, 145, 25, 0.58f), EyeshadowRadius = 0.68f,
            Blush = Rgba(225, 115, 95, 0.42f), BlushRadius = 0.11f
        },
        ["ph_deportes"] = new Preset // natural, casi sin maquillaje
        {
            LipsOuter = Rgba(185, 110, 95, 0.22f)
        },
    };

    const int EllipseSegments = 48;   // smoothness of ellipses and circles

    public Texture Overlay => _target; // what the live view and the photo draw on top

    RenderTexture _target;   // _canvas (videoWidth x videoHeight)
    Preset _preset;          // _currentPreset
    int _version = -1;       // last landmarks version painted
    bool _active;            // between Begin and End

    // Starts the face tracker and selects the preset (web initFaceFilter + setMakeupPreset).
    public void Begin(string presenterId, int width, int height)
    {
        Presets.TryGetValue(presenterId ?? "", out _preset);                              // MAKEUP_PRESETS[id] || null
        Debug.Log("[FaceFilter] Preset: " + presenterId + (_preset != null ? " ✓" : " (sin preset)")); // web log
        width = Mathf.Max(width, 16);                                                     // videoWidth || 1280
        height = Mathf.Max(height, 16);                                                   // videoHeight || 720
        if (_target == null || _target.width != width || _target.height != height)
        {
            if (_target != null) _target.Release();
            _target = new RenderTexture(width, height, 0, RenderTextureFormat.ARGB32) { name = "MakeupOverlay" }; // overlay canvas
        }
        Clear();                                                                          // start transparent
        _version = -1;                                                                    // repaint on the first result
        _active = true;
        FaceTrackingService.RequestStart();                                               // start Face Mesh
    }

    // Stops the tracker and clears the overlay (web stopFaceFilter).
    public void End()
    {
        _active = false;                     // stop painting
        FaceTrackingService.RequestStop();   // release the model
        Clear();                             // clearRect
    }

    // Repaints when the tracker produced a new result (web _onFaceResults).
    void LateUpdate()
    {
        if (!_active || _target == null) return;                                        // idle
        if (!FaceTrackingService.TryGetLatest(ref _version, out var landmarks)) return;  // nothing new
        if (landmarks == null || landmarks.Length < 468 || _preset == null) { Clear(); return; } // no face or no preset
        Paint(landmarks);                                                                // _drawMakeup
    }

    // Clears the overlay to transparent.
    void Clear()
    {
        if (_target == null) return;
        var previous = RenderTexture.active;
        RenderTexture.active = _target;
        GL.Clear(false, true, Color.clear); // ctx.clearRect
        RenderTexture.active = previous;
    }

    // Draws lips, eyeshadow and blush in that order (web _drawMakeup).
    void Paint(Vector3[] lm)
    {
        float w = _target.width, h = _target.height;                       // canvas size
        Vector2 P(int i) => new Vector2(lm[i].x * w, (1f - lm[i].y) * h);  // mirror-view normalized -> pixels (y up)

        var previous = RenderTexture.active;
        RenderTexture.active = _target;
        GL.Clear(false, true, Color.clear);                                // clearRect for every result
        GL.PushMatrix();
        GL.LoadPixelMatrix(0f, w, 0f, h);                                  // pixel coordinates
        paintMaterial.SetPass(0);                                          // premultiplied source-over
        GL.Begin(GL.TRIANGLES);

        if (_preset.LipsOuter.HasValue)                                    // _drawLips
        {
            FillPolygon(LipsOuter, P, _preset.LipsOuter.Value);            // outer lip
            if (_preset.LipsInner.HasValue) FillPolygon(LipsInner, P, _preset.LipsInner.Value); // inner lip
            var top = P(0);                                                // upper lip center
            FillEllipse(top + new Vector2(0f, 2f), 8f, 4f, new Color(1f, 1f, 1f, 0.18f), 0f); // small highlight (y - 2 in canvas)
        }
        if (_preset.Eyeshadow.HasValue)                                    // _drawEyeshadow (multiply over a transparent layer = source-over)
        {
            Eyeshadow(LeftEye, P);
            Eyeshadow(RightEye, P);
        }
        if (_preset.Blush.HasValue)                                        // _drawBlush (screen over a transparent layer = source-over)
        {
            float r = w * 0.35f * _preset.BlushRadius;                     // faceWidth = W * 0.35 estimate
            FillEllipse(Centroid(LeftCheek, P), r, r, _preset.Blush.Value, r);
            FillEllipse(Centroid(RightCheek, P), r, r, _preset.Blush.Value, r);
        }

        GL.End();
        GL.PopMatrix();
        RenderTexture.active = previous;
    }

    // Soft ellipse above the eye with a radial gradient (web _drawEyeshadow).
    void Eyeshadow(int[] eye, System.Func<int, Vector2> P)
    {
        var center = Centroid(eye, P);                                       // eye center
        float eyeWidth = Mathf.Abs(P(eye[0]).x - P(eye[8]).x) * 1.4f;        // corner to corner * 1.4
        float eyeH = eyeWidth * 0.45f * _preset.EyeshadowRadius;             // ellipse height
        var c = center + new Vector2(0f, eyeH * 0.8f);                       // offsetY upwards
        FillEllipse(c, eyeWidth * 0.65f, eyeH * 1.2f, _preset.Eyeshadow.Value, eyeWidth * 0.7f); // gradient radius eyeWidth * 0.7
    }

    // Average position of a group of landmarks (web _centroid).
    static Vector2 Centroid(int[] indices, System.Func<int, Vector2> P)
    {
        var sum = Vector2.zero;
        foreach (int i in indices) sum += P(i); // accumulate
        return sum / indices.Length;            // mean
    }

    // Solid polygon as a fan from its centroid (lips contours are star-shaped around it).
    static void FillPolygon(int[] indices, System.Func<int, Vector2> P, Color color)
    {
        var center = Centroid(indices, P);           // fan center
        var c = Premultiply(color);                  // canvas blending
        for (int k = 0; k < indices.Length; k++)
        {
            Vertex(center, c);                       // triangle center
            Vertex(P(indices[k]), c);                // current corner
            Vertex(P(indices[(k + 1) % indices.Length]), c); // next corner (closePath)
        }
    }

    // Ellipse filled with a radial gradient from color (center) to transparent at gradientRadius (0 = solid).
    static void FillEllipse(Vector2 center, float rx, float ry, Color color, float gradientRadius)
    {
        var inner = Premultiply(color);                                          // addColorStop(0, color)
        for (int k = 0; k < EllipseSegments; k++)
        {
            float a0 = k * Mathf.PI * 2f / EllipseSegments, a1 = (k + 1) * Mathf.PI * 2f / EllipseSegments;
            var p0 = center + new Vector2(Mathf.Cos(a0) * rx, Mathf.Sin(a0) * ry); // rim points
            var p1 = center + new Vector2(Mathf.Cos(a1) * rx, Mathf.Sin(a1) * ry);
            Vertex(center, inner);                                               // full color in the middle
            Vertex(p0, RimColor(inner, center, p0, gradientRadius));             // faded rim
            Vertex(p1, RimColor(inner, center, p1, gradientRadius));
        }
    }

    // Gradient value at a rim point: premultiplied color * (1 - distance / radius), clamped (addColorStop(1, transparent)).
    static Color RimColor(Color inner, Vector2 center, Vector2 point, float radius)
    {
        if (radius <= 0f) return inner;                                  // solid fill
        float t = Mathf.Clamp01(Vector2.Distance(center, point) / radius); // position on the gradient
        return inner * (1f - t);                                         // premultiplied interpolation
    }

    // Converts straight rgba to premultiplied.
    static Color Premultiply(Color c)
    {
        return new Color(c.r * c.a, c.g * c.a, c.b * c.a, c.a); // rgb * a
    }

    // Emits one colored vertex.
    static void Vertex(Vector2 p, Color c)
    {
        GL.Color(c);                 // per-vertex color
        GL.Vertex3(p.x, p.y, 0f);    // pixel position
    }

    // Frees the render texture.
    void OnDestroy()
    {
        if (_target != null) _target.Release(); // GPU memory
    }
}
