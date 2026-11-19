using System;                     // Func
using System.Collections.Generic; // Dictionary
using UnityEngine;                // Texture2D, Sprite, Mathf

// Runtime-generated white sprites for shapes CSS draws natively (circles, glows, rings, pills).
// Tint them with Image.color; results are cached so every caller shares one texture.
public static class ProceduralSprites
{
    static readonly Dictionary<string, Sprite> Cache = new Dictionary<string, Sprite>(); // key -> sprite

    // Anti-aliased solid disc. Sliced with border size/2 it stretches into a pill (border-radius: 999px).
    public static Sprite Disc(int size = 64)
    {
        float r = size * 0.5f;                                                   // radius in pixels
        return Get("disc" + size, size, d => Mathf.Clamp01(r - d + 0.5f), r);   // 1px soft edge
    }

    // Soft radial glow that fades to transparent at the edge (approximates CSS box-shadow blur).
    public static Sprite Glow(int size = 64)
    {
        float r = size * 0.5f;                                                   // radius in pixels
        return Get("glow" + size, size, d => Mathf.Pow(Mathf.Clamp01(1f - d / r), 2f), 0f); // quadratic falloff
    }

    // Thin anti-aliased ring (SVG circle stroke). Sliced with border size/2 it stretches into a pill outline.
    public static Sprite Ring(int size, float radius, float thickness)
    {
        float half = thickness * 0.5f;                                           // half stroke width
        string key = "ring" + size + "_" + radius + "_" + thickness;             // unique per geometry
        return Get(key, size, d => Mathf.Clamp01(half - Mathf.Abs(d - radius) + 0.5f), size * 0.5f); // stroke band
    }

    // Builds (or returns cached) a square white texture whose alpha comes from distance to center.
    static Sprite Get(string key, int size, Func<float, float> alphaAtDistance, float border)
    {
        if (Cache.TryGetValue(key, out var cached) && cached != null) return cached; // reuse existing sprite

        var texture = new Texture2D(size, size, TextureFormat.RGBA32, false) // no mipmaps for crisp UI
        {
            wrapMode = TextureWrapMode.Clamp,   // no bleeding at the edges
            filterMode = FilterMode.Bilinear,   // smooth scaling
            hideFlags = HideFlags.DontSave      // runtime-only asset
        };
        var pixels = new Color32[size * size];  // RGBA buffer
        float center = size * 0.5f;             // geometric center
        for (int y = 0; y < size; y++)          // every row
        {
            for (int x = 0; x < size; x++)      // every column
            {
                float d = Vector2.Distance(new Vector2(x + 0.5f, y + 0.5f), new Vector2(center, center)); // pixel-center distance
                byte a = (byte)Mathf.RoundToInt(Mathf.Clamp01(alphaAtDistance(d)) * 255f);                // shape alpha
                pixels[y * size + x] = new Color32(255, 255, 255, a);                                       // white, tinted later
            }
        }
        texture.SetPixels32(pixels); // upload buffer
        texture.Apply(false, true);  // make GPU copy and free CPU memory

        var b = new Vector4(border, border, border, border); // 9-slice border (0 = simple sprite)
        var sprite = Sprite.Create(texture, new Rect(0, 0, size, size), new Vector2(0.5f, 0.5f), 100f, 0, SpriteMeshType.FullRect, b); // centered pivot
        sprite.hideFlags = HideFlags.DontSave; // runtime-only asset
        Cache[key] = sprite;                   // remember for next callers
        return sprite;
    }
}
