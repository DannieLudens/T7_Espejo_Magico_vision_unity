using UnityEngine;    // MonoBehaviour, RectTransform, Vector2, Mathf
using UnityEngine.UI; // Image

// Finger-driven lipstick cursor and pinch progress ring (port of js/cursor.js).
// Hidden until the first hand is detected; the mouse never moves it.
public class HandCursor : MonoBehaviour
{
    [SerializeField] RectTransform lipstick;              // lipstick image, pivot at its top-left tip (hotspot)
    [SerializeField] CanvasGroup lipstickGlow;            // gold drop-shadow shown while pinching
    [SerializeField] RectTransform progressRing;          // ring root, centered on the finger
    [SerializeField] Image progressFill;                  // radial filled stroke
    [SerializeField] CanvasGroup progressGroup;           // ring opacity
    [SerializeField, Range(0f, 1f)] float follow = 0.55f; // _CUR_LERP: fast lerp toward the tracker position
    [SerializeField] float ringFadeSeconds = 0.2f;        // #pinch-progress transition: opacity 0.2s
    [SerializeField] float popScale = 1.35f;              // #lipstick-cursor.pop scale
    [SerializeField] float popGrowSeconds = 0.2f;         // pop transition duration
    [SerializeField] float popHoldSeconds = 0.3f;         // class removed after 300 ms

    RectTransform _root;                         // full-screen parent used for coordinate conversion
    Vector2 _target = new Vector2(-300f, -300f); // latest finger position (local)
    Vector2 _current = new Vector2(-300f, -300f);// rendered position (local)
    bool _handSeen;                              // false until the first handMove
    bool _ringActive;                            // ring should be visible
    float _popStart = -10f;                      // time of the last pop

    // Caches the root rect and hides everything until a hand appears.
    void Awake()
    {
        _root = (RectTransform)transform;           // cursor layer covers the whole screen
        lipstick.gameObject.SetActive(false);       // visibility: hidden
        lipstickGlow.alpha = 0f;                    // no pinch glow yet
        progressGroup.alpha = 0f;                   // ring hidden
        progressFill.fillAmount = 0f;               // empty ring
    }

    // Subscribes to the hand gesture feed.
    void OnEnable()
    {
        HandGestures.HandMoved += OnHandMoved;           // follow the finger
        HandGestures.PinchStarted += OnPinchStarted;     // show ring
        HandGestures.PinchProgress += OnPinchProgress;   // fill ring
        HandGestures.PinchConfirmed += OnPinchConfirmed; // pop
        HandGestures.PinchEnded += OnPinchEnded;         // hide ring
    }

    // Unsubscribes from the hand gesture feed.
    void OnDisable()
    {
        HandGestures.HandMoved -= OnHandMoved;
        HandGestures.PinchStarted -= OnPinchStarted;
        HandGestures.PinchProgress -= OnPinchProgress;
        HandGestures.PinchConfirmed -= OnPinchConfirmed;
        HandGestures.PinchEnded -= OnPinchEnded;
    }

    // Stores the new target and reveals the cursor on the first detection.
    void OnHandMoved(Vector2 screenPosition)
    {
        _target = ToLocal(screenPosition);                 // web _curTargetX/Y
        if (_handSeen) return;                             // already visible
        _handSeen = true;                                  // first detection
        lipstick.gameObject.SetActive(true);               // visibility: visible
    }

    // Pinch started: glow on, empty ring visible.
    void OnPinchStarted(Vector2 screenPosition)
    {
        lipstickGlow.alpha = 1f;          // .pinching drop-shadow
        _ringActive = true;               // .active
        progressFill.fillAmount = 0f;     // _curSetProgress(0)
    }

    // Pinch held: fill and move the ring.
    void OnPinchProgress(Vector2 screenPosition, float progress)
    {
        progressFill.fillAmount = progress;                   // stroke-dashoffset
        progressRing.anchoredPosition = ToLocal(screenPosition); // ring centered on the finger
    }

    // Pinch confirmed: hide ring and play the pop animation.
    void OnPinchConfirmed(Vector2 screenPosition)
    {
        ClearPinch();                      // same cleanup as pinchEnd
        _popStart = Time.unscaledTime;     // _curPopAnimation
    }

    // Pinch released early: hide ring.
    void OnPinchEnded()
    {
        ClearPinch(); // remove .pinching and .active
    }

    // Removes pinch visuals.
    void ClearPinch()
    {
        lipstickGlow.alpha = 0f;       // no glow
        _ringActive = false;           // fade ring out
        progressFill.fillAmount = 0f;  // empty ring
    }

    // Moves the cursor, fades the ring and runs the pop scale.
    void Update()
    {
        _current += (_target - _current) * follow;   // web tick(): fast lerp each frame
        lipstick.anchoredPosition = _current;        // tip follows the finger

        float ringTarget = _ringActive ? 1f : 0f;                                                   // desired opacity
        progressGroup.alpha = Mathf.MoveTowards(progressGroup.alpha, ringTarget, Time.unscaledDeltaTime / ringFadeSeconds); // 0.2s fade

        float sincePop = Time.unscaledTime - _popStart;                                             // pop timeline
        float scale = 1f;                                                                           // default size
        if (sincePop >= 0f && sincePop < popHoldSeconds)                                            // .pop applied
            scale = Mathf.LerpUnclamped(1f, popScale, CssEasing.BackOut(Mathf.Clamp01(sincePop / popGrowSeconds))); // grow with overshoot
        lipstick.localScale = new Vector3(scale, scale, 1f);                                        // snaps back when .pop is removed
    }

    // Converts a screen point into the cursor layer's local coordinates.
    Vector2 ToLocal(Vector2 screenPosition)
    {
        RectTransformUtility.ScreenPointToLocalPointInRectangle(_root, screenPosition, null, out var local); // overlay canvas: no camera
        return local; // relative to the layer pivot (center)
    }
}
