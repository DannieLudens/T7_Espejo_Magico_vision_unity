using TMPro;          // TMP_Text
using UnityEngine;    // MonoBehaviour, RectTransform, Vector2, Mathf, Color
using UnityEngine.UI; // Image

// One oval presenter card of the menu (port of .card-wrapper/.presenter-card markup and CSS).
public class PresenterCard : MonoBehaviour
{
    [SerializeField] PresenterDefinition presenter; // data shown by this card

    [Header("Layers")]
    [SerializeField] CanvasGroup content;           // wrapper content: entrance opacity
    [SerializeField] RectTransform contentRect;     // wrapper content: entrance translate/scale
    [SerializeField] RectTransform card;            // the oval (hit-test area, hover transform)
    [SerializeField] RectTransform background;      // .card-bg (parallax, inset -8 %)
    [SerializeField] RectTransform character;       // .card-character (parallax)
    [SerializeField] Image oval;                    // ellipse mask with --bg-card fill
    [SerializeField] Image backgroundImage;         // fondo sprite
    [SerializeField] Image topFade;                 // .card-top-fade gradient
    [SerializeField] Image characterImage;          // personaje sprite
    [SerializeField] Image stripes;                 // ::after diagonal glass stripes
    [SerializeField] Image sparkle;                 // ::before corner sparkle
    [SerializeField] Image border;                  // 2px ellipse border
    [SerializeField] Image hoverGlow;               // hover box-shadow
    [SerializeField] Image selectRing;              // .card-select-ring
    [SerializeField] Image selectGlow;              // ringGrow box-shadow
    [SerializeField] TMP_Text nameLabel;            // .card-name

    static readonly Color BorderIdle = new Color(212f / 255f, 175f / 255f, 55f / 255f, 0.35f); // --gold-dimmed
    const float HoverSeconds = 0.35f;               // transform 0.35s cubic-bezier(0.34,1.2,0.64,1)
    const float BorderSeconds = 0.3f;               // border-color 0.3s
    const float RingSeconds = 0.2f;                 // ring opacity 0.2s
    const float ParallaxSeconds = 0.12f;            // transform 0.12s linear

    public PresenterDefinition Presenter => presenter; // selected on pinch

    CssTransition _hover;    // 0 = idle, 1 = hovered (scale + lift)
    CssTransition _border;   // 0 = dimmed, 1 = gold
    CssTransition _ring;     // ring opacity
    CssTransition _bgX, _bgY, _chX, _chY; // parallax offsets in pixels
    bool _hovered;           // .hovered
    bool _selecting;         // .selecting
    float _entranceStart = float.MaxValue; // cardSlideIn start time (MaxValue = not playing)
    Vector2 _cardRest;       // card anchored position without hover lift
    Vector2 _chRest;         // character position without parallax

    // Creates the transitions and applies the presenter data.
    void Awake()
    {
        _hover = new CssTransition(0f, HoverSeconds, t => CssEasing.CubicBezier(0.34f, 1.2f, 0.64f, 1f, t)); // springy hover
        _border = new CssTransition(0f, BorderSeconds, CssEasing.Ease);   // border color
        _ring = new CssTransition(0f, RingSeconds, CssEasing.Ease);       // ring opacity
        _bgX = new CssTransition(0f, ParallaxSeconds, null);              // linear parallax
        _bgY = new CssTransition(0f, ParallaxSeconds, null);
        _chX = new CssTransition(0f, ParallaxSeconds, null);
        _chY = new CssTransition(0f, ParallaxSeconds, null);
        _cardRest = card.anchoredPosition;                                // resting position
        BuildShapes();                                                    // generated CSS shapes
        ApplyPresenter();                                                 // sprites and framing
    }

    // Generates the ellipse, border, ring and gradient sprites that CSS draws natively.
    void BuildShapes()
    {
        int w = Mathf.RoundToInt(card.rect.width), h = Mathf.RoundToInt(card.rect.height); // 300 x 500
        oval.sprite = ProceduralSprites.Ellipse(w, h);                                   // border-radius: 50%
        border.sprite = ProceduralSprites.EllipseRing(w, h, 2f);                         // border: 2px solid
        selectRing.sprite = ProceduralSprites.EllipseRing(w + 6, h + 6, 2.5f);          // inset: -3px; border: 2.5px
        hoverGlow.sprite = ProceduralSprites.EllipseShadow(w, h, 40f);                   // box-shadow: 0 8px 40px
        hoverGlow.rectTransform.sizeDelta = new Vector2(w + 80, h + 80);                 // shape + blur on every side
        hoverGlow.rectTransform.anchoredPosition = new Vector2(0f, -8f);                 // 8px downward offset
        selectGlow.sprite = ProceduralSprites.EllipseShadow(w + 16, h + 16, 22f);        // ring (+6) with 5px spread, 22px blur
        selectGlow.rectTransform.sizeDelta = new Vector2(w + 16 + 44, h + 16 + 44);      // shape + blur on every side
        topFade.sprite = ProceduralSprites.LinearGradient("cardTopFade", 8, 64, 180f, new[]
        {
            new ProceduralSprites.Stop(0f, new Color(10f / 255f, 10f / 255f, 10f / 255f, 0.55f)), // rgba(10,10,10,0.55) 0%
            new ProceduralSprites.Stop(1f, new Color(10f / 255f, 10f / 255f, 10f / 255f, 0f))      // transparent 100%
        });
        var glass = new Color(200f / 255f, 230f / 255f, 1f, 1f);                         // rgba(200,230,255,..)
        var glassLight = new Color(220f / 255f, 240f / 255f, 1f, 1f);                    // rgba(220,240,255,..)
        var glassMid = new Color(210f / 255f, 235f / 255f, 1f, 1f);                      // rgba(210,235,255,..)
        stripes.sprite = ProceduralSprites.LinearGradient("cardStripes" + w + "x" + h, w, h, 148f, new[]
        {
            new ProceduralSprites.Stop(0.05f, Clear(glass)),          new ProceduralSprites.Stop(0.08f, Alpha(glass, 0.55f)),      // wide stripe
            new ProceduralSprites.Stop(0.16f, Alpha(glassLight, 0.42f)), new ProceduralSprites.Stop(0.21f, Alpha(glass, 0.18f)),
            new ProceduralSprites.Stop(0.25f, Clear(glass)),          new ProceduralSprites.Stop(0.31f, Clear(glass)),             // gap
            new ProceduralSprites.Stop(0.33f, Alpha(glass, 0.32f)),   new ProceduralSprites.Stop(0.38f, Alpha(glassMid, 0.22f)),   // medium stripe
            new ProceduralSprites.Stop(0.41f, Alpha(glass, 0.08f)),   new ProceduralSprites.Stop(0.44f, Clear(glass)),
            new ProceduralSprites.Stop(0.50f, Clear(glass)),          new ProceduralSprites.Stop(0.515f, Alpha(glass, 0.18f)),     // thin stripe
            new ProceduralSprites.Stop(0.54f, Alpha(glass, 0.12f)),   new ProceduralSprites.Stop(0.56f, Clear(glass))
        });
        sparkle.sprite = ProceduralSprites.RadialGradient("cardSparkle", 64, new[]
        {
            new ProceduralSprites.Stop(0f, new Color(1f, 1f, 1f, 0.9f)),  // rgba(255,255,255,0.90) 0%
            new ProceduralSprites.Stop(0.35f, new Color(1f, 1f, 1f, 0.4f)), // rgba(255,255,255,0.40) 35%
            new ProceduralSprites.Stop(0.65f, new Color(1f, 1f, 1f, 0f))   // transparent 65%
        });
    }

    // Same color with a new alpha.
    static Color Alpha(Color c, float a)
    {
        c.a = a;  // replace alpha
        return c;
    }

    // "transparent" that keeps the neighbour's hue (premultiplied blending ignores it anyway).
    static Color Clear(Color c)
    {
        return Alpha(c, 0f); // zero alpha
    }

    // Fills sprites, name and per-presenter character framing.
    void ApplyPresenter()
    {
        if (presenter == null) return;                                    // unassigned in the inspector
        backgroundImage.sprite = presenter.background;                    // card-bg
        characterImage.sprite = presenter.character;                      // card-character
        nameLabel.text = presenter.label;                                 // white-space: pre-line

        var size = card.rect.size;                                        // oval size (300 x 500)
        var sprite = presenter.character;                                 // native proportions
        float height = size.y * presenter.cardCharacterHeight;            // background-size: auto X%
        float width = height * sprite.rect.width / sprite.rect.height;    // keep aspect
        character.sizeDelta = new Vector2(width, height);                 // image box
        float left = (size.x - width) * presenter.cardCharacterAnchorX;   // background-position X%
        character.anchoredPosition = new Vector2(left - (size.x - width) * 0.5f, 0f); // offset from bottom-center anchor
        _chRest = character.anchoredPosition;                             // parallax origin
    }

    // Starts the staggered slide-in (cardSlideIn 0.55s, delay index * 0.1s).
    public void PlayEntrance(float delay)
    {
        _entranceStart = Time.unscaledTime + delay; // animation-delay
        ApplyEntrance(Time.unscaledTime);           // opacity 0 before it starts
    }

    // Skips the entrance (cards already built in this session).
    public void ShowImmediately()
    {
        _entranceStart = float.MinValue; // animation long finished
        ApplyEntrance(Time.unscaledTime);
    }

    // True when a screen point is inside the card's bounding box, including the hover scale.
    public bool Contains(Vector2 screenPosition)
    {
        return RectTransformUtility.RectangleContainsScreenPoint(card, screenPosition, null); // getBoundingClientRect test
    }

    // Hover state plus parallax offsets from the finger position (web _updatePresenterHover).
    public void SetHovered(bool hovered, Vector2 screenPosition)
    {
        float now = Time.unscaledTime;                                // transition clock
        _hovered = hovered;                                           // .hovered
        _hover.SetTarget(hovered ? 1f : 0f, now);                     // scale and lift
        _border.SetTarget(hovered ? 1f : 0f, now);                    // border color
        UpdateRingTarget(now);                                        // ring opacity

        float cx = 0f, cy = 0f;                                       // finger position relative to the card center (-0.5..0.5)
        if (hovered && RectTransformUtility.ScreenPointToLocalPointInRectangle(card, screenPosition, null, out var local))
        {
            var rect = card.rect;                                     // local rect
            cx = (local.x - rect.xMin) / rect.width - 0.5f;           // web cx
            cy = 0.5f - (local.y - rect.yMin) / rect.height;          // web cy (CSS y grows downward)
        }
        _bgX.SetTarget(cx * -12f, now);                               // translate(cx * -12px, ...)
        _bgY.SetTarget(cy * 8f, now);                                 // ... cy * -8px (Unity y up)
        _chX.SetTarget(cx * 8f, now);                                 // translate(cx * 8px, ...)
        _chY.SetTarget(cy * -5f, now);                                // ... cy * 5px (Unity y up)
    }

    // Selection glow while a pinch is held over this card (.selecting).
    public void SetSelecting(bool selecting)
    {
        _selecting = selecting;               // ring pulses
        UpdateRingTarget(Time.unscaledTime);  // opacity 1 while selecting
    }

    // Ring opacity: 1 selecting, 0.45 hovered, 0 otherwise.
    void UpdateRingTarget(float now)
    {
        _ring.SetTarget(_selecting ? 1f : _hovered ? 0.45f : 0f, now); // CSS opacity rules
    }

    // Applies every animated property.
    void Update()
    {
        float now = Time.unscaledTime;                                              // animation clock
        ApplyEntrance(now);                                                         // cardSlideIn

        float h = _hover.Evaluate(now);                                             // 0..1 (overshoots)
        float s = Mathf.LerpUnclamped(1f, 1.045f, h);                               // scale(1.045)
        card.localScale = new Vector3(s, s, 1f);                                    // from the oval center
        card.anchoredPosition = _cardRest + new Vector2(0f, Mathf.LerpUnclamped(0f, 6f, h)); // translateY(-6px)
        border.color = Color.Lerp(BorderIdle, AppTheme.Gold, _border.Evaluate(now)); // border-color
        var glow = AppTheme.Gold; glow.a = 0.28f * Mathf.Clamp01(h);                 // 0 8px 40px rgba(212,175,55,0.28)
        hoverGlow.color = glow;                                                      // hover shadow

        background.anchoredPosition = new Vector2(_bgX.Evaluate(now), _bgY.Evaluate(now));          // parallax background
        character.anchoredPosition = _chRest + new Vector2(_chX.Evaluate(now), _chY.Evaluate(now)); // parallax character

        float ring = _ring.Evaluate(now);                                           // ring opacity
        var ringColor = AppTheme.GoldLight; ringColor.a = ring;                     // 2.5px solid --gold-light
        selectRing.color = ringColor;                                               // ring
        float pulse = _selecting ? CssEasing.PingPong(now, 0.8f) : 0f;              // ringGrow 0.4s alternate
        var glowColor = AppTheme.GoldLight; glowColor.a = pulse;                    // 0 0 0px -> 0 0 22px 5px --gold-light
        selectGlow.color = glowColor;                                               // pulsing halo
    }

    // cardSlideIn: from opacity 0, translateY(50px) scale(0.88) to the resting state.
    void ApplyEntrance(float now)
    {
        float k = Mathf.Clamp01((now - _entranceStart) / 0.55f);                     // 0.55s
        float e = CssEasing.CubicBezier(0.34f, 1.3f, 0.64f, 1f, k);                  // springy curve
        content.alpha = Mathf.Clamp01(e);                                            // opacity 0 -> 1
        float s = Mathf.LerpUnclamped(0.88f, 1f, e);                                 // scale 0.88 -> 1
        contentRect.localScale = new Vector3(s, s, 1f);
        contentRect.anchoredPosition = new Vector2(0f, Mathf.LerpUnclamped(-50f, 0f, e)); // translateY(50px) -> 0
    }
}
