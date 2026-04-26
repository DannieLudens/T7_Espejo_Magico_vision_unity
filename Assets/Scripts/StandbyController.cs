using System.Collections.Concurrent;
using UnityEngine;
using UnityEngine.SceneManagement;
using Mediapipe.Tasks.Vision.HandLandmarker;

public class StandbyController : MonoBehaviour
{
    [Header("Configuracion")]
    [Range(0f, 0.1f)]
    public float umbralPinza = 0.05f;
    public float tiempoRequerido = 1.5f;
    public string escenaMenu = "Menu_Seleccion";

    private float _tiempoPinza = 0f;
    private bool _navegando = false;
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
        if (_navegando) return;

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
            return;
        }

        var landmarks = resultado.handLandmarks[0].landmarks;
        if (landmarks.Count < 21) return;

        var pulgar = landmarks[4];
        var indice = landmarks[8];

        float distancia = Vector2.Distance(
            new Vector2(pulgar.x, pulgar.y),
            new Vector2(indice.x, indice.y)
        );

        if (distancia < umbralPinza)
        {
            _tiempoPinza += Time.deltaTime;
            if (_tiempoPinza >= tiempoRequerido)
            {
                _navegando = true;
                var runner = FindAnyObjectByType<Mediapipe.Unity.Sample.HandLandmarkDetection.HandLandmarkerRunner>();
                if (runner != null) runner.Stop();
                StartCoroutine(Navegar());
            }
        }
        else
        {
            _tiempoPinza = 0f;
        }
    }

    System.Collections.IEnumerator Navegar()
    {
        yield return new WaitForSeconds(0.5f);
        SceneManager.LoadScene(escenaMenu);
    }
}