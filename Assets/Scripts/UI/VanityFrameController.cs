using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// Genera y controla el marco vanity con bombillas LED.
/// Crea el canvas de overlay, los 3 paneles (top, left, right)
/// y las bombillas animadas. Se autoinstala en escena via [RuntimeInitializeOnLoadMethod]
/// o puede agregarse manualmente a un GameObject vacío.
/// </summary>
public class VanityFrameController : MonoBehaviour
{
    [Header("Dimensiones del marco")]
    [Tooltip("Grosor del marco en píxeles (referencia 1920x1080)")]
    public float grosorMarco = 52f;

    [Header("Bombillas")]
    public float diametroBombilla = 18f;
    public float separacionBombilla = 38f;
    public Color colorBombilla = new Color(1f, 0.98f, 0.91f, 1f);
    public Color colorApagada = new Color(0.22f, 0.20f, 0.16f, 1f);

    [Header("Animación idle — pulso suave")]
    public float velocidadPulso = 1.2f;
    [Range(0f, 1f)] public float intensidadMinPulso = 0.72f;
    [Range(0f, 1f)] public float intensidadMaxPulso = 1f;

    [Header("Animación feedback — parpadeo")]
    public int cantidadParpadeos = 5;
    public float velocidadParpadeo = 18f;

    [Header("Color marco")]
    public Color colorMarco = new Color(0.055f, 0.055f, 0.055f, 1f);
    public Color colorBorde = new Color(0.16f, 0.14f, 0.10f, 1f);

    private Canvas _vanityCanvas;
    private readonly List<Image> _bombillas = new List<Image>();
    private bool _parpadeando = false;
    private float _fasePulso = 0f;

    void Awake()
    {
        CrearCanvas();
        CrearMarco();
    }

    void Update()
    {
        if (_parpadeando) return;
        AnimarPulsoIdle();
    }

    // ─── Construcción del canvas ──────────────────────────────────────────────

    void CrearCanvas()
    {
        var go = new GameObject("VanityCanvas");
        go.transform.SetParent(transform, false);

        _vanityCanvas = go.AddComponent<Canvas>();
        _vanityCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
        _vanityCanvas.sortingOrder = 99;

        var scaler = go.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        scaler.matchWidthOrHeight = 0f;

        go.AddComponent<GraphicRaycaster>();
    }

    // ─── Construcción del marco ───────────────────────────────────────────────

    void CrearMarco()
    {
        // Panel superior
        var top = CrearPanel("VanityTop",
            anchorMin: new Vector2(0, 1),
            anchorMax: new Vector2(1, 1),
            pivot:     new Vector2(0.5f, 1f),
            offsetMin: new Vector2(0, -grosorMarco),
            offsetMax: Vector2.zero);
        PoblarBombillasHorizontal(top, grosorMarco);

        // Panel izquierdo (debajo del top, sobre el fondo)
        var left = CrearPanel("VanityLeft",
            anchorMin: new Vector2(0, 0),
            anchorMax: new Vector2(0, 1),
            pivot:     new Vector2(0f, 0.5f),
            offsetMin: Vector2.zero,
            offsetMax: new Vector2(grosorMarco, -grosorMarco));
        PoblarBombillasVertical(left, grosorMarco);

        // Panel derecho
        var right = CrearPanel("VanityRight",
            anchorMin: new Vector2(1, 0),
            anchorMax: new Vector2(1, 1),
            pivot:     new Vector2(1f, 0.5f),
            offsetMin: new Vector2(-grosorMarco, 0),
            offsetMax: new Vector2(0, -grosorMarco));
        PoblarBombillasVertical(right, grosorMarco);
    }

    GameObject CrearPanel(string nombre, Vector2 anchorMin, Vector2 anchorMax,
                          Vector2 pivot, Vector2 offsetMin, Vector2 offsetMax)
    {
        var go = new GameObject(nombre);
        go.transform.SetParent(_vanityCanvas.transform, false);

        var rt = go.AddComponent<RectTransform>();
        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
        rt.pivot     = pivot;
        rt.offsetMin = offsetMin;
        rt.offsetMax = offsetMax;

        var img = go.AddComponent<Image>();
        img.color = colorMarco;
        img.raycastTarget = false;

        // Borde interno sutil
        var outline = go.AddComponent<Outline>();
        outline.effectColor    = colorBorde;
        outline.effectDistance = new Vector2(0, -1);
        outline.useGraphicAlpha = false;

        return go;
    }

    // ─── Poblar bombillas ─────────────────────────────────────────────────────

    void PoblarBombillasHorizontal(GameObject panel, float grosor)
    {
        var rt = panel.GetComponent<RectTransform>();
        float anchoRef = 1920f;
        int cantidad = Mathf.FloorToInt(anchoRef / separacionBombilla);
        float espaciado = anchoRef / cantidad;

        for (int i = 0; i < cantidad; i++)
        {
            float x = -anchoRef * 0.5f + espaciado * 0.5f + i * espaciado;
            float y = -grosor * 0.5f;
            _bombillas.Add(CrearBombilla(panel, new Vector2(x, y)));
        }
    }

    void PoblarBombillasVertical(GameObject panel, float grosor)
    {
        float altoRef = 1080f - grosor; // debajo del top
        int cantidad = Mathf.FloorToInt(altoRef / separacionBombilla);
        float espaciado = altoRef / cantidad;

        for (int i = 0; i < cantidad; i++)
        {
            float y = altoRef * 0.5f - espaciado * 0.5f - i * espaciado;
            float x = grosor * 0.5f;

            // Centrar horizontalmente dentro del panel lateral
            bool isLeft = panel.name == "VanityLeft";
            float xPos = isLeft ? grosor * 0.5f : -grosor * 0.5f;

            _bombillas.Add(CrearBombilla(panel, new Vector2(xPos, y)));
        }
    }

    Image CrearBombilla(GameObject parent, Vector2 posicion)
    {
        var go = new GameObject("Bombilla");
        go.transform.SetParent(parent.transform, false);

        var rt = go.AddComponent<RectTransform>();
        rt.anchorMin        = new Vector2(0.5f, 0.5f);
        rt.anchorMax        = new Vector2(0.5f, 0.5f);
        rt.pivot            = new Vector2(0.5f, 0.5f);
        rt.anchoredPosition = posicion;
        rt.sizeDelta        = new Vector2(diametroBombilla, diametroBombilla);

        var img = go.AddComponent<Image>();
        img.sprite       = CrearSpriteCirculo();
        img.color        = colorBombilla;
        img.raycastTarget = false;

        // Aro exterior (socket)
        var socket = new GameObject("Socket");
        socket.transform.SetParent(go.transform, false);
        var srt = socket.AddComponent<RectTransform>();
        srt.anchorMin = Vector2.zero; srt.anchorMax = Vector2.one;
        srt.offsetMin = new Vector2(-3, -3); srt.offsetMax = new Vector2(3, 3);
        var sImg = socket.AddComponent<Image>();
        sImg.sprite = CrearSpriteCirculo();
        sImg.color  = new Color(0.22f, 0.20f, 0.14f, 1f);
        sImg.raycastTarget = false;
        socket.transform.SetAsFirstSibling();

        return img;
    }

    // ─── Sprite círculo en runtime ────────────────────────────────────────────

    static Sprite _circuloSprite;
    static Sprite CrearSpriteCirculo()
    {
        if (_circuloSprite != null) return _circuloSprite;

        int size = 64;
        var tex = new Texture2D(size, size, TextureFormat.RGBA32, false);
        tex.filterMode = FilterMode.Bilinear;
        float r = size * 0.5f;

        for (int y = 0; y < size; y++)
        for (int x = 0; x < size; x++)
        {
            float dx = x - r + 0.5f;
            float dy = y - r + 0.5f;
            float dist = Mathf.Sqrt(dx*dx + dy*dy);
            float alpha = Mathf.Clamp01((r - dist) * 2.5f);
            tex.SetPixel(x, y, new Color(1, 1, 1, alpha));
        }
        tex.Apply();

        _circuloSprite = Sprite.Create(tex,
            new Rect(0, 0, size, size),
            new Vector2(0.5f, 0.5f));
        return _circuloSprite;
    }

    // ─── Animación idle ───────────────────────────────────────────────────────

    void AnimarPulsoIdle()
    {
        _fasePulso += Time.deltaTime * velocidadPulso;
        float t = (Mathf.Sin(_fasePulso) + 1f) * 0.5f;
        float brillo = Mathf.Lerp(intensidadMinPulso, intensidadMaxPulso, t);

        Color c = colorBombilla * brillo;
        c.a = 1f;

        foreach (var b in _bombillas)
            if (b != null) b.color = c;
    }

    // ─── Feedback de selección (llamar desde PinzaDetector o similar) ─────────

    /// <summary>Duración total del parpadeo en segundos — úsala para sincronizar el cambio de escena.</summary>
    public float TiempoParpadeo => (cantidadParpadeos * 2f) / velocidadParpadeo;

    
public void DispararParpadeo()
    {
        if (!_parpadeando)
            StartCoroutine(CoroutineParpadeo());
    }

    IEnumerator CoroutineParpadeo()
    {
        _parpadeando = true;
        for (int i = 0; i < cantidadParpadeos * 2; i++)
        {
            bool encendidas = (i % 2 == 0);
            Color c = encendidas ? colorBombilla : colorApagada;
            foreach (var b in _bombillas)
                if (b != null) b.color = c;

            yield return new WaitForSeconds(1f / velocidadParpadeo);
        }
        _parpadeando = false;
    }
}
