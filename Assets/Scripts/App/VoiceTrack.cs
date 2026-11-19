using UnityEngine; // AudioSource, AudioClip, AudioDataLoadState, Time

// Plays one voice clip and reports when it ends (web audioEl.play() + onended).
// Clips are not preloaded, so it waits for the first-use load before watching for the end.
public class VoiceTrack
{
    const float MinimumPlayback = 0.25f; // a clip that stops sooner failed to start (web play().catch)

    readonly AudioSource _source; // channel
    bool _waitingForLoad;         // clip still loading
    float _startedAt;             // time Play() was issued

    public bool IsActive { get; private set; } // a clip is loading or playing

    // Wraps an AudioSource.
    public VoiceTrack(AudioSource source)
    {
        _source = source; // voice channel
    }

    // Starts a clip (loading it first if needed); null means "nothing to play".
    public void Play(AudioClip clip)
    {
        _source.Stop();                                                    // previous clip
        _source.clip = clip;                                               // audioEl.src
        IsActive = clip != null;                                           // something to play
        if (!IsActive) return;                                             // nothing else to do
        _waitingForLoad = clip.loadState != AudioDataLoadState.Loaded;     // first use of the clip
        if (_waitingForLoad) clip.LoadAudioData();                         // load()
        else Begin();                                                      // play()
    }

    // Stops and clears the clip (audioEl.pause(); src = '').
    public void Stop()
    {
        _source.Stop();         // pause
        _source.clip = null;    // src = ''
        IsActive = false;       // idle
        _waitingForLoad = false;
    }

    // Call every frame; returns true exactly once when the clip finished or could not play.
    public bool Tick()
    {
        if (!IsActive) return false;                                           // nothing playing
        if (_waitingForLoad)                                                   // still loading
        {
            var state = _source.clip.loadState;                                // load progress
            if (state == AudioDataLoadState.Loaded) { _waitingForLoad = false; Begin(); } // ready: play
            else if (state == AudioDataLoadState.Failed) { IsActive = false; return true; } // treat as ended
            return false;                                                      // keep waiting
        }
        if (_source.isPlaying || Time.unscaledTime - _startedAt < MinimumPlayback) return false; // still talking
        IsActive = false;                                                      // onended
        Captions.NotifyEnded(_source);                                         // 'ended' clears the caption
        return true;
    }

    // Starts playback and remembers when.
    void Begin()
    {
        _source.Play();                    // play()
        _startedAt = Time.unscaledTime;    // for end detection
        Captions.Attach(_source, _source.clip); // attachCaptions(audioEl, getCaptionUrl(audioEl.src))
    }
}
