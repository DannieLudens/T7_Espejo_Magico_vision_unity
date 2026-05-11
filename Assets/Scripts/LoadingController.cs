using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class LoadingController : MonoBehaviour
{
    public static string EscenaDestino = "";
    public static bool EsExperiencia = false;

    [Header("Barras Bounce")]
    public RectTransform barra1;
    public RectTransform barra2;
    public RectTransform barra3;
    public float alturaMinima = 40f;
    public float alturaMaxima = 120f;
    public float velocidadBounce = 2f;

    [Header("Colores Barras")]
    public Image imagenBarra1;
    public Image imagenBarra2;
    public Image imagenBarra3;

    [Header("UI")]
    public TMP_Text textoEstado;

    [Header("Panel Experiencia")]
    public GameObject panelExperiencia;

    private AsyncOperation _cargaAsincrona;

void Start()
    {
        StartCoroutine(BounceBarra(barra1, 0f));
        StartCoroutine(BounceBarra(barra2, 0.2f));
        StartCoroutine(BounceBarra(barra3, 0.4f));
        if (panelExperiencia != null)
            panelExperiencia.SetActive(EsExperiencia);
        StartCoroutine(CargarEscena());
    }

IEnumerator CargarEscena()
    {
        if (textoEstado != null) textoEstado.text = "Cargando...";
        yield return new WaitForSeconds(0.5f);
        _cargaAsincrona = SceneManager.LoadSceneAsync(EscenaDestino);
        _cargaAsincrona.allowSceneActivation = false;
        float tiempoMinimo = 2f;
        float tiempoTranscurrido = 0f;
        while (!_cargaAsincrona.isDone)
        {
            tiempoTranscurrido += Time.deltaTime;
            if (_cargaAsincrona.progress >= 0.9f && tiempoTranscurrido >= tiempoMinimo)
            {
                if (!EsExperiencia)
                {
                    _cargaAsincrona.allowSceneActivation = true;
                }
                else
                {
                    if (textoEstado != null) textoEstado.text = "Listo";
                    yield break;
                }
            }
            yield return null;
        }
    }

    public void ActivarEscena()
    {
        if (_cargaAsincrona != null)
            _cargaAsincrona.allowSceneActivation = true;
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
            if (barra != null)
                barra.sizeDelta = new Vector2(barra.sizeDelta.x, altura);
            yield return null;
        }
    }
}