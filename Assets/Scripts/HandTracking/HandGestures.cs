using System;                        // Action
using System.Collections.Concurrent; // ConcurrentQueue
using UnityEngine;                   // MonoBehaviour, Vector2, Screen, Time

// Turns raw hand frames into cursor and pinch events (port of js/hand-tracker.js).
// Events are static and always raised on the main thread, in screen pixels (origin bottom-left).
public class HandGestures : MonoBehaviour
{
    [SerializeField] float pinchThreshold = 0.07f;            // thumb-index normalized distance (web PINCH_THRESHOLD)
    [SerializeField] float pinchHoldSeconds = 1.5f;           // hold time to confirm (web PINCH_HOLD_MS)
    [SerializeField, Range(0f, 1f)] float smoothing = 0.18f;  // lerp per frame (web LERP_ALPHA)

    public static event Action<Vector2> HandMoved;            // smoothed index fingertip position
    public static event Action HandLost;                      // hand left the camera
    public static event Action<Vector2> PinchStarted;         // pinch began
    public static event Action<Vector2, float> PinchProgress; // pinch held, progress 0..1
    public static event Action<Vector2> PinchConfirmed;       // pinch held long enough
    public static event Action PinchEnded;                    // pinch released before confirming
    public static event Action<HandFrame, float, bool> FrameProcessed; // raw frame, pinch distance, pinched (debug overlay)

    public static bool HandVisible { get; private set; }      // true while a hand is tracked
    public static Vector2 Position { get; private set; }      // last smoothed fingertip position
    public static float PinchThreshold { get; private set; } = 0.07f; // current threshold, shown by the debug overlay

    readonly ConcurrentQueue<HandFrame> _frames = new ConcurrentQueue<HandFrame>(); // provider thread -> main thread
    Vector2 _smooth = new Vector2(-200f, -200f);              // web starts the cursor off-screen
    float _pinchStart = -1f;                                  // time the current pinch started, -1 when idle
    bool _waitingForRelease;                                  // after a confirm, wait for the hand to open

    // Starts listening to the active hand tracking provider.
    void OnEnable()
    {
        PinchThreshold = pinchThreshold;              // publish the inspector value
        HandTrackingService.FrameReceived += Enqueue; // frames may arrive on a worker thread
    }

    // Stops listening to the provider.
    void OnDisable()
    {
        HandTrackingService.FrameReceived -= Enqueue; // avoid leaks between play sessions
    }

    // Stores a frame for processing on the main thread.
    void Enqueue(HandFrame frame)
    {
        _frames.Enqueue(frame); // thread-safe handoff
    }

    // Processes every frame received since the last update.
    void Update()
    {
        while (_frames.TryDequeue(out var frame)) Process(frame); // same order as MediaPipe results
    }

    // Port of _onResults: hand lost, cursor smoothing and pinch detection.
    void Process(HandFrame frame)
    {
        if (!frame.HasHand) // no hand in this result
        {
            FrameProcessed?.Invoke(frame, 0f, false); // debug canvas is cleared on every empty result
            if (!HandVisible) return; // already reported
            HandVisible = false;      // hand gone
            ResetPinch();             // cancel any pinch in progress
            HandLost?.Invoke();       // notify listeners once
            return;
        }

        HandVisible = true;                                       // a hand is in the frame
        var index = frame.Landmarks[HandFrame.IndexTip];          // index fingertip (landmark 8)
        var thumb = frame.Landmarks[HandFrame.ThumbTip];          // thumb tip (landmark 4)
        var raw = new Vector2(index.x * Screen.width, (1f - index.y) * Screen.height); // mirror-view top-left -> screen bottom-left
        _smooth = Vector2.Lerp(_smooth, raw, smoothing);          // web _lerp(_smoothX, rawX, LERP_ALPHA)
        Position = _smooth;                                       // expose for late subscribers
        HandMoved?.Invoke(_smooth);                               // web 'handMove'

        float distance = Vector2.Distance(new Vector2(thumb.x, thumb.y), new Vector2(index.x, index.y)); // pinch gap in image space
        bool pinched = distance < pinchThreshold;                 // fingers closed
        UpdatePinch(pinched);                                     // web _updatePinch
        FrameProcessed?.Invoke(frame, distance, pinched);         // web _drawDebug
    }

    // Pinch hold state machine (web _updatePinch).
    void UpdatePinch(bool pinched)
    {
        if (!pinched) { ResetPinch(); return; } // fingers apart, reset
        if (_waitingForRelease) return;         // avoid repeated confirms while the pinch is held

        if (_pinchStart < 0f)                   // first pinched frame
        {
            _pinchStart = Time.unscaledTime;    // start timing
            PinchStarted?.Invoke(_smooth);      // web 'pinchStart'
        }

        float progress = Mathf.Min((Time.unscaledTime - _pinchStart) / pinchHoldSeconds, 1f); // 0..1
        PinchProgress?.Invoke(_smooth, progress); // web 'pinchProgress'

        if (progress < 1f) return;              // keep holding
        PinchConfirmed?.Invoke(_smooth);        // web 'pinchConfirmed'
        _pinchStart = -1f;                      // pinch consumed
        _waitingForRelease = true;              // block until the hand opens
    }

    // Cancels a pinch in progress and re-arms detection (web _resetPinch).
    void ResetPinch()
    {
        if (_pinchStart >= 0f)                      // a pinch was being held
        {
            if (!_waitingForRelease) PinchEnded?.Invoke(); // released before confirming
            _pinchStart = -1f;                      // clear timer
        }
        _waitingForRelease = false;                 // next pinch is allowed
    }
}
