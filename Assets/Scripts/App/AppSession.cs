// Shared state of the current visitor session (web globals _activePresenter, _menuInstructionPlayed...).
public static class AppSession
{
    public static PresenterDefinition ActivePresenter;   // presenter chosen in the menu
    public static bool MenuInstructionPlayed;            // voice instruction plays once per session
    public static bool MenuCardsIntroPlayed;             // cards slide in only the first time the menu is built
    public static UnityEngine.Texture2D LastPhoto;       // photo taken in the photobooth (shown with the QR)
}
