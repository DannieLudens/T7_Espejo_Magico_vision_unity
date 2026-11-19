using System;      // Action, Func
using UnityEngine; // Texture

// Platform-agnostic hub: the active provider publishes hand frames here and gameplay scripts subscribe.
// Editor/Windows provider: MediaPipeNativeHandBridge (homuler plugin). WebGL provider: browser MediaPipe via .jslib.
public static class HandTrackingService
{
    public static event Action<HandFrame> FrameReceived; // may be raised from a worker thread, queue before touching Unity objects
    public static event Action StopRequested;            // providers listen to stop the camera and the model

    public static Func<Texture> CameraTextureSource; // set by the provider to expose its live camera texture

    // Sends a new frame to every subscriber.
    public static void Publish(HandFrame frame)
    {
        FrameReceived?.Invoke(frame); // fan out to all listeners
    }

    // Asks the active provider to stop tracking (call from the main thread).
    public static void RequestStop()
    {
        StopRequested?.Invoke(); // provider decides how to stop
    }

    // Returns the provider's camera texture, or null when it is not available yet.
    public static Texture GetCameraTexture()
    {
        return CameraTextureSource?.Invoke(); // null when no provider registered a source
    }
}
