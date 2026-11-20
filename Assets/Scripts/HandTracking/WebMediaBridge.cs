using System.Runtime.InteropServices; // DllImport
using UnityEngine;                    // MonoBehaviour, Texture2D, Vector3

// WebGL provider (browser MediaPipe JS + Snap Camera Kit through EspejoBridge.jslib):
// the browser owns the webcam; every frame this copies the video into a Unity texture, polls the hand
// and face landmarks (converted to mirror view like hand-tracker.js / face-filter.js) and the Snap output.
// Outside WebGL players every call is a no-op, so the Editor keeps using the native homuler bridges.
public class WebMediaBridge : MonoBehaviour
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")] static extern void EM_Start();
    [DllImport("__Internal")] static extern int EM_VideoWidth();
    [DllImport("__Internal")] static extern int EM_VideoHeight();
    [DllImport("__Internal")] static extern int EM_UpdateVideoTexture(int texture, int width, int height);
    [DllImport("__Internal")] static extern int EM_PollHand(float[] buffer, int max);
    [DllImport("__Internal")] static extern void EM_FaceStart();
    [DllImport("__Internal")] static extern void EM_FaceStop();
    [DllImport("__Internal")] static extern int EM_PollFace(float[] buffer, int max);
    [DllImport("__Internal")] static extern void EM_SnapStart(string token, string group, string lens, int width, int height);
    [DllImport("__Internal")] static extern int EM_SnapState();
    [DllImport("__Internal")] static extern void EM_SnapPause();
    [DllImport("__Internal")] static extern int EM_SnapWidth();
    [DllImport("__Internal")] static extern int EM_SnapHeight();
    [DllImport("__Internal")] static extern int EM_UpdateSnapTexture(int texture);
#endif

    public static bool IsActive { get; private set; }  // true in WebGL players

    static WebMediaBridge _instance;                    // single provider
    Texture2D _camera;                                  // webcam copy (bottom-up, not mirrored)
    Texture2D _snap;                                    // Snap output copy (already mirrored by MirrorX)
    readonly float[] _hand = new float[HandFrame.LandmarkCount * 3];          // poll buffer
    readonly float[] _face = new float[FaceTrackingService.LandmarkCount * 3]; // poll buffer
    bool _snapRunning;                                  // a lens is playing (copy the canvas every frame)

    // Creates the provider before the first scene in WebGL players.
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Install()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        var go = new GameObject("WebMediaBridge");        // survives scene loads
        DontDestroyOnLoad(go);
        _instance = go.AddComponent<WebMediaBridge>();
        IsActive = true;
        HandTrackingService.CameraTextureSource = () => _instance._camera;     // live camera for every screen
        FaceTrackingService.StartRequested += () => EM_FaceStart();            // photobooth fallback filter
        FaceTrackingService.StopRequested += () => EM_FaceStop();
        EM_Start();                                                             // getUserMedia + Hands
        Debug.Log("[WebBridge] Proveedor WebGL activo (MediaPipe JS).");
#endif
    }

    // Copies the frames and polls the models.
    void Update()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        UpdateCamera();
        PollHand();
        if (FaceTrackingService.Running) PollFace();
        if (_snapRunning) UpdateSnap();
#endif
    }

#if UNITY_WEBGL && !UNITY_EDITOR
    // Allocates the camera texture once the video size is known, then uploads every frame.
    void UpdateCamera()
    {
        int w = EM_VideoWidth(), h = EM_VideoHeight();                         // 0 until the webcam plays
        if (w <= 0 || h <= 0) return;
        if (_camera == null || _camera.width != w || _camera.height != h)
        {
            if (_camera != null) Destroy(_camera);
            _camera = new Texture2D(w, h, TextureFormat.RGBA32, false) { name = "WebCamera", wrapMode = TextureWrapMode.Clamp }; // video size
            _camera.Apply(false, false);                                       // create the GL texture
            Debug.Log($"[WebBridge] Cámara {w}x{h}");
        }
        EM_UpdateVideoTexture((int)_camera.GetNativeTexturePtr(), w, h);       // video -> canvas -> texSubImage2D
    }

    // Publishes the newest hand result (x flipped to mirror view, like rawX = (1 - lm.x)).
    void PollHand()
    {
        int n = EM_PollHand(_hand, _hand.Length);                              // -1 = no new result
        if (n < 0) return;
        if (n < _hand.Length) { HandTrackingService.Publish(HandFrame.Empty); return; } // no hand
        var points = new Vector3[HandFrame.LandmarkCount];                     // fresh array per frame
        for (int i = 0; i < points.Length; i++)
            points[i] = new Vector3(1f - _hand[i * 3], _hand[i * 3 + 1], _hand[i * 3 + 2]); // mirror view
        HandTrackingService.Publish(new HandFrame(points));
    }

    // Publishes the newest face result in mirror view (face-filter.js draws with ctx.scale(-1, 1)).
    void PollFace()
    {
        int n = EM_PollFace(_face, _face.Length);
        if (n < 0) return;
        if (n < 468 * 3) { FaceTrackingService.Publish(null); return; }        // no face
        var points = new Vector3[n / 3];
        for (int i = 0; i < points.Length; i++)
            points[i] = new Vector3(1f - _face[i * 3], _face[i * 3 + 1], _face[i * 3 + 2]);
        FaceTrackingService.Publish(points);
    }

    // Uploads the Snap canvas into its texture.
    void UpdateSnap()
    {
        int w = EM_SnapWidth(), h = EM_SnapHeight();
        if (w <= 0 || h <= 0) return;
        if (_snap == null || _snap.width != w || _snap.height != h)
        {
            if (_snap != null) Destroy(_snap);
            _snap = new Texture2D(w, h, TextureFormat.RGBA32, false) { name = "SnapLens", wrapMode = TextureWrapMode.Clamp };
            _snap.Apply(false, false);
        }
        EM_UpdateSnapTexture((int)_snap.GetNativeTexturePtr());
    }
#endif

    // ── Snap Camera Kit API used by the photobooth ─────────────

    // Starts (or resumes) Snap with the presenter's lens; false when Snap cannot be used here.
    public static bool SnapBegin(string presenterId)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        var snap = AppConfig.Current.snap;                                      // APP_CONFIG.snap
        string lens = snap.LensFor(presenterId);                                // APP_CONFIG.snap.lensIds[id]
        if (!snap.enabled || lens == null || string.IsNullOrEmpty(snap.lensGroupId) || snap.lensGroupId.StartsWith("TU_")) return false;
        var pb = AppConfig.Current.photobooth;                                  // render size
        EM_SnapStart(snap.apiToken, snap.lensGroupId, lens, pb.photoWidth, pb.photoHeight);
        _instance._snapRunning = true;
        return true;
#else
        return false;                                                           // Editor/Windows: MakeupFilter only
#endif
    }

    // 1 loading, 2 ready, -1 failed, 0 idle.
    public static int SnapState()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        return EM_SnapState();
#else
        return -1;
#endif
    }

    // Snap output texture (mirrored, bottom-up), null until the first upload.
    public static Texture SnapTexture => _instance != null ? _instance._snap : null;

    // Pauses the session but keeps it for the next visit (web pauseSnapFilter).
    public static void SnapPause()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        EM_SnapPause();
        if (_instance != null) _instance._snapRunning = false;
#endif
    }
}
