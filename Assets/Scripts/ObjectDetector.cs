using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Unity.InferenceEngine;

public class ObjectDetector : MonoBehaviour
{
    [Header("Configuracion de Sentis")]
    public ModelAsset modeloAsset;
    public CameraCapture camaraCapture;

    [Header("Configuracion de Deteccion")]
    [Range(0f, 1f)]
    public float umbralConfianza = 0.5f;

    [Header("UI Feedback")]
    public TextMeshProUGUI textoDeteccion;

    private Model modeloCargado;
    private Worker worker;

    private string[] etiquetas = new string[]
    {
        "persona", "bicicleta", "auto", "moto", "avion", "bus", "tren", "camion",
        "bote", "semaforo", "boca_de_incendio", "stop", "parquimetro", "banco",
        "pajaro", "gato", "perro", "caballo", "oveja", "vaca", "elefante", "oso",
        "cebra", "jirafa", "mochila", "paraguas", "bolso", "corbata", "maleta",
        "frisbee", "esquis", "snowboard", "balon", "cometa", "bate", "guante",
        "patineta", "surf", "raqueta", "botella", "copa", "taza", "tenedor",
        "cuchillo", "cuchara", "tazon", "banana", "manzana", "sandwich", "naranja",
        "brocoli", "zanahoria", "perro_caliente", "pizza", "dona", "torta", "silla",
        "sofa", "planta", "cama", "mesa", "inodoro", "tv", "laptop", "mouse",
        "control", "teclado", "celular", "microondas", "horno", "tostadora",
        "lavaplatos", "nevera", "libro", "reloj", "jarron", "tijeras", "peluche",
        "secador", "cepillo_dientes"
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

        float mejorConfianza = 0f;
        int mejorClase = -1;

        int numDetecciones = cpuOutput.shape[2];
        int numClases = cpuOutput.shape[1] - 4;

        for (int i = 0; i < numDetecciones; i++)
        {
            for (int c = 0; c < numClases; c++)
            {
                float confianza = cpuOutput[0, 4 + c, i];
                if (confianza > mejorConfianza)
                {
                    mejorConfianza = confianza;
                    mejorClase = c;
                }
            }
        }

        cpuOutput.Dispose();

        if (mejorConfianza >= umbralConfianza && mejorClase >= 0 && mejorClase < etiquetas.Length)
        {
            string etiqueta = etiquetas[mejorClase];
            textoDeteccion.text = $"Detectado: {etiqueta} ({(mejorConfianza * 100f):F1}%)";
            Debug.Log($"Objeto detectado: {etiqueta} con {(mejorConfianza * 100f):F1}% de confianza");
        }
        else
        {
            textoDeteccion.text = "Buscando objeto...";
        }
    }

    void OnDestroy()
    {
        worker?.Dispose();
    }
}