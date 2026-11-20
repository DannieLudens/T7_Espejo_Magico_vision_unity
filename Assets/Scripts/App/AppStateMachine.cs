using System;             // Action
using System.Collections; // IEnumerator
using UnityEngine;                // MonoBehaviour, Debug
using UnityEngine.InputSystem;    // Keyboard

// Single-scene state machine that shows one screen at a time (port of _transitionTo in js/app.js).
public class AppStateMachine : MonoBehaviour
{
    [SerializeField] AppState initialState = AppState.Mirror;           // state shown at boot (kiosk rests in the mirror)
    [SerializeField] ScreenFader fader;                                  // black overlay between screens
    [SerializeField] ScreenController[] screens = new ScreenController[0]; // every screen instance in the scene
    [SerializeField] float idleReturnSeconds = 30f;                      // no interaction this long on a waiting screen -> mirror

    public AppState Current { get; private set; } = AppState.None; // active state
    public bool IsTransitioning { get; private set; }               // guard against overlapping transitions

    public event Action<AppState, AppState> StateChanged; // (previous, next) raised after a transition completes

    ScreenController _activeScreen; // screen currently visible
    float _lastActivity;            // last hand, mouse or key activity (or state change)

    // Hides every screen and enters the initial state without fading (web boots straight into standby).
    void Start()
    {
        foreach (var screen in screens) // prepare each screen
        {
            if (screen == null) continue;       // tolerate empty slots in the inspector
            screen.Bind(this);                  // give it access to the machine
            screen.gameObject.SetActive(false); // start hidden
        }
        StartCoroutine(Transition(initialState, true)); // immediate first transition
    }

    // Polls operator keyboard shortcuts and the inactivity return every frame.
    void Update()
    {
        HandleOperatorShortcuts(); // N, M, ESC
        CheckInactivity();         // abandoned visit -> mirror
    }

    // Kiosk change (delivery feedback): a visitor who walks away mid-visit leaves the kiosk on a screen that waits
    // forever, so after idleReturnSeconds without a hand, mouse or key the machine returns to the mirror.
    void CheckInactivity()
    {
        float now = Time.unscaledTime;                                         // real time
        if (HandGestures.HandVisible || PointerOrKeyActive()) _lastActivity = now; // someone is there
        if (IsTransitioning || _activeScreen == null) return;                  // wait for the screen to settle
        if (!_activeScreen.WaitsForVisitor(Current)) { _lastActivity = now; return; } // screen ends on its own
        if (now - _lastActivity < idleReturnSeconds) return;                   // still within the grace time
        Debug.Log($"[App] {idleReturnSeconds:0} s sin interacción en {Current} → MIRROR");
        TransitionTo(AppState.Mirror);                                         // back to the resting screen
    }

    // True when the mouse moved or any mouse button or key was pressed this frame.
    static bool PointerOrKeyActive()
    {
        var mouse = Mouse.current;                                             // null without a mouse
        if (mouse != null && (mouse.delta.ReadValue().sqrMagnitude > 0f || mouse.leftButton.isPressed || mouse.rightButton.isPressed)) return true;
        var keyboard = Keyboard.current;                                       // null without a keyboard
        return keyboard != null && keyboard.anyKey.wasPressedThisFrame;
    }

    // Requests a transition; ignored when already in that state or busy (same rule as the web).
    public void TransitionTo(AppState next, bool immediate = false)
    {
        if (next == Current || IsTransitioning) return; // web guard
        StartCoroutine(Transition(next, immediate));     // run the fade sequence
    }

    // Fades out, swaps screens, runs exit/enter hooks and fades back in.
    IEnumerator Transition(AppState next, bool immediate)
    {
        IsTransitioning = true;                                              // lock
        var previous = Current;                                              // remember for hooks and event
        var nextScreen = FindScreen(next);                                   // screen that handles the new state
        bool sameScreen = nextScreen != null && nextScreen == _activeScreen; // sub-mode switch, e.g. Final -> Photobooth
        bool fade = !immediate && !sameScreen && fader != null;              // the web never fades between sub-modes

        if (fade) yield return fader.FadeOut(); // go black before swapping

        if (_activeScreen != null) _activeScreen.OnExit(previous);                    // leave the old state
        if (_activeScreen != null && !sameScreen) _activeScreen.gameObject.SetActive(false); // hide the old screen

        Current = next;             // commit the new state
        _lastActivity = Time.unscaledTime; // every screen starts with a full grace time
        _activeScreen = nextScreen; // remember the visible screen
        if (_activeScreen != null)
        {
            _activeScreen.gameObject.SetActive(true); // show the new screen
            _activeScreen.OnEnter(next);              // enter the new state
        }
        else
        {
            Debug.LogWarning($"[App] No screen handles {next}"); // prefab not wired in the inspector
        }

        Debug.Log($"[App] {previous} -> {next}"); // same trace as the web console

        if (fade) yield return fader.FadeIn(); // reveal the new screen

        IsTransitioning = false;              // unlock
        StateChanged?.Invoke(previous, next); // notify listeners
    }

    // Returns the screen registered for a state, or null.
    ScreenController FindScreen(AppState state)
    {
        foreach (var screen in screens)                                    // few screens, linear search
            if (screen != null && screen.Handles(state)) return screen;     // first match wins
        return null;                                                       // nothing handles it
    }

    // Port of the web keydown handler: N opens the menu, M the mirror, ESC goes back.
    void HandleOperatorShortcuts()
    {
        var keyboard = Keyboard.current;                                           // null when no keyboard is connected
        if (keyboard == null) return;                                              // kiosk without keyboard
        if (keyboard.mKey.wasPressedThisFrame) TransitionTo(AppState.Mirror);      // magic mirror from anywhere
        if (keyboard.nKey.wasPressedThisFrame) TransitionTo(AppState.Menu);        // presenter menu from anywhere
        if (keyboard.escapeKey.wasPressedThisFrame) TransitionTo(BackTarget(Current)); // one level back
    }

    // Where ESC leads from each state (same rules as the web).
    static AppState BackTarget(AppState state)
    {
        switch (state)
        {
            case AppState.Mirror:   // mirror is the prelude, skip the tutorial
            case AppState.Tutorial: // operator can skip the tutorial
            case AppState.Menu:     // menu goes back to idle
                return AppState.Standby;
            case AppState.Experience:
            case AppState.Outro:
            case AppState.Final:
            case AppState.Photobooth:
            case AppState.PhotoResult:
                return AppState.Menu; // any presenter flow returns to the menu
            default:
                return state; // Standby and Intro ignore ESC (same-state requests are discarded)
        }
    }
}
