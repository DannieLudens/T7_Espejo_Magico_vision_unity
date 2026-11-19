using UnityEngine;                 // MonoBehaviour, RectTransform, Color
using UnityEngine.EventSystems;    // IPointerEnterHandler, IPointerExitHandler
using UnityEngine.UI;              // Image

// One .final-btn of the Final screen: rounded box with icon, label and pinch progress bar.
// The screen sets the hand states; this component animates them like the CSS rules and transitions.
public class FinalButton : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    [SerializeField] RectTransform body;     // animated visual (transform: translateX() scale())
    [SerializeField] Image fill;             // background
    [SerializeField] Image border;           // 2px border
    [SerializeField] Image nearShadow;       // .finger-near box-shadow: 0 0 30px rgba(212,175,55,0.45)
    [SerializeField] Image selectingShadow;  // .selecting box-shadow: 0 0 20px rgba(212,175,55,0.35)
    [SerializeField] RectTransform bar;      // .final-btn-bar (width = pinch progress)
    [SerializeField] Image barFill;          // bar gradient
    [SerializeField] Image barGlow;          // bar box-shadow: 0 0 6px var(--gold)
    [SerializeField] bool secondary;         // .final-btn.secondary (dimmer border and label)
    [SerializeField] float nearShift = 4f;   // .finger-near translateX: 4px in the result mode, 6px in the photo mode

    public bool HandHover { get; set; }      // .hovered set by the hand cursor
    public bool Near { get; set; }           // .finger-near (fingertip within 65 px of the center)
    public bool Selecting { get; set; }      // .selecting (pinch held over the button)
    public float Progress { get; set; }      // pinch progress 0..1 shown by the bar
    public int AlignSign { get; set; } = 1;  // data-cta-align: -1 left, 1 right, 0 center

    // Center of the button in screen pixels (for the proximity effect).
    public Vector2 ScreenCenter => RectTransformUtility.WorldToScreenPoint(null, body.TransformPoint(body.rect.center));

    static readonly Color GoldDimmed = WithAlpha(AppTheme.Gold, 0.35f);   // --gold-dimmed
    static readonly Color SecondaryBorder = WithAlpha(AppTheme.Gold, 0.15f); // .final-btn.secondary border
    static readonly Color RestFill = new Color(10f / 255f, 10f / 255f, 10f / 255f, 0.7f); // rgba(10,10,10,0.7)

    ColorTransition _border; // transition: border-color 0.3s
    ColorTransition _fill;   // transition: background 0.3s
    CssTransition _shift;    // transition: transform 0.25s (translateX)
    CssTransition _scale;    // transition: transform 0.25s (scale)
    bool _mouseOver;         // .final-btn:hover

    // Prepares the transitions at the resting look.
    void Awake()
    {
        _border = new ColorTransition(secondary ? SecondaryBorder : GoldDimmed, 0.3f); // rest border
        _fill = new ColorTransition(RestFill, 0.3f);                                   // rest background
        _shift = new CssTransition(0f, 0.25f, CssEasing.Ease);                         // no offset
        _scale = new CssTransition(1f, 0.25f, CssEasing.Ease);                         // no zoom
        barFill.sprite = ProceduralSprites.LinearGradient("finalBtnBar", 64, 2, 90f, new[] // to right
        {
            new ProceduralSprites.Stop(0f, AppTheme.GoldDark),  // var(--gold-dark)
            new ProceduralSprites.Stop(1f, AppTheme.GoldLight)  // var(--gold-light)
        });
    }

    // True when the screen point is inside the (transformed) button, like getBoundingClientRect.
    public bool Contains(Vector2 screenPosition)
    {
        return RectTransformUtility.RectangleContainsScreenPoint(body, screenPosition, null); // includes scale/offset
    }

    // Clears every hand state and jumps to the resting look (entering the screen).
    public void ResetState()
    {
        HandHover = Near = Selecting = _mouseOver = false;                        // no classes
        Progress = 0f;                                                            // empty bar
        _border.Snap(secondary ? SecondaryBorder : GoldDimmed);                   // rest border
        _fill.Snap(RestFill);                                                     // rest background
        _shift.Snap(0f);                                                          // no offset
        _scale.Snap(1f);                                                          // no zoom
        Apply(Time.unscaledTime);                                                 // draw it now
    }

    // Mouse :hover.
    public void OnPointerEnter(PointerEventData eventData) { _mouseOver = true; }

    // Mouse left the button.
    public void OnPointerExit(PointerEventData eventData) { _mouseOver = false; }

    // Animates toward the look of the current states.
    void Update()
    {
        Apply(Time.unscaledTime); // every frame while visible
    }

    // Resolves the CSS cascade for the active classes and applies it.
    void Apply(float now)
    {
        bool hover = HandHover || _mouseOver; // .hovered or :hover

        // border-color: .finger-near > .secondary > .selecting > .hovered > base (specificity and source order)
        Color borderTarget = Near ? AppTheme.Gold
            : secondary ? SecondaryBorder
            : Selecting ? AppTheme.GoldLight
            : hover ? AppTheme.Gold
            : GoldDimmed;
        _border.SetTarget(borderTarget, now);                                                     // animate 0.3s
        border.color = _border.Evaluate(now);

        // background: .finger-near > .hovered > base
        _fill.SetTarget(Near ? WithAlpha(AppTheme.Gold, 0.16f) : hover ? WithAlpha(AppTheme.Gold, 0.1f) : RestFill, now);
        fill.color = _fill.Evaluate(now);

        // box-shadow is not transitioned: .finger-near wins over .selecting
        nearShadow.color = WithAlpha(AppTheme.Gold, Near ? 0.45f : 0f);                          // 0 0 30px
        selectingShadow.color = WithAlpha(AppTheme.Gold, !Near && Selecting ? 0.35f : 0f);        // 0 0 20px

        // transform: .finger-near translateX(±4px) scale(1.12) > .hovered translateX(±6px) scale(1.06)
        float shift = Near ? nearShift * AlignSign : hover ? 6f * (AlignSign == 0 ? 1 : AlignSign) : 0f; // centered hover keeps +6px
        _shift.SetTarget(shift, now);
        _scale.SetTarget(Near ? 1.12f : hover ? 1.06f : 1f, now);
        float s = _scale.Evaluate(now);
        body.localScale = new Vector3(s, s, 1f);                                                  // transform-origin: center
        body.anchoredPosition = new Vector2(_shift.Evaluate(now), 0f);                            // translateX

        // .final-btn-bar width: progress% (0.05s linear, close enough to instant)
        bar.anchorMax = new Vector2(Mathf.Clamp01(Progress), bar.anchorMax.y);                    // grow from the left
        bool barVisible = Progress > 0f;                                                          // width 0 draws nothing
        barFill.enabled = barVisible;
        barGlow.enabled = barVisible;
    }

    // Same color with a different alpha.
    static Color WithAlpha(Color c, float a)
    {
        return new Color(c.r, c.g, c.b, a); // rgba()
    }

    // A color that animates like a CSS color transition (ease timing).
    class ColorTransition
    {
        readonly CssTransition _t;  // shared 0..1 clock
        Color _from, _to;           // endpoints of the current change

        // Starts at rest on a color.
        public ColorTransition(Color value, float duration)
        {
            _from = _to = value;                               // at rest
            _t = new CssTransition(1f, duration, CssEasing.Ease); // finished
        }

        // Starts animating toward a new color from the current one.
        public void SetTarget(Color target, float now)
        {
            if (target == _to) return;                         // unchanged
            _from = Evaluate(now);                             // continue from the current color
            _to = target;                                      // new destination
            _t.Snap(0f);                                       // restart the clock...
            _t.SetTarget(1f, now);                             // ...and run it
        }

        // Jumps to a color.
        public void Snap(Color value)
        {
            _from = _to = value; // no interpolation
            _t.Snap(1f);         // finished
        }

        // Color at the given time.
        public Color Evaluate(float now)
        {
            return Color.LerpUnclamped(_from, _to, _t.Evaluate(now)); // eased blend
        }
    }
}
