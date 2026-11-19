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
    static readonly Color WarmGlow = new Color(1f, 248f / 255f, 200f / 255f, 1f);  // rgba(255,248,200)
    static readonly Color FlashMid = new Color(1f, 1f, 238f / 255f, 1f);           // #ffffee

    // Runtime state of one bulb.
    class Bulb
    {
        public Image Core;              // the bulb disc
        public Image Glow;              // the box-shadow halo
        public float Phase;             // negative animation-delay in seconds
        public float FlashStart = -10f; // when the current flash started
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
        for (int k = 0; k < _byWave.Count; k++) _byWave[k].FlashStart = now + k * flashStep; // staggered by perimeter order
    }

    // Animates every bulb: pulse by default, flash keyframes while flashing.
    void Update()
    {
        float now = Time.unscaledTime; // CSS animations ignore game time scale
        foreach (var bulb in _bulbs)
        {
            float flashT = (now - bulb.FlashStart) / flashDuration; // 0..1 while flashing
            if (flashT >= 0f && flashT <= 1f) ApplyFlash(bulb, flashT); // bulbFlash overrides the pulse
            else ApplyPulse(bulb, CssEasing.PingPong(now + bulb.Phase, PulseCycle)); // bulbPulse continues its timeline
        }
    }

    // bulbPulse: opacity 0.55 -> 1 -> 0.55 with a growing glow.
    void ApplyPulse(Bulb bulb, float e)
    {
        float opacity = Mathf.Lerp(0.55f, 1f, e);                                  // element opacity
        float glowSize = bulbSize + 2f * Mathf.Lerp(6f, 12f, e);                   // box-shadow 0 0 4px 2px -> 0 0 8px 4px (spread + blur)
        float glowAlpha = Mathf.Lerp(0.4f, 0.9f, e);                               // shadow alpha
        Paint(bulb, WarmCore, opacity, WarmGlow, glowSize, glowAlpha);             // apply
    }

    // bulbFlash keyframes (0%, 60%, 100%) with ease-out per segment.
    void ApplyFlash(Bulb bulb, float t)
    {
        if (t < 0.6f) // 0% -> 60%
        {
            float k = CssEasing.EaseOut(t / 0.6f);                                                         // segment progress
            Paint(bulb, Color.Lerp(Color.white, FlashMid, k), Mathf.Lerp(1f, 0.9f, k),
                  Color.Lerp(Color.white, WarmGlow, k),
                  bulbSize + 2f * Mathf.Lerp(30f, 21f, k), Mathf.Lerp(0.95f, 0.8f, k));                   // 0 0 20px 10px -> 0 0 14px 7px
        }
        else // 60% -> 100%
        {
            float k = CssEasing.EaseOut((t - 0.6f) / 0.4f);                                                // segment progress
            Paint(bulb, Color.Lerp(FlashMid, WarmCore, k), Mathf.Lerp(0.9f, 0.55f, k), WarmGlow,
                  bulbSize + 2f * Mathf.Lerp(21f, 6f, k), Mathf.Lerp(0.8f, 0.4f, k));                      // back to resting warm
        }
    }

    // Writes color, opacity and glow to the two images of a bulb.
    void Paint(Bulb bulb, Color core, float opacity, Color glow, float glowSize, float glowAlpha)
    {
        core.a = opacity;                                                     // CSS opacity on the element
        bulb.Core.color = core;                                               // disc color
        glow.a = glowAlpha * opacity;                                         // element opacity also dims the shadow
        bulb.Glow.color = glow;                                               // halo color
        bulb.Glow.rectTransform.sizeDelta = new Vector2(glowSize, glowSize);  // halo radius
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
            Glow = Layer(root, "Glow", ProceduralSprites.Glow(64), bulbSize * 3f), // halo behind
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
