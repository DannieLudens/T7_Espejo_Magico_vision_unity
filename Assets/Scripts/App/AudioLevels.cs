using System;      // Serializable
using UnityEngine; // PlayerPrefs, JsonUtility, Debug

// Volume channels of the kiosk (port of _audioConfig / _applyVolumes in js/app.js): master, voice-over,
// videos and background music, each 0..100 with its own mute. Saved on demand like localStorage.
public static class AudioLevels
{
    public enum Channel { Master, Voice, Video, Music } // 'master', 'voz', 'video', 'music'

    const string StorageKey = "espejoMagico_audioConfig"; // _AUDIO_STORAGE_KEY

    // Same field names as the web JSON so the saved shape matches.
    [Serializable]
    class Config
    {
        public int master = 100; public bool mutemaster; // 🎛 Master
        public int voz = 100;    public bool mutevoz;    // 🎙 Voz en off
        public int video = 100;  public bool mutevideo;  // 🎬 Videos
        public int music = 35;   public bool mutemusic;  // 🎵 Música de fondo
    }

    static Config _config; // _audioConfig, loaded on first use

    static Config Current => _config ?? (_config = Load()); // lazy _loadAudioConfig

    // Effective volume of a voice-over source (mf * voz).
    public static float Voice => MasterFactor * (Current.mutevoz ? 0f : Current.voz / 100f);

    // Effective volume of the experience video (mf * video).
    public static float Video => MasterFactor * (Current.mutevideo ? 0f : Current.video / 100f);

    // Effective volume of the background music (mf * music).
    public static float Music => MasterFactor * (Current.mutemusic ? 0f : Current.music / 100f);

    static float MasterFactor => Current.mutemaster ? 0f : Current.master / 100f; // mf

    // Slider value 0..100 of a channel.
    public static int GetLevel(Channel channel)
    {
        switch (channel)
        {
            case Channel.Master: return Current.master;
            case Channel.Voice: return Current.voz;
            case Channel.Video: return Current.video;
            default: return Current.music;
        }
    }

    // Sets a channel level (slider 'input').
    public static void SetLevel(Channel channel, int value)
    {
        value = Mathf.Clamp(value, 0, 100); // range 0..100
        switch (channel)
        {
            case Channel.Master: Current.master = value; break;
            case Channel.Voice: Current.voz = value; break;
            case Channel.Video: Current.video = value; break;
            default: Current.music = value; break;
        }
    }

    // Whether a channel is muted.
    public static bool IsMuted(Channel channel)
    {
        switch (channel)
        {
            case Channel.Master: return Current.mutemaster;
            case Channel.Voice: return Current.mutevoz;
            case Channel.Video: return Current.mutevideo;
            default: return Current.mutemusic;
        }
    }

    // Flips a channel mute (mute button click).
    public static void ToggleMute(Channel channel)
    {
        switch (channel)
        {
            case Channel.Master: Current.mutemaster = !Current.mutemaster; break;
            case Channel.Voice: Current.mutevoz = !Current.mutevoz; break;
            case Channel.Video: Current.mutevideo = !Current.mutevideo; break;
            default: Current.mutemusic = !Current.mutemusic; break;
        }
    }

    // Persists the configuration (web _saveAudioConfig).
    public static void Save()
    {
        PlayerPrefs.SetString(StorageKey, JsonUtility.ToJson(Current)); // localStorage.setItem
        PlayerPrefs.Save();                                              // flush (IndexedDB on WebGL)
        Debug.Log("[Audio] Configuración guardada.");
    }

    // Reads the saved configuration, falling back to the defaults (web _loadAudioConfig).
    static Config Load()
    {
        var config = new Config();                                        // _AUDIO_DEFAULTS
        string saved = PlayerPrefs.GetString(StorageKey, "");             // localStorage.getItem
        if (string.IsNullOrEmpty(saved)) return config;                   // nothing saved yet
        try
        {
            JsonUtility.FromJsonOverwrite(saved, config);                 // { ...defaults, ...saved }
            Debug.Log("[Audio] Configuración cargada.");
        }
        catch (Exception e)
        {
            Debug.LogWarning("[Audio] No se pudo cargar config guardada: " + e.Message); // corrupt entry
        }
        return config;
    }
}
