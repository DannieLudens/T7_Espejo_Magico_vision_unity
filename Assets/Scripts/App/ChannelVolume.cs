using UnityEngine; // MonoBehaviour, AudioSource

// Keeps an AudioSource at the volume of its operator channel (web _applyVolumes on <audio> elements).
[RequireComponent(typeof(AudioSource))]
public class ChannelVolume : MonoBehaviour
{
    [SerializeField] AudioLevels.Channel channel = AudioLevels.Channel.Voice; // which slider drives it

    AudioSource _source; // controlled source

    // Caches the source and applies the level before the first frame plays.
    void Awake()
    {
        _source = GetComponent<AudioSource>(); // same GameObject
        Apply();                               // initial volume
    }

    // Follows slider and mute changes every frame.
    void LateUpdate()
    {
        Apply(); // cheap: one float
    }

    // Writes the effective channel volume.
    void Apply()
    {
        switch (channel)
        {
            case AudioLevels.Channel.Music: _source.volume = AudioLevels.Music; break; // _ambientMusic.volume
            case AudioLevels.Channel.Video: _source.volume = AudioLevels.Video; break; // expVideo.volume
            default: _source.volume = AudioLevels.Voice; break;                         // vozVol
        }
    }
}
