using UnityEngine; // Time, Vector2, Canvas

// Magic mirror scene (port of the MIRROR state in js/app.js): water ripple over the webcam, a 10 s countdown
// that restarts whenever a hand moves, and 10 s of continuous hand presence or a pinch leading to the pinch
// Tutorial. The hand cursors are hidden here like body.mirror-mode does.
// Kiosk change (delivery feedback): the mirror is the resting screen, so the countdown waits paused until a
// visitor moves a hand, and when it runs out the mirror re-arms itself instead of leaving for Standby.
public class MirrorScreen : ScreenController
{
    const int CountdownSeconds = 10;     // _MIRROR_CD_SECS
    const float ActivationSeconds = 10f; // mirrorActivated timer in _mmHandMove

    [SerializeField] MagicMirror mirror;         // water ripple renderer
    [SerializeField] MirrorCountdown countdown;  // ring in the bottom-left corner
    [SerializeField] VanityCredits credits;      // bottom strip credits with "Tour Telemedellín"
    [SerializeField] OperatorPanel ripplePanel;  // #mirror-config (key C)

    int _seconds;              // _mirrorCdSecs
    float _nextTick;           // next setInterval tick (keeps its phase when the count is reset)
    float _activateAt = -1f;   // _mmActivateTimer due time, -1 = not running
    bool _leaving;             // a transition was already requested
    bool _engaged;             // a visitor moved a hand since the countdown was last armed
    Camera _eventCamera;       // null for a Screen Space Overlay canvas

    // Starts the ripple and the countdown (web _onEnterState MIRROR).
    public override void OnEnter(AppState state)
    {
        var canvas = GetComponentInParent<Canvas>();                                         // root canvas
        _eventCamera = canvas != null && canvas.renderMode != RenderMode.ScreenSpaceOverlay ? canvas.worldCamera : null; // coordinate conversion
        _leaving = false;                     // fresh visit
        _activateAt = -1f;                    // no hand yet
        _engaged = false;                     // countdown paused until someone shows up
        credits.Show(true);                   // body.mirror-mode credits
        if (HandCursor.Instance != null) HandCursor.Instance.SetSuppressed(true); // cursors display: none
        mirror.Begin();                       // startMagicMirror
        countdown.Show();                     // opacity 0 -> 1
        _seconds = CountdownSeconds;          // _startMirrorCountdown
        countdown.Apply(_seconds, CountdownSeconds);
        _nextTick = Time.unscaledTime + 1f;   // setInterval(1000)
    }

    // Stops the ripple and restores the cursors (web _onLeaveState MIRROR).
    public override void OnExit(AppState state)
    {
        mirror.End();                         // stopMagicMirror
        credits.Hide();                       // remove mirror-mode
        if (HandCursor.Instance != null) HandCursor.Instance.SetSuppressed(false); // cursors back
    }

    // Opens or closes the ripple settings (web _toggleMirrorConfig); it stays open across visits.
    public void ToggleConfig()
    {
        ripplePanel.Toggle(); // classList.toggle('hidden')
    }

    // A moving hand ripples the water, restarts the countdown and arms the activation timer.
    protected override void OnHandMoved(Vector2 screenPosition)
    {
        mirror.SetFinger(screenPosition, _eventCamera);                                // _mmHandMove
        _seconds = CountdownSeconds;                                                   // _resetMirrorCountdown
        countdown.Apply(_seconds, CountdownSeconds);
        if (!_engaged) { _engaged = true; _nextTick = Time.unscaledTime + 1f; }        // first move starts the ticks
        if (_activateAt < 0f) _activateAt = Time.unscaledTime + ActivationSeconds;     // setTimeout(10000) once
    }

    // The hand left: stop splashing and cancel the activation timer (web _mmHandLost).
    protected override void OnHandLost()
    {
        mirror.ClearFinger();  // _mmFX = _mmFY = -1
        _activateAt = -1f;     // clearTimeout(_mmActivateTimer)
    }

    // A pinch goes straight to the tutorial (case AppState.MIRROR in _onPinchConfirmed).
    protected override void OnPinchConfirmed(Vector2 screenPosition)
    {
        Leave(AppState.Tutorial); // _transitionTo(TUTORIAL)
    }

    // Ticks the countdown once per second and fires the activation timer.
    void Update()
    {
        if (_leaving) return;                                   // already on the way out
        float now = Time.unscaledTime;                          // timers use real time
        if (_activateAt >= 0f && now >= _activateAt)            // mirrorActivated
        {
            _activateAt = -1f;
            Leave(AppState.Tutorial);                           // 10 s of interaction -> tutorial
            return;
        }
        if (!_engaged) return;                                  // nobody here: the countdown waits full
        while (now >= _nextTick)                                // setInterval tick
        {
            _nextTick += 1f;                                    // keep the interval phase
            _seconds = Mathf.Max(0, _seconds - 1);              // count down
            countdown.Apply(_seconds, CountdownSeconds);        // ring and number
            if (_seconds <= 0)                                  // the visitor left
            {
                Debug.Log("[Mirror] Countdown llegó a 0 → el espejo espera al siguiente visitante");
                _engaged = false;                               // pause again (web went to STANDBY)
                _seconds = CountdownSeconds;                    // full ring for the next visitor
                countdown.Apply(_seconds, CountdownSeconds);
                return;
            }
        }
    }

    // Requests one transition per visit.
    void Leave(AppState next)
    {
        if (_leaving) return;                          // only once
        _leaving = true;                               // lock
        StartCoroutine(TransitionWhenIdle(next));      // waits for a running fade
    }
}
