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

    [Header("Audio Educativos")]
    public AudioSource audioSource;
    public AudioClip[] audioEducativos; // Pres_Noti_M_1 al _5

    [Header("Audio Idle")]
    public AudioClip audioInstruccion;  // Instruccion.ogg
    public AudioClip audioAlaEspera;    // AlaEspera.ogg
    public AudioClip audioCorrecto;     // Correcto.ogg
    public AudioClip audioIncorrecto;   // Incorrecto.ogg
    
    [Header("Barra Progreso Continua")]
    public Slider sliderProgreso;
    private float _progresoBase = 0f;
    private float _progresoPorVideo;
    private bool _actualizandoProgreso = false;

    [Header("Animacion Respiracion")]
    public AnimationCurve curvaRespiracion = AnimationCurve.EaseInOut(0f, 0.92f, 1f, 1.08f);
    public float duracionRespiracion = 2.5f;

    [Header("Paneles Estado")]
    public GameObject panelEstado1;

    [Header("Objetos Secuencia")]
    public RawImage[] imagenesObjetos;
    public Color colorActivo = Color.white;
    public Color colorUsado = new Color(1f, 1f, 1f, 0.3f);
    public Color colorPendiente = new Color(0.7f, 0.7f, 0.7f, 1f);

    [Header("Clases YOLO esperadas por video")]
    public string[] clasesEsperadas;

    [Header("Configuracion")]
    public float timeoutPorInactividad = 30f;
    public float delayDeteccion = 5f;
    public float intervaloAlaEspera = 10f; // Cada cuanto suena AlaEspera

    [Header("UI Feedback")]
    public TMP_Text textoIncorrecto;

    private int _videoActual = 0;
    private bool _esperandoObjeto = false;
    private bool _deteccionActiva = false;
    private float _tiempoSinInteraccion = 0f;
    private Coroutine _animacionRespiracion;
    private Coroutine _coroutinaAlaEspera;

    public static ExperienciaController Instancia;

    void Awake()
    {
        Instancia = this;
    }

    void Start()
    {
        InicializarObjetos();
        if (textoIncorrecto != null) textoIncorrecto.gameObject.SetActive(false);
        _progresoPorVideo = 1f / videosEducativos.Length;
        StartCoroutine(EsperarYComenzar());
    }

    void Update()
    {
        if (_actualizandoProgreso && videoPlayer.length > 0)
        {
            float progresoVideo = (float)(videoPlayer.time / videoPlayer.length);
            float progresoTotal = _progresoBase + (progresoVideo * _progresoPorVideo);
            if (sliderProgreso != null)
                sliderProgreso.value = progresoTotal;
        }
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

    void ReproducirAudio(int indice)
    {
        if (audioSource == null) return;
        if (audioEducativos == null || indice >= audioEducativos.Length) return;
        if (audioEducativos[indice] == null) return;

        audioSource.Stop();
        audioSource.clip = audioEducativos[indice];
        audioSource.Play();
    }

    void ReproducirAudioIdle(AudioClip clip)
    {
        if (audioSource == null || clip == null) return;
        // Solo reproduce si no hay otro audio corriendo
        if (!audioSource.isPlaying)
        {
            audioSource.clip = clip;
            audioSource.Play();
        }
    }

    // Espera a que termine el audio educativo y luego reproduce Instruccion
    IEnumerator EsperarAudioYReproducirInstruccion()
    {
        // Esperar a que termine el audio educativo anterior
        yield return new WaitUntil(() => !audioSource.isPlaying);
        
        // Reproducir instruccion
        if (audioInstruccion != null)
        {
            audioSource.clip = audioInstruccion;
            audioSource.Play();
            // Esperar a que termine Instruccion antes de iniciar AlaEspera
            yield return new WaitUntil(() => !audioSource.isPlaying);
        }

        // Iniciar loop de AlaEspera cada intervaloAlaEspera segundos
        _coroutinaAlaEspera = StartCoroutine(LoopAlaEspera());
    }

    IEnumerator LoopAlaEspera()
    {
        while (_esperandoObjeto)
        {
            yield return new WaitForSeconds(intervaloAlaEspera);
            if (_esperandoObjeto && !audioSource.isPlaying)
            {
                audioSource.clip = audioAlaEspera;
                audioSource.Play();
            }
        }
    }

    void DetenerAudiosIdle()
    {
        if (_coroutinaAlaEspera != null)
        {
            StopCoroutine(_coroutinaAlaEspera);
            _coroutinaAlaEspera = null;
        }
        if (audioSource != null) audioSource.Stop();
    }

IEnumerator SecuenciaExperiencia()
    {
        for (int i = 0; i < videosEducativos.Length; i++)
        {
            _videoActual = i;
            if (BarraProgresoController.Instancia != null)
                BarraProgresoController.Instancia.SetCheckpointActivo(i == 0 ? 0 : (i * 2) - 1);
            _progresoBase = i * _progresoPorVideo;
            _actualizandoProgreso = true;

            if (i > 0) ActivarObjetoActual(i - 1);

            SetEstado1();
            ReproducirAudio(i);
            yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));

            if (i < videosEducativos.Length - 1)
            {
                SetEstado2();
                _actualizandoProgreso = false;
                if (sliderProgreso != null)
                    sliderProgreso.value = (i + 1) * _progresoPorVideo;
                if (BarraProgresoController.Instancia != null)
                    BarraProgresoController.Instancia.SetCheckpointActivo(i * 2);
                ActivarObjetoActual(i);
                _esperandoObjeto = true;
                _deteccionActiva = false;
                _tiempoSinInteraccion = 0f;

                StartCoroutine(EsperarAudioYReproducirInstruccion());

                yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
                DetenerAudiosIdle();
                MarcarObjetoUsado(i);
            }
        }

        // Liberar camara antes de navegar a pantalla final
        videoPlayer.Stop();
        DetenerAudiosIdle();
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        yield return new WaitForSeconds(0.5f);
        UnityEngine.SceneManagement.SceneManager.LoadScene("6_Pantalla_Final");
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

        yield return new WaitForSeconds(delayDeteccion);
        _deteccionActiva = true;

        while (_esperandoObjeto)
        {
            _tiempoSinInteraccion += Time.deltaTime;
            if (_tiempoSinInteraccion >= timeoutPorInactividad)
            {
                videoPlayer.Stop();
                DetenerAudiosIdle();
                var camara = FindAnyObjectByType<CameraCapture>();
                if (camara != null) camara.ForzarDetener();
                yield return new WaitForSeconds(0.5f);
                UnityEngine.SceneManagement.SceneManager.LoadScene("0_Standby");
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
        DetenerAudiosIdle();
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(CargarEscena("1_Menu_Principal"));
    }

    public void OpcionSkipFinal()
    {
        StopAllCoroutines();
        videoPlayer.Stop();
        DetenerAudiosIdle();
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(CargarEscena("6_Pantalla_Final"));
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
            DetenerAudiosIdle();
            // Reproducir audio correcto
            if (audioCorrecto != null)
            {
                audioSource.clip = audioCorrecto;
                audioSource.Play();
            }
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
            DetenerAudiosIdle();
            if (audioCorrecto != null)
            {
                audioSource.clip = audioCorrecto;
                audioSource.Play();
            }
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
            textoIncorrecto.gameObject.SetActive(true);

        // Audio incorrecto solo si no hay otro audio sonando
        if (audioSource != null && !audioSource.isPlaying && audioIncorrecto != null)
        {
            audioSource.clip = audioIncorrecto;
            audioSource.Play();
        }

        yield return new WaitForSeconds(2f);

        if (textoIncorrecto != null)
            textoIncorrecto.gameObject.SetActive(false);
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
        float tiempo = 0f;
        while (true)
        {
            tiempo += Time.deltaTime / duracionRespiracion;
            if (tiempo > 1f) tiempo = 0f;
            float escala = curvaRespiracion.Evaluate(tiempo);
            rect.localScale = Vector3.one * escala;
            yield return null;
        }
    }

    public void SaltarAVideo(int indice)
    {
        StopAllCoroutines();
        DetenerAudiosIdle();
        _videoActual = indice;
        _esperandoObjeto = false;
        _deteccionActiva = false;
        if (_animacionRespiracion != null) StopCoroutine(_animacionRespiracion);
        
        foreach (var img in imagenesObjetos)
            if (img != null) img.rectTransform.localScale = Vector3.one;
        
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
        ReproducirAudio(indice);
        yield return StartCoroutine(ReproducirVideo(videosEducativos[indice]));

        if (indice < videosEducativos.Length - 1)
        {
            SetEstado2();
            _esperandoObjeto = true;
            _deteccionActiva = false;
            _tiempoSinInteraccion = 0f;
            StartCoroutine(EsperarAudioYReproducirInstruccion());
            yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
            DetenerAudiosIdle();
            MarcarObjetoUsado(indice);

            for (int i = indice + 1; i < videosEducativos.Length; i++)
            {
                _videoActual = i;
                ActivarObjetoActual(i);
                SetEstado1();
                ReproducirAudio(i);
                yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));

                if (i < videosEducativos.Length - 1)
                {
                    SetEstado2();
                    _esperandoObjeto = true;
                    _deteccionActiva = false;
                    _tiempoSinInteraccion = 0f;
                    StartCoroutine(EsperarAudioYReproducirInstruccion());
                    yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
                    DetenerAudiosIdle();
                    MarcarObjetoUsado(i);
                }
            }
        }

        // Liberar camara antes de navegar a pantalla final
        videoPlayer.Stop();
        DetenerAudiosIdle();
        var camara2 = FindAnyObjectByType<CameraCapture>();
        if (camara2 != null) camara2.ForzarDetener();
        yield return new WaitForSeconds(0.5f);
        UnityEngine.SceneManagement.SceneManager.LoadScene("6_Pantalla_Final");
    }

    public void SaltarAIdle(int indice)
    {
        StopAllCoroutines();
        DetenerAudiosIdle();
        _videoActual = indice;
        _esperandoObjeto = false;
        _deteccionActiva = false;
        if (_animacionRespiracion != null) StopCoroutine(_animacionRespiracion);
        
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
        StartCoroutine(EsperarAudioYReproducirInstruccion());
        yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
        DetenerAudiosIdle();
        MarcarObjetoUsado(indice);
        
        for (int i = indice + 1; i < videosEducativos.Length; i++)
        {
            _videoActual = i;
            ActivarObjetoActual(i);
            SetEstado1();
            ReproducirAudio(i);
            yield return StartCoroutine(ReproducirVideo(videosEducativos[i]));
            
            if (i < videosEducativos.Length - 1)
            {
                SetEstado2();
                _esperandoObjeto = true;
                _deteccionActiva = false;
                _tiempoSinInteraccion = 0f;
                StartCoroutine(EsperarAudioYReproducirInstruccion());
                yield return StartCoroutine(ReproducirIdleEsperandoObjeto());
                DetenerAudiosIdle();
                MarcarObjetoUsado(i);
            }
        }
        // Liberar camara antes de navegar a pantalla final
        videoPlayer.Stop();
        DetenerAudiosIdle();
        var camara3 = FindAnyObjectByType<CameraCapture>();
        if (camara3 != null) camara3.ForzarDetener();
        yield return new WaitForSeconds(0.5f);
        UnityEngine.SceneManagement.SceneManager.LoadScene("6_Pantalla_Final");
    }
}