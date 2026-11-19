using System.Collections; // IEnumerator
using UnityEngine;        // MonoBehaviour, CanvasGroup, Mathf, Time

// Full-screen black overlay used to fade between screens (web: #scene-overlay).
[RequireComponent(typeof(CanvasGroup))]
public class ScreenFader : MonoBehaviour
{
    [SerializeField] float fadeOutSeconds = 0.38f; // time to reach full black (web: 380 ms)
    [SerializeField] float fadeInSeconds = 0.40f;  // time to clear the black (web: 400 ms)

    CanvasGroup _group; // overlay opacity and input blocking

    // Caches the CanvasGroup and starts fully transparent.
    void Awake()
    {
        _group = GetComponent<CanvasGroup>(); // overlay alpha
        SetAlpha(0f);                         // invisible at boot
    }

    // Fades the overlay to black.
    public IEnumerator FadeOut()
    {
        return Fade(0f, 1f, fadeOutSeconds); // screen goes black
    }

    // Fades the overlay back to transparent.
    public IEnumerator FadeIn()
    {
        return Fade(1f, 0f, fadeInSeconds); // new screen becomes visible
    }

    // Animates alpha between two values with an ease curve, ignoring time scale.
    IEnumerator Fade(float from, float to, float seconds)
    {
        for (float t = 0f; t < seconds; t += Time.unscaledDeltaTime) // advance every frame
        {
            SetAlpha(Mathf.Lerp(from, to, Mathf.SmoothStep(0f, 1f, t / seconds))); // CSS "ease"-like curve
            yield return null;                                                   // wait one frame
        }
        SetAlpha(to); // land exactly on the target
    }

    // Applies alpha and blocks pointer input while the overlay is visible.
    void SetAlpha(float alpha)
    {
        _group.alpha = alpha;                  // overlay opacity
        _group.blocksRaycasts = alpha > 0.01f; // web: pointer-events auto while black
    }
}
