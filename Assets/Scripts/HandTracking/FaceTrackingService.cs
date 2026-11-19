using System;      // Action
using UnityEngine; // Vector3, Time

// Platform-agnostic hub for face landmarks (web initFaceFilter / stopFaceFilter).
// Landmarks use the same mirror-view convention as HandFrame: x grows to the right of the mirrored
// image the visitor sees, y grows downwards, both normalized 0..1.
// Editor/Windows provider: MediaPipeNativeFaceBridge (homuler FaceLandmarker). WebGL provider: pending .jslib.
public static class FaceTrackingService
{
    public const int LandmarkCount = 478;            // Face Landmarker v2 (468 mesh + 10 iris, like refineLandmarks)

    public static event Action StartRequested;       // providers start the face model
    public static event Action StopRequested;        // providers release the face model

    static readonly object Gate = new object();      // results arrive on a worker thread
    static Vector3[] _latest;                        // newest landmarks, null when no face
    static int _version;                             // increments on every published result

    public static bool Running { get; private set; } // a screen asked for face tracking

    // Starts face tracking (photobooth entered).
    public static void RequestStart()
    {
        if (Running) return;          // already on
        Running = true;               // remember the request
        StartRequested?.Invoke();     // provider decides how to start
    }

    // Stops face tracking and forgets the last face (web stopFaceFilter).
    public static void RequestStop()
    {
        if (!Running) return;         // already off
        Running = false;              // remember the request
        StopRequested?.Invoke();      // provider releases resources
        Publish(null);                // _lastLandmarks = null
    }

    // Stores a result from the provider (any thread). Pass null when no face is visible.
    public static void Publish(Vector3[] landmarks)
    {
        lock (Gate)
        {
            _latest = landmarks;      // newest wins
            _version++;               // tell readers something changed
        }
    }

    // Copies the newest landmarks for the main thread; returns false when nothing changed since lastVersion.
    public static bool TryGetLatest(ref int lastVersion, out Vector3[] landmarks)
    {
        lock (Gate)
        {
            landmarks = _latest;                      // may be null (no face)
            if (_version == lastVersion) return false; // no new result
            lastVersion = _version;                   // consumed
            return true;
        }
    }
}
