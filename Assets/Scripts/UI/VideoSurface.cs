using System;            // Action
using UnityEngine;       // MonoBehaviour, RenderTexture, Debug
using UnityEngine.UI;    // RawImage, AspectRatioFitter
using UnityEngine.Video; // VideoPlayer

// A UI video element backed by a URL VideoPlayer (works on WebGL), like an HTML <video>.
// Scales with AspectRatioFitter: FitInParent = object-fit: contain, EnvelopeParent = cover.
[RequireComponent(typeof(VideoPlayer))]
public class VideoSurface : MonoBehaviour
{
    [SerializeField] RawImage image;          // shows the decoded frames
    [SerializeField] AspectRatioFitter fitter; // contain / cover behaviour
    [SerializeField] bool playAudio;           // unmuted <video> (exp-video); the rest are muted

    public event Action Finished;             // 'ended' (only when not looping)

    VideoPlayer _player;          // decoder
    RenderTexture _target;        // frame buffer
    string _url;                  // current source

    public bool IsPlaying => _player != null && _player.isPlaying;  // currently decoding
    public double Time => _player != null ? _player.time : 0;      // currentTime
    public double Length => _player != null ? _player.length : 0;  // duration (0 until prepared)

    // Configures the player for URL playback without audio.
    void Awake()
    {
        _player = GetComponent<VideoPlayer>();                    // decoder on this object
        _player.playOnAwake = false;                              // started from code
        _player.source = VideoSource.Url;                         // required on WebGL
        _player.renderMode = VideoRenderMode.RenderTexture;       // decode off-screen
        if (playAudio)                                            // exp-video keeps its soundtrack
        {
            _player.audioOutputMode = VideoAudioOutputMode.Direct; // the only mode WebGL supports
            _player.controlledAudioTrackCount = 1;                // first audio track
            _player.EnableAudioTrack(0, true);                    // play it
        }
        else _player.audioOutputMode = VideoAudioOutputMode.None; // muted video
        _player.prepareCompleted += OnPrepared;                   // start when ready
        _player.loopPointReached += OnLoopPoint;                  // end of clip
        _player.errorReceived += OnError;                         // log failures
        image.enabled = false;                                    // no white frame before the first decode
    }

    // Loads a StreamingAssets video and plays it once prepared (videoEl.src = ...; play()).
    public void Play(string relativePath, bool loop)
    {
        _url = MediaPaths.StreamingUrl(relativePath); // full URL
        _player.isLooping = loop;                     // videoEl.loop
        _player.url = _url;                           // src
        _player.Prepare();                            // load()
    }

    // Changes looping without restarting the clip (web videoEl.loop = false).
    public void SetLooping(bool loop)
    {
        _player.isLooping = loop; // takes effect at the next loop point
    }

    // Stops playback and hides the surface (videoEl.pause(); src = '').
    public void Stop()
    {
        _player.Stop();        // release the decoder
        _player.url = null;    // forget the source
        _url = null;           // nothing loaded
        image.enabled = false; // nothing to show
    }

    // Creates a matching RenderTexture and starts playback.
    void OnPrepared(VideoPlayer source)
    {
        if (source.url != _url) return;                                         // a newer request replaced this one
        int w = (int)source.width, h = (int)source.height;                      // native size
        if (_target == null || _target.width != w || _target.height != h)
        {
            if (_target != null) _target.Release();                             // drop old buffer
            _target = new RenderTexture(w, h, 0);                               // new buffer
        }
        source.targetTexture = _target;                                         // decode into it
        image.texture = _target;                                                // display it
        if (fitter != null) fitter.aspectRatio = (float)w / h;                  // contain / cover
        image.enabled = true;                                                   // visible
        source.Play();                                                          // play()
    }

    // Follows the operator's video volume (expVideo.volume = mf * video).
    void LateUpdate()
    {
        if (playAudio) _player.SetDirectAudioVolume(0, AudioLevels.Video); // Direct output ignores the AudioListener
    }

    // Raises Finished when a non-looping clip ends.
    void OnLoopPoint(VideoPlayer source)
    {
        if (!source.isLooping) Finished?.Invoke(); // videoEl.onended
    }

    // Logs decoder errors (web console.warn) and treats the clip as finished so the flow never stalls.
    void OnError(VideoPlayer source, string message)
    {
        Debug.LogWarning("[Video] " + _url + ": " + message); // diagnostic
        if (!source.isLooping) Finished?.Invoke();           // keep the experience moving
    }

    // Frees the RenderTexture.
    void OnDestroy()
    {
        if (_target != null) _target.Release(); // GPU memory
    }
}
