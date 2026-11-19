using UnityEngine; // Color

// Visual palette copied from the web version's CSS variables (css/styles.css :root).
public static class AppTheme
{
    public static readonly Color Gold = Hex(0xD4AF37);       // --gold
    public static readonly Color GoldLight = Hex(0xF5D76E);  // --gold-light
    public static readonly Color GoldDark = Hex(0xA07C10);   // --gold-dark
    public static readonly Color Background = Hex(0x0A0A0A); // --bg
    public static readonly Color Text = Hex(0xF0E6C8);       // --text
    public static readonly Color TextDim = new Color(240f / 255f, 230f / 255f, 200f / 255f, 0.55f); // --text-dim
    public static readonly Color BulbWarm = Hex(0xFFF8DC);   // --bulb-warm

    // Converts a 0xRRGGBB integer into an opaque Color.
    static Color Hex(int rgb)
    {
        return new Color(((rgb >> 16) & 0xFF) / 255f, ((rgb >> 8) & 0xFF) / 255f, (rgb & 0xFF) / 255f, 1f); // split channels
    }
}
