using UnityEngine; // Time, Vector2, Canvas, Mathf

// Magic mirror scene (port of the MIRROR state in js/app.js): water ripple over the webcam; playing with a hand
// leads to the pinch Tutorial, and a pinch goes there right away. The hand cursors are hidden like body.mirror-mode.
// Kiosk changes (delivery feedback): the mirror is the resting screen, and instead of the web's corner countdown
// the frame bulbs light up around the perimeter while the visitor plays (a progress meter readable from afar),
// a pill invites, cheers and announces the start, and a short tracking dropout only drains the progress slowly.
public class MirrorScreen : ScreenController
{
    const float ActivationSeconds = 5f; // playing time that lights every bulb
    const float HandGrace = 0.4f;       // tracking dropout that does not count as leaving
    const float DrainSeconds = 3f;      // a full meter empties in this time once the visitor is gone
    const float ReadyHold = 1.4f;       // "¡Comencemos!" + flash wave before the tutorial

    [SerializeField] MagicMirror mirror;          // water ripple renderer
    [SerializeField] MirrorInvitation invitation; // bottom pill
    [SerializeField] VanityCredits credits;       // bottom strip credits with "Tour Telemedellín"
    [SerializeField] OperatorPanel ripplePanel;   // #mirror-config (key C)

    float _progress;           // 0..1 share of the bulbs lit
    float _lastSeen = -10f;    // last time a hand was tracked
    float _readyAt = -1f;      // meter completed, -1 = not yet
    bool _leaving;             // a transition was already requested
    Camera _eventCamera;       // null for a Screen Space Overlay canvas

    // Starts the ripple and the invitation (web _onEnterState MIRROR).
    public override void OnEnter(AppState state)
    {
        var canvas = GetComponentInParent<Canvas>();                                         // root canvas
        _eventCamera = canvas != null && canvas.renderMode != RenderMode.ScreenSpaceOverlay ? canvas.worldCamera : null; // coordinate conversion
        _leaving = false;                     // fresh visit
        _progress = 0f;                       // no bulbs lit
        _readyAt = -1f;
        _lastSeen = -10f;
        credits.Show(true);                   // body.mirror-mode credits
        if (HandCursor.Instance != null) HandCursor.Instance.SetSuppressed(true); // cursors display: none
        mirror.Begin();                       // startMagicMirror
        invitation.Show(MirrorInvitation.Mode.Invite); // "Acércate y mueve tu mano"
    }

    // Stops the ripple, the meter and the pill, and restores the cursors (web _onLeaveState MIRROR).
    public override void OnExit(AppState state)
    {
        mirror.End();                         // stopMagicMirror
        credits.Hide();                       // remove mirror-mode
        invitation.HideNow();                 // no pill on the next screen
        if (MirrorFrame.Instance != null) MirrorFrame.Instance.ClearProgress(); // bulbs back to the pulse
        if (HandCursor.Instance != null) HandCursor.Instance.SetSuppressed(false); // cursors back
    }

    // Opens or closes the ripple settings (web _toggleMirrorConfig); it stays open across visits.
    public void ToggleConfig()
    {
        ripplePanel.Toggle(); // classList.toggle('hidden')
    }

    // A moving hand ripples the water (web _mmHandMove).
    protected override void OnHandMoved(Vector2 screenPosition)
    {
        mirror.SetFinger(screenPosition, _eventCamera);
    }

    // The hand left: stop splashing (web _mmHandLost).
    protected override void OnHandLost()
    {
        mirror.ClearFinger();  // _mmFX = _mmFY = -1
    }

    // A pinch goes straight to the tutorial (case AppState.MIRROR in _onPinchConfirmed); the frame flashes on its own.
    protected override void OnPinchConfirmed(Vector2 screenPosition)
    {
        Leave(AppState.Tutorial); // _transitionTo(TUTORIAL)
    }

    // Fills or drains the bulb meter and keeps the pill in sync.
    void Update()
    {
        if (_leaving) return;                                   // already on the way out
        float now = Time.unscaledTime;                          // timers use real time
        if (_readyAt >= 0f)                                     // meter full: let the celebration play
        {
            if (now - _readyAt >= ReadyHold) Leave(AppState.Tutorial);
            return;
        }

        if (HandGestures.HandVisible) _lastSeen = now;          // someone is playing
        bool present = now - _lastSeen <= HandGrace;            // short dropouts still count as present
        float dt = Time.unscaledDeltaTime;
        if (present) _progress += dt / ActivationSeconds;       // fill while playing
        else _progress -= dt / DrainSeconds;                    // drain slowly once gone
        _progress = Mathf.Clamp01(_progress);

        var frame = MirrorFrame.Instance;
        if (frame != null)
        {
            if (_progress > 0f) frame.SetProgress(_progress);   // bulbs light up in wave order
            else frame.ClearProgress();                         // idle pulse
        }

        if (_progress >= 1f)                                    // every bulb lit
        {
            _readyAt = now;
            invitation.Show(MirrorInvitation.Mode.Ready);       // "¡Comencemos!"
            if (frame != null) frame.TriggerSelectionFlash();   // white wave around the frame
            return;
        }
        invitation.Show(present ? MirrorInvitation.Mode.Engaged : MirrorInvitation.Mode.Invite); // cheer or invite
    }

    // Requests one transition per visit.
    void Leave(AppState next)
    {
        if (_leaving) return;                          // only once
        _leaving = true;                               // lock
        StartCoroutine(TransitionWhenIdle(next));      // waits for a running fade
    }
}
