using UnityEngine; // MonoBehaviour

// Base class for one full-screen view; the state machine shows it for the states it handles.
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
}
