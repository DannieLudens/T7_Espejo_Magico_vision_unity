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

    const float MinimumPlayback = 0.25f; // a voice that stops sooner failed to start (web play().catch)

    float _enteredAt;     // time this visit started
    float _audioAt = -1f; // pending voice start, -1 = none
    float _startedAt;     // time the voice started
    bool _audioStarted;   // voice was started in this visit
    bool _leaving;        // transition already requested

    // Schedules the voice, or leaves right away when there is nothing to play.
    public override void OnEnter(AppState state)
    {
        _enteredAt = Time.unscaledTime;                              // start of the fallback timer
        _audioStarted = false;                                       // nothing played yet
        _leaving = false;                                            // fresh visit
        _audioAt = ClipForVisit() != null ? _enteredAt + audioDelay : -1f; // setTimeout(audioDelay)
        if (_audioAt < 0f) Leave();                                  // web: no audio -> transition immediately
    }

    // Stops the voice and cancels timers.
    public override void OnExit(AppState state)
    {
        _audioAt = -1f;        // clearTimeout
        _audioStarted = false; // forget this visit
        voice.Stop();          // audioEl.pause()
        voice.clip = null;     // audioEl.src = ''
    }

    // Clip to narrate in this visit; subclasses override it.
    protected virtual AudioClip ClipForVisit()
    {
        return clip; // fixed clip by default
    }

    // Starts the delayed voice, detects its end and enforces the fallback.
    protected virtual void Update()
    {
        if (_leaving) return;                                    // transition already requested
        float now = Time.unscaledTime;                           // timers use real time

        if (_audioAt >= 0f && now >= _audioAt)                   // delay elapsed
        {
            _audioAt = -1f;                                      // timer consumed
            voice.clip = ClipForVisit();                         // audioEl.src = ...
            voice.Play();                                        // audioEl.play()
            _startedAt = now;                                    // for end detection
            _audioStarted = true;                                // remember
        }
        else if (_audioStarted && !voice.isPlaying && now - _startedAt >= MinimumPlayback) // audioEl.onended (or blocked audio)
        {
            Leave();                                             // _doIntroTransition / _doOutroTransition
        }

        if (now - _enteredAt >= fallbackSeconds) Leave();        // fallback timer
    }

    // Mouse click anywhere on the screen skips it (web scene click listener).
    public void OnPointerClick(PointerEventData eventData)
    {
        Leave(); // skip
    }

    // Requests the next state once.
    void Leave()
    {
        if (_leaving) return;                            // only once per visit
        _leaving = true;                                 // lock
        StartCoroutine(TransitionWhenIdle(nextState));   // _transitionTo(next)
    }
}
