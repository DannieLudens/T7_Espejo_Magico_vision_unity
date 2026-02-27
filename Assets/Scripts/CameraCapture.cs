using UnityEngine;
using UnityEngine.UI;

/* CameraCapture: Es el encargado de acceder a la cámara web del computador, 
 capturar el video en tiempo real y mostrarlo en el RawImage que creaste en el Canvas. 
 Básicamente es el "ojo" de la experiencia. */

public class CameraCapture : MonoBehaviour
{
    [Header("Configuracion de Camara")]
    public RawImage displayImage;
    public int camaraIndex = 0;
    public int ancho = 640;
    public int alto = 640;
    public int fps = 30;

    private WebCamTexture webCamTexture;

    public WebCamTexture ObtenerTextura() => webCamTexture;

    void Start()
    {
        WebCamDevice[] dispositivos = WebCamTexture.devices;

        if (dispositivos.Length == 0)
        {
            Debug.LogError("No se encontro ninguna camara.");
            return;
        }

        webCamTexture = new WebCamTexture(
            dispositivos[camaraIndex].name, ancho, alto, fps
        );

        displayImage.texture = webCamTexture;
        webCamTexture.Play();

        Debug.Log("Camara iniciada: " + dispositivos[camaraIndex].name);
    }

    void OnDestroy()
    {
        if (webCamTexture != null && webCamTexture.isPlaying)
            webCamTexture.Stop();
    }
}
