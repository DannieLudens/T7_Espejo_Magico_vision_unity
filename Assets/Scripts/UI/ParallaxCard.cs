using UnityEngine;
using UnityEngine.UI;
using System.Reflection;

/// <summary>
/// Controla la tarjeta elipse de cada presentador:
/// - Forma elíptica via Mask generada en runtime
/// - Parallax de dos capas (fondo + personaje) reaccionando al cursor de mano
/// - Se conecta automáticamente al PinzaDetector por reflexión
/// </summary>
[RequireComponent(typeof(RectTransform))]
public class ParallaxCard : MonoBehaviour
{
    [Header("Sprites")]
    public Sprite spritePersonaje;
    public Sprite spriteFondo;

    [Header("Parallax")]
    [Range(0f, 40f)] public float intensidadFondo = 10f;
    [Range(0f, 40f)] public float intensidadPersonaje = 24f;
    [Range(1f, 20f)] public float suavizado = 9f;

    [Header("Elipse")]
    [Tooltip("Ancho de la elipse en píxeles (referencia 1920x1080)")]
    public float anchoElipse = 220f;
    [Tooltip("Alto de la elipse en píxeles")]
    public float altoElipse  = 340f;

    // Referencias internas
    private RectTransform _rt;
    private RectTransform _rtFondo;
    private RectTransform _rtPersonaje;
    private Image _imgFondo;
    private Image _imgPersonaje;

    // Conexión con PinzaDetector
    private PinzaDetector _pinza;
    private FieldInfo _fCursorX, _fCursorY, _fMano;

    // Estado parallax
    private Vector2 _offFondo;
    private Vector2 _offPersonaje;

    // ──────────────────────────────────────────────────────────────────────────

    void Start()
    {
        _rt = GetComponent<RectTransform>();

        ConfigurarElipse();
        CrearCapas();
        ConectarPinzaDetector();
    }

    void Update()
    {
        if (_pinza == null) { ResetarOffsets(); return; }

        bool manoActiva = (bool)_fMano.GetValue(_pinza);
        if (!manoActiva) { ResetarOffsets(); return; }

        float cx = (float)_fCursorX.GetValue(_pinza);
        float cy = (float)_fCursorY.GetValue(_pinza);

        // Convertir posición del cursor a espacio local del panel
        Vector2 localPt;
        Camera cam = null; // ScreenSpaceOverlay no necesita cámara
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            _rt, new Vector2(cx, cy), cam, out localPt);

        // Normalizar al rango [-1, 1] dentro de la elipse
        Vector2 norm = new Vector2(
            localPt.x / (anchoElipse  * 0.5f),
            localPt.y / (altoElipse   * 0.5f)
        );
        norm = Vector2.ClampMagnitude(norm, 1f);

        Vector2 targetFondo      = norm * intensidadFondo;
        Vector2 targetPersonaje  = norm * intensidadPersonaje;

        float dt = Time.deltaTime * suavizado;
        _offFondo      = Vector2.Lerp(_offFondo,      targetFondo,     dt);
        _offPersonaje  = Vector2.Lerp(_offPersonaje,  targetPersonaje, dt);

        _rtFondo.anchoredPosition     = _offFondo;
        _rtPersonaje.anchoredPosition = _offPersonaje;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Construcción

    void ConfigurarElipse()
    {
        // Ajustar tamaño del panel raíz a la elipse
        _rt.sizeDelta = new Vector2(anchoElipse, altoElipse);

        // Generar sprite oval para la Mask
        var tex = GenerarTexturaElipse(256, 384);
        var spriteElipse = Sprite.Create(tex,
            new Rect(0, 0, tex.width, tex.height),
            new Vector2(0.5f, 0.5f), 100f);

        // Configurar Image + Mask en este GameObject
        var img = GetComponent<Image>();
        if (img == null) img = gameObject.AddComponent<Image>();
        img.sprite = spriteElipse;
        img.type   = Image.Type.Simple;
        img.color  = Color.white;
        img.raycastTarget = true;

        var mask = GetComponent<Mask>();
        if (mask == null) mask = gameObject.AddComponent<Mask>();
        mask.showMaskGraphic = false;
    }

    void CrearCapas()
    {
        // ── Capa fondo ──────────────────────────────────────────────────────
        var goFondo = new GameObject("Capa_Fondo");
        goFondo.transform.SetParent(transform, false);
        _rtFondo = goFondo.AddComponent<RectTransform>();
        _rtFondo.anchorMin        = Vector2.zero;
        _rtFondo.anchorMax        = Vector2.one;
        _rtFondo.offsetMin        = new Vector2(-14f, -14f); // un poco más grande para el movimiento
        _rtFondo.offsetMax        = new Vector2( 14f,  14f);
        _imgFondo = goFondo.AddComponent<Image>();
        _imgFondo.sprite          = spriteFondo;
        _imgFondo.type            = Image.Type.Simple;
        _imgFondo.preserveAspect  = false;
        _imgFondo.raycastTarget   = false;
        goFondo.transform.SetAsFirstSibling();

        // ── Capa personaje ───────────────────────────────────────────────────
        var goPersonaje = new GameObject("Capa_Personaje");
        goPersonaje.transform.SetParent(transform, false);
        _rtPersonaje = goPersonaje.AddComponent<RectTransform>();
        _rtPersonaje.anchorMin        = Vector2.zero;
        _rtPersonaje.anchorMax        = Vector2.one;
        _rtPersonaje.offsetMin        = new Vector2(-20f, -20f);
        _rtPersonaje.offsetMax        = new Vector2( 20f,  20f);
        _imgPersonaje = goPersonaje.AddComponent<Image>();
        _imgPersonaje.sprite          = spritePersonaje;
        _imgPersonaje.type            = Image.Type.Simple;
        _imgPersonaje.preserveAspect  = true;
        _imgPersonaje.raycastTarget   = false;
    }

    void ConectarPinzaDetector()
    {
        _pinza = FindAnyObjectByType<PinzaDetector>();
        if (_pinza == null) { Debug.LogWarning("[ParallaxCard] PinzaDetector no encontrado."); return; }

        var flags = BindingFlags.NonPublic | BindingFlags.Instance;
        var tipo  = typeof(PinzaDetector);
        _fCursorX = tipo.GetField("_cursorX", flags);
        _fCursorY = tipo.GetField("_cursorY", flags);
        _fMano    = tipo.GetField("_manoDetectada", flags);
    }

    void ResetarOffsets()
    {
        float dt = Time.deltaTime * suavizado;
        _offFondo     = Vector2.Lerp(_offFondo,     Vector2.zero, dt);
        _offPersonaje = Vector2.Lerp(_offPersonaje, Vector2.zero, dt);
        if (_rtFondo     != null) _rtFondo.anchoredPosition     = _offFondo;
        if (_rtPersonaje != null) _rtPersonaje.anchoredPosition = _offPersonaje;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Generación de textura elipse

    static Texture2D GenerarTexturaElipse(int w, int h)
    {
        var tex = new Texture2D(w, h, TextureFormat.RGBA32, false);
        tex.filterMode = FilterMode.Bilinear;
        float rx = w * 0.5f, ry = h * 0.5f;
        float cx = rx, cy = ry;
        float suaveBorde = 3.5f;

        for (int y = 0; y < h; y++)
        for (int x = 0; x < w; x++)
        {
            float dx = (x + 0.5f - cx) / rx;
            float dy = (y + 0.5f - cy) / ry;
            float dist = Mathf.Sqrt(dx*dx + dy*dy);
            float alpha = Mathf.Clamp01((1f - dist) * (Mathf.Min(w, h) / suaveBorde));
            tex.SetPixel(x, y, new Color(1f, 1f, 1f, alpha));
        }
        tex.Apply();
        return tex;
    }
}
