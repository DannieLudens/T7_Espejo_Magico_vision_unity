using UnityEngine;
using UnityEngine.SceneManagement;

public class PantallaFinalController : MonoBehaviour
{
    public void IrAlMenu()
    {
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(CargarMenu());
    }

    System.Collections.IEnumerator CargarMenu()
    {
        yield return new WaitForSeconds(0.5f);
        UnityEngine.SceneManagement.SceneManager.LoadScene("1_Menu_Principal");
    }

    public void ProbarMaquillaje()
    {
        // Por ahora solo un debug, la funcionalidad AR viene despues
        Debug.Log("Probar maquillaje - AR pendiente de implementar");
    }
}