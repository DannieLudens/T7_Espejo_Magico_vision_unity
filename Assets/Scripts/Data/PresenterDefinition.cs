using UnityEngine; // ScriptableObject, Sprite, Color

// Data of one presenter (port of an entry of PRESENTERS in js/presenters.js).
[CreateAssetMenu(menuName = "Espejo Magico/Presenter", fileName = "Presenter")]
public class PresenterDefinition : ScriptableObject
{
    public string id;                        // web id, e.g. "p_noticias"
    [TextArea] public string label;          // card name (two lines)
    public Sprite character;                 // personaje: transparent PNG of the presenter
    public Sprite background;                // fondo: studio set (menu hover and card background)
    public Sprite finalBackground;           // fondoFinal: used by intro and final screens
    public Color accentColor = Color.white;  // accentColor
    public AudioClip introAudio;             // introAudio: voice played on the Intro screen

    [Header("Menu card framing (per-presenter CSS overrides)")]
    [Tooltip("background-size: auto X% -> character height as a fraction of the card height")]
    public float cardCharacterHeight = 0.92f;              // default 92 %
    [Range(0f, 1f), Tooltip("background-position X% (0.5 = center)")]
    public float cardCharacterAnchorX = 0.5f;              // default center
}
