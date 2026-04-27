using System.Collections;
using UnityEngine;
using UnityEngine.Video;
using UnityEngine.UI;

public class ExperienciaController : MonoBehaviour
{
    [Header("Video Player")]
    public VideoPlayer videoPlayer;

    [Header("Videos")]
    public VideoClip[] videosEducativos; // E1, E2, E3, E4, E5
    public VideoClip videoIdle;

    [Header("Paneles Estado")]
    public GameObject panelEstado1; // Lista de pasos - visible durante educativo

    [Header("Objetos Secuencia")]
    public Image[] imagenesObjetos; // 4 imagenes de objetos
    public Color colorActivo = Color.white;
    public Color colorUsado = new Color(1f, 1f, 1f, 0.3f);
    public Color colorPendiente = new Color(0.7f, 0.7f, 0.7f, 1f);

    [Header("Configuracion")]
    public float timeoutIdle = 30f;

    private int _videoActual = 0;
    private bool _enIdle = false;
    private float _tiempoSinInteraccion = 0f;
    private bool _esperandoObjeto = false;
    private Coroutine _animacionRespiracion;

    void Start()
    {
        InicializarObjetos();
        StartCoroutine(EsperarYComenzar());
    }

    IEnumerator EsperarYComenzar()
    {
        yield return new WaitForSeconds(0.5f);
        StartCoroutine(SecuenciaExperiencia());
    }

    void InicializarObjetos()
    {
        for (int i = 0; i < imagenesObjetos.Length; i++)
        {
            if (imagenesObjetos[i] != null)
                imagenesObjetos[i].color = colorPendiente;
        }
    }

    IEnumerator SecuenciaExperiencia()
    {
        for (int i = 0; i < videosEducativos.Length; i++)
        {
            _videoActual = i;

            // Activar objeto correspondiente con animacion
            ActivarObjetoActual(i);

            // Estado 1: reproducir video educativo
            SetEstado1();
            yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));

            // Estado 2: reproducir idle y esperar objeto
            SetEstado2();
            _esperandoObjeto = true;
            _tiempoSinInteraccion = 0f;
            yield return StartCoroutine(ReproducirIdleEsperandoObjeto());

            // Objeto correcto mostrado - marcar como usado
            MarcarObjetoUsado(i);
        }

        // Todos los videos completados - ir a pantalla final
        UnityEngine.SceneManagement.SceneManager.LoadScene("Pantalla_Final");
    }

    IEnumerator ReproducirVideo(VideoClip clip)
    {
        videoPlayer.clip = clip;
        videoPlayer.Play();
        yield return new WaitUntil(() => videoPlayer.isPrepared);
        yield return new WaitUntil(() => !videoPlayer.isPlaying);
    }

    IEnumerator ReproducirIdleEsperandoObjeto()
    {
        videoPlayer.clip = videoIdle;
        videoPlayer.isLooping = true;
        videoPlayer.Play();

        while (_esperandoObjeto)
        {
            _tiempoSinInteraccion += Time.deltaTime;
            if (_tiempoSinInteraccion >= timeoutIdle)
            {
                videoPlayer.Stop();
                var camara = FindAnyObjectByType<CameraCapture>();
                if (camara != null) camara.ForzarDetener();
                yield return new WaitForSeconds(0.5f);
                UnityEngine.SceneManagement.SceneManager.LoadScene("1_Menu_Principal");
                yield break;
            }
            yield return null;
        }

        videoPlayer.isLooping = false;
    }

    public void ObjetoCorrectoDetectado()
    {
        _esperandoObjeto = false;
        _tiempoSinInteraccion = 0f;
    }

    void SetEstado1()
    {
        if (panelEstado1 != null) panelEstado1.SetActive(true);
    }

    void SetEstado2()
    {
        if (panelEstado1 != null) panelEstado1.SetActive(false);
    }

    void ActivarObjetoActual(int indice)
    {
        for (int i = 0; i < imagenesObjetos.Length; i++)
        {
            if (imagenesObjetos[i] == null) continue;

            if (i == indice)
            {
                imagenesObjetos[i].color = colorActivo;
                if (_animacionRespiracion != null)
                    StopCoroutine(_animacionRespiracion);
                _animacionRespiracion = StartCoroutine(AnimacionRespiracion(imagenesObjetos[i].rectTransform));
            }
            else if (i < indice)
            {
                imagenesObjetos[i].color = colorUsado;
            }
        }
    }

    void MarcarObjetoUsado(int indice)
    {
        if (_animacionRespiracion != null)
            StopCoroutine(_animacionRespiracion);

        if (indice < imagenesObjetos.Length && imagenesObjetos[indice] != null)
        {
            imagenesObjetos[indice].color = colorUsado;
            imagenesObjetos[indice].rectTransform.localScale = Vector3.one;
        }
    }

    IEnumerator AnimacionRespiracion(RectTransform rect)
    {
        float velocidad = 1.5f;
        float minScale = 0.9f;
        float maxScale = 1.1f;
        bool creciendo = true;
        float escala = 1f;

        while (true)
        {
            if (creciendo)
            {
                escala += Time.deltaTime * velocidad;
                if (escala >= maxScale) creciendo = false;
            }
            else
            {
                escala -= Time.deltaTime * velocidad;
                if (escala <= minScale) creciendo = true;
            }
            rect.localScale = Vector3.one * escala;
            yield return null;
        }
    }
}