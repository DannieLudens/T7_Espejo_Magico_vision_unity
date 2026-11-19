using System;             // Action
using System.Collections; // IEnumerator
using TMPro;              // TextMeshProUGUI
using UnityEngine;        // MonoBehaviour, RectTransform, Color
using UnityEngine.UI;     // Image, RawImage

// Photobooth sub-mode of the Final screen (port of _enterPhotoBooth, _startPhotoCapture and
// startCountdown in js/app.js + js/photo-booth.js). FinalScreen forwards the hand events here.
public class PhotoboothView : MonoBehaviour
{
    [Header("Live view (#photobooth-canvas)")]
    [SerializeField] RawImage liveView;            // mirrored webcam
    [SerializeField] RawImage makeupView;          // #photobooth-makeup-canvas (face filter overlay)
    [SerializeField] MakeupFilter makeup;          // face-filter.js fallback (Snap Camera Kit is web only)

    [Header("UI (#photobooth-ui)")]
    [SerializeField] CanvasGroup hint;             // #photobooth-hint (hintBlink)
    [SerializeField] RectTransform takeButton;     // #btn-take-photo
    [SerializeField] Image ringFill;               // .take-photo-ring background
    [SerializeField] Image ringBorder;             // .take-photo-ring 3px border
    [SerializeField] Image ringShadowRest;         // box-shadow 0 0 18px rgba(212,175,55,0.25)
    [SerializeField] Image ringShadowHover;        // .hovered box-shadow 0 0 32px rgba(212,175,55,0.55)
    [SerializeField] Image ringShadowNear;         // .finger-near box-shadow 0 0 42px rgba(212,175,55,0.65)
    [SerializeField] TextMeshProUGUI takeLabel;    // .take-photo-label
    [SerializeField] RectTransform backButton;     // #photobooth-back
    [SerializeField] Image backFill;               // background rgba(0,0,0,0.5)
    [SerializeField] Image backBorder;             // 1px border rgba(212,175,55,0.2)
    [SerializeField] Image backShadow;             // .finger-near box-shadow 0 0 20px rgba(212,175,55,0.4)
    [SerializeField] TextMeshProUGUI backLabel;    // "← Volver"
    [SerializeField] TextMeshProUGUI countdown;    // #countdown-display
    [SerializeField] PointerHover takeMouse;       // mouse :hover on the 📷 button
    [SerializeField] PointerHover backMouse;       // mouse :hover on "← Volver"

    [Header("Timing (APP_CONFIG.photobooth)")]
    [SerializeField] int countdownSeconds = 3;     // countdownSeconds

    const float NearRadius = 65f;                  // _CUR_PROX_RADIUS in CSS px

    public event Action<Texture2D> PhotoTaken;     // capture finished -> photo result mode
    public event Action BackRequested;             // "← Volver" -> menu

    static readonly Color GoldDimmed = new Color(AppTheme.Gold.r, AppTheme.Gold.g, AppTheme.Gold.b, 0.35f); // --gold-dimmed

    bool _capturing;           // _photoCapturing
    bool _takeHover;           // #btn-take-photo.hovered (hand)
    bool _takeNear, _backNear; // .finger-near
    float _popStart = -10f;    // countdownPop start
    Coroutine _captureRoutine; // countdown + capture

    CssTransition _takeScale;  // #btn-take-photo transform 0.15s ease
    CssTransition _ringLevel;  // ring transitions 0.2s: 0 rest, 1 hovered, 2 finger-near
    CssTransition _backLevel;  // back button transitions 0.15s: 0 rest, 1 finger-near
    CssTransition _backHover;  // back label color 0.2s on mouse :hover

    // Prepares the transitions.
    void Awake()
    {
        _takeScale = new CssTransition(1f, 0.15f, CssEasing.Ease); // scale(1)
        _ringLevel = new CssTransition(0f, 0.2f, CssEasing.Ease);  // rest look
        _backLevel = new CssTransition(0f, 0.15f, CssEasing.Ease); // rest look
        _backHover = new CssTransition(0f, 0.2f, CssEasing.Ease);  // rest color
    }

    // Shows the camera with the 📷 button and the hint (web _enterPhotoBooth).
    public void Enter()
    {
        AttachCamera();                                            // drawImage(webcam)
        StartMakeup();                                             // initFaceFilter + setMakeupPreset

        takeButton.gameObject.SetActive(true);                     // classList.remove('hidden')
        hint.gameObject.SetActive(true);
        countdown.gameObject.SetActive(false);                     // #countdown-display.hidden
        _capturing = false;                                        // reset de seguridad
        _takeHover = _takeNear = _backNear = false;                // no hover classes
        _takeScale.Snap(1f);                                       // rest transforms
        _ringLevel.Snap(0f);
        _backLevel.Snap(0f);
        _backHover.Snap(0f);
        Debug.Log("[App] Photobooth activo (sin filtro AR todavía)"); // web log
    }

    // Shows the shared webcam mirrored; #111 while the camera is not ready (readyState < 2).
    void AttachCamera()
    {
        var camera = HandTrackingService.GetCameraTexture();         // same webcam as hand tracking
        liveView.texture = camera;                                   // drawImage(webcam)
        liveView.color = camera != null ? Color.white : Color.clear; // fillRect('#111') fallback
        liveView.uvRect = new Rect(1f, 0f, -1f, 1f);                 // ctx.scale(-1, 1)
    }

    // Starts the face filter for the active presenter and shows its overlay (already in mirror view, so no flip).
    void StartMakeup()
    {
        var camera = HandTrackingService.GetCameraTexture();                   // overlay matches the video size
        int w = camera != null ? camera.width : 1280, h = camera != null ? camera.height : 720; // || 1280 x 720
        var presenter = AppSession.ActivePresenter;                            // _activePresenter.id
        makeup.Begin(presenter != null ? presenter.id : null, w, h);           // Face Mesh + preset
        makeupView.texture = makeup.Overlay;                                   // #photobooth-makeup-canvas
        makeupView.uvRect = new Rect(0f, 0f, 1f, 1f);                          // landmarks are mirror view already
        makeupView.enabled = true;
    }

    // Stops a running countdown and releases the camera (web _onLeaveStateFinal).
    public void Exit()
    {
        if (_captureRoutine != null) { StopCoroutine(_captureRoutine); _captureRoutine = null; } // abort countdown
        _capturing = false;                         // allow a new capture next time
        liveView.texture = null;                    // stop drawing the webcam
        makeup.End();                               // stopFaceFilter()
    }

    // ── Hand and mouse input ─────────────────────────────────

    // Hover of the 📷 button follows the fingertip (web _onPhotoBoothHandMove).
    public void HandMoved(Vector2 screenPosition)
    {
        _takeHover = takeButton.gameObject.activeSelf && Contains(takeButton, screenPosition); // .hovered toggle
    }

    // Hand gone: no hover.
    public void HandLost()
    {
        _takeHover = false; // cursor hidden
    }

    // Pinch: "← Volver" first, then the 📷 button (web _onPinchConfirmed PHOTOBOOTH).
    public void PinchConfirmed(Vector2 screenPosition)
    {
        if (Contains(backButton, screenPosition)) { BackRequested?.Invoke(); return; }            // _transitionTo(MENU)
        if (takeButton.gameObject.activeSelf && Contains(takeButton, screenPosition)) StartCapture(); // _handlePhotoBoothPinch
    }

    // Mouse click on the 📷 button.
    public void OnTakeClicked()
    {
        StartCapture(); // takeBtn click
    }

    // Mouse click on "← Volver".
    public void OnBackClicked()
    {
        BackRequested?.Invoke(); // backBtn click
    }

    // True when the screen point is inside the (scaled) element, like getBoundingClientRect.
    static bool Contains(RectTransform rect, Vector2 screenPosition)
    {
        return RectTransformUtility.RectangleContainsScreenPoint(rect, screenPosition, null); // includes transform
    }

    // ── Countdown and capture ────────────────────────────────

    // Hides the button and the hint, then runs the countdown (web _startPhotoCapture).
    void StartCapture()
    {
        if (_capturing) return;                          // already counting
        _capturing = true;                               // _photoCapturing
        takeButton.gameObject.SetActive(false);          // btn-take-photo.hidden
        hint.gameObject.SetActive(false);                // photobooth-hint.hidden
        _captureRoutine = StartCoroutine(CaptureRoutine()); // startCountdown()
    }

    // 3 -> 2 -> 1 with bulb blinks, "¡Listo!" with the camera flash, then the photo 0.8 s later.
    IEnumerator CaptureRoutine()
    {
        countdown.gameObject.SetActive(true);                                 // display.classList.remove('hidden')
        int seconds = AppConfig.Loaded ? AppConfig.Current.photobooth.countdownSeconds : countdownSeconds; // APP_CONFIG value
        for (int count = seconds; count > 0; count--)                         // tick()
        {
            Pop(count.ToString());                                            // textContent + countdown-pop
            if (MirrorFrame.Instance != null) MirrorFrame.Instance.TriggerCountdownBlink(); // uniform blink
            yield return new WaitForSecondsRealtime(1f);                       // setTimeout(tick, 1000)
        }
        if (MirrorFrame.Instance != null) MirrorFrame.Instance.TriggerCameraFlash(); // ¡Foto!
        Pop("¡Listo!");                                                       // last pop
        yield return new WaitForSecondsRealtime(0.8f);                         // setTimeout(…, 800)

        Texture2D photo = null;                                               // _capturePhoto()
        if (PhotoComposer.Instance != null)
            yield return PhotoComposer.Instance.Capture(liveView.texture, makeupView.enabled ? makeupView.texture : null, p => photo = p);
        countdown.gameObject.SetActive(false);                                // display.classList.add('hidden')
        _captureRoutine = null;                                               // finished
        _capturing = false;                                                   // finally { _photoCapturing = false }
        PhotoTaken?.Invoke(photo);                                            // _showPhotoResult(dataURL)
    }

    // Sets the countdown text and restarts the countdownPop animation.
    void Pop(string text)
    {
        countdown.text = text;           // display.textContent
        _popStart = Time.unscaledTime;   // void offsetWidth; classList.add('countdown-pop')
    }

    // ── Frame update ─────────────────────────────────────────

    // hintBlink, countdownPop, proximity and the button transitions.
    void Update()
    {
        float now = Time.unscaledTime;                                                  // animation clock
        if (liveView.texture == null) AttachCamera();                                   // the render loop keeps polling the webcam
        hint.alpha = Mathf.Lerp(0.35f, 1f, CssEasing.PingPong(now, 2.5f));             // hintBlink 2.5s ease-in-out

        float popT = Mathf.Clamp01((now - _popStart) / 0.45f);                          // countdownPop 0.45s
        float pop = CssEasing.CubicBezier(0.34f, 1.56f, 0.64f, 1f, popT);               // overshooting curve
        float popScale = Mathf.LerpUnclamped(2.5f, 1f, pop);                            // scale(2.5) -> scale(1)
        countdown.rectTransform.localScale = new Vector3(popScale, popScale, 1f);
        countdown.alpha = Mathf.Clamp01(pop);                                           // opacity 0 -> 1

        UpdateProximity();                                                              // _curUpdateProximity
        AnimateTakeButton(now);                                                         // ring + label + scale
        AnimateBackButton(now);                                                         // back pill
    }

    // Finger-near on the 📷 button and "← Volver" (65 px around their centers).
    void UpdateProximity()
    {
        bool seen = HandGestures.HandVisible;                                           // cursor visible
        var finger = HandGestures.Position;                                             // interpolated fingertip
        float radius = NearRadius * transform.lossyScale.x;                             // CSS px -> screen px
        _takeNear = seen && takeButton.gameObject.activeSelf && Vector2.Distance(finger, Center(takeButton)) < radius; // hidden button is skipped
        _backNear = seen && Vector2.Distance(finger, Center(backButton)) < radius;      // back button
    }

    // Center of an element in screen pixels.
    static Vector2 Center(RectTransform rect)
    {
        return RectTransformUtility.WorldToScreenPoint(null, rect.TransformPoint(rect.rect.center)); // rect center
    }

    // 📷 button: rest / .hovered / .finger-near (finger-near wins: it is declared later with equal specificity).
    void AnimateTakeButton(float now)
    {
        bool hover = _takeHover || takeMouse.IsOver;                                    // .hovered or :hover
        _takeScale.SetTarget(_takeNear ? 1.22f : hover ? 1.08f : 1f, now);              // transform: scale()
        float s = _takeScale.Evaluate(now);
        takeButton.localScale = new Vector3(s, s, 1f);

        _ringLevel.SetTarget(_takeNear ? 2f : hover ? 1f : 0f, now);                    // 0.2s ring transition
        float level = _ringLevel.Evaluate(now);
        float active = Mathf.Clamp01(level);                                            // rest -> hovered/near
        ringBorder.color = Color.Lerp(GoldDimmed, AppTheme.Gold, active);               // border-color
        ringFill.color = Color.Lerp(new Color(0f, 0f, 0f, 0.6f), WithAlpha(AppTheme.Gold, 0.18f), active); // background
        float near = Mathf.Clamp01(level - 1f);                                         // hovered -> near
        ringShadowRest.color = WithAlpha(AppTheme.Gold, 0.25f * (1f - active));         // 18px glow fades out
        ringShadowHover.color = WithAlpha(AppTheme.Gold, 0.55f * active * (1f - near)); // 32px glow
        ringShadowNear.color = WithAlpha(AppTheme.Gold, 0.65f * near);                  // 42px glow

        takeLabel.color = _takeNear ? AppTheme.GoldLight : hover ? AppTheme.Gold : GoldDimmed; // label color (no transition)
    }

    // "← Volver": rest, mouse :hover (gold text) and .finger-near (scale 1.38 + glow).
    void AnimateBackButton(float now)
    {
        _backLevel.SetTarget(_backNear ? 1f : 0f, now);                                 // 0.15s finger-near transition
        _backHover.SetTarget(backMouse.IsOver ? 1f : 0f, now);                          // 0.2s :hover color
        float near = _backLevel.Evaluate(now);
        float s = Mathf.LerpUnclamped(1f, 1.38f, near);                                 // transform: scale(1.38)
        backButton.localScale = new Vector3(s, s, 1f);
        backFill.color = new Color(0f, 0f, 0f, Mathf.Lerp(0.5f, 0.85f, near));          // background
        backBorder.color = Color.Lerp(WithAlpha(AppTheme.Gold, 0.2f), AppTheme.Gold, near); // border-color
        backShadow.color = WithAlpha(AppTheme.Gold, 0.4f * near);                       // box-shadow
        var rest = Color.Lerp(AppTheme.TextDim, AppTheme.Gold, _backHover.Evaluate(now)); // :hover color
        backLabel.color = Color.Lerp(rest, AppTheme.GoldLight, near);                   // .finger-near color
    }

    // Same color with a different alpha.
    static Color WithAlpha(Color c, float a)
    {
        return new Color(c.r, c.g, c.b, a); // rgba()
    }
}
