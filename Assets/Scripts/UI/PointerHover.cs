using UnityEngine;              // MonoBehaviour
using UnityEngine.EventSystems; // IPointerEnterHandler, IPointerExitHandler

// Exposes the mouse :hover state of a UI element so screens can blend it with the hand hover.
public class PointerHover : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    public bool IsOver { get; private set; } // pointer inside the element

    // Pointer entered the element (or one of its raycast children).
    public void OnPointerEnter(PointerEventData eventData) { IsOver = true; }

    // Pointer left the element.
    public void OnPointerExit(PointerEventData eventData) { IsOver = false; }

    // Hidden elements lose the hover (CSS :hover ends with display: none).
    void OnDisable() { IsOver = false; }
}
