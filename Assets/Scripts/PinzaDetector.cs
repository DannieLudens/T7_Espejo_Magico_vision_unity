using System.Collections;
using System.Collections.Concurrent;
using UnityEngine;
using UnityEngine.SceneManagement;
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

    [Header("Escenas")]
    public string escenaPresentadora = "Experiencia_Presentadora";
    public string escenaPresentador = "Experiencia_Presentador";

    private float _tiempoPinza = 0f;
    private bool _seleccionHecha = false;
    private ConcurrentQueue<HandLandmarkerResult> _cola = new ConcurrentQueue<HandLandmarkerResult>();

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

        while (_cola.TryDequeue(out var resultado))
        {
            ProcesarResultado(resultado);
        }
    }

    void ProcesarResultado(HandLandmarkerResult resultado)
    {
        if (resultado.handLandmarks == null || resultado.handLandmarks.Count == 0)
        {
            _tiempoPinza = 0f;
            if (textoEstado != null)
                textoEstado.text = "Muestra tu mano a la cámara";
            return;
        }

        var landmarks = resultado.handLandmarks[0].landmarks;
        var pulgar = landmarks[4];
        var indice = landmarks[8];

        float distancia = Vector2.Distance(
            new Vector2(pulgar.x, pulgar.y),
            new Vector2(indice.x, indice.y)
        );

        if (distancia < umbralPinza)
        {
            _tiempoPinza += Time.deltaTime;
            if (textoEstado != null)
                textoEstado.text = $"Manteniendo pinza... {_tiempoPinza:F1}s";

            if (_tiempoPinza >= tiempoRequerido)
            {
                _seleccionHecha = true;
                var runner = FindAnyObjectByType<Mediapipe.Unity.Sample.HandLandmarkDetection.HandLandmarkerRunner>();
                if (runner != null) runner.Stop();

                string escena = pulgar.x < 0.5f ? escenaPresentadora : escenaPresentadora;
                StartCoroutine(CargarEscenaConDelay(escena));
            }
        }
        else
        {
            _tiempoPinza = 0f;
            if (textoEstado != null)
                textoEstado.text = "Haz el gesto de pinza para seleccionar";
        }
    }

    IEnumerator CargarEscenaConDelay(string escena)
    {
        yield return new WaitForSeconds(0.5f);
        SceneManager.LoadScene(escena);
    }
}