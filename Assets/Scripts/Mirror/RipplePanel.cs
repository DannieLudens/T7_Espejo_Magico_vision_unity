using TMPro;          // TMP_Text
using UnityEngine;    // MonoBehaviour, Color
using UnityEngine.UI; // Button, Image

// Ripple config panel inside the mirror scene (web #mirror-config, key C): live tuning of the simulation.
public class RipplePanel : MonoBehaviour
{
    [SerializeField] MagicMirror mirror;      // simulation being tuned
    [SerializeField] StepSlider damping;      // #cfg-damping
    [SerializeField] StepSlider force;        // #cfg-force
    [SerializeField] StepSlider radius;       // #cfg-radius
    [SerializeField] StepSlider displacement; // #cfg-disp
    [SerializeField] StepSlider tint;         // #cfg-tint
    [SerializeField] Button resetButton;      // #cfg-reset
    [SerializeField] Image resetBackground;   // .ctrl-btn background
    [SerializeField] TMP_Text resetLabel;     // "Restablecer valores"
    [SerializeField] Image resetGlyph;        // ↺ (text glyph, follows the label color)
    [SerializeField] PointerHover resetHover; // .ctrl-btn:hover

    static readonly Color Gold = new Color(212f / 255f, 175f / 255f, 55f / 255f, 1f);        // --gold
    static readonly Color TextDim = new Color(240f / 255f, 230f / 255f, 200f / 255f, 0.55f); // --text-dim

    // Shows the current values and binds each slider to its variable.
    void Awake()
    {
        Sync();                                                        // slider positions
        damping.Changed += v => mirror.Damping = v;                    // _mmDamping
        force.Changed += v => mirror.SplashForce = v;                  // _mmSplashF
        radius.Changed += v => mirror.SplashRadius = v;                // _mmSplashR
        displacement.Changed += v => mirror.Displacement = v;          // _mmDisp
        tint.Changed += v => mirror.Tint = v;                          // _mmTint
        resetButton.onClick.AddListener(ResetValues);                  // ↺ Restablecer valores
    }

    // Restores MM_DEFAULTS and syncs the sliders.
    void ResetValues()
    {
        mirror.Damping = MagicMirror.DefaultDamping;
        mirror.SplashForce = MagicMirror.DefaultSplashForce;
        mirror.SplashRadius = MagicMirror.DefaultSplashRadius;
        mirror.Displacement = MagicMirror.DefaultDisplacement;
        mirror.Tint = MagicMirror.DefaultTint;
        Sync();
    }

    // Moves the sliders to the simulation's values.
    void Sync()
    {
        damping.SetValue(mirror.Damping);
        force.SetValue(mirror.SplashForce);
        radius.SetValue(mirror.SplashRadius);
        displacement.SetValue(mirror.Displacement);
        tint.SetValue(mirror.Tint);
    }

    // Hover style of the reset button.
    void Update()
    {
        bool hot = resetHover.IsOver;                                                    // :hover
        resetBackground.color = new Color(Gold.r, Gold.g, Gold.b, hot ? 0.18f : 0.08f);  // background
        resetLabel.color = hot ? Gold : TextDim;                                         // color
        resetGlyph.color = resetLabel.color;                                             // same text color
    }
}
