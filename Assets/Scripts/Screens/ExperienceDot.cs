using UnityEngine;    // MonoBehaviour, RectTransform, Color, Mathf
using UnityEngine.UI; // Image

// One dot on the experience progress bar (web .exp-dot, .exp-dot--nav, .done, .checkpoint, .finger-near, .dwelling).
public class ExperienceDot : MonoBehaviour
{
    public enum Kind { Start, End, Checkpoint } // data-nav="start" / "end" or a scene checkpoint

    [SerializeField] Image glow;        // box-shadow
    [SerializeField] Image fill;        // background
    [SerializeField] Image border;      // border: 2px solid
    [SerializeField] GameObject check;  // ✓ inside the active checkpoint

    static readonly Color Green = Hex(0x3DBE82);       // Telemedellín green (nav dots)
    static readonly Color GreenLight = Hex(0x52D496);  // nav hover/near
    const float TransitionSeconds = 0.2f;              // transition: ... 0.2s

    public Kind DotKind { get; private set; }          // nav or checkpoint
    public int SceneIndex { get; private set; }        // data-scene-idx
    public bool Done { get; set; }                     // .done (checkpoint already passed)
    public bool Active { get; set; }                   // .checkpoint (current idle checkpoint)
    public bool Near { get; set; }                     // .finger-near (finger within 65 px)
    public bool Dwelling { get; set; }                 // .dwelling (hover-and-wait in progress)

    RectTransform _rt;                                 // dot rect
    float _scale = 1f;                                 // animated transform scale
    Color _fill, _border, _glow;                       // animated colors
    float _glowExtent;                                 // animated shadow reach in px

    bool IsNav => DotKind != Kind.Checkpoint;          // .exp-dot--nav

    // Places the dot on the track at a fraction of its width (style.left = X%).
    public void Setup(Kind kind, int sceneIndex, float position)
    {
        _rt = (RectTransform)transform;                          // cached rect
        DotKind = kind;                                          // nav or checkpoint
        SceneIndex = sceneIndex;                                 // scene it belongs to
        _rt.anchorMin = _rt.anchorMax = new Vector2(position, 0.5f); // left: X%, top: 50%
        _rt.anchoredPosition = Vector2.zero;                     // translate(-50%, -50%) via centered pivot
        glow.sprite = ProceduralSprites.EllipseShadow(32, 32, 16f); // round box-shadow
        fill.sprite = ProceduralSprites.Disc(64);                // border-radius: 50%
        border.sprite = ProceduralSprites.Ring(64, 28f, 8f);     // stroke on the outer edge: ~2px at 16 px (scaled with the dot)
        ComputeTarget(out _scale, out _fill, out _border, out _glow, out _glowExtent, out _); // start at rest
    }

    // True when a screen point is inside the dot's bounding box, including its scale.
    public bool Contains(Vector2 screenPosition)
    {
        return RectTransformUtility.RectangleContainsScreenPoint(_rt, screenPosition, null); // _hitTest
    }

    // Dot center in screen pixels.
    public Vector2 ScreenCenter => RectTransformUtility.WorldToScreenPoint(null, _rt.position);

    // Animates towards the visual state that the CSS rules would produce.
    void Update()
    {
        ComputeTarget(out float scale, out Color fillColor, out Color borderColor, out Color glowColor, out float extent, out float size); // CSS cascade
        float step = Time.unscaledDeltaTime / TransitionSeconds;                       // linear 0.2s transition
        _scale = Mathf.MoveTowards(_scale, scale, step * 2.5f);                         // transform
        _fill = MoveTowards(_fill, fillColor, step);                                    // background
        _border = MoveTowards(_border, borderColor, step);                              // border-color
        _glow = MoveTowards(_glow, glowColor, step);                                    // box-shadow color
        _glowExtent = Mathf.MoveTowards(_glowExtent, extent, step * 30f);               // box-shadow size

        float brightness = Dwelling && !IsNav ? Mathf.Lerp(1f, 1.35f, CssEasing.PingPong(Time.unscaledTime, 1.2f)) : 1f; // dwell-pulse 0.6s alternate
        _rt.sizeDelta = new Vector2(size, size);                                        // width/height change instantly in CSS
        _rt.localScale = new Vector3(_scale, _scale, 1f);                               // scale(..)
        fill.color = new Color(_fill.r * brightness, _fill.g * brightness, _fill.b * brightness, _fill.a); // filter: brightness()
        border.color = _border;                                                         // ring
        glow.color = _glow;                                                             // shadow
        float g = size + _glowExtent * 2f;                                              // shadow box
        glow.rectTransform.sizeDelta = new Vector2(g, g);                               // spread + blur around the dot
        check.SetActive(Active && !IsNav);                                              // .checkpoint::after ✓
    }

    // CSS cascade for this dot: returns scale, colors, shadow reach and size.
    void ComputeTarget(out float scale, out Color fillColor, out Color borderColor, out Color glowColor, out float extent, out float size)
    {
        scale = 1f;                                                    // no transform
        if (IsNav)                                                     // .exp-dot--nav
        {
            size = 16f;                                                // 16px
            fillColor = Green; borderColor = Color.white;              // #3DBE82, #fff
            glowColor = Alpha(Green, 0.5f); extent = 6f;               // 0 0 6px rgba(61,190,130,0.5)
            if (Near) { scale = 2.1f; fillColor = GreenLight; glowColor = Alpha(Green, 0.85f); extent = 16f; } // .finger-near
            if (Dwelling) { fillColor = GreenLight; borderColor = Color.white; glowColor = Alpha(Green, 0.75f); extent = 28f; } // .dwelling
            return;
        }

        size = Active ? 22f : 14f;                                      // .checkpoint is 22px
        if (Active)                                                    // .checkpoint
        {
            fillColor = AppTheme.Gold; borderColor = Color.white;     // gold with white border
            float pulse = CssEasing.PingPong(Time.unscaledTime, 1.2f); // dotPulse 1.2s
            glowColor = AppTheme.Gold; extent = Mathf.Lerp(10f, 21f, pulse); // 8px 2px <-> 16px 5px
        }
        else if (Done)                                                 // .done
        {
            fillColor = AppTheme.GoldDark; borderColor = AppTheme.Gold; // gold-dark with gold border
            glowColor = AppTheme.GoldDark; extent = 6f;               // 0 0 6px gold-dark
        }
        else                                                           // default dot
        {
            fillColor = new Color(20f / 255f, 20f / 255f, 20f / 255f, 0.85f); // rgba(20,20,20,0.85)
            borderColor = new Color(1f, 1f, 1f, 0.3f);                 // rgba(255,255,255,0.3)
            glowColor = new Color(1f, 1f, 1f, 0f); extent = 0f;        // no shadow
        }

        if (Near)                                                      // .finger-near:not(.exp-dot--nav)
        {
            scale = Active ? 2.0f : 2.4f;                              // checkpoint near uses 2.0
            fillColor = new Color(80f / 255f, 80f / 255f, 80f / 255f, 0.95f); // rgba(80,80,80,0.95)
            borderColor = new Color(1f, 1f, 1f, 0.9f);                 // rgba(255,255,255,0.9)
            glowColor = Active ? AppTheme.Gold : new Color(1f, 1f, 1f, 0.35f); // gold for the checkpoint
            extent = Active ? 22f : 14f;                               // 18px 4px vs 14px
        }

        if (Dwelling)                                                  // .dwelling (!important)
        {
            borderColor = AppTheme.Gold;                               // border-color: gold
            glowColor = Alpha(AppTheme.Gold, 0.65f); extent = 28f;     // 0 0 22px 6px rgba(212,175,55,0.65)
        }
    }

    // Moves every channel of a color toward a target.
    static Color MoveTowards(Color from, Color to, float step)
    {
        return new Color(Mathf.MoveTowards(from.r, to.r, step), Mathf.MoveTowards(from.g, to.g, step),
                         Mathf.MoveTowards(from.b, to.b, step), Mathf.MoveTowards(from.a, to.a, step)); // linear blend
    }

    // Same color with another alpha.
    static Color Alpha(Color c, float a)
    {
        c.a = a;  // replace alpha
        return c;
    }

    // 0xRRGGBB to Color.
    static Color Hex(int rgb)
    {
        return new Color(((rgb >> 16) & 0xFF) / 255f, ((rgb >> 8) & 0xFF) / 255f, (rgb & 0xFF) / 255f, 1f); // opaque
    }
}
