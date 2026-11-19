// The homuler plugin only ships native libraries for desktop/mobile, so this file is compiled out of WebGL players.
#if UNITY_EDITOR || !UNITY_WEBGL
using Mediapipe.Tasks.Vision.HandLandmarker;           // HandLandmarkerResult
using Mediapipe.Unity.Sample.HandLandmarkDetection;    // PinzaEventBus, HandLandmarkerRunner
using UnityEngine;                                     // Vector3, Object, Texture

// Forwards results from the homuler MediaPipe plugin (Editor and Windows builds) into HandTrackingService.
public static class MediaPipeNativeHandBridge
{
    // Hooks the plugin result bus before the first scene loads.
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Install()
    {
        PinzaEventBus.OnResultado -= Forward;                      // avoid double subscription when domain reload is off
        PinzaEventBus.OnResultado += Forward;                      // receive every landmarker result
        HandTrackingService.StopRequested -= StopRunner;           // same guard for the stop hook
        HandTrackingService.StopRequested += StopRunner;           // stop the runner when gameplay asks
        HandTrackingService.CameraTextureSource = FindScreenTexture; // expose the plugin's camera texture
    }

    // Converts a plugin result into a HandFrame and publishes it (runs on the plugin's callback thread).
    static void Forward(HandLandmarkerResult result)
    {
        if (result.handLandmarks == null || result.handLandmarks.Count == 0) // no hand in this frame
        {
            HandTrackingService.Publish(HandFrame.Empty); // tell listeners the hand is gone
            return;                                       // nothing else to convert
        }

        var source = result.handLandmarks[0].landmarks;              // first hand only
        if (source == null || source.Count < HandFrame.LandmarkCount) return; // incomplete result, skip it

        var points = new Vector3[HandFrame.LandmarkCount];           // fresh array, listeners may keep it
        for (int i = 0; i < points.Length; i++)                      // copy every landmark
            points[i] = new Vector3(source[i].x, source[i].y, source[i].z); // the plugin's WebCamSource already delivers a mirrored image

        HandTrackingService.Publish(new HandFrame(points));          // send to gameplay scripts
    }

    // Stops the plugin's hand landmarker runner in the current scene.
    static void StopRunner()
    {
        var runner = Object.FindAnyObjectByType<HandLandmarkerRunner>(); // runner lives in the scene
        if (runner != null) runner.Stop();                               // release camera and graph
    }

    // Returns the texture the plugin renders the camera into, if its Screen exists.
    static Texture FindScreenTexture()
    {
        var screen = Object.FindAnyObjectByType<Mediapipe.Unity.Screen>(); // sample UI screen component
        return screen != null ? screen.texture : null;                      // null until the camera starts
    }
}
#endif
