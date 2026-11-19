using System;             // Action
using System.Collections; // IEnumerator
using UnityEngine;        // MonoBehaviour, Camera, RenderTexture, Texture2D
using UnityEngine.UI;     // RawImage

// Renders the final photo off-screen (port of _capturePhoto in js/photo-booth.js).
// A dedicated camera draws a 1280 x 720 Screen Space - Camera canvas with the mirrored webcam,
// the makeup overlay, the gold corners, the Telemedellín watermark and the brand text.
[RequireComponent(typeof(Camera))]
public class PhotoComposer : MonoBehaviour
{
    [SerializeField] int width = 1280;            // APP_CONFIG.photobooth.photoWidth
    [SerializeField] int height = 720;            // APP_CONFIG.photobooth.photoHeight
    [SerializeField] Canvas canvas;               // composition canvas (Screen Space - Camera)
    [SerializeField] RawImage cameraImage;        // webcam, mirrored (ctx.scale(-1, 1))
    [SerializeField] RawImage makeupImage;        // makeup overlay (face filter), hidden when absent

    public static PhotoComposer Instance { get; private set; } // single composer in Main.unity

    Camera _camera;       // off-screen renderer
    RenderTexture _target; // composition target

    // Prepares the camera and its render target; the camera stays off until a capture.
    void Awake()
    {
        Instance = this;                                                   // screens find it here
        _camera = GetComponent<Camera>();                                  // renderer
        _target = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32); // captureCanvas
        _camera.targetTexture = _target;                                   // never draws to the screen
        _camera.enabled = false;                                           // idle
        canvas.renderMode = RenderMode.ScreenSpaceCamera;                  // canvas sized by the camera
        canvas.worldCamera = _camera;                                      // drawn only by this camera
        canvas.gameObject.SetActive(false);                                // nothing to draw while idle
    }

    // Draws one frame of the composition and returns it as a readable texture.
    public IEnumerator Capture(Texture camera, Texture makeup, Action<Texture2D> done)
    {
        cameraImage.texture = camera;                          // live webcam frame
        cameraImage.color = camera != null ? Color.white : Color.clear; // #111 background when there is no camera
        cameraImage.uvRect = new Rect(1f, 0f, -1f, 1f);        // horizontal mirror, full frame stretched to 16:9
        makeupImage.texture = makeup;                          // overlay canvas
        makeupImage.enabled = makeup != null;                  // drawn only when present

        canvas.gameObject.SetActive(true);                     // build the UI for this frame
        _camera.enabled = true;                                // render once into the target
        yield return new WaitForEndOfFrame();                  // the camera has rendered

        var previous = RenderTexture.active;                   // restore later
        RenderTexture.active = _target;                        // read from the composition
        var photo = new Texture2D(width, height, TextureFormat.RGB24, false); // JPEG has no alpha
        photo.ReadPixels(new Rect(0, 0, width, height), 0, 0); // GPU -> CPU copy
        photo.Apply(false);                                    // upload for display
        RenderTexture.active = previous;                       // restore

        _camera.enabled = false;                               // idle again
        canvas.gameObject.SetActive(false);                    // hide the composition
        cameraImage.texture = null;                            // drop references
        makeupImage.texture = null;
        done?.Invoke(photo);                                   // resolve(photo)
    }

    // Releases the render target.
    void OnDestroy()
    {
        if (_target != null) _target.Release(); // GPU memory
    }
}
