using UnityEngine;    // MonoBehaviour, RectTransform
using UnityEngine.UI; // Image

// Puts a generated shape on this Image so prefabs can use CSS-like circles, glows, rings and pills.
[ExecuteAlways, RequireComponent(typeof(Image))]
public class ShapeImage : MonoBehaviour
{
    public enum Shape { Disc, Glow, Ring, Pill, PillOutline, RoundedRect, RoundedRectOutline, RoundedRectShadow } // supported CSS look-alikes

    [SerializeField] Shape shape = Shape.Disc;     // which shape to draw
    [SerializeField] int resolution = 64;          // texture size in pixels
    [SerializeField] float ringRadius = 22f;       // Ring: SVG circle r (in texture pixels)
    [SerializeField] float ringThickness = 3f;     // Ring: stroke width; outlines: border width
    [SerializeField] int cornerRadius = 10;        // RoundedRect: border-radius in pixels
    [SerializeField] float shadowBlur = 20f;       // RoundedRectShadow: box-shadow blur radius in pixels

    Image _image; // cached target

    // Applies the shape when enabled (also in edit mode thanks to ExecuteAlways).
    void OnEnable()
    {
        Apply(); // assign sprite and image settings
    }

    // Keeps pill corners round when the element is resized.
    void OnRectTransformDimensionsChange()
    {
        if (_image != null) FitPillCorners(); // only matters for sliced pills
    }

#if UNITY_EDITOR
    // Re-applies after inspector edits.
    void OnValidate()
    {
        if (isActiveAndEnabled) Apply(); // live preview in the editor
    }
#endif

    // Assigns the generated sprite and the matching Image type.
    void Apply()
    {
        _image = GetComponent<Image>(); // target graphic
        switch (shape)
        {
            case Shape.Disc:
                _image.sprite = ProceduralSprites.Disc(resolution);                         // solid circle (Image type left as set, e.g. Filled)
                break;
            case Shape.Glow:
                _image.sprite = ProceduralSprites.Glow(resolution);                         // soft halo
                break;
            case Shape.Ring:
                _image.sprite = ProceduralSprites.Ring(resolution, ringRadius, ringThickness); // SVG-like ring (Filled works for progress)
                break;
            case Shape.Pill:
                _image.sprite = ProceduralSprites.Disc(resolution);                         // disc sliced into a capsule
                _image.type = Image.Type.Sliced;                                            // stretch the middle
                break;
            case Shape.PillOutline:
                _image.sprite = ProceduralSprites.Ring(resolution, resolution * 0.5f - ringThickness * 0.5f - 0.5f, ringThickness); // edge ring
                _image.type = Image.Type.Sliced;                                            // stretch the middle
                break;
            case Shape.RoundedRect:
                _image.sprite = ProceduralSprites.RoundedRect(cornerRadius);                 // fixed-radius box
                _image.type = Image.Type.Sliced;                                            // stretch the middle
                _image.pixelsPerUnitMultiplier = 1f;                                        // radius in UI pixels
                break;
            case Shape.RoundedRectOutline:
                _image.sprite = ProceduralSprites.RoundedRectOutline(cornerRadius, ringThickness); // fixed-radius border
                _image.type = Image.Type.Sliced;                                            // stretch the middle
                _image.pixelsPerUnitMultiplier = 1f;                                        // radius in UI pixels
                break;
            case Shape.RoundedRectShadow:
                _image.sprite = ProceduralSprites.RoundedRectShadow(cornerRadius, shadowBlur); // blurred halo (rect padded by blur)
                _image.type = Image.Type.Sliced;                                            // stretch the middle
                _image.pixelsPerUnitMultiplier = 1f;                                        // blur in UI pixels
                break;
        }
        FitPillCorners(); // radius = half height
    }

    // Scales the 9-slice border so the corner radius equals half of the shorter side (horizontal or vertical pills).
    void FitPillCorners()
    {
        if (shape != Shape.Pill && shape != Shape.PillOutline) return; // only pills are sliced
        var rect = ((RectTransform)transform).rect;                     // current UI size
        float side = Mathf.Min(rect.width, rect.height);                // border-radius: 999px uses the short side
        if (side <= 0f) return;                                         // layout not ready yet
        _image.pixelsPerUnitMultiplier = resolution / side;             // border px = (res/2) / multiplier = side/2
    }
}
