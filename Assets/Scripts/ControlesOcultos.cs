using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;

public class ControlesOcultos : MonoBehaviour
{
    [Header("Botones")]
    public Button btnReiniciar;
    public Button btnCerrar;

    [Header("Colores")]
    public Color colorTransparente = new Color(1f, 1f, 1f, 0f);
    public Color colorHover = new Color(1f, 1f, 1f, 0.15f);
    public Color colorContorno = new Color(1f, 1f, 1f, 0.4f);

    void Start()
    {
        ConfigurarBoton(btnReiniciar);
        ConfigurarBoton(btnCerrar);

        btnReiniciar.onClick.AddListener(Reiniciar);
        btnCerrar.onClick.AddListener(Cerrar);
    }

    void ConfigurarBoton(Button btn)
    {
        if (btn == null) return;

        // Fondo transparente por defecto
        var img = btn.GetComponent<Image>();
        if (img != null)
        {
            img.color = colorTransparente;
            // Asegurar que el boton sea interactuable sin imagen visible
            img.raycastTarget = true;
        }

        // Agregar eventos hover
        var trigger = btn.gameObject.GetComponent<EventTrigger>();
        if (trigger == null) trigger = btn.gameObject.AddComponent<EventTrigger>();

        // Hover enter
        var entrar = new EventTrigger.Entry { eventID = EventTriggerType.PointerEnter };
        entrar.callback.AddListener((_) => MostrarBoton(btn));
        trigger.triggers.Add(entrar);

        // Hover exit
        var salir = new EventTrigger.Entry { eventID = EventTriggerType.PointerExit };
        salir.callback.AddListener((_) => OcultarBoton(btn));
        trigger.triggers.Add(salir);
    }

    void MostrarBoton(Button btn)
    {
        var img = btn.GetComponent<Image>();
        if (img != null) img.color = colorHover;

        // Mostrar contorno si tiene Outline
        var outline = btn.GetComponent<Outline>();
        if (outline != null) outline.enabled = true;
    }

    void OcultarBoton(Button btn)
    {
        var img = btn.GetComponent<Image>();
        if (img != null) img.color = colorTransparente;

        // Ocultar contorno
        var outline = btn.GetComponent<Outline>();
        if (outline != null) outline.enabled = false;
    }

    void Reiniciar()
    {
        // Detener camara si existe en la escena
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(CargarEscena("0_Standby"));
    }

    void Cerrar()
    {
        var camara = FindAnyObjectByType<CameraCapture>();
        if (camara != null) camara.ForzarDetener();
        StartCoroutine(SalirApp());
    }

    IEnumerator CargarEscena(string escena)
    {
        yield return new WaitForSeconds(0.3f);
        SceneManager.LoadScene(escena);
    }

    IEnumerator SalirApp()
    {
        yield return new WaitForSeconds(0.3f);
        Application.Quit();
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #endif
    }
}
