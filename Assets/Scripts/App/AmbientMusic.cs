using UnityEngine; // MonoBehaviour, AudioSource

// Looping background music that starts in Standby and never stops (web #ambient-music).
[RequireComponent(typeof(AudioSource))]
public class AmbientMusic : MonoBehaviour
{
    [SerializeField, Range(0f, 1f)] float volume = 0.35f; // web default music volume: 35 %

    AudioSource _source; // plays MusicaAmbiente.mp3

    // Configures the AudioSource like the <audio loop> element.
    void Awake()
    {
        _source = GetComponent<AudioSource>(); // cached source
        _source.loop = true;                   // <audio loop>
        _source.playOnAwake = false;           // started by the Standby screen
        _source.volume = volume;               // _applyVolumes music level
    }

    // Starts the music if it is not already playing (web _startAmbientMusic).
    public void Play()
    {
        if (!_source.isPlaying) _source.Play(); // WebGL resumes the audio context after the first interaction
    }
}
