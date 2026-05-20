using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.Video;
using TMPro;

public class LoadingController : MonoBehaviour
{
    public enum ModoLoadingTipo { SoloBarras, StandbyAMenu, MenuAExperiencia }
    public static ModoLoadingTipo ModoLoading = ModoLoadingTipo.SoloBarras;
    public static string EscenaDestino = "";

    public static bool EsExperiencia
    {
        get => ModoLoading == ModoLoadingTipo.MenuAExperiencia;
        set => ModoLoading = value ? ModoLoadingTipo.MenuAExperiencia : ModoLoadingTipo.SoloBarras;
    }

    [Header("Barras Bounce")]
    public RectTransform barra1;
    public RectTransform barra2;
    public RectTransform barra3;
    public float alturaMinima = 40f;
    public float alturaMaxima = 120f;
    public float velocidadBounce = 2f;

    [Header("UI")]
    public TMP_Text textoEstado;

    [Header("Panel Video Instructivo")]
    public GameObject panelVideo;
    public VideoPlayer videoPlayer;
    public RawImage rawImageVideo;
    public AudioSource audioSource;

    [Header("Clips Standby -> Menu")]
    public VideoClip videoClipStandbyMenu;
    public AudioClip audioClipStandbyMenu;

    [Header("Clips Menu -> Experiencia")]
    public VideoClip videoClipMenuExp;
    public AudioClip audioClipMenuExp;

    [Header("Configuracion Video")]
    public int reproduccionesRequeridas = 1;

    private AsyncOperation _cargaAsincrona;
    private int _reproduccionesVideo = 0;
    private bool _audioTerminado = false;
    private bool _videoTerminado = false;

    void Start()
    {
        StartCoroutine(BounceBarra(barra1, 0f));
        StartCoroutine(BounceBarra(barra2, 0.2f));
        StartCoroutine(BounceBarra(barra3, 0.4f));

        bool conVideo = ModoLoading != ModoLoadingTipo.SoloBarras;
        if (panelVideo != null) panelVideo.SetActive(conVideo);

        if (conVideo)
        {
            VideoClip clipVideo = ModoLoading == ModoLoadingTipo.StandbyAMenu ? videoClipStandbyMenu : videoClipMenuExp;
            AudioClip clipAudio = ModoLoading == ModoLoadingTipo.StandbyAMenu ? audioClipStandbyMenu : audioClipMenuExp;
            if (videoPlayer != null && clipVideo != null)
            {
                videoPlayer.clip = clipVideo;
                videoPlayer.isLooping = false;
                videoPlayer.loopPointReached += OnVideoTerminado;
                videoPlayer.Prepare();
            }
            if (audioSource != null && clipAudio != null)
                audioSource.clip = clipAudio;
        }
        else
        {
            _videoTerminado = true;
            _audioTerminado = true;
        }

        StartCoroutine(CargarEscena());
    }

void OnVideoTerminado(VideoPlayer vp)
    {
        _reproduccionesVideo++;
        if (_reproduccionesVideo < reproduccionesRequeridas) { vp.Stop(); vp.Play(); }
        else { _videoTerminado = true; }
    }

    IEnumerator CargarEscena()
    {
        if (textoEstado != null) textoEstado.text = "Cargando...";
        yield return new WaitForSeconds(0.5f);
        _cargaAsincrona = SceneManager.LoadSceneAsync(EscenaDestino);
        _cargaAsincrona.allowSceneActivation = false;
        float tiempoMinimo = 3f;
        float tiempoTranscurrido = 0f;

        if (ModoLoading != ModoLoadingTipo.SoloBarras && videoPlayer != null)
        {
            yield return new WaitUntil(() => videoPlayer.isPrepared);
            videoPlayer.Play();
            if (audioSource != null) audioSource.Play();
        }

        while (true)
        {
            tiempoTranscurrido += Time.deltaTime;
            if (audioSource != null && !audioSource.isPlaying && tiempoTranscurrido > 1f)
                _audioTerminado = true;
            bool listo = ModoLoading == ModoLoadingTipo.SoloBarras
                ? (_cargaAsincrona.progress >= 0.9f && tiempoTranscurrido >= tiempoMinimo)
                : (_videoTerminado && _audioTerminado && _cargaAsincrona.progress >= 0.9f);
            if (listo) { _cargaAsincrona.allowSceneActivation = true; yield break; }
            yield return null;
        }
    }

    public void ActivarEscena()
    {
        if (_cargaAsincrona != null) _cargaAsincrona.allowSceneActivation = true;
    }

    IEnumerator BounceBarra(RectTransform barra, float desfase)
    {
        yield return new WaitForSeconds(desfase);
        float tiempo = 0f;
        while (true)
        {
            tiempo += Time.deltaTime * velocidadBounce;
            float t = (Mathf.Sin(tiempo * Mathf.PI) + 1f) / 2f;
            float altura = Mathf.Lerp(alturaMinima, alturaMaxima, t);
            if (barra != null) barra.sizeDelta = new Vector2(barra.sizeDelta.x, altura);
            yield return null;
        }
    }

    void OnDestroy()
    {
        if (videoPlayer != null) videoPlayer.loopPointReached -= OnVideoTerminado;
    }
}