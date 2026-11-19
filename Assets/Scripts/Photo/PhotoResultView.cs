using System;             // Action
using System.Collections; // IEnumerator
using UnityEngine;        // MonoBehaviour, RectTransform, Texture2D
using UnityEngine.UI;     // RawImage, LayoutElement

// Photo sub-mode of the Final screen (port of _showPhotoResult and _handlePhotoResultPinch in js/app.js):
// the captured photo, the QR to download it, "📸 Tomar otra" and "↩ Volver al inicio".
public class PhotoResultView : MonoBehaviour
{
    [SerializeField] RawImage photo;            // #captured-photo-img
    [SerializeField] LayoutElement qrBox;       // #qr-code-container (white, padding 12px)
    [SerializeField] RawImage qrImage;          // the 220 x 220 code
    [SerializeField] CanvasGroup uploading;     // #photo-uploading "Subiendo foto… ⏳"
    [SerializeField] RectTransform shareColumn; // #photo-share (re-centered when its content changes)
    [SerializeField] FinalButton retakeButton;  // #btn-retake
    [SerializeField] FinalButton menuButton;    // #btn-photo-menu

    const float NearRadius = 65f;               // _CUR_PROX_RADIUS in CSS px

    public event Action RetakeRequested;        // _enterPhotoBooth()
    public event Action MenuRequested;          // _transitionTo(MENU)
    public event Action TimedOut;               // qrDisplayMs elapsed -> tutorial

    Texture2D _qrTexture;     // generated code
    float _returnAt = -1f;    // auto-return time, -1 while uploading
    bool _timedOut;           // fired once

    // Shows the photo, uploads it and draws the QR (web _showPhotoResult).
    public void Show(Texture2D captured)
    {
        photo.texture = captured;                          // img.src = dataURL
        photo.enabled = captured != null;
        retakeButton.AlignSign = menuButton.AlignSign = 1; // photo mode buttons shift right on hover/near
        retakeButton.ResetState();
        menuButton.ResetState();
        SetQr(null);                                       // container empty while uploading
        SetUploading(true);                                // uploading.classList.remove('hidden')
        _returnAt = -1f;                                   // timer starts after the upload
        _timedOut = false;
        if (captured != null) StartCoroutine(UploadAndShowQr(captured)); // await processAndShowQR
    }

    // Uploads the JPEG, shows the QR and arms the auto-return.
    IEnumerator UploadAndShowQr(Texture2D captured)
    {
        int quality = Mathf.RoundToInt(AppConfig.Current.photobooth.jpegQuality * 100f); // jpegQuality 0.92
        byte[] jpeg = captured.EncodeToJPG(quality);                                     // toDataURL('image/jpeg')
        string url = null;
        yield return PhotoUploader.Process(jpeg, u => url = u);                          // Cloudinary or local fallback
        SetQr(url);                                                                      // generateQRCode
        SetUploading(false);                                                             // uploading.classList.add('hidden')
        _returnAt = Time.unscaledTime + AppConfig.Current.photobooth.qrDisplayMs / 1000f; // setTimeout(…, qrDisplayMs)
    }

    // Replaces the QR (null = empty white container, as while the web is uploading).
    void SetQr(string url)
    {
        if (_qrTexture != null) { Destroy(_qrTexture); _qrTexture = null; }  // container.innerHTML = ''
        if (!string.IsNullOrEmpty(url)) _qrTexture = QrEncoder.ToTexture(QrEncoder.Encode(url)); // new QRCode(...)
        qrImage.texture = _qrTexture;
        qrImage.enabled = _qrTexture != null;
        float side = _qrTexture != null ? 244f : 24f;                         // 220 + 2 x 12 padding, or padding only
        qrBox.preferredWidth = qrBox.minWidth = side;
        qrBox.preferredHeight = qrBox.minHeight = side;
        LayoutRebuilder.MarkLayoutForRebuild(shareColumn);                    // re-center the column
    }

    // Shows or hides the uploading line.
    void SetUploading(bool visible)
    {
        uploading.gameObject.SetActive(visible);           // .hidden toggle
        LayoutRebuilder.MarkLayoutForRebuild(shareColumn);
    }

    // Leaving the mode cancels the upload callback and the timer.
    void OnDisable()
    {
        StopAllCoroutines();   // the result arrives for a mode that is no longer shown
        _returnAt = -1f;       // no auto-return
    }

    // ── Hand and mouse input ─────────────────────────────────

    // Pinch over "Tomar otra" or "Volver al inicio" (web _handlePhotoResultPinch).
    public void PinchConfirmed(Vector2 screenPosition)
    {
        if (retakeButton.Contains(screenPosition)) { RetakeRequested?.Invoke(); return; } // _enterPhotoBooth()
        if (menuButton.Contains(screenPosition)) MenuRequested?.Invoke();                 // _transitionTo(MENU)
    }

    // Mouse click on "📸 Tomar otra".
    public void OnRetakeClicked() { RetakeRequested?.Invoke(); }

    // Mouse click on "↩ Volver al inicio".
    public void OnMenuClicked() { MenuRequested?.Invoke(); }

    // ── Frame update ─────────────────────────────────────────

    // Uploading blink, finger-near on both buttons and the auto-return timer.
    void Update()
    {
        float now = Time.unscaledTime;                                                   // animation clock
        if (uploading.gameObject.activeSelf) uploading.alpha = Blink(now, 1.5f);         // hintBlink 1.5s (ease)

        bool seen = HandGestures.HandVisible;                                            // cursor visible
        var finger = HandGestures.Position;                                              // interpolated fingertip
        float radius = NearRadius * transform.lossyScale.x;                              // CSS px -> screen px
        retakeButton.Near = seen && Vector2.Distance(finger, retakeButton.ScreenCenter) < radius; // .finger-near
        menuButton.Near = seen && Vector2.Distance(finger, menuButton.ScreenCenter) < radius;

        if (_returnAt < 0f || _timedOut || now < _returnAt) return;                      // timer not due
        _timedOut = true;                                                                // fire once
        TimedOut?.Invoke();                                                              // _transitionTo(TUTORIAL)
    }

    // hintBlink keyframes (0% / 100% opacity 0.35, 50% opacity 1) with the default "ease" per segment.
    static float Blink(float now, float period)
    {
        float t = Mathf.Repeat(now, period) / period;                                    // 0..1 in the cycle
        float k = t < 0.5f ? CssEasing.Ease(t / 0.5f) : 1f - CssEasing.Ease((t - 0.5f) / 0.5f); // up then down
        return Mathf.Lerp(0.35f, 1f, k);
    }

    // Frees the QR texture.
    void OnDestroy()
    {
        if (_qrTexture != null) Destroy(_qrTexture); // GPU memory
    }
}
