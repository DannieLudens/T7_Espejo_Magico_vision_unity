using UnityEngine;
using UnityEngine.UI;

public class BarraProgresoController : MonoBehaviour
{
    [Header("Checkpoints")]
    public Image[] checkpoints; // 6 botones: E1, Idle1, Idle2, Idle3, Idle4, E5

    [Header("Linea de Progreso")]
    public Slider sliderProgreso;

    [Header("Colores")]
    public Color colorPendiente = new Color(0.4f, 0.4f, 0.4f);
    public Color colorActivo = new Color(0.98f, 0.75f, 0.10f);
    public Color colorCompletado = new Color(0.3f, 0.8f, 0.3f);

    public static BarraProgresoController Instancia;

    void Awake()
    {
        Instancia = this;
    }

    void Start()
    {
        ResetBarra();
    }

    public void ResetBarra()
    {
        foreach (var cp in checkpoints)
            if (cp != null) cp.color = colorPendiente;
        if (sliderProgreso != null) sliderProgreso.value = 0f;
    }

    public void SetCheckpointActivo(int indice)
    {
        for (int i = 0; i < checkpoints.Length; i++)
        {
            if (checkpoints[i] == null) continue;
            if (i < indice)
                checkpoints[i].color = colorCompletado;
            else if (i == indice)
                checkpoints[i].color = colorActivo;
            else
                checkpoints[i].color = colorPendiente;
        }

        if (sliderProgreso != null)
            sliderProgreso.value = (float)indice / (checkpoints.Length - 1);
    }
}