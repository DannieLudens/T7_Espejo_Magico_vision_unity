using UnityEngine;
using UnityEngine.UI;
using Unity.InferenceEngine;
using TMPro;

public class ObjectDetector : MonoBehaviour
{
    [Header("Configuracion de Sentis")]
    public ModelAsset modeloAsset;
    public CameraCapture camaraCapture;

    [Header("Configuracion de Deteccion")]
    [Range(0f, 1f)]
    public float umbralConfianza = 0.5f;

    [Header("UI Feedback")]
    public TMP_Text textoNombre;
    public TMP_Text textoIncorrecto;

    private Model modeloCargado;
    private Worker worker;

    private string[] etiquetas = new string[]
    {
        "Base_Maquillaje",
        "CajaDeMaquillaje",
        "Delineador_Lapiz",
        "Delineador_Pincel",
        "Labial",
        "Pintucaritas",
        "Polvo_Brocha"
    };

    void Start()
    {
        modeloCargado = ModelLoader.Load(modeloAsset);
        worker = new Worker(modeloCargado, BackendType.GPUCompute);
        if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
        Debug.Log("Modelo cargado correctamente.");
    }

    void Update()
    {
        WebCamTexture textura = camaraCapture.ObtenerTextura();
        if (textura == null || !textura.isPlaying) return;

        Tensor<float> inputTensor = new Tensor<float>(new TensorShape(1, 3, 640, 640));
        TextureConverter.ToTensor(textura, inputTensor, new TextureTransform());
        worker.Schedule(inputTensor);
        inputTensor.Dispose();

        using Tensor<float> output = worker.PeekOutput() as Tensor<float>;
        if (output == null) return;

        var cpuOutput = output.ReadbackAndClone();

        int numDetecciones = cpuOutput.shape[2];
        float mejorConfianza = 0f;
        int mejorClase = -1;

        for (int i = 0; i < numDetecciones; i++)
        {
            for (int c = 0; c < etiquetas.Length; c++)
            {
                float confianza = cpuOutput[0, 4 + c, i];
                if (confianza > mejorConfianza && confianza > umbralConfianza)
                {
                    mejorConfianza = confianza;
                    mejorClase = c;
                }
            }
        }

        if (mejorClase >= 0)
        {
            textoNombre.text = $"{etiquetas[mejorClase].Replace("_", " ")} ({(mejorConfianza * 100f):F1}%)";
            if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
        }
        else
        {
            textoNombre.text = "Buscando objeto...";
            if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
        }

        cpuOutput.Dispose();
    }

    void OnDestroy()
    {
        worker?.Dispose();
    }
}