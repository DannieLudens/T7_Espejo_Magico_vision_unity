using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class PantallaFinalController : MonoBehaviour
{
    [Header("Timeout")]
    public float timeoutPorInactividad = 30f;

    private float _tiempoSinInteraccion = 0f;
    private bool _navegando = false;

    void Update()
    {
        if (_navegando) return;
        _tiempoSinInteraccion += Time.deltaTime;
        if (_tiempoSinInteraccion >= timeoutPorInactividad)
        {
            _navegando = true;
            var camara = FindAnyObjectByType<CameraCapture>();
            if (camara != null) camara.ForzarDetener();
            StartCoroutine(CargarStandby());
        }
    }

    void ResetTimeout()
    {
        _tiempoSinInteraccion = 0f;
    }

public void IrAlMenu()
    {
        ResetTimeout();
        _navegando = true;
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(CargarMenu());
    }

IEnumerator CargarMenu()
    {
        yield return new WaitForSeconds(0.5f);
        LoadingController.EscenaDestino = "1_Menu_Principal";
        LoadingController.EsExperiencia = false;
        SceneManager.LoadScene("2_Loading_Scene");
    }

IEnumerator CargarStandby()
    {
        yield return new WaitForSeconds(0.5f);
        LoadingController.EscenaDestino = "0_Standby";
        LoadingController.EsExperiencia = false;
        SceneManager.LoadScene("2_Loading_Scene");
    }


    public void ProbarMaquillaje()
    {
        // Por ahora solo un debug, la funcionalidad AR viene despues
        Debug.Log("Probar maquillaje - AR pendiente de implementar");
    }
}