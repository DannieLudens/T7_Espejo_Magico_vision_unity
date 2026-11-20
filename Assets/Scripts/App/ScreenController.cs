using System.Collections; // IEnumerator
using UnityEngine;        // MonoBehaviour, Vector2

// Base class for one full-screen view; the state machine shows it for the states it handles.
// While the screen GameObject is active it receives hand gesture callbacks (web document listeners).
public class ScreenController : MonoBehaviour
{
    [SerializeField] AppState[] handledStates = new AppState[0]; // states that display this screen

    protected AppStateMachine Machine { get; private set; } // owner, set once at startup

    // Returns true when this screen should be visible for the given state.
    public bool Handles(AppState state)
    {
        return System.Array.IndexOf(handledStates, state) >= 0; // tiny array, linear search is fine
    }

    // Stores the owning state machine (called once at startup).
    public void Bind(AppStateMachine machine)
    {
        Machine = machine; // screens use it to request transitions
    }

    // Called right after the screen is shown for a state.
    public virtual void OnEnter(AppState state) { }

    // Called right before the screen is hidden or switches to another of its states.
    public virtual void OnExit(AppState state) { }

    // True while the screen waits for the visitor with no end of its own (the machine sends the kiosk back to
    // the mirror after a while without interaction). Screens that play to the end or time out themselves say no.
    public virtual bool WaitsForVisitor(AppState state) { return false; }

    // Transitions as soon as the state machine is free; automatic exits can fire while a fade is still running.
    protected IEnumerator TransitionWhenIdle(AppState next)
    {
        while (Machine.IsTransitioning) yield return null; // the web would silently drop this request
        Machine.TransitionTo(next);                        // go
    }

    // Subscribes the gesture hooks while the screen is visible.
    protected virtual void OnEnable()
    {
        HandGestures.HandMoved += OnHandMoved;           // fingertip moved
        HandGestures.HandLost += OnHandLost;             // hand left the camera
        HandGestures.PinchProgress += OnPinchProgress;   // pinch being held
        HandGestures.PinchConfirmed += OnPinchConfirmed; // pinch completed
    }

    // Unsubscribes the gesture hooks when the screen is hidden.
    protected virtual void OnDisable()
    {
        HandGestures.HandMoved -= OnHandMoved;           // stop cursor updates
        HandGestures.HandLost -= OnHandLost;             // stop lost notifications
        HandGestures.PinchProgress -= OnPinchProgress;   // stop progress updates
        HandGestures.PinchConfirmed -= OnPinchConfirmed; // stop confirmations
    }

    // Fingertip position in screen pixels (origin bottom-left).
    protected virtual void OnHandMoved(Vector2 screenPosition) { }

    // The hand left the camera.
    protected virtual void OnHandLost() { }

    // Pinch held at a position, progress 0..1.
    protected virtual void OnPinchProgress(Vector2 screenPosition, float progress) { }

    // Pinch confirmed at a position.
    protected virtual void OnPinchConfirmed(Vector2 screenPosition) { }
}
