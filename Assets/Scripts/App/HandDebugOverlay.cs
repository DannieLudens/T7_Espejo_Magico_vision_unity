using System.Globalization;     // CultureInfo for "0.123" formatting
using TMPro;                    // TMP_Text
using UnityEngine;              // MonoBehaviour, RectTransform, Mathf, Color
using UnityEngine.InputSystem;  // Keyboard
using UnityEngine.UI;           // Image

// Operator view of the tracked hand skeleton, toggled with D (web #handCanvas and _drawDebug).
// Works on every platform because it draws from HandFrame data, not from the native plugin.
[RequireComponent(typeof(CanvasGroup))]
public class HandDebugOverlay : MonoBehaviour
{
    static readonly int[,] Connections = // MediaPipe HAND_CONNECTIONS
    {
        { 0, 1 }, { 1, 2 }, { 2, 3 }, { 3, 4 },          // thumb
        { 0, 5 }, { 5, 6 }, { 6, 7 }, { 7, 8 },          // index
        { 5, 9 }, { 9, 10 }, { 10, 11 }, { 11, 12 },     // middle
        { 9, 13 }, { 13, 14 }, { 14, 15 }, { 15, 16 },   // ring
        { 13, 17 }, { 0, 17 }, { 17, 18 }, { 18, 19 }, { 19, 20 } // pinky and palm
    };

    static readonly Color PinchedColor = new Color(1f, 215f / 255f, 0f, 1f);                 // #FFD700
    static readonly Color BoneColor = new Color(1f, 1f, 1f, 0.6f);                           // rgba(255,255,255,0.6)
    static readonly Color JointColor = new Color(1f, 200f / 255f, 100f / 255f, 0.9f);        // rgba(255,200,100,0.9)
    static readonly Color LabelColor = new Color(1f, 1f, 1f, 0.7f);                          // rgba(255,255,255,0.7)

    [SerializeField] TMP_Text distanceLabel;        // "pinch dist: ... (threshold: ...)"
    [SerializeField] float visibleOpacity = 0.5f;   // #handCanvas.debug-visible
    [SerializeField] float fadeSeconds = 0.3f;      // transition: opacity 0.3s
    [SerializeField] float lineWidth = 2f;          // drawConnectors lineWidth
    [SerializeField] float jointRadius = 3f;        // drawLandmarks radius

    CanvasGroup _group;   // overlay opacity
    RectTransform _root;  // full-screen drawing area
    Image[] _bones;       // one stretched quad per connection
    Image[] _joints;      // one disc per landmark
    bool _visible;        // toggled by D

    // Creates the skeleton graphics once and starts hidden.
    void Awake()
    {
        _group = GetComponent<CanvasGroup>();            // opacity control
        _group.alpha = 0f;                               // opacity: 0 by default
        _group.blocksRaycasts = false;                   // pointer-events: none
        _root = (RectTransform)transform;                // drawing area
        _bones = new Image[Connections.GetLength(0)];    // 21 connections
        for (int i = 0; i < _bones.Length; i++) _bones[i] = NewImage("Bone" + i, null);                       // plain quads
        _joints = new Image[HandFrame.LandmarkCount];    // 21 landmarks
        for (int i = 0; i < _joints.Length; i++) _joints[i] = NewImage("Joint" + i, ProceduralSprites.Disc(32)); // small circles
        SetSkeletonActive(false);                        // nothing tracked yet
    }

    // Listens to processed hand frames.
    void OnEnable()
    {
        HandGestures.FrameProcessed += Draw; // main-thread frames with pinch info
    }

    // Stops listening.
    void OnDisable()
    {
        HandGestures.FrameProcessed -= Draw; // avoid leaks
    }

    // Toggles with D and animates the opacity.
    void Update()
    {
        var keyboard = Keyboard.current;                                       // may be null on kiosks
        if (keyboard != null && keyboard.dKey.wasPressedThisFrame) _visible = !_visible; // web: canvasEl.classList.toggle('debug-visible')
        float target = _visible ? visibleOpacity : 0f;                         // desired opacity
        _group.alpha = Mathf.MoveTowards(_group.alpha, target, visibleOpacity * Time.unscaledDeltaTime / fadeSeconds); // 0.3s fade
    }

    // Redraws the skeleton and the pinch distance for one frame (web _drawDebug).
    void Draw(HandFrame frame, float distance, bool pinched)
    {
        if (!frame.HasHand) { SetSkeletonActive(false); return; } // canvas cleared when there is no hand
        SetSkeletonActive(true);                                  // hand present

        var size = _root.rect.size;                               // full viewport in canvas units
        var boneColor = pinched ? PinchedColor : BoneColor;       // gold while pinching
        var jointColor = pinched ? PinchedColor : JointColor;     // gold while pinching

        for (int i = 0; i < _bones.Length; i++)                   // drawConnectors
        {
            var a = ToLocal(frame.Landmarks[Connections[i, 0]], size); // segment start
            var b = ToLocal(frame.Landmarks[Connections[i, 1]], size); // segment end
            var delta = b - a;                                         // segment vector
            var rt = _bones[i].rectTransform;
            rt.anchoredPosition = (a + b) * 0.5f;                      // centered between both joints
            rt.sizeDelta = new Vector2(delta.magnitude, lineWidth);    // length x thickness
            rt.localRotation = Quaternion.Euler(0f, 0f, Mathf.Atan2(delta.y, delta.x) * Mathf.Rad2Deg); // aligned with the segment
            _bones[i].color = boneColor;                               // stroke color
        }

        for (int i = 0; i < _joints.Length; i++)                  // drawLandmarks
        {
            var rt = _joints[i].rectTransform;
            rt.anchoredPosition = ToLocal(frame.Landmarks[i], size);   // joint position
            rt.sizeDelta = Vector2.one * jointRadius * 2f;             // circle diameter
            _joints[i].color = jointColor;                             // fill color
        }

        distanceLabel.text = "pinch dist: " + distance.ToString("F3", CultureInfo.InvariantCulture)
                           + "  (threshold: " + HandGestures.PinchThreshold.ToString(CultureInfo.InvariantCulture) + ")"; // calibration text
        distanceLabel.color = pinched ? PinchedColor : LabelColor;    // gold while pinching
    }

    // Converts a normalized mirror-view landmark into local coordinates of the centered root.
    static Vector2 ToLocal(Vector3 landmark, Vector2 size)
    {
        return new Vector2((landmark.x - 0.5f) * size.x, (0.5f - landmark.y) * size.y); // top-left image space -> centered UI space
    }

    // Shows or hides every skeleton graphic and the label.
    void SetSkeletonActive(bool active)
    {
        foreach (var bone in _bones) bone.enabled = active;      // connections
        foreach (var joint in _joints) joint.enabled = active;   // landmarks
        distanceLabel.enabled = active;                          // text only while a hand is tracked
    }

    // Creates a non-interactive image child.
    Image NewImage(string name, Sprite sprite)
    {
        var rt = new GameObject(name, typeof(RectTransform), typeof(Image)).GetComponent<RectTransform>(); // graphic holder
        rt.SetParent(transform, false);   // inside the overlay
        var image = rt.GetComponent<Image>();
        image.sprite = sprite;            // null = solid quad
        image.raycastTarget = false;      // pointer-events: none
        return image;
    }
}
