// Every state of the kiosk, mirroring AppState in the web version (js/app.js).
public enum AppState
{
    None,        // no state yet (before boot)
    Standby,     // idle loop video, waits for a hand
    Menu,        // presenter selection cards
    Intro,       // presenter image + intro audio
    Experience,  // presenter scenes with navigation dots
    Outro,       // closing audio before the final screen
    Final,       // result screen with photobooth/mirror options
    Photobooth,  // AR filter camera (sub-mode of the Final screen)
    PhotoResult, // captured photo + QR (sub-mode of the Final screen)
    Mirror,      // water ripple magic mirror
    Tutorial     // pinch gesture tutorial video
}
