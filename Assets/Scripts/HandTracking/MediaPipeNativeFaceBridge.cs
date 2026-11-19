// The homuler plugin only ships native libraries for desktop/mobile, so this file is compiled out of WebGL players.
#if UNITY_EDITOR || !UNITY_WEBGL
using System.Collections;                          // IEnumerator
using Mediapipe.Tasks.Vision.FaceLandmarker;       // FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult
using Mediapipe.Unity.Experimental;                // TextureFramePool
using Mediapipe.Unity.Sample;                      // ImageSourceProvider, AssetLoader
using UnityEngine;                                 // MonoBehaviour, Vector3
using UnityEngine.Rendering;                       // AsyncGPUReadbackRequest
using Stopwatch = System.Diagnostics.Stopwatch;    // monotonic timestamps for LIVE_STREAM

// Runs the homuler Face Landmarker on the same camera as hand tracking (Editor and Windows builds)
// and publishes the landmarks to FaceTrackingService. Same image transformation as HandLandmarkerRunner,
// so face and hand landmarks share the mirror-view coordinates the visitor sees.
public class MediaPipeNativeFaceBridge : MonoBehaviour
{
    const string ModelPath = "face_landmarker_v2.bytes"; // copied to StreamingAssets

    static MediaPipeNativeFaceBridge _instance;          // created on demand

    FaceLandmarker _landmarker;     // MediaPipe task
    TextureFramePool _pool;         // CPU copies of camera frames
    Coroutine _loop;                // frame feeding loop
    readonly Stopwatch _clock = new Stopwatch(); // LIVE_STREAM timestamps must increase

    // Hooks the service before the first scene loads.
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Install()
    {
        FaceTrackingService.StartRequested -= OnStart; // avoid double subscription when domain reload is off
        FaceTrackingService.StartRequested += OnStart; // photobooth entered
        FaceTrackingService.StopRequested -= OnStop;
        FaceTrackingService.StopRequested += OnStop;   // photobooth left
    }

    // Creates the runner object the first time and starts it.
    static void OnStart()
    {
        if (_instance == null)
        {
            var go = new GameObject("FaceLandmarker (MediaPipe)");      // helper object
            DontDestroyOnLoad(go);                                       // survives scene changes
            _instance = go.AddComponent<MediaPipeNativeFaceBridge>();
        }
        _instance.Begin(); // initFaceFilter
    }

    // Stops the runner if it exists.
    static void OnStop()
    {
        if (_instance != null) _instance.End(); // stopFaceFilter
    }

    // Starts the feeding loop.
    void Begin()
    {
        if (_loop == null) _loop = StartCoroutine(Run()); // one loop at a time
    }

    // Stops the loop and releases the task (web: _faceCam.stop(); _faceMesh = null).
    void End()
    {
        if (_loop != null) { StopCoroutine(_loop); _loop = null; } // no more frames
        _landmarker?.Close();                                      // free the graph
        _landmarker = null;
        _pool?.Dispose();                                          // free frame buffers
        _pool = null;
        _clock.Stop();
    }

    // Prepares the model, waits for the shared camera and feeds every frame to the landmarker.
    IEnumerator Run()
    {
        yield return AssetLoader.PrepareAssetAsync(ModelPath);                       // resource manager of the hand sample
        var options = new FaceLandmarkerOptions(
            new Mediapipe.Tasks.Core.BaseOptions(Mediapipe.Tasks.Core.BaseOptions.Delegate.CPU, modelAssetPath: ModelPath),
            runningMode: Mediapipe.Tasks.Vision.Core.RunningMode.LIVE_STREAM,       // async results
            numFaces: 1,                                                             // maxNumFaces: 1
            minFaceDetectionConfidence: 0.65f,                                       // minDetectionConfidence
            minFacePresenceConfidence: 0.55f,
            minTrackingConfidence: 0.55f,                                            // minTrackingConfidence
            resultCallback: OnResult);
        _landmarker = FaceLandmarker.CreateFromOptions(options, Mediapipe.Unity.GpuManager.GpuResources); // build the graph
        Debug.Log("[FaceFilter] MediaPipe Face Landmarker listo."); // web log

        var source = ImageSourceProvider.ImageSource;                                // camera already playing for hands
        while (source == null || !source.isPrepared)                                 // wait for the webcam
        {
            yield return null;
            source = ImageSourceProvider.ImageSource;
        }
        _pool = new TextureFramePool(source.textureWidth, source.textureHeight, TextureFormat.RGBA32, 4); // frame buffers
        var flip = source.GetTransformationOptions();                                // same flips as the hand runner
        var processing = new Mediapipe.Tasks.Vision.Core.ImageProcessingOptions(rotationDegrees: (int)flip.rotationAngle);
        _clock.Restart();

        AsyncGPUReadbackRequest request = default;                                   // async CPU copy
        var waitForReadback = new WaitUntil(() => request.done);
        while (true)
        {
            if (!_pool.TryGetTextureFrame(out var frame)) { yield return null; continue; } // all buffers busy
            request = frame.ReadTextureAsync(source.GetCurrentTexture(), flip.flipHorizontally, flip.flipVertically);
            yield return waitForReadback;                                            // wait for the copy
            if (request.hasError) { frame.Release(); continue; }                     // skip broken frames
            var image = frame.BuildCPUImage();                                       // MediaPipe image
            frame.Release();
            _landmarker?.DetectAsync(image, _clock.ElapsedTicks / System.TimeSpan.TicksPerMillisecond, processing); // _faceMesh.send
        }
    }

    // Converts the first face into mirror-view landmarks (runs on the MediaPipe worker thread).
    static void OnResult(FaceLandmarkerResult result, Mediapipe.Image image, long timestamp)
    {
        if (result.faceLandmarks == null || result.faceLandmarks.Count == 0) // no face in this frame
        {
            FaceTrackingService.Publish(null);                                // _lastLandmarks = null
            return;
        }
        var source = result.faceLandmarks[0].landmarks;                      // multiFaceLandmarks[0]
        var points = new Vector3[source.Count];                              // fresh array, readers may keep it
        for (int i = 0; i < points.Length; i++) points[i] = new Vector3(source[i].x, source[i].y, source[i].z); // already mirror view
        FaceTrackingService.Publish(points);
    }

    // Releases the task when the object goes away.
    void OnDestroy()
    {
        End(); // free native resources
    }
}
#endif
