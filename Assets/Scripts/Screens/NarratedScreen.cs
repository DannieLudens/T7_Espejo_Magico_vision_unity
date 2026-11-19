using UnityEngine;              // AudioSource, AudioClip, Time
using UnityEngine.EventSystems; // IPointerClickHandler

// A screen that plays one voice-over clip and then moves on (shared logic of web _setupIntro/_setupOutro):
// optional start delay, transition when the voice ends, safety fallback and mouse click to skip.
public class NarratedScreen : ScreenController, IPointerClickHandler
{
    [SerializeField] protected AudioSource voice;          // voice-over channel
    [SerializeField] AudioClip clip;                       // fixed clip (Outro); Intro picks one per presenter
    [SerializeField] float audioDelay;                     // seconds before the voice starts (Intro: 1 s)
    [SerializeField] float fallbackSeconds = 30f;          // safety timeout (Intro 90 s, Outro 30 s)
    [SerializeField] AppState nextState = AppState.Final;  // where to go when the voice ends

    VoiceTrack _track;    // voice playback with end detection
    float _enteredAt;     // time this visit started
    float _audioAt = -1f; // pending voice start, -1 = none
    bool _leaving;        // transition already requested
    protected bool FallbackArmed; // the safety timeout still applies (cleared when a subclass handles the end itself)

    // Schedules the voice, or leaves right away when there is nothing to play.
    public override void OnEnter(AppState state)
    {
        if (_track == null) _track = new VoiceTrack(voice);           // created on first use
        _enteredAt = Time.unscaledTime;                              // start of the fallback timer
        _leaving = false;                                            // fresh visit
        FallbackArmed = true;                                        // setTimeout(fallback)
        _audioAt = ClipForVisit() != null ? _enteredAt + audioDelay : -1f; // setTimeout(audioDelay)
        if (_audioAt < 0f) Leave();                                  // web: no audio -> transition immediately
    }

    // Stops the voice and cancels timers.
    public override void OnExit(AppState state)
    {
        _audioAt = -1f;  // clearTimeout
        _track?.Stop();  // audioEl.pause(); src = ''
        Captions.Detach(); // detachCaptions()
    }

    // Clip to narrate in this visit; subclasses override it.
    protected virtual AudioClip ClipForVisit()
    {
        return clip; // fixed clip by default
    }

    // Starts the delayed voice, detects its end and enforces the fallback.
    protected virtual void Update()
    {
        if (_leaving || _track == null) return;                  // nothing to do
        float now = Time.unscaledTime;                           // timers use real time

        if (_audioAt >= 0f && now >= _audioAt)                   // delay elapsed
        {
            _audioAt = -1f;                                      // timer consumed
            _track.Play(ClipForVisit());                         // audioEl.src = ...; play()
        }
        else if (_track.Tick())                                  // audioEl.onended (or blocked audio)
        {
            OnVoiceEnded();                                      // _doIntroTransition / _doOutroTransition
        }

        if (FallbackArmed && now - _enteredAt >= fallbackSeconds) Leave(); // fallback timer
    }

    // Mouse click anywhere on the screen skips it (web scene click listener).
    public void OnPointerClick(PointerEventData eventData)
    {
        Leave(); // skip
    }

    // The voice finished or could not play; by default the screen moves on right away.
    protected virtual void OnVoiceEnded()
    {
        Leave(); // transition to nextState
    }

    // Requests the next state once.
    protected void Leave()
    {
        if (_leaving) return;                            // only once per visit
        _leaving = true;                                 // lock
        StartCoroutine(TransitionWhenIdle(nextState));   // _transitionTo(next)
    }
}
