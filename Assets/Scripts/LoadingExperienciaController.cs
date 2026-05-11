using System.Collections;
using UnityEngine;
using UnityEngine.Video;
using UnityEngine.UI;

public class LoadingExperienciaController : MonoBehaviour
{
    [Header("Video")]
    public VideoPlayer videoPlayer;
    public RawImage rawImageVideo;

    [Header("Audio")]
    public AudioSource audioSource;
    public AudioClip[] audiosPorPresentador; // 4 clips, uno por presentador
    public static int IndicePresentador = 0;

    private int _reproduccionesVideo = 0;
    private const int REPRODUCCIONES_REQUERIDAS = 2;
    private bool _videoTerminado = false;
    private bool _audioTerminado = false;

    void Start()
    {
        StartCoroutine(ReproducirIntroduccion());
    }

    IEnumerator ReproducirIntroduccion()
    {
        // Reproducir audio del presentador (una sola vez)
        if (audioSource != null && audiosPorPresentador != null 
            && IndicePresentador < audiosPorPresentador.Length
            && audiosPorPresentador[IndicePresentador] != null)
        {
            audioSource.clip = audiosPorPresentador[IndicePresentador];
            audioSource.Play();
        }

        // Reproducir video 2 veces
        if (videoPlayer != null)
        {
            videoPlayer.isLooping = false;
            videoPlayer.loopPointReached += OnVideoTerminado;
            videoPlayer.Prepare();
            yield return new WaitUntil(() => videoPlayer.isPrepared);
            videoPlayer.Play();
        }

        // Esperar a que el video se reproduzca 2 veces
        yield return new WaitUntil(() => _reproduccionesVideo >= REPRODUCCIONES_REQUERIDAS);

        // Esperar a que el audio termine si sigue
        if (audioSource != null && audioSource.isPlaying)
            yield return new WaitUntil(() => !audioSource.isPlaying);

        // Avisar al LoadingController que puede activar la escena
        var loading = FindAnyObjectByType<LoadingController>();
        if (loading != null)
            loading.ActivarEscena();
    }

    void OnVideoTerminado(VideoPlayer vp)
    {
        _reproduccionesVideo++;
        if (_reproduccionesVideo < REPRODUCCIONES_REQUERIDAS)
        {
            // Volver a reproducir
            vp.Stop();
            vp.Play();
        }
    }

    void OnDestroy()
    {
        if (videoPlayer != null)
            videoPlayer.loopPointReached -= OnVideoTerminado;
    }
}
