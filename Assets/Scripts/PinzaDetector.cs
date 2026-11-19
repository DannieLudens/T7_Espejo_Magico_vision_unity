using System.Collections;
using System.Collections.Concurrent;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class PinzaDetector : MonoBehaviour
{
    [Header("Configuracion")]
    [Range(0f, 0.1f)]
    public float umbralPinza = 0.05f;
    public float tiempoRequerido = 1.5f;

    [Header("UI")]
    public TMP_Text textoEstado;
    public RectTransform cursorMano;
    public RectTransform canvasRect;
    public Camera camaraCanvas;

    [Header("Paneles")]
    public PanelOpcion[] paneles;

    [Header("Timeout")]
    public float timeoutPorInactividad = 30f;

    private float _tiempoPinza = 0f;
    private bool _seleccionHecha = false;
    private float _tiempoSinMano = 0f;
    private ConcurrentQueue<HandFrame> _cola = new ConcurrentQueue<HandFrame>(); // frames arrive off the main thread
    private PanelOpcion _panelActual = null;
    private float _cursorX = 0f;
    private float _cursorY = 0f;
    private bool _manoDetectada = false;
    private float _escalaAnimacion = 1f;
    private bool _creciendo = true;

    [System.Serializable]
    public class PanelOpcion
    {
        public RectTransform rectTransform;
        public Image imagenPanel;
        public string escenaDestino;
        public Color colorNormal = new Color(0.2f, 0.2f, 0.3f);
        public Color colorHover = new Color(0.4f, 0.6f, 1f);
    }

    // Subscribes to the platform-agnostic hand tracking feed.
    void OnEnable()
    {
        HandTrackingService.FrameReceived += EnColarResultado; // listen to Editor/Windows/WebGL provider
    }

    // Unsubscribes from the hand tracking feed.
    void OnDisable()
    {
        HandTrackingService.FrameReceived -= EnColarResultado; // stop listening when disabled
    }

    // Queues a frame so it is processed on the main thread in Update.
    void EnColarResultado(HandFrame resultado)
    {
        _cola.Enqueue(resultado); // thread-safe handoff
    }

    void Update()
    {
        if (_seleccionHecha) return;

        // Animacion pulsante del cursor
        if (_manoDetectada)
        {
            float velocidad = 2f;
            if (_creciendo)
            {
                _escalaAnimacion += Time.deltaTime * velocidad;
                if (_escalaAnimacion >= 1.3f) _creciendo = false;
            }
            else
            {
                _escalaAnimacion -= Time.deltaTime * velocidad;
                if (_escalaAnimacion <= 0.7f) _creciendo = true;
            }
            if (cursorMano != null)
                cursorMano.localScale = Vector3.one * _escalaAnimacion;
        }

        // Timeout por inactividad
        if (!_manoDetectada && !_seleccionHecha)
        {
            _tiempoSinMano += Time.deltaTime;
            if (_tiempoSinMano >= timeoutPorInactividad)
            {
                _seleccionHecha = true;
                HandTrackingService.RequestStop(); // stop camera/model before leaving the scene
                StartCoroutine(CargarEscenaConDelay("0_Standby"));
            }
        }
        else
        {
            _tiempoSinMano = 0f;
        }

        while (_cola.TryDequeue(out var resultado))
        {
            ProcesarResultado(resultado);
        }
    }

    // Moves the cursor, highlights panels and detects the pinch for one hand frame.
    void ProcesarResultado(HandFrame resultado)
    {
        if (!resultado.HasHand) // no hand in this frame
        {
            _tiempoPinza = 0f;
            _manoDetectada = false;
            if (cursorMano != null) cursorMano.gameObject.SetActive(false);
            DesresaltarTodos();
            if (textoEstado != null)
                textoEstado.text = "Muestra tu mano a la cámara";
            return;
        }

        _manoDetectada = true;
        _tiempoSinMano = 0f;
        if (cursorMano != null) cursorMano.gameObject.SetActive(true);

        var landmarks = resultado.Landmarks;          // 21 normalized landmarks of the first hand
        var pulgar = landmarks[HandFrame.ThumbTip];   // thumb tip
        var indice = landmarks[HandFrame.IndexTip];   // index finger tip

        // Posicion del indice en pantalla
        // Invertir X porque la camara esta espejada
        float indiceX = indice.x;
        float indiceY = 1f - indice.y;
        // debug para verificar coordenadas
        //Debug.Log($"Indice X:{indiceX:F3} Y:{indiceY:F3} | Pantalla X:{indiceX * Screen.width:F0} Y:{indiceY * Screen.height:F0}");
        
        // Mover cursor
        if (cursorMano != null && canvasRect != null)
        {
            Vector2 posicionCursor = new Vector2(
                indiceX * canvasRect.sizeDelta.x,
                indiceY * canvasRect.sizeDelta.y
            );
            cursorMano.anchoredPosition = posicionCursor - canvasRect.sizeDelta * 0.5f;
        }

        // Detectar hover sobre paneles
        _panelActual = null;
        foreach (var panel in paneles)
        {
            float minX = panel.rectTransform.anchorMin.x;
            float maxX = panel.rectTransform.anchorMax.x;
            float minY = panel.rectTransform.anchorMin.y;
            float maxY = panel.rectTransform.anchorMax.y;

            if (indiceX >= minX && indiceX <= maxX && indiceY >= minY && indiceY <= maxY)
            {
                if (panel.imagenPanel != null) panel.imagenPanel.color = panel.colorHover;
                _panelActual = panel;
            }
            else
            {
                if (panel.imagenPanel != null) panel.imagenPanel.color = panel.colorNormal;
            }
        }

        // Detectar pinza
        float distancia = Vector2.Distance(
            new Vector2(pulgar.x, pulgar.y),
            new Vector2(indice.x, indice.y)
        );

        bool esPinza = distancia < umbralPinza;

        if (esPinza && _panelActual != null)
        {
            _tiempoPinza += Time.deltaTime;
            if (textoEstado != null)
                textoEstado.text = $"Seleccionando {_panelActual.escenaDestino}... {_tiempoPinza:F1}s";

            if (_tiempoPinza >= tiempoRequerido)
            {
                _seleccionHecha = true;
                HandTrackingService.RequestStop(); // stop camera/model before leaving the scene

                var vanity = FindAnyObjectByType<VanityFrameController>();
                float demora = 0.5f;
                if (vanity != null)
                {
                    vanity.DispararParpadeo();
                    demora = vanity.TiempoParpadeo + 0.15f;
                }
                StartCoroutine(CargarEscenaConDelay(_panelActual.escenaDestino, demora));
            }
        }
        else
        {
            _tiempoPinza = 0f;
            if (_panelActual != null)
            {
                if (textoEstado != null)
                    textoEstado.text = $"Haz pinza para seleccionar";
            }
            else
            {
                if (textoEstado != null)
                    textoEstado.text = "Muestra tu mano a la cámara";
            }
        }
    }

void DesresaltarTodos()
    {
        if (paneles == null) return;
        foreach (var panel in paneles)
        {
            if (panel == null || panel.imagenPanel == null) continue;
            panel.imagenPanel.color = panel.colorNormal;
        }
    }

IEnumerator CargarEscenaConDelay(string escena, float demora = 0.5f)
    {
        yield return new WaitForSeconds(demora);
        bool esExperiencia = escena.Contains("Pres_") || escena.Contains("Experiencia");
        LoadingController.ModoLoading = esExperiencia 
            ? LoadingController.ModoLoadingTipo.MenuAExperiencia 
            : LoadingController.ModoLoadingTipo.SoloBarras;
        LoadingController.EscenaDestino = escena;
        SceneManager.LoadScene("2_Loading_Scene");
    }
}