using System.Collections;
using UnityEngine;
using UnityEngine.Video;
using UnityEngine.UI;
using TMPro;

public class ExperienciaController : MonoBehaviour
{   
    [Header("Menu Opciones")]
    public GameObject panelMenuOpciones;

    [Header("Video Player")]
    public VideoPlayer videoPlayer;

    [Header("Videos")]
    public VideoClip[] videosEducativos;
    public VideoClip videoIdle;

    [Header("Paneles Estado")]
    public GameObject panelEstado1;

    [Header("Objetos Secuencia")]
    public Image[] imagenesObjetos;
    public Color colorActivo = Color.white;
    public Color colorUsado = new Color(1f, 1f, 1f, 0.3f);
    public Color colorPendiente = new Color(0.7f, 0.7f, 0.7f, 1f);

    [Header("Clases YOLO esperadas por video")]
    public string[] clasesEsperadas; // Base_Maquillaje, Polvo_Brocha, etc

    [Header("Configuracion")]
    public float timeoutIdle = 30f;
    public float delayDeteccion = 5f;

    [Header("UI Feedback")]
    public TMP_Text textoIncorrecto;

    private int _videoActual = 0;
    private bool _esperandoObjeto = false;
    private bool _deteccionActiva = false;
    private float _tiempoSinInteraccion = 0f;
    private Coroutine _animacionRespiracion;

    public static ExperienciaController Instancia;

    void Awake()
    {
        Instancia = this;
    }

    void Start()
    {
        InicializarObjetos();
        if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
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

            // Solo activar objeto si no es el primer video
            if (i > 0) ActivarObjetoActual(i - 1);

            SetEstado1();
            yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));

            if (i < videosEducativos.Length - 1)
            {
                SetEstado2();
                ActivarObjetoActual(i);
                _esperandoObjeto = true;
                _deteccionActiva = false;
                _tiempoSinInteraccion = 0f;
                yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
                MarcarObjetoUsado(i);
            }
        }

        UnityEngine.SceneManagement.SceneManager.LoadScene("Pantalla_Final");
    }

    IEnumerator ReproducirVideo(VideoClip clip)
    {
        videoPlayer.Stop();
        videoPlayer.isLooping = false;
        videoPlayer.clip = clip;
        videoPlayer.Prepare();
        yield return new WaitUntil(() => videoPlayer.isPrepared);
        videoPlayer.Play();
        yield return new WaitUntil(() => videoPlayer.isPlaying);
        yield return new WaitUntil(() => !videoPlayer.isPlaying);
    }

    IEnumerator ReproducirIdleEsperandoObjeto()
    {
        videoPlayer.clip = videoIdle;
        videoPlayer.isLooping = true;
        videoPlayer.Play();

        // Delay antes de activar deteccion
        yield return new WaitForSeconds(delayDeteccion);
        _deteccionActiva = true;

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

    public void AbrirMenuOpciones()
    {
        if (panelMenuOpciones != null)
            panelMenuOpciones.SetActive(true);
    }

    public void CerrarMenuOpciones()
    {
        if (panelMenuOpciones != null)
            panelMenuOpciones.SetActive(false);
    }

    public void OpcionVolverMenu()
    {
        StopAllCoroutines();
        videoPlayer.Stop();
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(CargarEscena("1_Menu_Principal"));
    }

    public void OpcionSkipFinal()
    {
        StopAllCoroutines();
        videoPlayer.Stop();
        StartCoroutine(CargarEscena("Pantalla_Final"));
    }

    IEnumerator CargarEscena(string escena)
    {
        yield return new WaitForSeconds(0.5f);
        UnityEngine.SceneManagement.SceneManager.LoadScene(escena);
    }
    
    public void NotificarObjetoDetectado(string claseDetectada)
    {
        if (!_deteccionActiva || !_esperandoObjeto) return;

        string claseEsperada = _videoActual < clasesEsperadas.Length ? clasesEsperadas[_videoActual] : "";

        if (claseDetectada == claseEsperada)
        {
            _esperandoObjeto = false;
            if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
        }
        else
        {
            StartCoroutine(MostrarObjetoIncorrecto());
        }
    }

    public void NotificarClickObjeto(int indiceObjeto)
    {
        if (!_deteccionActiva || !_esperandoObjeto) return;

        if (indiceObjeto == _videoActual)
        {
            _esperandoObjeto = false;
            if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
        }
        else
        {
            StartCoroutine(MostrarObjetoIncorrecto());
        }
    }

    IEnumerator MostrarObjetoIncorrecto()
    {
        if (textoIncorrecto != null)
        {
            textoIncorrecto.gameObject.SetActive(true);
            yield return new WaitForSeconds(2f);
            textoIncorrecto.gameObject.SetActive(false);
        }
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
                imagenesObjetos[i].rectTransform.localScale = Vector3.one;
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
    public void SaltarAVideo(int indice)
    {
        StopAllCoroutines();
        _videoActual = indice;
        _esperandoObjeto = false;
        _deteccionActiva = false;
        if (_animacionRespiracion != null) StopCoroutine(_animacionRespiracion);
        
        // Resetear escala de todos los objetos
        foreach (var img in imagenesObjetos)
            if (img != null) img.rectTransform.localScale = Vector3.one;
        
        // Marcar objetos anteriores como usados
        for (int i = 0; i < indice; i++)
            if (i < imagenesObjetos.Length && imagenesObjetos[i] != null)
                imagenesObjetos[i].color = colorUsado;

        ActivarObjetoActual(indice);
        SetEstado1();
        StartCoroutine(IniciarVideoDirecto(indice));
    }

    IEnumerator IniciarVideoDirecto(int indice)
    {
        yield return new WaitForSeconds(0.5f);
        yield return StartCoroutine(ReproducirVideo(videosEducativos[indice]));

        if (indice < videosEducativos.Length - 1)
        {
            SetEstado2();
            _esperandoObjeto = true;
            _deteccionActiva = false;
            _tiempoSinInteraccion = 0f;
            yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
            MarcarObjetoUsado(indice);

            for (int i = indice + 1; i < videosEducativos.Length; i++)
            {
                _videoActual = i;
                ActivarObjetoActual(i);
                SetEstado1();
                yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));

                if (i < videosEducativos.Length - 1)
                {
                    SetEstado2();
                    _esperandoObjeto = true;
                    _deteccionActiva = false;
                    _tiempoSinInteraccion = 0f;
                    yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
                    MarcarObjetoUsado(i);
                }
            }
        }

        UnityEngine.SceneManagement.SceneManager.LoadScene("Pantalla_Final");
    }

    public void SaltarAIdle(int indice)
    {
        StopAllCoroutines();
        _videoActual = indice;
        _esperandoObjeto = false;
        _deteccionActiva = false;
        if (_animacionRespiracion != null) StopCoroutine(_animacionRespiracion);
        
        // Resetear escala de todos los objetos
        foreach (var img in imagenesObjetos)
            if (img != null) img.rectTransform.localScale = Vector3.one;
        
        for (int i = 0; i < indice; i++)
            if (i < imagenesObjetos.Length && imagenesObjetos[i] != null)
                imagenesObjetos[i].color = colorUsado;
        
        ActivarObjetoActual(indice);
        SetEstado2();
        StartCoroutine(IniciarIdleDirecto(indice));
    }
    IEnumerator IniciarIdleDirecto(int indice)
    {
        yield return new WaitForSeconds(0.5f);
        _esperandoObjeto = true;
        _deteccionActiva = false;
        _tiempoSinInteraccion = 0f;
        yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
        MarcarObjetoUsado(indice);
        
        // Continuar con los videos restantes
        for (int i = indice + 1; i < videosEducativos.Length; i++)
        {
            _videoActual = i;
            ActivarObjetoActual(i);
            SetEstado1();
            yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));
            
            if (i < videosEducativos.Length - 1)
            {
                SetEstado2();
                _esperandoObjeto = true;
                _deteccionActiva = false;
                _tiempoSinInteraccion = 0f;
                yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
                MarcarObjetoUsado(i);
            }
        }
        UnityEngine.SceneManagement.SceneManager.LoadScene("Pantalla_Final");
    }
}