using UnityEngine;
using UnityEngine.SceneManagement;

public class PantallaFinalController : MonoBehaviour
{
    public void IrAlMenu()
    {
        SceneManager.LoadScene("1_Menu_Principal");
    }

    public void ProbarMaquillaje()
    {
        // Por ahora solo un debug, la funcionalidad AR viene despues
        Debug.Log("Probar maquillaje - AR pendiente de implementar");
    }
}