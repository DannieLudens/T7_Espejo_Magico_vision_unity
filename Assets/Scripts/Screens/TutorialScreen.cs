using UnityEngine; // SerializeField

// Pinch tutorial between the mirror and standby (port of _setupTutorial in js/app.js): Tuto1.mp4 loops
// full screen, the pinch instruction voice starts 3 s later, and when the voice ends the video finishes
// its current loop before going back to Standby. Safety fallback 90 s; a mouse click skips it.
public class TutorialScreen : NarratedScreen
{
    [SerializeField] VideoSurface video;                                   // #tuto-video (object-fit: cover)
    [SerializeField] string videoPath = "videos/Prototipo/Tuto1.mp4";      // assets/videos/Prototipo/Tuto1.mp4

    bool _waitingForVideoEnd; // voice done, letting the loop finish

    // Subscribes to the end of the video.
    void Awake()
    {
        video.Finished += OnVideoFinished; // 'ended' listener
    }

    // Starts the looping video and the delayed voice.
    public override void OnEnter(AppState state)
    {
        _waitingForVideoEnd = false;  // fresh visit
        video.Play(videoPath, true);  // loop = true; play()
        base.OnEnter(state);          // voice after 3 s, fallback 90 s
    }

    // Stops video and voice (web _onLeaveState TUTORIAL).
    public override void OnExit(AppState state)
    {
        base.OnExit(state);           // audio pause, clear timers
        _waitingForVideoEnd = false;  // onended = null
        video.Stop();                 // loop = false; pause(); src = ''
    }

    // Voice finished: stop looping and wait for the current cycle to end (web _doTutoTransition).
    protected override void OnVoiceEnded()
    {
        FallbackArmed = false;        // clearTimeout(_tutoFallbackTimer)
        _waitingForVideoEnd = true;   // addEventListener('ended', ..., { once: true })
        video.SetLooping(false);      // videoEl.loop = false
    }

    // The last loop ended: back to Standby.
    void OnVideoFinished()
    {
        if (!_waitingForVideoEnd) return; // ended before the voice finished (cannot happen while looping)
        _waitingForVideoEnd = false;      // once
        Leave();                          // _transitionTo(STANDBY)
    }
}
