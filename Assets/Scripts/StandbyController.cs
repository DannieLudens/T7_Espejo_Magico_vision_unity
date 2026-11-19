using System.Collections.Concurrent;
using UnityEngine;
using UnityEngine.SceneManagement;

public class StandbyController : MonoBehaviour
{
    [Header("Configuracion")]
    [Range(0f, 0.1f)]
    public float umbralPinza = 0.05f;
    public float tiempoRequerido = 1.5f;
    public string escenaMenu = "Menu_Seleccion";

    private float _tiempoPinza = 0f;
    private bool _navegando = false;
    private ConcurrentQueue<HandFrame> _cola = new ConcurrentQueue<HandFrame>(); // frames arrive off the main thread

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
        if (_navegando) return;

        while (_cola.TryDequeue(out var resultado))
        {
            ProcesarResultado(resultado);
        }
    }

    // Accumulates pinch time and navigates to the menu once it is held long enough.
    void ProcesarResultado(HandFrame resultado)
    {
        if (!resultado.HasHand) // no hand in this frame
        {
            _tiempoPinza = 0f; // reset the pinch timer
            return;            // nothing to evaluate
        }

        var landmarks = resultado.Landmarks;        // 21 normalized landmarks of the first hand
        var pulgar = landmarks[HandFrame.ThumbTip]; // thumb tip
        var indice = landmarks[HandFrame.IndexTip]; // index finger tip

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
                HandTrackingService.RequestStop(); // stop camera/model before leaving the scene
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
        LoadingController.ModoLoading = LoadingController.ModoLoadingTipo.StandbyAMenu;
        LoadingController.EscenaDestino = escenaMenu;
        SceneManager.LoadScene("2_Loading_Scene");
    }
}