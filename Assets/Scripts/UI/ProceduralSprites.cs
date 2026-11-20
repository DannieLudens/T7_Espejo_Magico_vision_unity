using System;                     // Func
using System.Collections.Generic; // Dictionary
using UnityEngine;                // Texture2D, Sprite, Mathf, Color

// Runtime-generated sprites for shapes CSS draws natively (circles, glows, rings, ellipses, gradients).
// White shapes are tinted with Image.color; gradients carry their own colors. Results are cached.
public static class ProceduralSprites
{
    static readonly Dictionary<string, Sprite> Cache = new Dictionary<string, Sprite>(); // key -> sprite

    // A CSS gradient color stop: position 0..1 along the gradient line.
    public struct Stop
    {
        public float Position; // 0..1
        public Color Color;    // rgba at that position

        // Creates a stop.
        public Stop(float position, Color color)
        {
            Position = position; // where
            Color = color;       // what
        }
    }

    // Anti-aliased solid disc. Sliced with border size/2 it stretches into a pill (border-radius: 999px).
    public static Sprite Disc(int size = 64)
    {
        float r = size * 0.5f; // radius in pixels
        return Create("disc" + size, size, size, (x, y) => White(Mathf.Clamp01(r - Distance(x, y, size, size) + 0.5f)), new Vector4(r, r, r, r));
    }

    // Soft radial glow that fades to transparent at the edge (approximates CSS box-shadow blur).
    public static Sprite Glow(int size = 64)
    {
        float r = size * 0.5f; // radius in pixels
        return Create("glow" + size, size, size, (x, y) => White(Mathf.Pow(Mathf.Clamp01(1f - Distance(x, y, size, size) / r), 2f)), Vector4.zero);
    }

    // Thin anti-aliased ring (SVG circle stroke). Sliced with border size/2 it stretches into a pill outline.
    public static Sprite Ring(int size, float radius, float thickness)
    {
        float half = thickness * 0.5f; // half stroke width
        float b = size * 0.5f;         // slice border
        return Create("ring" + size + "_" + radius + "_" + thickness, size, size,
            (x, y) => White(Mathf.Clamp01(half - Mathf.Abs(Distance(x, y, size, size) - radius) + 0.5f)), new Vector4(b, b, b, b));
    }

    // Anti-aliased filled ellipse at native size (CSS border-radius: 50% on a rectangle).
    public static Sprite Ellipse(int width, int height)
    {
        return Create("ellipse" + width + "x" + height, width, height,
            (x, y) => White(Mathf.Clamp01(0.5f - EllipseDistance(x, y, width, height, 0f))), Vector4.zero);
    }

    // Anti-aliased ellipse outline with the stroke fully inside the box (CSS border on a 50% radius box).
    public static Sprite EllipseRing(int width, int height, float thickness)
    {
        float half = thickness * 0.5f; // stroke center inset
        return Create("ellipseRing" + width + "x" + height + "_" + thickness, width, height,
            (x, y) => White(Mathf.Clamp01(half - Mathf.Abs(EllipseDistance(x, y, width, height, half)) + 0.5f)), Vector4.zero);
    }

    // 9-sliced rounded rectangle fill (CSS border-radius: radius px); stretch it to any size.
    public static Sprite RoundedRect(int radius)
    {
        int size = radius * 2 + 2;     // corners plus a 2px stretchable middle
        float b = radius + 1;          // slice border
        return Create("roundedRect" + radius, size, size, (x, y) => White(Mathf.Clamp01(0.5f - RoundedRectDistance(x, y, size, radius))), new Vector4(b, b, b, b));
    }

    // 9-sliced rounded rectangle outline with the stroke inside the edge (CSS border: thickness px solid).
    public static Sprite RoundedRectOutline(int radius, float thickness)
    {
        int size = radius * 2 + 2;     // corners plus a 2px stretchable middle
        float b = radius + 1;          // slice border
        float half = thickness * 0.5f; // stroke center inset
        return Create("roundedRectOutline" + radius + "_" + thickness, size, size,
            (x, y) => White(Mathf.Clamp01(half - Mathf.Abs(RoundedRectDistance(x, y, size, radius) + half) + 0.5f)), new Vector4(b, b, b, b));
    }

    // CSS box-shadow (0 0 blur spread) of a circle, in blur units: a disc of radius `ratio` blurred by 1
    // (Gaussian, sigma = 0.5), drawn out to ratio + 2 where the tail is gone. Shown at 2 * blur * (ratio + 2) px.
    // The profile is integrated over the disc, so small discs under a big blur stay as dim as Chrome draws them.
    public static Sprite CircleShadow(float ratio)
    {
        const int size = 64;                        // texture side
        const int samples = 65;                     // radial profile entries
        const float sigma = 0.5f;                   // blur 1 = 2 sigma
        float extent = ratio + 2f;                  // half side in blur units
        string key = "circleShadow" + ratio.ToString("0.###", System.Globalization.CultureInfo.InvariantCulture);
        if (Cache.TryGetValue(key, out var cached) && cached != null) return cached; // skip the integration

        var profile = new float[samples];           // value at distance rho = extent * i / (samples - 1)
        const int rings = 24, steps = 36;           // polar grid over the disc (half circle, mirrored)
        float norm = 1f / (2f * Mathf.PI * sigma * sigma); // 2D Gaussian normalization
        for (int i = 0; i < samples; i++)
        {
            float rho = extent * i / (samples - 1); // distance from the disc center
            float sum = 0f;
            for (int a = 0; a < rings; a++)
            {
                float r = (a + 0.5f) / rings * ratio;                       // ring radius inside the disc
                for (int b = 0; b < steps; b++)
                {
                    float theta = (b + 0.5f) / steps * Mathf.PI;            // ring angle (0..pi, symmetric)
                    float d2 = r * r + rho * rho - 2f * r * rho * Mathf.Cos(theta); // squared distance to the sample
                    sum += Mathf.Exp(-d2 / (2f * sigma * sigma)) * r;       // Gaussian weight * polar area
                }
            }
            profile[i] = Mathf.Clamp01(sum * norm * (ratio / rings) * (Mathf.PI * 2f / steps)); // integral over the disc (both halves)
        }
        return Create(key, size, size, (x, y) =>
        {
            float rho = Distance(x, y, size, size) / (size * 0.5f) * extent; // pixel distance in blur units
            float f = Mathf.Clamp(rho / extent * (samples - 1), 0f, samples - 1); // profile index
            int i0 = Mathf.FloorToInt(f), i1 = Mathf.Min(i0 + 1, samples - 1);
            return White(Mathf.Lerp(profile[i0], profile[i1], f - i0));       // interpolated profile
        }, Vector4.zero);
    }

    // CSS box-shadow of an ellipse: the shape blurred by `blur` px (Gaussian, sigma = blur / 2), padded on every side.
    public static Sprite EllipseShadow(int width, int height, float blur)
    {
        int pad = Mathf.CeilToInt(blur);               // the shadow reaches `blur` px past the shape
        float sigma = Mathf.Max(blur * 0.5f, 0.01f);   // CSS blur radius = 2 sigma
        return Create("ellipseShadow" + width + "x" + height + "_" + blur, width + pad * 2, height + pad * 2, (x, y) =>
        {
            float d = EllipseDistance(x - pad, y - pad, width, height, 0f); // distance to the shape edge
            return White(1f / (1f + Mathf.Exp(1.702f * d / sigma)));       // ~0.5 * erfc: Gaussian-blurred edge
        }, Vector4.zero);
    }

    // 9-sliced CSS box-shadow (0 0 blur) of a rounded rectangle, padded by `blur` px and clipped inside the box like CSS.
    public static Sprite RoundedRectShadow(int radius, float blur)
    {
        return RoundedRectShadow(radius, blur, true); // clipped under the box
    }

    // Blurred rounded box; clipInside = false keeps the shadow under the box too (for offset box-shadows
    // under a nearly opaque element, where CSS clipping would leave a bright gap between box and shadow).
    public static Sprite RoundedRectShadow(int radius, float blur, bool clipInside)
    {
        int pad = Mathf.CeilToInt(blur);             // the shadow reaches `blur` px past the box
        int core = radius * 2 + 2;                   // box corners plus a 2px stretchable middle
        int size = core + pad * 2;                   // texture side
        float sigma = Mathf.Max(blur * 0.5f, 0.01f); // CSS blur radius = 2 sigma
        float b = pad + radius + 1;                  // slice border keeps the blurred corners intact
        return Create("roundedRectShadow" + radius + "_" + blur + (clipInside ? "" : "_filled"), size, size, (x, y) =>
        {
            float half = size * 0.5f;                                                     // texture center
            var p = new Vector2(Mathf.Abs(x + 0.5f - half), Mathf.Abs(y + 0.5f - half)); // fold into one quadrant
            var q = p - new Vector2(core * 0.5f - radius, core * 0.5f - radius);          // past the straight edges
            float d = Vector2.Max(q, Vector2.zero).magnitude + Mathf.Min(Mathf.Max(q.x, q.y), 0f) - radius; // box SDF
            float shadow = 1f / (1f + Mathf.Exp(1.702f * d / sigma));                    // Gaussian-blurred edge
            return White(clipInside ? shadow * Mathf.Clamp01(d + 0.5f) : shadow);        // outer shadow only, or filled
        }, new Vector4(b, b, b, b));
    }

    // CSS linear-gradient(angle, stops) rendered at native size; angle 0 = to top, 90 = to right.
    public static Sprite LinearGradient(string key, int width, int height, float angleDegrees, Stop[] stops)
    {
        float rad = angleDegrees * Mathf.Deg2Rad;                          // CSS angle
        var dir = new Vector2(Mathf.Sin(rad), Mathf.Cos(rad));             // CSS (sin, -cos) with y down = (sin, cos) in texture space (y up)
        float length = Mathf.Abs(width * dir.x) + Mathf.Abs(height * dir.y); // CSS gradient line length
        return Create("linear_" + key, width, height, (x, y) =>
        {
            var p = new Vector2(x + 0.5f - width * 0.5f, y + 0.5f - height * 0.5f); // pixel relative to center
            return Sample(stops, 0.5f + Vector2.Dot(p, dir) / length);             // position on the gradient line
        }, Vector4.zero);
    }

    // CSS radial-gradient(circle, stops) where 100% is the distance to the farthest corner.
    public static Sprite RadialGradient(string key, int size, Stop[] stops)
    {
        float farCorner = size * 0.5f * Mathf.Sqrt(2f); // CSS default ending shape: farthest-corner
        return Create("radial_" + key, size, size, (x, y) => Sample(stops, Distance(x, y, size, size) / farCorner), Vector4.zero);
    }

    // Builds (or returns cached) a texture by evaluating a color for every pixel (x, y with y up).
    static Sprite Create(string key, int width, int height, Func<int, int, Color> pixel, Vector4 border)
    {
        if (Cache.TryGetValue(key, out var cached) && cached != null) return cached; // reuse existing sprite

        var texture = new Texture2D(width, height, TextureFormat.RGBA32, false) // no mipmaps for crisp UI
        {
            wrapMode = TextureWrapMode.Clamp,   // no bleeding at the edges
            filterMode = FilterMode.Bilinear,   // smooth scaling
            hideFlags = HideFlags.DontSave      // runtime-only asset
        };
        var pixels = new Color32[width * height]; // RGBA buffer
        for (int y = 0; y < height; y++)          // every row
            for (int x = 0; x < width; x++)       // every column
                pixels[y * width + x] = pixel(x, y); // evaluate shape or gradient
        texture.SetPixels32(pixels); // upload buffer
        texture.Apply(false, true);  // GPU copy, free CPU memory

        var sprite = Sprite.Create(texture, new Rect(0, 0, width, height), new Vector2(0.5f, 0.5f), 100f, 0, SpriteMeshType.FullRect, border); // centered pivot
        sprite.hideFlags = HideFlags.DontSave; // runtime-only asset
        Cache[key] = sprite;                   // remember for next callers
        return sprite;
    }

    // White with the given alpha.
    static Color White(float alpha)
    {
        return new Color(1f, 1f, 1f, alpha); // tinted later by Image.color
    }

    // Distance from a pixel center to the texture center.
    static float Distance(int x, int y, int width, int height)
    {
        return Vector2.Distance(new Vector2(x + 0.5f, y + 0.5f), new Vector2(width * 0.5f, height * 0.5f)); // euclidean
    }

    // Approximate signed distance (pixels) to an ellipse inscribed in the box and shrunk by inset; negative = inside.
    static float EllipseDistance(int x, int y, int width, int height, float inset)
    {
        float a = width * 0.5f - inset, b = height * 0.5f - inset;      // semi-axes
        float px = x + 0.5f - width * 0.5f, py = y + 0.5f - height * 0.5f; // pixel relative to center
        float f = Mathf.Sqrt(px * px / (a * a) + py * py / (b * b));    // normalized radius (1 on the curve)
        if (f < 1e-5f) return -Mathf.Min(a, b);                          // exact center
        float gradient = Mathf.Sqrt(px * px / (a * a * a * a) + py * py / (b * b * b * b)) / f; // |grad f|
        return (f - 1f) / gradient;                                      // first-order distance estimate
    }

    // Signed distance (pixels) from a pixel center to a rounded square of the given size and corner radius.
    static float RoundedRectDistance(int x, int y, int size, float radius)
    {
        float half = size * 0.5f;                                                  // half extent
        var p = new Vector2(Mathf.Abs(x + 0.5f - half), Mathf.Abs(y + 0.5f - half)); // fold into one quadrant
        var q = p - new Vector2(half - radius, half - radius);                     // distance past the straight edges
        return Vector2.Max(q, Vector2.zero).magnitude + Mathf.Min(Mathf.Max(q.x, q.y), 0f) - radius; // rounded box SDF
    }

    // Interpolates gradient stops at position t (CSS clamps outside the first/last stop).
    static Color Sample(Stop[] stops, float t)
    {
        if (t <= stops[0].Position) return stops[0].Color;                         // before the first stop
        for (int i = 1; i < stops.Length; i++)                                     // find the segment
        {
            if (t > stops[i].Position) continue;                                   // keep searching
            float span = stops[i].Position - stops[i - 1].Position;               // segment length
            float k = span <= 0f ? 1f : (t - stops[i - 1].Position) / span;       // local progress
            return PremultipliedLerp(stops[i - 1].Color, stops[i].Color, k);      // blend neighbours like the browser
        }
        return stops[stops.Length - 1].Color;                                       // after the last stop
    }

    // Blends in premultiplied space (CSS behaviour) so fading to "transparent" does not darken the color.
    static Color PremultipliedLerp(Color a, Color b, float k)
    {
        var pa = new Color(a.r * a.a, a.g * a.a, a.b * a.a, a.a); // premultiply start
        var pb = new Color(b.r * b.a, b.g * b.a, b.b * b.a, b.a); // premultiply end
        var p = Color.Lerp(pa, pb, k);                            // interpolate
        return p.a > 0f ? new Color(p.r / p.a, p.g / p.a, p.b / p.a, p.a) : Color.clear; // back to straight alpha
    }
}
