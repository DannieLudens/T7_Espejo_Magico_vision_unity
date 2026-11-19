using TMPro;          // TMP_Text
using UnityEngine;    // MonoBehaviour, RectTransform, Color, Mathf
using UnityEngine.UI; // Image

// Circular countdown in the mirror's bottom-left corner (web #mirror-countdown + _applyMirrorCountdown):
// a gold ring that empties counter-clockwise from 12 o'clock, turning orange and red as time runs out.
public class MirrorCountdown : MonoBehaviour
{
    const float Radius = 23f;    // SVG circle r (caps sit on it)

    [SerializeField] Image ring;          // .mirror-cd-ring, Filled Radial360 from the top, clockwise
    [SerializeField] RectTransform startCap; // round linecap at 12 o'clock
    [SerializeField] RectTransform endCap;   // round linecap at the end of the arc
    [SerializeField] TMP_Text number;     // #mirror-cd-num
    [SerializeField] CanvasGroup group;   // #mirror-countdown opacity

    static readonly Color Gold = new Color(212f / 255f, 175f / 255f, 55f / 255f, 0.85f);  // rgba(212, 175, 55, 0.85)
    static readonly Color Orange = new Color(1f, 155f / 255f, 40f / 255f, 0.9f);           // rgba(255, 155, 40, 0.9)
    static readonly Color Red = new Color(1f, 75f / 255f, 75f / 255f, 0.9f);               // rgba(255, 75, 75, 0.9)

    Image _startCapImage, _endCapImage; // cap colors follow the ring
    Color _colorFrom, _colorTo;  // transition: stroke 0.4s ease
    float _colorStart = -999f;   // time the color change started
    CssTransition _opacity;      // transition: opacity 0.6s ease

    // Caches the cap images and the fade.
    void Awake()
    {
        _startCapImage = startCap.GetComponent<Image>();               // cap graphic
        _endCapImage = endCap.GetComponent<Image>();                   // cap graphic
        _opacity = new CssTransition(0f, 0.6f, CssEasing.Ease);        // hidden until the scene is active
        _colorFrom = _colorTo = Gold;                                  // initial stroke
    }

    // Starts the fade-in (#scene-mirror.active #mirror-countdown { opacity: 1 }).
    public void Show()
    {
        _opacity.Snap(0f);                            // scene was hidden
        _opacity.SetTarget(1f, Time.unscaledTime);    // fade in over 0.6 s
        _colorFrom = _colorTo = Gold;                 // full time is always gold
        _colorStart = -999f;                          // no color animation pending
    }

    // Updates the ring length, its color and the number (web _applyMirrorCountdown).
    public void Apply(int seconds, int total)
    {
        float frac = (float)seconds / total;                           // remaining fraction
        ring.fillAmount = frac;                                        // stroke-dashoffset = C * (1 - frac)
        var target = frac > 0.4f ? Gold : frac > 0.15f ? Orange : Red; // urgency colors
        if (target != _colorTo)                                        // stroke changed
        {
            _colorFrom = CurrentColor();                               // continue from the current color
            _colorTo = target;
            _colorStart = Time.unscaledTime;                           // restart the 0.4 s transition
        }
        number.text = seconds.ToString();                              // num.textContent

        bool caps = frac > 0f && frac < 1f;                            // a full circle hides its caps, an empty one has none
        startCap.gameObject.SetActive(caps);
        endCap.gameObject.SetActive(caps);
        float angle = frac * Mathf.PI * 2f;                            // arc end, clockwise from the top
        endCap.anchoredPosition = new Vector2(Mathf.Sin(angle), Mathf.Cos(angle)) * Radius; // tip of the arc
        startCap.anchoredPosition = new Vector2(0f, Radius);           // 12 o'clock
    }

    // Animates the opacity and the stroke color.
    void Update()
    {
        group.alpha = _opacity.Evaluate(Time.unscaledTime); // fade-in
        var c = CurrentColor();                             // eased stroke color
        ring.color = c;
        _startCapImage.color = c;
        _endCapImage.color = c;
    }

    // Stroke color at the current time of its transition.
    Color CurrentColor()
    {
        float k = Mathf.Clamp01((Time.unscaledTime - _colorStart) / 0.4f); // transition: stroke 0.4s
        return Color.LerpUnclamped(_colorFrom, _colorTo, CssEasing.Ease(k)); // ease
    }
}
