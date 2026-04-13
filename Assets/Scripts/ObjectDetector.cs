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
    public TMP_Text textoDescripcion;
    public TMP_Text textoConfianza;

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

    private string[] descripciones = new string[]
    {
        "La base unifica el tono de la piel y proporciona una cobertura uniforme para el maquillaje de televisión.",
        "Contiene los productos esenciales organizados para el proceso de maquillaje profesional.",
        "Define y resalta los ojos con precisión, ideal para looks de televisión de alta definición.",
        "Permite trazos más fluidos y precisos para delinear ojos con mayor control.",
        "Da color y definición a los labios, esencial para que el rostro se vea completo en cámara.",
        "Pigmento especial para el rostro que garantiza colores vibrantes bajo las luces del set.",
        "Fija el maquillaje y elimina brillos no deseados para una apariencia perfecta en televisión."
    };

    void Start()
    {
        modeloCargado = ModelLoader.Load(modeloAsset);
        worker = new Worker(modeloCargado, BackendType.GPUCompute);
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
            textoNombre.text = etiquetas[mejorClase].Replace("_", " ");
            textoDescripcion.text = descripciones[mejorClase];
            textoConfianza.text = $"Confianza: {(mejorConfianza * 100f):F1}%";
        }
        else
        {
            textoNombre.text = "Buscando objeto...";
            textoDescripcion.text = "Muestra un objeto frente a la cámara para ver su descripción";
            textoConfianza.text = "Confianza: -";
        }

        cpuOutput.Dispose();
    }

    void OnDestroy()
    {
        worker?.Dispose();
    }
}