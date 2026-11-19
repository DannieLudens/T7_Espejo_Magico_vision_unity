using UnityEngine;    // MonoBehaviour, RectTransform, Mathf
using UnityEngine.UI; // Image

// Three Telemedellín colored bars that pump up and down (web .intro-bar / .tuto-bar with @keyframes tutoBarLoad).
public class LoadingBars : MonoBehaviour
{
    [SerializeField] RectTransform[] bars;               // pivot at the bottom (transform-origin: bottom)
    [SerializeField] Image[] barImages;                  // same order as bars
    [SerializeField] float period = 1.1f;                // tutoBarLoad 1.1s ease-in-out infinite
    [SerializeField] float stagger = 0.18f;              // nth-child delays: 0s, 0.18s, 0.36s

    // Scales and fades every bar with its own delay.
    void Update()
    {
        float now = Time.unscaledTime;                                    // CSS animations ignore time scale
        for (int i = 0; i < bars.Length; i++)
        {
            float e = CssEasing.PingPong(now - i * stagger, period);      // 0% -> 50% -> 100%
            bars[i].localScale = new Vector3(1f, Mathf.Lerp(0.30f, 1f, e), 1f); // scaleY(0.30) <-> scaleY(1)
            var c = barImages[i].color;                                   // keep the bar color
            c.a = Mathf.Lerp(0.55f, 1f, e);                               // opacity 0.55 <-> 1
            barImages[i].color = c;
        }
    }
}
