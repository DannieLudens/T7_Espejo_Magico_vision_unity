using System.Collections; // IEnumerator
using UnityEngine;        // AudioSource, AudioClip, Mathf, Time
using UnityEngine.UI;     // Image

// Presenter selection menu (port of _setupMenu, _updatePresenterHover, _getCardAt and the MENU pinch handlers).
public class MenuScreen : ScreenController
{
    [SerializeField] PresenterCard[] cards;               // the four oval cards, in PRESENTERS order
    [SerializeField] Image menuBackground;                // #menu-bg: hovered presenter's set, darkened
    [SerializeField] CanvasGroup menuBackgroundGroup;     // #menu-bg opacity
    [SerializeField] AudioSource voice;                   // voice-over channel
    [SerializeField] AudioClip instructionClip;           // Instruccion_Seleccion_de_Presentador.mp3
    [SerializeField] float instructionDelay = 3f;         // 3 s after entering, once per session
    [SerializeField] float selectionDelay = 0.9f;         // wait for the bulb flash before the transition
    [SerializeField] float cardStagger = 0.10f;           // animation-delay: index * 0.10s

    CssTransition _backgroundOpacity;  // transition: opacity 0.55s ease
    float _instructionAt = -1f;        // time to play the instruction, -1 = not scheduled
    bool _selected;                    // a presenter was picked, ignore further pinches

    // Creates the background transition.
    void Awake()
    {
        _backgroundOpacity = new CssTransition(0f, 0.55f, CssEasing.Ease); // #menu-bg transition
    }

    // The menu waits for a presenter choice with no time limit.
    public override bool WaitsForVisitor(AppState state) { return true; }

    // Builds the card entrance once per session and schedules the voice instruction.
    public override void OnEnter(AppState state)
    {
        _selected = false;                                                    // allow a new pick
        for (int i = 0; i < cards.Length; i++)                                // web _buildPresenterCards only on first visit
        {
            if (AppSession.MenuCardsIntroPlayed) cards[i].ShowImmediately();  // already built
            else cards[i].PlayEntrance(i * cardStagger);                      // staggered slide-in
            cards[i].SetHovered(false, Vector2.zero);                          // reset hover from the previous visit
            cards[i].SetSelecting(false);                                     // reset selection ring
        }
        AppSession.MenuCardsIntroPlayed = true;                               // cards exist now
        _backgroundOpacity.Snap(0f);                                          // no presenter hovered yet
        _instructionAt = AppSession.MenuInstructionPlayed ? -1f : Time.unscaledTime + instructionDelay; // setTimeout 3000
    }

    // Cancels the pending instruction and stops it if it is playing.
    public override void OnExit(AppState state)
    {
        _instructionAt = -1f;                    // clearTimeout(_menuInstructionTimer)
        if (voice.isPlaying) voice.Stop();       // _menuInstructionAudio.pause()
    }

    // Also listens to pinch releases so the selection ring never stays stuck.
    protected override void OnEnable()
    {
        base.OnEnable();                          // standard gesture hooks
        HandGestures.PinchEnded += ClearSelecting; // released before confirming
    }

    // Removes the extra subscription.
    protected override void OnDisable()
    {
        base.OnDisable();                         // standard gesture hooks
        HandGestures.PinchEnded -= ClearSelecting;
    }

    // Hover + parallax + dynamic background (web _updatePresenterHover).
    protected override void OnHandMoved(Vector2 screenPosition)
    {
        PresenterCard hovered = null;                                  // card under the finger
        foreach (var card in cards)
        {
            bool inside = card.Contains(screenPosition);               // bounding-box test
            card.SetHovered(inside, screenPosition);                   // .hovered + parallax
            if (inside) hovered = card;                                // remember
        }

        float now = Time.unscaledTime;                                 // transition clock
        if (hovered != null)
        {
            menuBackground.sprite = hovered.Presenter.background;      // data-hover-bg
            _backgroundOpacity.SetTarget(1f, now);                     // fade in
        }
        else
        {
            _backgroundOpacity.SetTarget(0f, now);                     // fade out
        }
    }

    // Hand gone: clear hover and selection, hide the background (web _onHandLost).
    protected override void OnHandLost()
    {
        foreach (var card in cards)
        {
            card.SetHovered(false, Vector2.zero); // remove .hovered
            card.SetSelecting(false);             // remove .selecting
        }
        _backgroundOpacity.SetTarget(0f, Time.unscaledTime); // menuBg.style.opacity = '0'
    }

    // Highlights the card being pinched (web _onPinchProgress, MENU branch).
    protected override void OnPinchProgress(Vector2 screenPosition, float progress)
    {
        var active = CardAt(screenPosition);                 // card under the finger
        foreach (var card in cards) card.SetSelecting(card == active); // only that one pulses
    }

    // Picks the presenter under the finger and opens the intro after the flash (web _onPinchConfirmed, MENU).
    protected override void OnPinchConfirmed(Vector2 screenPosition)
    {
        if (_selected) return;                                   // already transitioning
        var card = CardAt(screenPosition);                       // _getCardAt
        if (card == null) return;                                // pinch outside the cards does nothing
        _selected = true;                                        // block double picks
        ClearSelecting();                                        // _clearPinchBars
        AppSession.ActivePresenter = card.Presenter;             // _activePresenter
        StartCoroutine(OpenIntroAfterFlash());                   // setTimeout(..., 900)
    }

    // Waits for the bulb flash, then transitions to the intro.
    IEnumerator OpenIntroAfterFlash()
    {
        yield return new WaitForSecondsRealtime(selectionDelay); // 900 ms
        Machine.TransitionTo(AppState.Intro);                    // _transitionTo(AppState.INTRO)
    }

    // Returns the card whose bounding box contains the point, or null.
    PresenterCard CardAt(Vector2 screenPosition)
    {
        foreach (var card in cards)
            if (card.Contains(screenPosition)) return card;      // first match, same as the web loop
        return null;
    }

    // Removes the selecting state from every card.
    void ClearSelecting()
    {
        foreach (var card in cards) card.SetSelecting(false); // no ring pulse
    }

    // Plays the one-time instruction and animates the background opacity.
    void Update()
    {
        if (_instructionAt >= 0f && Time.unscaledTime >= _instructionAt) // timer elapsed
        {
            _instructionAt = -1f;                      // _menuInstructionTimer = null
            AppSession.MenuInstructionPlayed = true;   // only once per session
            voice.clip = instructionClip;              // new Audio(...)
            voice.Play();                              // play()
            Captions.Attach(voice, instructionClip);   // attachCaptions (never detached when leaving, like the web)
        }
        menuBackgroundGroup.alpha = _backgroundOpacity.Evaluate(Time.unscaledTime); // #menu-bg opacity
    }
}
