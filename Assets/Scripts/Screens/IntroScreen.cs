using UnityEngine;    // AudioClip, Time
using UnityEngine.UI; // Image, AspectRatioFitter

// Intro between the menu and the experience: presenter's final image + intro voice-over (port of _setupIntro).
public class IntroScreen : NarratedScreen
{
    [SerializeField] Image presenterImage;          // #intro-presenter-img (fondoFinal)
    [SerializeField] AspectRatioFitter imageFitter; // object-fit: contain inside max 62 % x 78 %
    [SerializeField] CanvasGroup imageGroup;        // image opacity

    CssTransition _imageOpacity; // transition: opacity 0.55s ease

    // Creates the image fade.
    void Awake()
    {
        _imageOpacity = new CssTransition(0f, 0.55f, CssEasing.Ease); // fade-in when the scene becomes active
    }

    // Shows the selected presenter's final image and starts the narration timers.
    public override void OnEnter(AppState state)
    {
        var presenter = AppSession.ActivePresenter;                         // chosen in the menu
        var sprite = presenter != null ? presenter.finalBackground : null;  // fondoFinal
        presenterImage.sprite = sprite;                                     // imgEl.src
        presenterImage.enabled = sprite != null;                            // no white box without an image
        if (sprite != null) imageFitter.aspectRatio = sprite.rect.width / sprite.rect.height; // keep proportions
        _imageOpacity.Snap(0f);                                             // start transparent
        _imageOpacity.SetTarget(1f, Time.unscaledTime);                     // #scene-intro.active -> opacity 1
        base.OnEnter(state);                                                // voice after 1 s, fallback 90 s
    }

    // Clears the image after the voice stops.
    public override void OnExit(AppState state)
    {
        base.OnExit(state);              // stop the voice
        presenterImage.sprite = null;    // imgEl.src = ''
    }

    // The selected presenter's intro clip.
    protected override AudioClip ClipForVisit()
    {
        return AppSession.ActivePresenter != null ? AppSession.ActivePresenter.introAudio : null; // introAudio
    }

    // Runs the narration timers and the image fade.
    protected override void Update()
    {
        base.Update();                                                   // voice, end detection, fallback
        imageGroup.alpha = _imageOpacity.Evaluate(Time.unscaledTime);    // fade-in
    }
}
