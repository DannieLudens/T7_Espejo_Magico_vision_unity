using System.Collections; // IEnumerator
using UnityEngine;        // MonoBehaviour, CanvasGroup, Mathf, Time

// Full-screen black overlay used to fade between screens (web: #scene-overlay).
// CSS animates opacity over 0.35s with "ease"; app.js waits 380 ms (out) and 400 ms (in) before continuing.
[RequireComponent(typeof(CanvasGroup))]
public class ScreenFader : MonoBehaviour
{
    [SerializeField] float transitionSeconds = 0.35f; // CSS transition: opacity 0.35s
    [SerializeField] float fadeOutWait = 0.38f;       // _fadeOut resolves after 380 ms
    [SerializeField] float fadeInWait = 0.40f;        // _fadeIn resolves after 400 ms

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
        return Fade(0f, 1f, fadeOutWait); // screen goes black
    }

    // Fades the overlay back to transparent.
    public IEnumerator FadeIn()
    {
        return Fade(1f, 0f, fadeInWait); // new screen becomes visible
    }

    // Animates alpha with the CSS "ease" curve, then waits until the JS timeout would resolve.
    IEnumerator Fade(float from, float to, float totalWait)
    {
        for (float t = 0f; t < totalWait; t += Time.unscaledDeltaTime) // run until the JS promise resolves
        {
            float k = Mathf.Clamp01(t / transitionSeconds);              // CSS transition progress
            SetAlpha(Mathf.Lerp(from, to, CssEasing.Ease(k)));           // same curve as the browser
            yield return null;                                           // wait one frame
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
