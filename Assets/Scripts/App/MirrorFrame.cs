using System.Collections.Generic; // List
using UnityEngine;                // MonoBehaviour, RectTransform, Mathf, Color
using UnityEngine.UI;             // Image

// Vanity-mirror LED frame (port of js/mirror-frame.js and the .bulb CSS keyframes).
// 52 bulbs: left rail and right rail (15 each, full height) and a top rail (22) between them.
public class MirrorFrame : MonoBehaviour
{
    const int BulbsTop = 22;        // bulbs in the top rail
    const int BulbsSide = 15;       // bulbs in each side rail
    const float PulseCycle = 2.2f;  // seconds per pulse (bulbPulse 2.2s)

    [SerializeField] float frameWidth = 62f;      // --frame-width
    [SerializeField] float bulbSize = 14f;        // --bulb-size
    [SerializeField] float flashStep = 0.026f;    // STEP_MS between bulbs in the wave
    [SerializeField] float flashDuration = 0.32f; // FLASH_MS (bulbFlash 0.32s)

    static readonly Color WarmCore = AppTheme.BulbWarm;                            // --bulb-warm
    static readonly Color WarmGlow = new Color(1f, 248f / 255f, 200f / 255f, 1f);  // rgba(255,248,200) inner shadow
    static readonly Color WarmHalo = new Color(1f, 240f / 255f, 160f / 255f, 1f);  // rgba(255,240,160) outer shadow
    static readonly Color FlashMid = new Color(1f, 1f, 238f / 255f, 1f);           // #ffffee

    // One CSS box-shadow layer: 0 0 blur spread color.
    struct Shadow
    {
        public float Blur, Spread; // px
        public Color Color;        // rgba (alpha included)

        // Creates a layer.
        public Shadow(float blur, float spread, Color color, float alpha)
        {
            Blur = blur; Spread = spread; Color = color; Color.a = alpha; // rgba
        }

        // CSS interpolation between two layers (a missing layer is "0 0 0 0 transparent" with the same rgb).
        public static Shadow Lerp(Shadow a, Shadow b, float t)
        {
            return new Shadow(Mathf.Lerp(a.Blur, b.Blur, t), Mathf.Lerp(a.Spread, b.Spread, t),
                              Color.Lerp(a.Color, b.Color, t), Mathf.Lerp(a.Color.a, b.Color.a, t));
        }

        // The padding layer CSS uses when the other list is shorter.
        public Shadow None => new Shadow(0f, 0f, Color, 0f);
    }

    // Runtime state of one bulb.
    class Bulb
    {
        public Image Core;              // the bulb disc
        public Image Glow;              // first box-shadow (tight, bright)
        public Image Halo;              // second box-shadow (wide, soft)
        public float Phase;             // negative animation-delay in seconds
        public float FlashStart = -10f; // when the current flash started
        public float FlashLength = 0.32f; // duration of the current flash animation
        public bool CameraFlash;        // cameraFlashAnim instead of bulbFlash
    }

    readonly List<Bulb> _bulbs = new List<Bulb>();  // all bulbs, any order
    readonly List<Bulb> _byWave = new List<Bulb>(); // bulbs sorted by perimeter position (data-wave-pos)

    public static MirrorFrame Instance { get; private set; } // screens trigger flashes outside of pinches (dwell, clicks)

    // Creates the three rails and their bulbs (web initMirrorFrame).
    void Awake()
    {
        Instance = this; // single frame in Main.unity
        var left = Rail("BulbsLeft", new Vector2(0f, 0f), new Vector2(0f, 1f), new Vector2(frameWidth, 0f), new Vector2(frameWidth * 0.5f, 0f));  // left edge, full height
        var top = Rail("BulbsTop", new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(-frameWidth * 2f, frameWidth), new Vector2(0f, -frameWidth * 0.5f)); // between the sides
        var right = Rail("BulbsRight", new Vector2(1f, 0f), new Vector2(1f, 1f), new Vector2(frameWidth, 0f), new Vector2(-frameWidth * 0.5f, 0f)); // right edge, full height

        var wave = new SortedDictionary<int, Bulb>(); // perimeter position -> bulb
        for (int i = 0; i < BulbsSide; i++) wave[BulbsSide - 1 - i] = CreateBulb(left, i, BulbsSide, true);             // wave climbs the left rail
        for (int i = 0; i < BulbsTop; i++) wave[BulbsSide + i] = CreateBulb(top, i, BulbsTop, false);                     // then crosses the top
        for (int i = 0; i < BulbsSide; i++) wave[BulbsSide + BulbsTop + i] = CreateBulb(right, i, BulbsSide, true);       // then descends the right
        _byWave.AddRange(wave.Values);                                                                                      // flash order
    }

    // Flashes on every confirmed pinch, like _onPinchConfirmed -> triggerSelectionFlash.
    void OnEnable()
    {
        HandGestures.PinchConfirmed += OnPinchConfirmed; // global selection feedback
    }

    // Stops reacting to pinches.
    void OnDisable()
    {
        HandGestures.PinchConfirmed -= OnPinchConfirmed; // avoid leaks
    }

    // Pinch handler.
    void OnPinchConfirmed(Vector2 _)
    {
        TriggerSelectionFlash(); // white wave around the frame
    }

    // White flash that travels around the perimeter (web triggerSelectionFlash).
    public void TriggerSelectionFlash()
    {
        float now = Time.unscaledTime;                                                // wave start
        for (int k = 0; k < _byWave.Count; k++) StartFlash(_byWave[k], now + k * flashStep, flashDuration, false); // staggered by perimeter order
    }

    // Uniform blink of every bulb on each countdown tick (web triggerCountdownBlink: bulbFlash 0.28s).
    public void TriggerCountdownBlink()
    {
        float now = Time.unscaledTime;                          // all at once
        foreach (var bulb in _bulbs) StartFlash(bulb, now, 0.28f, false); // .countdown-blink
    }

    // Photo flash: every bulb bright white at the same time (web triggerCameraFlash: cameraFlashAnim 0.75s).
    public void TriggerCameraFlash()
    {
        float now = Time.unscaledTime;                          // all at once
        foreach (var bulb in _bulbs) StartFlash(bulb, now, 0.75f, true); // .camera-flash
    }

    // Schedules one flash animation on a bulb.
    static void StartFlash(Bulb bulb, float start, float length, bool camera)
    {
        bulb.FlashStart = start;   // animation start
        bulb.FlashLength = length; // animation-duration
        bulb.CameraFlash = camera; // which keyframes
    }

    // Animates every bulb: pulse by default, flash keyframes while flashing.
    void Update()
    {
        float now = Time.unscaledTime; // CSS animations ignore game time scale
        foreach (var bulb in _bulbs)
        {
            float flashT = (now - bulb.FlashStart) / bulb.FlashLength; // 0..1 while flashing
            bool flashing = flashT >= 0f && flashT <= 1f;              // a flash class is applied
            if (flashing && bulb.CameraFlash) ApplyCameraFlash(bulb, flashT); // cameraFlashAnim overrides the pulse
            else if (flashing) ApplyFlash(bulb, flashT);               // bulbFlash overrides the pulse
            else ApplyPulse(bulb, CssEasing.PingPong(now + bulb.Phase, PulseCycle)); // bulbPulse continues its timeline
        }
    }

    // bulbPulse keyframes (style.css): 0%/100% rest, 50% bright.
    static readonly Shadow PulseGlowLow = new Shadow(4f, 2f, WarmGlow, 0.4f);   // 0 0 4px 2px rgba(255,248,200,.4)
    static readonly Shadow PulseGlowHigh = new Shadow(8f, 4f, WarmGlow, 0.9f);  // 0 0 8px 4px rgba(255,248,200,.9)
    static readonly Shadow PulseHaloLow = new Shadow(10f, 3f, WarmHalo, 0.2f);  // 0 0 10px 3px rgba(255,240,160,.2)
    static readonly Shadow PulseHaloHigh = new Shadow(20f, 7f, WarmHalo, 0.5f); // 0 0 20px 7px rgba(255,240,160,.5)

    // bulbFlash keyframes: 0% two white layers, 60% one warm layer, 100% resting warm layer.
    static readonly Shadow FlashGlow0 = new Shadow(20f, 10f, Color.white, 0.95f); // 0 0 20px 10px rgba(255,255,255,.95)
    static readonly Shadow FlashHalo0 = new Shadow(40f, 15f, Color.white, 0.6f);  // 0 0 40px 15px rgba(255,255,255,.6)
    static readonly Shadow FlashGlow60 = new Shadow(14f, 7f, WarmGlow, 0.8f);     // 0 0 14px 7px rgba(255,248,200,.8)

    // cameraFlashAnim keyframes: 0% two white layers, 100% resting warm layer.
    static readonly Shadow CameraGlow0 = new Shadow(30f, 15f, Color.white, 1f);    // 0 0 30px 15px rgba(255,255,255,1)
    static readonly Shadow CameraHalo0 = new Shadow(60f, 25f, Color.white, 0.75f); // 0 0 60px 25px rgba(255,255,255,.75)

    // bulbPulse: opacity 0.55 -> 1 -> 0.55 with both glow layers growing.
    void ApplyPulse(Bulb bulb, float e)
    {
        Paint(bulb, WarmCore, Mathf.Lerp(0.55f, 1f, e),
              Shadow.Lerp(PulseGlowLow, PulseGlowHigh, e), Shadow.Lerp(PulseHaloLow, PulseHaloHigh, e));
    }

    // bulbFlash keyframes (0%, 60%, 100%) with ease-out per segment.
    void ApplyFlash(Bulb bulb, float t)
    {
        if (t < 0.6f) // 0% -> 60%
        {
            float k = CssEasing.EaseOut(t / 0.6f);                                    // segment progress
            Paint(bulb, Color.Lerp(Color.white, FlashMid, k), Mathf.Lerp(1f, 0.9f, k),
                  Shadow.Lerp(FlashGlow0, FlashGlow60, k), Shadow.Lerp(FlashHalo0, FlashHalo0.None, k)); // halo fades out
        }
        else // 60% -> 100%
        {
            float k = CssEasing.EaseOut((t - 0.6f) / 0.4f);                           // segment progress
            Paint(bulb, Color.Lerp(FlashMid, WarmCore, k), Mathf.Lerp(0.9f, 0.55f, k),
                  Shadow.Lerp(FlashGlow60, PulseGlowLow, k), FlashHalo0.None);         // back to resting warm
        }
    }

    // cameraFlashAnim keyframes: white until 40%, then back to warm; box-shadow is only set at 0% and 100%,
    // so it shrinks across the whole animation (ease-out).
    void ApplyCameraFlash(Bulb bulb, float t)
    {
        float k = CssEasing.EaseOut(t);                                                 // box-shadow track 0% -> 100%
        var glow = Shadow.Lerp(CameraGlow0, PulseGlowLow, k);                           // white -> warm, shrinking
        var halo = Shadow.Lerp(CameraHalo0, CameraHalo0.None, k);                       // wide halo fades out
        if (t < 0.4f) { Paint(bulb, Color.white, 1f, glow, halo); return; }            // 0% -> 40%: solid white
        float b = CssEasing.EaseOut((t - 0.4f) / 0.6f);                                 // 40% -> 100% segment
        Paint(bulb, Color.Lerp(Color.white, WarmCore, b), Mathf.Lerp(1f, 0.55f, b), glow, halo); // fade to rest
    }

    // Writes color, opacity and both shadow layers of a bulb.
    void Paint(Bulb bulb, Color core, float opacity, Shadow glow, Shadow halo)
    {
        core.a = opacity;                      // CSS opacity on the element
        bulb.Core.color = core;                // disc color
        PaintShadow(bulb.Glow, glow, opacity); // element opacity also dims the shadows
        PaintShadow(bulb.Halo, halo, opacity);
    }

    // Shows one box-shadow layer: a blurred disc of radius bulb + spread, sized to cover its blur tail.
    void PaintShadow(Image image, Shadow shadow, float opacity)
    {
        float alpha = shadow.Color.a * opacity;                                   // final alpha
        if (alpha <= 0.002f) { image.enabled = false; return; }                   // transparent layer
        image.enabled = true;
        float blur = Mathf.Max(shadow.Blur, 0.5f);                                // avoid a zero-width profile
        float ratio = (bulbSize * 0.5f + shadow.Spread) / blur;                   // disc radius in blur units
        ratio = Mathf.Clamp(Mathf.Round(ratio * 8f) / 8f, 0.125f, 6f);            // cached sprite steps
        image.sprite = ProceduralSprites.CircleShadow(ratio);                     // Gaussian-blurred disc
        float side = 2f * blur * (ratio + 2f);                                    // sprite covers radius + 2 blur
        image.rectTransform.sizeDelta = new Vector2(side, side);
        var color = shadow.Color; color.a = alpha;
        image.color = color;                                                      // rgba of the layer
    }

    // Creates a rail container anchored to one edge of the frame.
    RectTransform Rail(string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 sizeDelta, Vector2 position)
    {
        var rail = new GameObject(name, typeof(RectTransform)).GetComponent<RectTransform>(); // empty container
        rail.SetParent(transform, false);  // child of the frame
        rail.anchorMin = anchorMin;        // edge anchors
        rail.anchorMax = anchorMax;
        rail.sizeDelta = sizeDelta;        // thickness (and inset for the top rail)
        rail.anchoredPosition = position;  // centered on the strip
        return rail;
    }

    // Creates bulb i of count inside a rail, spaced like flex "space-around".
    Bulb CreateBulb(RectTransform rail, int i, int count, bool vertical)
    {
        float along = (i + 0.5f) / count;                                    // space-around position
        var root = new GameObject("Bulb" + i, typeof(RectTransform)).GetComponent<RectTransform>(); // bulb holder
        root.SetParent(rail, false);                                         // inside the rail
        var anchor = vertical ? new Vector2(0.5f, 1f - along) : new Vector2(along, 0.5f); // DOM order: top->bottom, left->right
        root.anchorMin = root.anchorMax = anchor;                            // point anchor
        root.sizeDelta = new Vector2(bulbSize, bulbSize);                    // bulb box

        var bulb = new Bulb
        {
            Halo = Layer(root, "Halo", null, bulbSize * 3f),                       // second shadow, painted first (bottom)
            Glow = Layer(root, "Glow", null, bulbSize * 3f),                       // first shadow, over the halo
            Core = Layer(root, "Core", ProceduralSprites.Disc(64), bulbSize),      // disc on top
            Phase = (float)i / count * PulseCycle                                  // animation-delay: -(i/count)*2.2s
        };
        _bulbs.Add(bulb);                                                    // animate every frame
        return bulb;
    }

    // Adds a centered image layer to a bulb.
    static Image Layer(RectTransform parent, string name, Sprite sprite, float size)
    {
        var rt = new GameObject(name, typeof(RectTransform), typeof(Image)).GetComponent<RectTransform>(); // image holder
        rt.SetParent(parent, false);                       // inside the bulb
        rt.sizeDelta = new Vector2(size, size);            // square
        var image = rt.GetComponent<Image>();              // graphic
        image.sprite = sprite;                             // generated shape
        image.raycastTarget = false;                       // pointer-events: none
        return image;
    }
}
