using TMPro;          // TMP_Text
using UnityEngine;    // MonoBehaviour, CanvasGroup, RectTransform, Mathf, Time
using UnityEngine.UI; // Image

// Pill at the bottom of the magic mirror that tells the visitor what to do (kiosk addition, not in the web):
// it invites people to move a hand, cheers them on while the frame bulbs fill up and announces the start.
// Same look as the standby pinch hint; messages swap with a quick fade and pop.
public class MirrorInvitation : MonoBehaviour
{
    public enum Mode { Hidden, Invite, Engaged, Ready } // what the pill says

    [SerializeField] CanvasGroup group;   // pill opacity
    [SerializeField] RectTransform body;  // scaled by the pop
    [SerializeField] RectTransform icon;  // waves while inviting
    [SerializeField] Image iconImage;     // emoji of the current message
    [SerializeField] TMP_Text label;      // message text
    [SerializeField] Sprite handSprite;   // ✋ invite
    [SerializeField] Sprite sparkleSprite; // ✨ engaged and ready

    const string InviteText = "Acércate y mueve tu mano";  // nobody is playing
    const string EngagedText = "¡Sigue así!";              // the bulbs are filling up
    const string ReadyText = "¡Comencemos!";               // all bulbs lit, the tutorial is next
    const float FadeOut = 0.18f;                           // old message fades
    const float PopIn = 0.3f;                              // new message pops (indicatorPop)

    Mode _shown = Mode.Hidden;   // message on screen
    Mode _wanted = Mode.Hidden;  // message requested by the mirror
    float _phaseStart;           // start of the current fade or pop
    bool _swapping;              // fading the old message out
    float _alpha;                // opacity before the breathing

    // Requests a message; the swap animates on its own.
    public void Show(Mode mode)
    {
        if (mode == _wanted) return;             // already going there
        _wanted = mode;
        _swapping = _shown != Mode.Hidden;       // fade the old message first
        _phaseStart = Time.unscaledTime;
        if (!_swapping) Apply(mode);             // nothing visible: pop the new one right away
    }

    // Hides the pill at once (screen leaving).
    public void HideNow()
    {
        _wanted = _shown = Mode.Hidden;
        _swapping = false;
        _alpha = 0f;
        group.alpha = 0f;
    }

    // Writes the text and icon of a mode and starts its pop.
    void Apply(Mode mode)
    {
        _shown = mode;
        _phaseStart = Time.unscaledTime;
        if (mode == Mode.Hidden) return;
        label.text = mode == Mode.Invite ? InviteText : mode == Mode.Engaged ? EngagedText : ReadyText;
        iconImage.sprite = mode == Mode.Invite ? handSprite : sparkleSprite;
        LayoutRebuilder.ForceRebuildLayoutImmediate((RectTransform)transform); // pill hugs the new text
    }

    // Fades, pops, breathes and waves.
    void Update()
    {
        float now = Time.unscaledTime;
        float t = now - _phaseStart;
        if (_swapping)                                                   // old message fading out
        {
            _alpha = Mathf.Lerp(1f, 0f, t / FadeOut);
            body.localScale = Vector3.one;
            if (t >= FadeOut) { _swapping = false; Apply(_wanted); }    // then the new one
        }
        else if (_shown == Mode.Hidden)
        {
            _alpha = 0f;
        }
        else if (t < PopIn)                                              // indicatorPop: 0.7 -> 1 with overshoot
        {
            float k = CssEasing.BackOut(t / PopIn);
            _alpha = Mathf.Clamp01(k);
            float s = Mathf.LerpUnclamped(0.7f, 1f, k);
            body.localScale = new Vector3(s, s, 1f);
        }
        else
        {
            _alpha = 1f;
            body.localScale = Vector3.one;
        }

        float breathing = _shown == Mode.Invite && !_swapping && t >= PopIn
            ? Mathf.Lerp(0.55f, 1f, CssEasing.PingPong(t - PopIn, 2.5f)) // invite breathes like hintBlink
            : 1f;
        group.alpha = _alpha * breathing;

        float wave = _shown == Mode.Invite ? Mathf.Lerp(-10f, 10f, CssEasing.PingPong(now, 1.2f)) : 0f; // handWave
        icon.localEulerAngles = new Vector3(0f, 0f, -wave);              // CSS clockwise = Unity negative Z
    }
}
