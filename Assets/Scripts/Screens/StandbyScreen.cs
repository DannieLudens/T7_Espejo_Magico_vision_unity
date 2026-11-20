using UnityEngine;       // Debug, RenderTexture, Mathf, Time
using UnityEngine.UI;    // RawImage, AspectRatioFitter
using UnityEngine.Video; // VideoPlayer

// Standby: looping background video, pinch hint once a hand appears, pinch opens the menu (port of _setupStandby).
public class StandbyScreen : ScreenController
{
    [Header("Background video")]
    [SerializeField] VideoPlayer video;                // decodes the loop into a RenderTexture
    [SerializeField] RawImage videoImage;              // shows the RenderTexture
    [SerializeField] AspectRatioFitter videoFitter;    // EnvelopeParent = CSS object-fit: cover
    [SerializeField] string videoPath = "videos/Prototipo/Video_standby_v2_KlingAI.mp4";          // web primary source
    [SerializeField] string fallbackVideoPath = "videos/Prototipo/Video_standby_v1_PixVerseAI.mp4"; // web fallback source

    [Header("Hand indicator")]
    [SerializeField] CanvasGroup handIndicator;        // pill "Haz el gesto de pinza para comenzar"
    [SerializeField] RectTransform handIndicatorBody;  // scaled by the pop animation
    [SerializeField] RectTransform handIcon;           // 👌 that waves

    [Header("Shared elements")]
    [SerializeField] VanityCredits credits;            // bottom strip credits
    [SerializeField] AmbientMusic music;               // background music

    RenderTexture _videoTarget; // decoded frames
    bool _usingFallback;        // primary failed, playing v1
    bool _handShown;            // indicator already revealed in this visit
    float _shownAt;             // time the indicator popped in

    // Standby waits for a hand with no time limit.
    public override bool WaitsForVisitor(AppState state) { return true; }

    // Resets the hint, shows credits, starts video and music.
    public override void OnEnter(AppState state)
    {
        _handShown = false;          // _handShownInStandby = false
        credits.Show(false);         // body.standby-mode shows #standby-credits
        _usingFallback = false;      // always try the primary video first
        PlayVideo(videoPath);        // standby loop
        music.Play();                // _startAmbientMusic
    }

    // Pauses the video and hides the credits.
    public override void OnExit(AppState state)
    {
        video.Pause();  // videoEl.pause()
        credits.Hide(); // remove standby-mode
    }

    // First hand detection reveals the pinch hint (does not transition).
    protected override void OnHandMoved(Vector2 screenPosition)
    {
        if (_handShown) return;          // only once per visit
        _handShown = true;               // remember
        _shownAt = Time.unscaledTime;    // start pop animation
    }

    // Pinch anywhere opens the presenter menu.
    protected override void OnPinchConfirmed(Vector2 screenPosition)
    {
        Machine.TransitionTo(AppState.Menu); // case AppState.STANDBY
    }

    // Hidden bottom-right corner button for the operator (web #btn-magic-mirror).
    public void OpenMirror()
    {
        Machine.TransitionTo(AppState.Mirror); // opens the magic mirror scene
    }

    // Drives the indicator animations every frame.
    void Update()
    {
        AnimateHandIndicator(); // pop, breathing and waving
    }

    // indicatorPop (0.3s) then hintBlink (2.5s loop); the icon waves with handWave (0.6s alternate).
    void AnimateHandIndicator()
    {
        if (!_handShown)                                  // .hidden keeps the layout but is invisible
        {
            handIndicator.alpha = 0f;                      // opacity: 0
            handIndicatorBody.localScale = Vector3.one;    // no transform
            return;
        }

        float elapsed = Time.unscaledTime - _shownAt;                                   // time since reveal
        if (elapsed < 0.3f)                                                             // indicatorPop
        {
            float k = CssEasing.BackOut(elapsed / 0.3f);                                // overshooting curve
            handIndicator.alpha = Mathf.Clamp01(k);                                     // opacity 0 -> 1
            float s = Mathf.LerpUnclamped(0.7f, 1f, k);                                 // scale 0.7 -> 1
            handIndicatorBody.localScale = new Vector3(s, s, 1f);
        }
        else                                                                            // hintBlink takes over the opacity
        {
            handIndicator.alpha = Mathf.Lerp(0.35f, 1f, CssEasing.PingPong(elapsed - 0.3f, 2.5f)); // 0.35 <-> 1
            handIndicatorBody.localScale = Vector3.one;                                // pop finished
        }

        float wave = Mathf.Lerp(-10f, 10f, CssEasing.PingPong(Time.unscaledTime, 1.2f)); // rotate(-10deg) <-> rotate(10deg)
        handIcon.localEulerAngles = new Vector3(0f, 0f, -wave);                         // CSS clockwise = Unity negative Z
    }

    // Loads a StreamingAssets video by URL (works on WebGL) and plays it once prepared.
    void PlayVideo(string relativePath)
    {
        string url = MediaPaths.StreamingUrl(relativePath); // full URL
        video.prepareCompleted -= OnVideoPrepared;           // avoid duplicate handlers
        video.prepareCompleted += OnVideoPrepared;           // play when ready
        video.errorReceived -= OnVideoError;
        video.errorReceived += OnVideoError;                 // fallback on failure

        if (video.url == url && video.isPrepared)            // coming back to standby
        {
            video.Play();                                    // resume the loop
            return;
        }

        videoImage.enabled = false;                          // avoid a white frame before the first decode
        video.source = VideoSource.Url;                      // required on WebGL
        video.url = url;                                     // standby-video src
        video.isLooping = true;                              // loop
        video.audioOutputMode = VideoAudioOutputMode.None;   // muted
        video.Prepare();                                     // load()
    }

    // Creates a RenderTexture matching the video and starts playback.
    void OnVideoPrepared(VideoPlayer source)
    {
        int width = (int)source.width, height = (int)source.height;                      // native size
        if (_videoTarget == null || _videoTarget.width != width || _videoTarget.height != height)
        {
            if (_videoTarget != null) _videoTarget.Release();                            // drop old target
            _videoTarget = new RenderTexture(width, height, 0);                          // frame buffer
        }
        source.renderMode = VideoRenderMode.RenderTexture;                               // decode off-screen
        source.targetTexture = _videoTarget;                                             // into our texture
        videoImage.texture = _videoTarget;                                               // display it
        videoFitter.aspectRatio = (float)width / height;                                 // cover the screen area
        videoImage.enabled = true;                                                       // show
        source.Play();                                                                   // play()
    }

    // Switches to the fallback video once if the primary fails.
    void OnVideoError(VideoPlayer source, string message)
    {
        Debug.LogWarning("[Standby] Video error: " + message); // web console.warn
        if (_usingFallback) return;                            // both failed, keep black
        _usingFallback = true;                                 // try v1
        PlayVideo(fallbackVideoPath);                          // web catch -> v1
    }

    // Frees the RenderTexture.
    void OnDestroy()
    {
        if (_videoTarget != null) _videoTarget.Release(); // GPU memory
    }
}
