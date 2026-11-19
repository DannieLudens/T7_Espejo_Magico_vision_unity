using TMPro;       // TMP_Text
using UnityEngine; // MonoBehaviour

// Credits in the bottom strip of the vanity frame, visible in Standby and Mirror (web #standby-credits).
public class VanityCredits : MonoBehaviour
{
    const string Separator = " · ";                                                        // &nbsp;·&nbsp;
    const string BaseText = "UPB" + Separator + "IDED" + Separator + "Taller 7 Entretenimiento Digital"; // standby text
    const string MirrorSuffix = Separator + "Tour Telemedellín";                                      // #mirror-credits-extra

    [SerializeField] TMP_Text label;                 // credits label
    [SerializeField] float standbyFontSize = 13.6f;  // clamp(0.6rem, 1.1vw, 0.85rem) at 1920 px
    [SerializeField] float mirrorFontSize = 11.5f;   // clamp(0.5rem, 0.85vw, 0.72rem) at 1920 px

    // Shows the credits; mirror mode appends "Tour Telemedellín" with a smaller font.
    public void Show(bool mirrorMode)
    {
        label.text = (mirrorMode ? BaseText + MirrorSuffix : BaseText).ToUpperInvariant(); // text-transform: uppercase
        label.fontSize = mirrorMode ? mirrorFontSize : standbyFontSize;                     // body.mirror-mode font size
        gameObject.SetActive(true);                                                         // display: flex
    }

    // Hides the credits.
    public void Hide()
    {
        gameObject.SetActive(false); // display: none
    }
}
