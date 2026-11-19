using UnityEngine; // MonoBehaviour

// Card glass panel (web #glass-panel, key G in the menu): sparkle and stripes opacity of the presenter cards.
public class GlassPanel : MonoBehaviour
{
    [SerializeField] StepSlider sparkle;  // #sparkle-slider
    [SerializeField] StepSlider stripes;  // #stripes-slider

    // Shows the current values and wires the sliders.
    void Awake()
    {
        sparkle.SetValue(CardGlass.Sparkle);               // 0.15
        stripes.SetValue(CardGlass.Stripes);               // 0.40
        sparkle.Changed += v => CardGlass.Sparkle = v;     // --card-sparkle-opacity
        stripes.Changed += v => CardGlass.Stripes = v;     // --card-stripes-opacity
    }
}

// Shared opacities of the cards' glass layers (CSS variables on :root, not persisted).
public static class CardGlass
{
    public static float Sparkle = 0.15f; // --card-sparkle-opacity
    public static float Stripes = 0.40f; // --card-stripes-opacity
}
