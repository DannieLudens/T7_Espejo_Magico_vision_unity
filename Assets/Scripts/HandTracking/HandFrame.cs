using UnityEngine; // Vector3

// One hand-tracking sample, shared by every provider (native plugin or browser JS).
// Landmarks use MediaPipe's normalized image space: x,y in [0,1], origin at the top-left.
public readonly struct HandFrame
{
    public const int LandmarkCount = 21; // MediaPipe hand model returns 21 landmarks
    public const int ThumbTip = 4;       // landmark index of the thumb tip
    public const int IndexTip = 8;       // landmark index of the index finger tip
    public const int MiddleBase = 9;     // landmark index of the middle finger base (palm center)

    public static readonly HandFrame Empty = new HandFrame(null); // frame with no hand detected

    public readonly Vector3[] Landmarks; // landmarks of the first detected hand, null when there is no hand

    public bool HasHand => Landmarks != null && Landmarks.Length >= LandmarkCount; // true when a full hand is present

    // Builds a frame from the 21 landmarks of the first hand (pass null for "no hand").
    public HandFrame(Vector3[] landmarks)
    {
        Landmarks = landmarks; // store reference, providers allocate a fresh array per frame
    }
}
