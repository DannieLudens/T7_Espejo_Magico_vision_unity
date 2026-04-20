using System.Collections;
using System.Collections.Concurrent;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using Mediapipe.Tasks.Vision.HandLandmarker;

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

    private float _tiempoPinza = 0f;
    private bool _seleccionHecha = false;
    private ConcurrentQueue<HandLandmarkerResult> _cola = new ConcurrentQueue<HandLandmarkerResult>();
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

    void OnEnable()
    {
        Mediapipe.Unity.Sample.HandLandmarkDetection.PinzaEventBus.OnResultado += EnColarResultado;
    }

    void OnDisable()
    {
        Mediapipe.Unity.Sample.HandLandmarkDetection.PinzaEventBus.OnResultado -= EnColarResultado;
    }

    void EnColarResultado(HandLandmarkerResult resultado)
    {
        _cola.Enqueue(resultado);
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

        while (_cola.TryDequeue(out var resultado))
        {
            ProcesarResultado(resultado);
        }
    }

    void ProcesarResultado(HandLandmarkerResult resultado)
    {
        //Debug.Log("ProcesarResultado llamado");
        if (resultado.handLandmarks == null || resultado.handLandmarks.Count == 0)
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
        if (cursorMano != null) cursorMano.gameObject.SetActive(true);

        var landmarks = resultado.handLandmarks[0].landmarks;
        if (landmarks.Count < 21) return;
        var pulgar = landmarks[4];
        var indice = landmarks[8];

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
            Vector2 posLocal;
            bool dentro = RectTransformUtility.ScreenPointToLocalPointInRectangle(
            panel.rectTransform,
            new Vector2(indiceX * Screen.width, indiceY * Screen.height),
            camaraCanvas,
            out posLocal
            );

            if (dentro && panel.rectTransform.rect.Contains(posLocal))
            {
                panel.imagenPanel.color = panel.colorHover;
                _panelActual = panel;
            }
            else
            {
                panel.imagenPanel.color = panel.colorNormal;
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
                var runner = FindAnyObjectByType<Mediapipe.Unity.Sample.HandLandmarkDetection.HandLandmarkerRunner>();
                if (runner != null) runner.Stop();
                StartCoroutine(CargarEscenaConDelay(_panelActual.escenaDestino));
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
            panel.imagenPanel.color = panel.colorNormal;
    }

    IEnumerator CargarEscenaConDelay(string escena)
    {
        yield return new WaitForSeconds(0.5f);
        SceneManager.LoadScene(escena);
    }
}