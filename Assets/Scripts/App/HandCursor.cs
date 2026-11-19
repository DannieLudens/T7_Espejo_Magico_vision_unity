using System.Collections.Generic; // List
using UnityEngine;                // MonoBehaviour, RectTransform, Vector2, Mathf
using UnityEngine.EventSystems;   // EventSystem, PointerEventData, RaycastResult
using UnityEngine.UI;             // Image

// Finger-driven dual cursor and pinch progress ring (port of js/cursor.js).
// Lipstick by default, 👌 over actionable elements; hidden until the first hand is detected.
public class HandCursor : MonoBehaviour
{
    [SerializeField] RectTransform lipstick;              // lipstick image, pivot at its top-left tip (hotspot)
    [SerializeField] CanvasGroup lipstickGlow;            // gold drop-shadow shown while pinching
    [SerializeField] RectTransform pinchCursor;           // 👌 centered on the finger (interactive mode)
    [SerializeField] CanvasGroup pinchCursorGlow;         // gold drop-shadow of the 👌 while pinching
    [SerializeField] RectTransform progressRing;          // ring root, centered on the finger
    [SerializeField] Image progressFill;                  // radial filled stroke
    [SerializeField] CanvasGroup progressGroup;           // ring opacity
    [SerializeField, Range(0f, 1f)] float follow = 0.55f; // _CUR_LERP: fast lerp toward the tracker position
    [SerializeField] float ringFadeSeconds = 0.2f;        // #pinch-progress transition: opacity 0.2s
    [SerializeField] float popGrowSeconds = 0.2f;         // pop transition duration
    [SerializeField] float popHoldSeconds = 0.3f;         // .pop removed after 300 ms

    public static HandCursor Instance { get; private set; }  // single cursor layer in Main.unity

    RectTransform _root;                                     // full-screen parent used for coordinate conversion
    bool _dwellActive;                                       // ring driven by a dwell selection
    Vector2 _target = new Vector2(-300f, -300f);             // latest finger position (local)
    Vector2 _current = new Vector2(-300f, -300f);            // rendered position (local)
    bool _handSeen;                                          // false until the first handMove
    bool _interactive;                                       // finger over a HandInteractable
    bool _pinching;                                          // pinch held (.pinching)
    bool _ringActive;                                        // ring should be visible
    float _popStart = -10f;                                  // time of the last pop
    bool _popOnPinchCursor;                                  // which cursor pops
    CanvasGroup _layer;                                      // whole-layer visibility (mirror mode)
    PointerEventData _pointer;                               // reused raycast query
    readonly List<RaycastResult> _hits = new List<RaycastResult>(); // reused raycast results

    // Caches the root rect and hides everything until a hand appears.
    void Awake()
    {
        Instance = this;                            // screens use it for dwell progress
        _root = (RectTransform)transform;           // cursor layer covers the whole screen
        lipstick.gameObject.SetActive(false);       // visibility: hidden
        pinchCursor.gameObject.SetActive(false);    // visibility: hidden
        lipstickGlow.alpha = 0f;                    // no pinch glow yet
        pinchCursorGlow.alpha = 0f;                 // no pinch glow yet
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
        _target = ToLocal(screenPosition);  // web _curTargetX/Y
        if (_handSeen) return;              // already visible
        _handSeen = true;                   // first detection
        ApplyMode();                        // show the lipstick
    }

    // Pinch started: glow on, empty ring visible.
    void OnPinchStarted(Vector2 screenPosition)
    {
        _pinching = true;                 // .pinching
        _ringActive = true;               // .active
        progressFill.fillAmount = 0f;     // _curSetProgress(0)
    }

    // Pinch held: fill and move the ring.
    void OnPinchProgress(Vector2 screenPosition, float progress)
    {
        progressFill.fillAmount = progress;                      // stroke-dashoffset
        progressRing.anchoredPosition = ToLocal(screenPosition); // ring centered on the finger
    }

    // Pinch confirmed: hide ring and pop the visible cursor.
    void OnPinchConfirmed(Vector2 screenPosition)
    {
        ClearPinch();                     // same cleanup as pinchEnd
        _popStart = Time.unscaledTime;    // _curPopAnimation
        _popOnPinchCursor = _interactive; // pop whichever cursor is visible
    }

    // Pinch released early: hide ring.
    void OnPinchEnded()
    {
        ClearPinch(); // remove .pinching and .active
    }

    // Shows the ring centered on an element with a dwell progress (web curShowDwellProgress); progress 0 hides it.
    public void ShowDwellProgress(float progress, Vector2 screenPosition)
    {
        if (progress <= 0f)                                          // dwell cancelled or confirmed
        {
            _dwellActive = false;                                    // .active removed
            progressFill.fillAmount = 0f;                            // _curSetProgress(0)
            return;
        }
        _dwellActive = true;                                         // .active
        progressFill.fillAmount = progress;                          // stroke-dashoffset
        progressRing.anchoredPosition = ToLocal(screenPosition);     // ring over the element center
    }

    // Hides every cursor while a scene asks for it (body.mirror-mode #lipstick-cursor { display: none }); tracking keeps running.
    public void SetSuppressed(bool suppressed)
    {
        if (_layer == null) _layer = GetComponent<CanvasGroup>();                // cached group
        if (_layer == null) _layer = gameObject.AddComponent<CanvasGroup>();     // created on first use
        _layer.alpha = suppressed ? 0f : 1f;                                     // display: none / visible
        _layer.blocksRaycasts = false;                                           // cursors never take clicks
        _layer.interactable = false;
    }

    // Removes pinch visuals.
    void ClearPinch()
    {
        _pinching = false;             // no glow
        _ringActive = false;           // fade ring out
        progressFill.fillAmount = 0f;  // empty ring
    }

    // Moves the cursors, detects interactive elements, fades the ring and runs the pop.
    void Update()
    {
        _current += (_target - _current) * follow;   // web tick(): fast lerp each frame
        lipstick.anchoredPosition = _current;        // tip follows the finger
        pinchCursor.anchoredPosition = _current;     // 👌 centered on the finger

        if (_handSeen) UpdateInteractive();          // web _curUpdateInteractive

        lipstickGlow.alpha = _pinching ? 1f : 0f;    // #lipstick-cursor.pinching
        pinchCursorGlow.alpha = _pinching ? 1f : 0f; // #pinch-cursor.pinching

        float ringTarget = _ringActive || _dwellActive ? 1f : 0f;                                   // desired opacity
        progressGroup.alpha = Mathf.MoveTowards(progressGroup.alpha, ringTarget, Time.unscaledDeltaTime / ringFadeSeconds); // 0.2s fade

        float sincePop = Time.unscaledTime - _popStart;                    // pop timeline
        bool popping = sincePop >= 0f && sincePop < popHoldSeconds;        // .pop applied
        float grow = CssEasing.BackOut(Mathf.Clamp01(sincePop / popGrowSeconds)); // transform transition curve
        float lipstickScale = popping && !_popOnPinchCursor ? Mathf.LerpUnclamped(1f, 1.35f, grow) : 1f; // #lipstick-cursor.pop
        float pinchBase = _pinching ? 0.85f : 1f;                                                       // #pinch-cursor.pinching
        float pinchScale = popping && _popOnPinchCursor ? Mathf.LerpUnclamped(pinchBase, 1.4f, grow) : pinchBase; // #pinch-cursor.pop
        lipstick.localScale = new Vector3(lipstickScale, lipstickScale, 1f);   // scale from the tip
        pinchCursor.localScale = new Vector3(pinchScale, pinchScale, 1f);      // scale from the center
    }

    // Checks the topmost UI element under the finger (web document.elementFromPoint + closest()).
    void UpdateInteractive()
    {
        var events = EventSystem.current;                          // UI raycast entry point
        if (events == null) return;                                // no EventSystem in the scene
        if (_pointer == null) _pointer = new PointerEventData(events); // created once
        _pointer.position = RectTransformUtility.WorldToScreenPoint(null, _root.TransformPoint(_current)); // cursor in screen pixels
        _hits.Clear();                                             // reuse buffer
        events.RaycastAll(_pointer, _hits);                        // sorted top to bottom
        bool now = _hits.Count > 0 && _hits[0].gameObject.GetComponentInParent<HandInteractable>() != null; // topmost element is actionable
        if (now == _interactive) return;                           // no change
        _interactive = now;                                        // _curSetInteractive
        ApplyMode();                                               // swap cursors
    }

    // Shows the lipstick or the 👌 depending on the interactive mode.
    void ApplyMode()
    {
        lipstick.gameObject.SetActive(_handSeen && !_interactive);  // normal mode
        pinchCursor.gameObject.SetActive(_handSeen && _interactive); // pointer mode
    }

    // Converts a screen point into the cursor layer's local coordinates.
    Vector2 ToLocal(Vector2 screenPosition)
    {
        RectTransformUtility.ScreenPointToLocalPointInRectangle(_root, screenPosition, null, out var local); // overlay canvas: no camera
        return local; // relative to the layer pivot (center)
    }
}
