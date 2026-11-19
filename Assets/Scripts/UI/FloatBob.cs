using UnityEngine; // MonoBehaviour, RectTransform, Vector2

// Gentle vertical float loop for decorative images (web @keyframes logoFloatCorner).
public class FloatBob : MonoBehaviour
{
    [SerializeField] float amplitude = 9f; // translateY(-9px) at 50 %
    [SerializeField] float period = 4f;    // 4s ease-in-out infinite

    RectTransform _rect;   // animated element
    Vector2 _restPosition; // position at 0 % / 100 %

    // Remembers the resting position.
    void Awake()
    {
        _rect = (RectTransform)transform;         // UI element
        _restPosition = _rect.anchoredPosition;   // keyframe 0 %
    }

    // Moves up and back down every period.
    void Update()
    {
        float lift = amplitude * CssEasing.PingPong(Time.unscaledTime, period); // 0 -> 9 -> 0 px
        _rect.anchoredPosition = _restPosition + new Vector2(0f, lift);          // CSS negative Y is up in Unity
    }
}
