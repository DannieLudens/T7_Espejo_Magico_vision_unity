using UnityEngine;               // MonoBehaviour, RectTransform, CanvasGroup
using UnityEngine.InputSystem;   // Mouse

// Floating operator panel (web .ctrl-panel): hidden by default, toggled by a key, pops in with
// panelIn 0.22s cubic-bezier(0.34,1.3,0.64,1) and, for the body-level panels, closes on a click outside.
public class OperatorPanel : MonoBehaviour
{
    const float PopSeconds = 0.22f; // animation duration

    [SerializeField] RectTransform body;          // the panel box (centered pivot)
    [SerializeField] CanvasGroup group;           // opacity and raycasts
    [SerializeField] bool closeOnOutsideClick = true; // #sound-panel / #glass-panel document click listener

    public bool IsOpen { get; private set; } // !panel.classList.contains('hidden')

    Vector2 _rest;              // resting anchored position (translate -50%)
    float _openedAt = -10f;     // animation start

    // Starts hidden.
    void Awake()
    {
        _rest = body.anchoredPosition; // where the panel settles
        Apply(false);                  // .hidden
    }

    // Opens or closes the panel (web _toggleSoundPanel / _toggleGlassPanel / _toggleMirrorConfig).
    public void Toggle()
    {
        if (IsOpen) Close();
        else Open();
    }

    // Shows the panel and restarts the pop animation.
    public void Open()
    {
        IsOpen = true;                    // remove .hidden
        _openedAt = Time.unscaledTime;    // display: none -> block restarts the animation
        Apply(true);
    }

    // Hides the panel at once (display: none).
    public void Close()
    {
        IsOpen = false; // add .hidden
        Apply(false);
    }

    // Plays the pop-in and handles clicks outside.
    void Update()
    {
        if (!IsOpen) return;                                                         // nothing to animate
        float k = CssEasing.CubicBezier(0.34f, 1.3f, 0.64f, 1f, Mathf.Clamp01((Time.unscaledTime - _openedAt) / PopSeconds)); // eased progress
        group.alpha = Mathf.Clamp01(k);                                              // opacity 0 -> 1
        float s = Mathf.LerpUnclamped(0.95f, 1f, k);                                 // scale(0.95) -> scale(1)
        body.localScale = new Vector3(s, s, 1f);
        body.anchoredPosition = _rest - new Vector2(0f, body.rect.height * 0.04f * (1f - k)); // translateY(-46%) -> (-50%)

        var mouse = Mouse.current;                                                   // operator mouse
        if (closeOnOutsideClick && mouse != null && mouse.leftButton.wasReleasedThisFrame
            && !RectTransformUtility.RectangleContainsScreenPoint(body, mouse.position.ReadValue(), null)) // !panel.contains(e.target)
            Close();
    }

    // Applies the visible / hidden state.
    void Apply(bool visible)
    {
        group.alpha = 0f;                       // hidden, or faded in by the animation
        group.blocksRaycasts = visible;         // sliders only react while open
        group.interactable = visible;
        body.localScale = Vector3.one;          // reset transform
        body.anchoredPosition = _rest;
    }
}
