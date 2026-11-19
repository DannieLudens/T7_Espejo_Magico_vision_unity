using TMPro;          // TextMeshProUGUI, TextAlignmentOptions
using UnityEngine;    // RectTransform, Vector2, GameObject
using UnityEngine.UI; // Image, AspectRatioFitter, VerticalLayoutGroup

// Final screen (port of _setupFinal / _onFinalHandMove / _handleFinalPinch in js/app.js).
// One screen hosts the three sub-modes of the web #screen-final: result, photobooth and photo.
public class FinalScreen : ScreenController
{
    [Header("Sub-modes")]
    [SerializeField] GameObject resultMode;       // #final-result-mode
    [SerializeField] GameObject photoboothMode;   // #final-photobooth-mode (pending)
    [SerializeField] GameObject photoMode;        // #final-photo-mode (pending)

    [Header("Result mode")]
    [SerializeField] Image presenterImage;        // #final-presenter-img (object-fit: contain)
    [SerializeField] AspectRatioFitter imageFitter; // keeps the image proportions
    [SerializeField] Image backgroundOverlay;     // #final-bg-overlay: its inline background-image replaces the CSS gradient
    [SerializeField] RectTransform cta;           // #final-cta column
    [SerializeField] VerticalLayoutGroup ctaLayout; // flex column, gap 1.2rem
    [SerializeField] TextMeshProUGUI nameLabel;   // #final-presenter-name-label
    [SerializeField] TextMeshProUGUI subtitle;    // #final-presenter-subtitle
    [SerializeField] FinalButton makeupButton;    // #btn-try-makeup (data-action="makeup")
    [SerializeField] FinalButton menuButton;      // #btn-back-menu (data-action="menu")
    [SerializeField] float autoReturnSeconds = 30f; // _finalAutoReturnTimer

    const float NearRadius = 65f;        // _CUR_PROX_RADIUS in CSS px
    const float SidePadding = 96f;       // clamp(2.5rem, 6vw, 6rem) at 1920 px
    const float InnerPadding = 16f;      // 1rem on the side facing the character

    float _enteredAt;                    // time the result mode was shown
    bool _autoReturnRequested;           // timer already fired

    // Shows the sub-mode of the state; the result mode is rebuilt for the active presenter.
    public override void OnEnter(AppState state)
    {
        resultMode.SetActive(state == AppState.Final);           // _showFinalMode('result')
        photoboothMode.SetActive(state == AppState.Photobooth);  // _showFinalMode('photobooth')
        photoMode.SetActive(state == AppState.PhotoResult);      // _showFinalMode('photo')
        if (state == AppState.Final) SetupResult();              // _setupFinal
    }

    // Leaving any sub-mode stops the hand states of the buttons.
    public override void OnExit(AppState state)
    {
        makeupButton.ResetState(); // no hover/near/selecting left behind
        menuButton.ResetState();
    }

    // Image, CTA alignment, presenter name and the auto-return timer (web _setupFinal).
    void SetupResult()
    {
        var presenter = AppSession.ActivePresenter;                         // _activePresenter
        if (presenter != null)
        {
            presenterImage.sprite = presenter.finalBackground;              // imgEl.src = fondoFinal
            presenterImage.enabled = presenter.finalBackground != null;     // nothing to show otherwise
            if (presenter.finalBackground != null)
                imageFitter.aspectRatio = presenter.finalBackground.rect.width / presenter.finalBackground.rect.height; // contain
            ShowOverlayImage(presenter.finalBackground);                    // bgEl.style.backgroundImage = fondoFinal
            nameLabel.text = presenter.label;                               // nameEl.textContent (pre-line)
            ApplyAlignment(presenter.ctaAlign);                             // data-cta-align
        }
        makeupButton.ResetState();                                          // fresh buttons
        menuButton.ResetState();
        _enteredAt = Time.unscaledTime;                                     // setTimeout(…, 30000)
        _autoReturnRequested = false;                                       // timer armed
        Debug.Log("[App] Pantalla final: " + (presenter != null ? presenter.label.Replace('\n', ' ') : "(sin presentador)")); // web log
    }

    // The web sets fondoFinal as the overlay's inline background-image, which drops the gradient and draws the
    // picture at its natural size from the top-left corner (background-size: auto), clipped by the mode.
    // Every fondoFinal is larger than the 1796 x 956 area, so this is what the visitor actually sees.
    void ShowOverlayImage(Sprite sprite)
    {
        backgroundOverlay.enabled = sprite != null;        // nothing to draw otherwise
        if (sprite == null) return;
        backgroundOverlay.sprite = sprite;                 // same picture as the <img>
        backgroundOverlay.rectTransform.sizeDelta = sprite.rect.size; // natural size in CSS px (1920 x 1080 reference)
    }

    // Places the CTA column on the side away from the character (web data-cta-align rules).
    void ApplyAlignment(CtaAlign align)
    {
        float x = align == CtaAlign.Left ? 0f : align == CtaAlign.Right ? 1f : 0.5f;  // align-items of the mode
        cta.anchorMin = cta.anchorMax = cta.pivot = new Vector2(x, 0f);                // bottom edge (justify-content: flex-end)
        cta.anchoredPosition = Vector2.zero;
        cta.sizeDelta = new Vector2(align == CtaAlign.Center ? 600f : 560f, cta.sizeDelta.y); // max-width

        int left = align == CtaAlign.Left ? (int)SidePadding : align == CtaAlign.Right ? (int)InnerPadding : 48; // padding-left
        int right = align == CtaAlign.Right ? (int)SidePadding : align == CtaAlign.Left ? (int)InnerPadding : 48; // padding-right
        ctaLayout.padding = new RectOffset(left, right, 32, 40);                     // 2rem top, 2.5rem bottom
        ctaLayout.childAlignment = align == CtaAlign.Left ? TextAnchor.LowerLeft
            : align == CtaAlign.Right ? TextAnchor.LowerRight : TextAnchor.LowerCenter; // align-items of #final-cta

        var text = align == CtaAlign.Left ? TextAlignmentOptions.Left
            : align == CtaAlign.Right ? TextAlignmentOptions.Right : TextAlignmentOptions.Center; // text-align
        nameLabel.alignment = text;
        subtitle.alignment = text;

        int sign = align == CtaAlign.Left ? -1 : align == CtaAlign.Right ? 1 : 0;   // hover moves toward the edge
        makeupButton.AlignSign = sign;
        menuButton.AlignSign = sign;
        LayoutRebuilder.ForceRebuildLayoutImmediate(cta);                            // size the column now
    }

    // ── Button actions ───────────────────────────────────────

    // "💄 Prueba el maquillaje": photobooth sub-mode, which also cancels the auto-return.
    public void OnMakeupClicked()
    {
        if (Machine.Current != AppState.Final) return; // only from the result mode
        Machine.TransitionTo(AppState.Photobooth);    // _enterPhotoBooth()
    }

    // "↩ Volver al inicio": back to the presenter menu.
    public void OnMenuClicked()
    {
        if (Machine.Current != AppState.Final) return; // only from the result mode
        Machine.TransitionTo(AppState.Menu);          // _transitionTo(MENU)
    }

    // ── Hand input ───────────────────────────────────────────

    // Pinch released early: empty the bars (the web leaves them half full).
    protected override void OnEnable()
    {
        base.OnEnable();                         // shared gesture hooks
        HandGestures.PinchEnded += OnPinchEnded; // extra hook for this screen
    }

    // Removes the extra hook.
    protected override void OnDisable()
    {
        base.OnDisable();                        // shared gesture hooks
        HandGestures.PinchEnded -= OnPinchEnded; // stop listening
    }

    // Hover follows the fingertip (web _onFinalHandMove).
    protected override void OnHandMoved(Vector2 screenPosition)
    {
        if (Machine.Current != AppState.Final) return; // result mode only
        var hit = ButtonAt(screenPosition);           // _getFinalBtnAt
        makeupButton.HandHover = hit == makeupButton; // .hovered toggle
        menuButton.HandHover = hit == menuButton;
    }

    // Hand gone: drop the hover (cursor hidden).
    protected override void OnHandLost()
    {
        makeupButton.HandHover = menuButton.HandHover = false; // no hovered button
        OnPinchEnded();                                        // no pinch either
    }

    // The button under the pinch shows .selecting and fills its bar (web _onPinchProgress FINAL).
    protected override void OnPinchProgress(Vector2 screenPosition, float progress)
    {
        if (Machine.Current != AppState.Final) return; // result mode only
        var hit = ButtonAt(screenPosition);           // button under the pinch
        foreach (var button in new[] { makeupButton, menuButton })
        {
            button.Selecting = button == hit;          // .selecting
            button.Progress = button == hit ? progress : 0f; // bar width
        }
    }

    // Pinch completed over a button runs its action (web _handleFinalPinch).
    protected override void OnPinchConfirmed(Vector2 screenPosition)
    {
        if (Machine.Current != AppState.Final) return; // result mode only
        var hit = ButtonAt(screenPosition);           // button under the pinch
        if (hit == makeupButton) OnMakeupClicked();    // data-action="makeup"
        else if (hit == menuButton) OnMenuClicked();   // data-action="menu"
    }

    // Clears the pinch feedback of both buttons.
    void OnPinchEnded()
    {
        makeupButton.Selecting = menuButton.Selecting = false; // no .selecting
        makeupButton.Progress = menuButton.Progress = 0f;      // empty bars
    }

    // Button whose rectangle contains the point, or null.
    FinalButton ButtonAt(Vector2 screenPosition)
    {
        if (makeupButton.Contains(screenPosition)) return makeupButton; // DOM order
        if (menuButton.Contains(screenPosition)) return menuButton;
        return null;
    }

    // ── Frame update ─────────────────────────────────────────

    // Finger-near effect and the 30 s auto-return to the menu.
    void Update()
    {
        if (Machine == null || Machine.Current != AppState.Final) return; // result mode only

        bool seen = HandGestures.HandVisible;                       // cursor visible
        var finger = HandGestures.Position;                         // interpolated fingertip
        float radius = NearRadius * transform.lossyScale.x;         // CSS px -> screen px
        makeupButton.Near = seen && Vector2.Distance(finger, makeupButton.ScreenCenter) < radius; // .finger-near
        menuButton.Near = seen && Vector2.Distance(finger, menuButton.ScreenCenter) < radius;

        if (_autoReturnRequested || Time.unscaledTime - _enteredAt < autoReturnSeconds) return; // timer running
        _autoReturnRequested = true;                                // fire once
        StartCoroutine(TransitionWhenIdle(AppState.Menu));          // auto-return to the menu
    }
}
