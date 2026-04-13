using UnityEngine;
using UnityEngine.UI;
using Unity.InferenceEngine;
using TMPro;

public class HandPoseDetector : MonoBehaviour
{
    [Header("Modelo")]
    public ModelAsset handLandmarkModel;

    [Header("Camara")]
    public CameraCapture camaraCapture;

    [Header("UI")]
    public TMP_Text textoEstado;
    public RectTransform panelLandmarks;

    [Header("Configuracion")]
    [Range(0f, 1f)]
    public float umbralPresencia = 0.5f;
    [Range(0f, 50f)]
    public float umbralPinza = 20f;
    /// <summary>
    /// Prefab para los puntos de landmarks
    /// </summary>
    //public GameObject prefabPunto;

    [Header("Seleccion")]
    public GameObject panelPresentadora;
    public GameObject panelPresentador;

    private Model modeloLandmark;
    private Worker workerLandmark;

    private float tiempoPinza = 0f;
    private float tiempoRequerido = 1.5f;
    private bool seleccionHecha = false;

    private GameObject[] puntos = new GameObject[21];

    void Start()
    {
        modeloLandmark = ModelLoader.Load(handLandmarkModel);
        workerLandmark = new Worker(modeloLandmark, BackendType.GPUCompute);

        // Crear los 21 puntos
        for (int i = 0; i < 21; i++)
        {
            GameObject punto = new GameObject($"Punto_{i}");
            punto.transform.SetParent(panelLandmarks, false);
            var img = punto.AddComponent<Image>();
            img.color = i == 4 || i == 8 ? Color.red : Color.green;
            var rect = punto.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(10, 10);
            puntos[i] = punto;
        }

        Debug.Log("Modelo de mano cargado.");
    }

    void Update()
    {
        if (seleccionHecha) return;

        WebCamTexture textura = camaraCapture.ObtenerTextura();
        if (textura == null || !textura.isPlaying) return;

        Tensor<float> inputTensor = new Tensor<float>(new TensorShape(1, 3, 224, 224));
        TextureConverter.ToTensor(textura, inputTensor, new TextureTransform().SetDimensions(224, 224));
        workerLandmark.Schedule(inputTensor);
        inputTensor.Dispose();

        using Tensor<float> presencia = workerLandmark.PeekOutput("Identity_1") as Tensor<float>;
        if (presencia == null) return;

        var cpuPresencia = presencia.ReadbackAndClone();
        float scorePresencia = cpuPresencia[0, 0];
        cpuPresencia.Dispose();

        if (scorePresencia < umbralPresencia)
        {
            textoEstado.text = "Muestra tu mano a la cámara";
            tiempoPinza = 0f;
            OcultarPuntos();
            return;
        }

        using Tensor<float> landmarks = workerLandmark.PeekOutput("Identity") as Tensor<float>;
        if (landmarks == null) return;

        var cpuLandmarks = landmarks.ReadbackAndClone();

        // Mostrar los 21 puntos
        for (int i = 0; i < 21; i++)
        {
            float x = cpuLandmarks[0, i * 3];
            float y = cpuLandmarks[0, i * 3 + 1];

            // Normalizar de 224x224 a 0-1
            float nx = 1f - (x / 224f); // Invertir X para que coincida con la UI
            float ny = 1f - (y / 224f);

            var rect = puntos[i].GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(nx, ny);
            rect.anchorMax = new Vector2(nx, ny);
            rect.anchoredPosition = Vector2.zero;
            puntos[i].SetActive(true);
        }

        float pulgarX = cpuLandmarks[0, 12];
        float pulgarY = cpuLandmarks[0, 13];
        float indiceX = cpuLandmarks[0, 24];
        float indiceY = cpuLandmarks[0, 25];

        cpuLandmarks.Dispose();

        float distancia = Vector2.Distance(
            new Vector2(pulgarX, pulgarY),
            new Vector2(indiceX, indiceY)
        );

        bool esPinza = distancia < umbralPinza;

        if (esPinza)
        {
            tiempoPinza += Time.deltaTime;
            textoEstado.text = $"Manteniendo pinza... {tiempoPinza:F1}s";

            if (tiempoPinza >= tiempoRequerido)
            {
                DetectarSeleccion(pulgarX);
            }
        }
        else
        {
            tiempoPinza = 0f;
            textoEstado.text = "Haz el gesto de pinza para seleccionar";
        }
    }

    void OcultarPuntos()
    {
        foreach (var p in puntos)
            if (p != null) p.SetActive(false);
    }

    void DetectarSeleccion(float posicionX)
    {
        seleccionHecha = true;
        if (posicionX < 112f)
        {
            Debug.Log("Seleccionada: Presentadora");
            UnityEngine.SceneManagement.SceneManager.LoadScene("Experiencia_Presentadora");
        }
        else
        {
            Debug.Log("Seleccionado: Presentador");
            UnityEngine.SceneManagement.SceneManager.LoadScene("Experiencia_Presentadora");
        }
    }

    void OnDestroy()
    {
        workerLandmark?.Dispose();
    }
}