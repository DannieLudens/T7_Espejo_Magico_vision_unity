using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class CameraCapture : MonoBehaviour
{
    public static System.Action OnCamaraLista;

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
        StartCoroutine(IniciarCamaraConDelay());
    }

    IEnumerator IniciarCamaraConDelay()
    {
        yield return new WaitForSeconds(0.5f);
        WebCamDevice[] dispositivos = WebCamTexture.devices;
        if (dispositivos.Length == 0)
        {
            Debug.LogError("No se encontro ninguna camara.");
            yield break;
        }
        webCamTexture = new WebCamTexture(dispositivos[camaraIndex].name, ancho, alto, fps);
        displayImage.texture = webCamTexture;
        webCamTexture.Play();
        Debug.Log("Camara iniciada: " + dispositivos[camaraIndex].name);
        yield return new WaitUntil(() => webCamTexture != null && webCamTexture.isPlaying && webCamTexture.width > 16);
        OnCamaraLista?.Invoke();
    }

    void OnDestroy()
    {
        if (webCamTexture != null && webCamTexture.isPlaying)
        {
            webCamTexture.Stop();
            webCamTexture = null;
        }
    }

    public void ForzarDetener()
    {
        if (webCamTexture != null && webCamTexture.isPlaying)
        {
            webCamTexture.Stop();
            webCamTexture = null;
        }
    }
}