using System.Collections;         // IEnumerator
using System.Collections.Generic; // List
using TMPro;                      // TMP_Text
using UnityEngine;                // AudioSource, RectTransform, Mathf, Time
using UnityEngine.UI;             // Image, RawImage, Button

// Presenter experience: scene videos + voice, idle checkpoints, progress bar dots, back button and dwell selection
// (port of _setupExperience, _playScene, _advanceExperience, _enterIdleMode, _exitIdleMode and the dwell system).
public class ExperienceScreen : ScreenController
{
    [Header("Media")]
    [SerializeField] VideoSurface mainVideo;         // #exp-video (object-fit: contain)
    [SerializeField] AudioSource voice;              // #exp-audio
    [SerializeField] CanvasGroup sceneFade;          // #exp-scene-fade

    [Header("Header and back button")]
    [SerializeField] TMP_Text presenterName;         // #exp-presenter-name
    [SerializeField] RectTransform backButton;       // #exp-back-btn (hit area)
    [SerializeField] Image backFill;                 // pill background
    [SerializeField] Image backBorder;               // pill border
    [SerializeField] Image backGlow;                 // dwelling glow
    [SerializeField] TMP_Text backLabel;             // "← Volver"

    [Header("Progress bar (bottom strip)")]
    [SerializeField] RectTransform track;            // #exp-progress-track
    [SerializeField] RectTransform progressFill;     // #exp-progress-fill (anchorMax.x = progress)
    [SerializeField] ExperienceDot dotPrefab;        // template for .exp-dot

    [Header("Checkpoint overlay")]
    [SerializeField] CanvasGroup idleOverlay;        // #exp-idle-overlay
    [SerializeField] RectTransform idleOverlayRect;  // entrance animation
    [SerializeField] VideoSurface objectVideo;       // #exp-idle-object
    [SerializeField] Image objectBorder;             // pulsing gold border
    [SerializeField] RawImage cameraView;            // #exp-idle-camera (mirrored)
    [SerializeField] Image cameraBorder;             // camera border
    [SerializeField] TMP_Text idleHint;              // #exp-idle-hint
    [SerializeField] CanvasGroup detectionFeedback;  // #det-feedback (hidden while the detector is idle)
    [SerializeField] TMP_Text detectionLabel;        // #det-label
    [SerializeField] GameObject detectionCheck;      // ✓ drawn before the label (fonts have no U+2713)
    [SerializeField] RectTransform holdFill;         // #det-hold-fill (anchorMax.x = progress)
    [SerializeField] Image cameraGlow;               // .det-detected box-shadow

    const float SceneFadeWait = 0.32f;   // setTimeout(startVideo, 320)
    const float DwellSeconds = 1.5f;     // _DWELL_MS
    const float NearRadius = 65f;        // _CUR_PROX_RADIUS in CSS px

    readonly List<ExperienceDot> _dots = new List<ExperienceDot>(); // current dots
    PresenterDefinition _presenter;      // _activePresenter
    int _sceneIndex;                     // _currentSceneIdx
    bool _idleMode;                      // _isIdleMode
    bool _videoEnded, _audioEnded;       // _sceneVideoEnded / _sceneAudioEnded
    bool _bridging;                      // idle bridge loop while the voice finishes
    int _clipIndex, _trackIndex;         // position in multi-clip / multi-track scenes
    VoiceTrack _voiceTrack;              // voice playback with end detection
    Coroutine _pending;                  // delayed scene/idle start after the fade
    object _dwellTarget;                 // _dwellEl (ExperienceDot or the back button)
    float _dwellStart;                   // _dwellStart
    bool _backNear;                      // back button .finger-near
    float _overlayShownAt = -10f;        // idleOverlayIn start
    bool _overlayVisible;                // overlay without .hidden
    CssTransition _fadeAlpha;            // #exp-scene-fade transition: opacity 0.3s
    CssTransition _fillValue;            // #exp-progress-fill transition: width 0.3s linear
    CssTransition _backScale;            // #exp-back-btn transition: transform 0.18s
    float _backVisual;                   // 0 rest, 1 near, 2 dwelling (colors)
    CssTransition _feedbackAlpha;        // #det-feedback opacity (0.3s fade-in, instant hide)
    float _holdTarget, _holdValue;       // #det-hold-fill width with transition 0.12s linear
    bool _objectDetected;                // .det-detected on the camera tile
    float _cameraDetect;                 // animated 0..1 for the green border/glow

    // Creates transitions and hooks the main video's end event.
    void Awake()
    {
        _fadeAlpha = new CssTransition(0f, 0.3f, CssEasing.Ease); // scene fade
        _fillValue = new CssTransition(0f, 0.3f, null);           // linear progress width
        _backScale = new CssTransition(1f, 0.18f, CssEasing.Ease); // back button scale
        _voiceTrack = new VoiceTrack(voice);                       // waits for first-use clip loads
        _feedbackAlpha = new CssTransition(0f, 0.3f, CssEasing.Ease); // detection widget fade
        mainVideo.Finished += OnClipFinished;                      // videoEl.onended
        progressFill.GetComponent<Image>().sprite = ProceduralSprites.LinearGradient("expProgress", 64, 4, 90f, new[]
        {
            new ProceduralSprites.Stop(0f, AppTheme.GoldDark),     // linear-gradient(to right, --gold-dark,
            new ProceduralSprites.Stop(1f, AppTheme.GoldLight)     //                            --gold-light)
        });
    }

    // Only the idle checkpoints wait (for the object); the scene videos play to the end on their own.
    public override bool WaitsForVisitor(AppState state) { return _idleMode; }

    // Starts the selected presenter's experience from its first scene (web _setupExperience).
    public override void OnEnter(AppState state)
    {
        _presenter = AppSession.ActivePresenter;                              // chosen in the menu
        if (_presenter == null || _presenter.scenes.Length == 0)              // nothing to play
        {
            StartCoroutine(TransitionWhenIdle(AppState.Menu));                // web: back to the menu
            return;
        }
        presenterName.text = _presenter.label.Replace('\n', ' ');            // label on one line
        _sceneIndex = 0;                                                      // _currentSceneIdx = 0 (set by the menu)
        idleOverlay.alpha = 0f;                                               // overlay hidden
        idleOverlay.blocksRaycasts = false;
        _fadeAlpha.Snap(0f);                                                  // no fade on the first scene
        _fillValue.Snap(0f);                                                  // empty bar
        _feedbackAlpha.Snap(0f);                                              // detection widget hidden
        BuildDots();                                                          // _buildExpDots
        PlayScene(_sceneIndex);                                               // first scene
    }

    // Stops all media and clears dwell feedback (web _onLeaveState EXPERIENCE).
    public override void OnExit(AppState state)
    {
        CancelDwell();          // _cancelDwell
        StopMedia();            // _stopExperienceMedia
    }

    // ── Scenes ───────────────────────────────────────────────

    // Plays a scene: fade (except the first), clips back to back and chained voice tracks (web _playScene).
    void PlayScene(int index)
    {
        UpdateDots(index, false);                                              // _updateExpDots
        _fillValue.SetTarget((float)index / _presenter.scenes.Length, Time.unscaledTime); // bar at the scene start
        if (_pending != null) StopCoroutine(_pending);                         // a newer request wins
        _pending = StartCoroutine(AfterFade(index > 0, () => StartScene(index))); // doFade = index > 0
    }

    // Resets flags and starts the first clip and the first voice track.
    void StartScene(int index)
    {
        var scene = _presenter.scenes[index];  // scene data
        _videoEnded = false;                   // _sceneVideoEnded
        _audioEnded = false;                   // _sceneAudioEnded
        _bridging = false;                     // not looping an idle yet
        _clipIndex = 0;                        // first clip
        PlayNextClip();                        // _playNextClip
        _trackIndex = 0;                       // first track
        if (scene.audios.Length > 0) PlayNextTrack(); // _playNextTrack
        else _audioEnded = true;               // no audio: do not block
    }

    // Plays the next clip of the scene, or bridges with an idle loop when the voice is still talking.
    void PlayNextClip()
    {
        var scene = _presenter.scenes[_sceneIndex];                // current scene
        if (_clipIndex < scene.videos.Length)                      // more clips
        {
            mainVideo.Play(scene.videos[_clipIndex++], false);     // videoEl.src = clip; play()
            return;
        }
        _videoEnded = true;                                        // all clips done
        if (_audioEnded) { CheckSceneComplete(); return; }         // both finished
        string bridge = scene.hasCheckpoint ? _presenter.IdleVideoFor(_sceneIndex) : _presenter.LastIdleVideo(); // idle.video ?? last idle
        if (bridge == null) return;                                // freeze on the last frame
        _bridging = true;                                          // bridge active
        mainVideo.Play(bridge, true);                              // loop until the voice ends
    }

    // Main video clip ended.
    void OnClipFinished()
    {
        if (_idleMode || _bridging) return; // loops never end; idle has no auto advance
        PlayNextClip();                     // next clip or bridge
    }

    // Plays the next voice track or marks the audio as complete.
    void PlayNextTrack()
    {
        var scene = _presenter.scenes[_sceneIndex];    // current scene
        if (_trackIndex < scene.audios.Length)         // more tracks
        {
            _voiceTrack.Play(scene.audios[_trackIndex++]); // audioEl.src = track; play()
            return;
        }
        _audioEnded = true;                            // _sceneAudioEnded
        Captions.Detach();                             // detachCaptions() after the last track
        if (_videoEnded && _bridging)                  // stop the bridge loop before advancing
        {
            _bridging = false;
            mainVideo.Stop();
        }
        CheckSceneComplete();                          // _checkSceneComplete
    }

    // Advances once both the video and the audio finished.
    void CheckSceneComplete()
    {
        if (_videoEnded && _audioEnded) Advance(); // _advanceExperience
    }

    // Enters the scene's checkpoint, or plays the next scene, or ends in the Outro (web _advanceExperience).
    void Advance()
    {
        if (_idleMode) return;                                    // idle exits are handled separately
        var scene = _presenter.scenes[_sceneIndex];               // current scene
        if (scene.hasCheckpoint && _presenter.IdleVideoFor(_sceneIndex) != null) { EnterIdle(_sceneIndex); return; } // checkpoint
        _sceneIndex++;                                            // next scene
        if (_sceneIndex < _presenter.scenes.Length) PlayScene(_sceneIndex);
        else StartCoroutine(TransitionWhenIdle(AppState.Outro));  // _transitionTo(OUTRO)
    }

    // ── Checkpoints ──────────────────────────────────────────

    // Loops the idle video and shows the object/camera overlay (web _enterIdleMode).
    void EnterIdle(int index)
    {
        _idleMode = true;                                                          // _isIdleMode
        _fillValue.SetTarget((float)(index + 1) / _presenter.scenes.Length, Time.unscaledTime); // bar at the checkpoint
        UpdateDots(index, true);                                                   // checkpoint dot
        var scene = _presenter.scenes[index];                                      // scene data
        idleHint.text = string.IsNullOrEmpty(scene.hint) ? "Muestra el objeto a la cámara" : scene.hint; // overlay text
        if (_pending != null) StopCoroutine(_pending);                             // a newer request wins
        _pending = StartCoroutine(AfterFade(true, () => StartIdle(index)));       // fade, then startIdleVideo
    }

    // Starts the idle loop, the object video and the camera preview.
    void StartIdle(int index)
    {
        var scene = _presenter.scenes[index];                          // scene data
        StopVoice();                                                   // silence the previous scene
        mainVideo.Play(_presenter.IdleVideoFor(index), true);          // idle loop
        _overlayVisible = true;                                        // remove .hidden (entrance animates the opacity)
        idleOverlay.blocksRaycasts = true;                             // clickable (testing)
        _overlayShownAt = Time.unscaledTime;                           // idleOverlayIn
        if (!string.IsNullOrEmpty(scene.objectVideo)) objectVideo.Play(scene.objectVideo, true); // 360° object
        else objectVideo.Stop();                                       // display: none
        AttachCamera();                                                // srcObject = webcam stream
        ResetDetectionFeedback();                                      // label, bar and border at rest
        var recognizer = ObjectRecognizer.Instance;                    // loaded at startup
        if (recognizer != null) recognizer.Begin(scene.detectLabels, OnObjectConfirmed); // startDetecting (no-op without model)
    }

    // The detector confirmed the requested object (web onDetected callback).
    void OnObjectConfirmed()
    {
        if (_idleMode) ExitIdle(); // if (_isIdleMode) _exitIdleMode()
    }

    // Puts the detection widget back to its initial text and empty bar.
    void ResetDetectionFeedback()
    {
        detectionLabel.text = "Acerca el objeto a la cámara"; // initial #det-label
        detectionCheck.SetActive(false);                      // no ✓
        _holdTarget = _holdValue = 0f;                         // empty bar
        _objectDetected = false;                               // neutral camera border
    }

    // Subscribes to the recognizer while the screen is visible.
    protected override void OnEnable()
    {
        base.OnEnable();                                          // gesture hooks
        var recognizer = ObjectRecognizer.Instance;               // persistent system
        if (recognizer == null) return;                           // not created yet at scene load
        recognizer.StatusChanged += OnDetectorStatus;             // data-status
        recognizer.Prediction += OnDetectorPrediction;            // _detUpdateUI
        recognizer.HoldProgress += OnDetectorHold;                // _detSetHoldProgress
    }

    // Unsubscribes from the recognizer.
    protected override void OnDisable()
    {
        base.OnDisable();                                         // gesture hooks
        var recognizer = ObjectRecognizer.Instance;
        if (recognizer == null) return;
        recognizer.StatusChanged -= OnDetectorStatus;
        recognizer.Prediction -= OnDetectorPrediction;
        recognizer.HoldProgress -= OnDetectorHold;
    }

    // Shows the widget while scanning/confirmed, hides it instantly when idle.
    void OnDetectorStatus(ObjectRecognizer.Status status)
    {
        if (status == ObjectRecognizer.Status.Idle) _feedbackAlpha.Snap(0f);  // [data-status="idle"] { opacity: 0 }
        else _feedbackAlpha.SetTarget(1f, Time.unscaledTime);                 // transition: opacity 0.3s
    }

    // Updates the label and the camera border from the best prediction.
    void OnDetectorPrediction(string label, bool detected)
    {
        if (detected) detectionLabel.text = "¡Objeto detectado! Mantén quieto…";   // preceded by the drawn ✓
        else if (label == "Ninguno") detectionLabel.text = "Acerca el objeto a la cámara"; // nothing in front
        else detectionLabel.text = "Buscando…";                                     // another object
        detectionCheck.SetActive(detected);                                         // ✓
        _objectDetected = detected;                                                 // .det-detected
    }

    // Stores the hold progress for the bar.
    void OnDetectorHold(float progress)
    {
        _holdTarget = progress; // width: X%
    }

    // Leaves the checkpoint and plays the next scene, or ends in the Outro (web _exitIdleMode).
    void ExitIdle()
    {
        _idleMode = false;                                          // _isIdleMode = false
        ObjectRecognizer.Instance?.End();                           // stopDetecting()
        HideOverlay();                                              // overlay hidden, object video stopped
        _sceneIndex++;                                              // next scene
        if (_sceneIndex < _presenter.scenes.Length) PlayScene(_sceneIndex);
        else StartCoroutine(TransitionWhenIdle(AppState.Outro));    // last checkpoint ends the experience
    }

    // Jumps straight to a scene, skipping its checkpoint (start/end nav dots, web _jumpToScene).
    void JumpToScene(int index)
    {
        if (index < 0 || index >= _presenter.scenes.Length) return; // out of range
        StopMedia();                                                // _stopExperienceMedia
        _sceneIndex = index;                                        // target
        PlayScene(index);                                           // play it
    }

    // Confirms the active checkpoint or jumps to another one (web _jumpToCheckpoint).
    void JumpToCheckpoint(int index)
    {
        if (index < 0 || index >= _presenter.scenes.Length || !_presenter.scenes[index].hasCheckpoint) return; // invalid
        if (_idleMode && _sceneIndex == index) { ExitIdle(); return; } // dot of the active checkpoint confirms it
        StopMedia();                                                // stop everything
        _sceneIndex = index;                                        // target
        EnterIdle(index);                                           // jump to its idle
    }

    // Waits for the black scene fade before running an action, then fades back in.
    IEnumerator AfterFade(bool fade, System.Action action)
    {
        if (fade)                                                            // fadeEl.classList.add('active')
        {
            _fadeAlpha.SetTarget(1f, Time.unscaledTime);
            yield return new WaitForSecondsRealtime(SceneFadeWait);          // 320 ms
        }
        action();                                                            // startVideo / startIdleVideo
        _fadeAlpha.SetTarget(0f, Time.unscaledTime);                         // fadeEl.classList.remove('active')
        _pending = null;                                                     // done
    }

    // Stops video, voice, overlay and pending steps (web _stopExperienceMedia).
    void StopMedia()
    {
        if (_pending != null) { StopCoroutine(_pending); _pending = null; } // cancel delayed starts
        ObjectRecognizer.Instance?.End();                                   // stopDetecting()
        mainVideo.Stop();                                                   // videoEl.pause(); src = ''
        StopVoice();                                                        // audioEl.pause()
        Captions.Detach();                                                  // detachCaptions()
        _videoEnded = _audioEnded = false;                                  // reset flags
        _bridging = false;                                                  // no bridge
        _fadeAlpha.Snap(0f);                                                // fade removed
        HideOverlay();                                                      // overlay hidden
        _idleMode = false;                                                  // _isIdleMode = false
    }

    // Stops the voice track.
    void StopVoice()
    {
        _voiceTrack.Stop(); // pause; src = ''
    }

    // Hides the checkpoint overlay and releases its media.
    void HideOverlay()
    {
        _overlayVisible = false;              // .hidden
        idleOverlay.alpha = 0f;               // invisible
        idleOverlay.blocksRaycasts = false;   // not clickable
        objectVideo.Stop();                   // objectVideoEl.src = ''
        cameraView.texture = null;            // srcObject = null
    }

    // Shows the live camera in the overlay, mirrored and cropped to a square (object-fit: cover; scaleX(-1)).
    void AttachCamera()
    {
        var texture = HandTrackingService.GetCameraTexture();       // same stream as hand tracking
        cameraView.texture = texture;                                // srcObject
        cameraView.enabled = texture != null;                        // black tile when unavailable
        if (texture == null) return;                                 // no camera yet
        float aspect = (float)texture.width / texture.height;        // camera proportions
        float w = aspect > 1f ? 1f / aspect : 1f;                    // visible width (cover)
        float h = aspect > 1f ? 1f : aspect;                         // visible height (cover)
        cameraView.uvRect = new Rect(0.5f + w * 0.5f, 0.5f - h * 0.5f, -w, h); // centered crop, horizontally mirrored
    }

    // ── Dots ─────────────────────────────────────────────────

    // Creates the start dot, one dot per checkpoint and the end dot (web _buildExpDots).
    void BuildDots()
    {
        foreach (var dot in _dots) Destroy(dot.gameObject);                      // remove previous dots
        _dots.Clear();
        int total = _presenter.scenes.Length;                                    // scenes.length
        AddDot(ExperienceDot.Kind.Start, 0, 0f);                                 // left: 0%
        for (int i = 0; i < total; i++)
            if (_presenter.scenes[i].hasCheckpoint) AddDot(ExperienceDot.Kind.Checkpoint, i, (i + 1f) / total); // (i+1)/total
        AddDot(ExperienceDot.Kind.End, total - 1, 1f);                           // left: 100%
    }

    // Instantiates one dot with a mouse click handler.
    void AddDot(ExperienceDot.Kind kind, int sceneIndex, float position)
    {
        var dot = Instantiate(dotPrefab, track);                      // child of the track
        dot.gameObject.SetActive(true);                               // template is inactive
        dot.Setup(kind, sceneIndex, position);                        // place it
        dot.GetComponent<Button>().onClick.AddListener(() => ActivateDot(dot)); // click = same as pinch
        _dots.Add(dot);                                               // remember
    }

    // Marks passed checkpoints as done and the current one as active (web _updateExpDots).
    void UpdateDots(int currentIndex, bool isCheckpoint)
    {
        foreach (var dot in _dots)
        {
            if (dot.DotKind != ExperienceDot.Kind.Checkpoint) continue;          // nav dots never change
            dot.Done = dot.SceneIndex < currentIndex;                            // .done
            dot.Active = dot.SceneIndex == currentIndex && isCheckpoint;         // .checkpoint
        }
    }

    // Runs the action of a dot (nav: jump to scene; checkpoint: jump/confirm).
    void ActivateDot(ExperienceDot dot)
    {
        if (dot.DotKind == ExperienceDot.Kind.Start) JumpToScene(0);                                  // data-nav="start"
        else if (dot.DotKind == ExperienceDot.Kind.End) JumpToScene(_presenter.scenes.Length - 1);    // data-nav="end"
        else JumpToCheckpoint(dot.SceneIndex);                                                        // checkpoint
    }

    // Mouse click on the back button.
    public void OnBackClicked()
    {
        Machine.TransitionTo(AppState.Menu); // backBtn.onclick
    }

    // Mouse click on the checkpoint overlay confirms it (testing aid in the web version).
    public void OnIdleOverlayClicked()
    {
        if (_idleMode) ExitIdle(); // idleOverlay.onclick
    }

    // ── Hand input ───────────────────────────────────────────

    // Starts, keeps or cancels the dwell over a dot or the back button (web _updateExperienceDwell).
    protected override void OnHandMoved(Vector2 screenPosition)
    {
        object target = Hit(screenPosition);              // element under the finger
        if (target == null) { CancelDwell(); return; }     // nothing: cancel
        if (target == _dwellTarget) return;               // same element: keep ticking
        CancelDwell();                                    // new element: restart
        _dwellTarget = target;                            // _startDwell
        _dwellStart = Time.unscaledTime;
    }

    // Hand gone: cancel the dwell (web _onHandLost).
    protected override void OnHandLost()
    {
        CancelDwell(); // _cancelDwell
    }

    // Pinch on the back button or a dot runs it; anywhere else is ignored (web _onPinchConfirmed EXPERIENCE).
    protected override void OnPinchConfirmed(Vector2 screenPosition)
    {
        object target = Hit(screenPosition);                       // element under the finger
        if (target == null) return;                                // ignore completely
        CancelDwell();                                             // avoid a double trigger
        Activate(target);                                          // run it
    }

    // Back button first, then dots (web hit order).
    object Hit(Vector2 screenPosition)
    {
        if (RectTransformUtility.RectangleContainsScreenPoint(backButton, screenPosition, null)) return backButton; // _hitTest(backBtn)
        foreach (var dot in _dots) if (dot.Contains(screenPosition)) return dot; // _getDotAt
        return null;
    }

    // Runs the action of a hit target.
    void Activate(object target)
    {
        if (target == (object)backButton) Machine.TransitionTo(AppState.Menu); // Volver
        else if (target is ExperienceDot dot) ActivateDot(dot);                 // dot
    }

    // Clears the dwell state and its ring (web _cancelDwell).
    void CancelDwell()
    {
        _dwellTarget = null;                                                   // no element
        if (HandCursor.Instance != null) HandCursor.Instance.ShowDwellProgress(0f, Vector2.zero); // hide ring
    }

    // ── Frame update ─────────────────────────────────────────

    // Voice end detection, progress bar, dwell tick, proximity effects and overlay animations.
    void Update()
    {
        if (_presenter == null) return;                                       // not started
        float now = Time.unscaledTime;                                        // animation clock

        if (_voiceTrack.Tick()) PlayNextTrack();                              // audioEl.onended

        if (!_idleMode && !_bridging && mainVideo.IsPlaying && mainVideo.Length > 0) // ontimeupdate
        {
            float clipFraction = (float)(mainVideo.Time / mainVideo.Length);    // currentTime / duration
            _fillValue.SetTarget((_sceneIndex + clipFraction) / _presenter.scenes.Length, now); // overall progress
        }
        progressFill.anchorMax = new Vector2(Mathf.Clamp01(_fillValue.Evaluate(now)), 1f); // width: X%
        sceneFade.alpha = _fadeAlpha.Evaluate(now);                           // fade overlay

        TickDwell(now);                                                       // _tickDwell
        UpdateProximity();                                                    // _curUpdateProximity
        AnimateBackButton(now);                                               // pill hover/near/dwelling
        AnimateOverlay(now);                                                  // idleOverlayIn + objectPulse
    }

    // Advances the dwell progress and confirms after 1.5 s (web _tickDwell/_confirmDwell).
    void TickDwell(float now)
    {
        foreach (var dot in _dots) dot.Dwelling = (object)dot == _dwellTarget;         // .dwelling
        if (_dwellTarget == null) return;                                              // no dwell
        float progress = Mathf.Min((now - _dwellStart) / DwellSeconds, 1f);             // 0..1
        Vector2 center = _dwellTarget is ExperienceDot d ? d.ScreenCenter
            : RectTransformUtility.WorldToScreenPoint(null, backButton.TransformPoint(backButton.rect.center)); // element center
        if (HandCursor.Instance != null) HandCursor.Instance.ShowDwellProgress(progress, center); // ring over the element
        if (progress < 1f) return;                                                     // keep waiting
        var target = _dwellTarget;                                                     // remember before clearing
        CancelDwell();                                                                 // clean state first
        if (MirrorFrame.Instance != null) MirrorFrame.Instance.TriggerSelectionFlash(); // triggerSelectionFlash
        Activate(target);                                                              // _confirmDwell
    }

    // Finger-near effect on dots and the back button (65 px around their centers).
    void UpdateProximity()
    {
        bool seen = HandGestures.HandVisible;                                  // cursor visible
        var finger = HandGestures.Position;                                    // interpolated fingertip
        float radius = NearRadius * transform.lossyScale.x;                    // CSS px -> screen px
        foreach (var dot in _dots) dot.Near = seen && Vector2.Distance(finger, dot.ScreenCenter) < radius; // per dot
        var backCenter = RectTransformUtility.WorldToScreenPoint(null, backButton.TransformPoint(backButton.rect.center));
        _backNear = seen && Vector2.Distance(finger, backCenter) < radius;    // back button
    }

    // Back pill: rest, .finger-near (scale 1.14) and .dwelling (scale 1.18 + glow), 0.18s transitions.
    void AnimateBackButton(float now)
    {
        bool dwelling = _dwellTarget == (object)backButton;                   // .dwelling
        _backScale.SetTarget(dwelling ? 1.18f : _backNear ? 1.14f : 1f, now); // transform: scale()
        float s = _backScale.Evaluate(now);
        backButton.localScale = new Vector3(s, s, 1f);
        float target = dwelling ? 2f : _backNear ? 1f : 0f;                   // visual level
        _backVisual = Mathf.MoveTowards(_backVisual, target, Time.unscaledDeltaTime / 0.18f); // linear 0.18s
        float near = Mathf.Clamp01(_backVisual), dwell = Mathf.Clamp01(_backVisual - 1f); // blend factors
        backFill.color = new Color(0f, 0f, 0f, Mathf.Lerp(Mathf.Lerp(0.58f, 0.82f, near), 0.88f, dwell)); // background
        var dimmed = new Color(AppTheme.Gold.r, AppTheme.Gold.g, AppTheme.Gold.b, 0.35f);                 // --gold-dimmed
        backBorder.color = Color.Lerp(Color.Lerp(new Color(1f, 1f, 1f, 0.18f), dimmed, near), AppTheme.Gold, dwell); // border
        backLabel.color = Color.Lerp(new Color(1f, 1f, 1f, 0.82f), AppTheme.GoldLight, near);             // text
        backGlow.color = new Color(AppTheme.Gold.r, AppTheme.Gold.g, AppTheme.Gold.b, 0.55f * dwell);     // 0 0 18px 4px glow
    }

    // idleOverlayIn (0.4s from translateX(-24px) scale(0.95)) and objectPulse (2.5s) on the object tile.
    void AnimateOverlay(float now)
    {
        if (!_overlayVisible) return;                                                          // hidden
        float k = CssEasing.CubicBezier(0.34f, 1.3f, 0.64f, 1f, Mathf.Clamp01((now - _overlayShownAt) / 0.4f)); // entrance curve
        idleOverlayRect.anchoredPosition = new Vector2(Mathf.LerpUnclamped(-24f, 0f, k) + 40f, 6.4f); // left: 2.5rem; bottom: 0.4rem
        float s = Mathf.LerpUnclamped(0.95f, 1f, k);
        idleOverlayRect.localScale = new Vector3(s, s, 1f);
        idleOverlay.alpha = Mathf.Clamp01(k);                                                  // opacity 0 -> 1
        float pulse = CssEasing.PingPong(now, 2.5f);                                           // objectPulse
        var dimmed = new Color(AppTheme.Gold.r, AppTheme.Gold.g, AppTheme.Gold.b, 0.35f);      // --gold-dimmed
        objectBorder.color = Color.Lerp(dimmed, AppTheme.Gold, pulse);                         // border-color

        detectionFeedback.alpha = _feedbackAlpha.Evaluate(now);                                // #det-feedback opacity
        _holdValue = Mathf.MoveTowards(_holdValue, _holdTarget, Time.unscaledDeltaTime / 0.12f); // width 0.12s linear
        holdFill.anchorMax = new Vector2(_holdValue, 1f);                                      // #det-hold-fill
        _cameraDetect = Mathf.MoveTowards(_cameraDetect, _objectDetected ? 1f : 0f, Time.unscaledDeltaTime / 0.2f); // 0.2s
        var green = new Color(61f / 255f, 190f / 255f, 130f / 255f, 1f);                       // #3DBE82
        cameraBorder.color = Color.Lerp(new Color(1f, 1f, 1f, 0.18f), green, _cameraDetect);   // .det-detected border
        cameraGlow.color = new Color(green.r, green.g, green.b, 0.65f * _cameraDetect);        // 0 0 14px rgba(61,190,130,0.65)
    }
}
