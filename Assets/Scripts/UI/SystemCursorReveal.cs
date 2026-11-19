using UnityEngine; // MonoBehaviour, CanvasGroup, Time

// Shows a hidden operator control only in system-cursor mode (body.system-cursor #btn-magic-mirror, transition: opacity 0.3s).
public class SystemCursorReveal : MonoBehaviour
{
    [SerializeField] CanvasGroup visuals; // gold box with 🪞

    CssTransition _opacity; // opacity 0 <-> 1

    // Starts in the current cursor mode.
    void Awake()
    {
        _opacity = new CssTransition(OperatorControls.SystemCursor ? 1f : 0f, 0.3f, CssEasing.Ease); // initial
    }

    // Follows the operator cursor mode.
    void Update()
    {
        float now = Time.unscaledTime;
        _opacity.SetTarget(OperatorControls.SystemCursor ? 1f : 0f, now); // body.system-cursor
        visuals.alpha = _opacity.Evaluate(now);                           // opacity
    }
}
