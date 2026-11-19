using System;      // Serializable
using UnityEngine; // ScriptableObject, Sprite, Color, AudioClip

// Data of one presenter (port of an entry of PRESENTERS in js/presenters.js).
[CreateAssetMenu(menuName = "Espejo Magico/Presenter", fileName = "Presenter")]
public class PresenterDefinition : ScriptableObject
{
    public string id;                        // web id, e.g. "p_noticias"
    [TextArea] public string label;          // card name (two lines)
    public Sprite character;                 // personaje: transparent PNG of the presenter
    public Sprite background;                // fondo: studio set (menu hover and card background)
    public Sprite finalBackground;           // fondoFinal: used by intro and final screens
    public Color accentColor = Color.white;  // accentColor
    public AudioClip introAudio;             // introAudio: voice played on the Intro screen

    [Header("Menu card framing (per-presenter CSS overrides)")]
    [Tooltip("background-size: auto X% -> character height as a fraction of the card height")]
    public float cardCharacterHeight = 0.92f;              // default 92 %
    [Range(0f, 1f), Tooltip("background-position X% (0.5 = center)")]
    public float cardCharacterAnchorX = 0.5f;              // default center

    [Header("Experience")]
    public string[] idleVideos = new string[0];            // checkpoint loops in order (StreamingAssets paths)
    public ExperienceScene[] scenes = new ExperienceScene[0]; // scenes in playback order

    // Idle loop for the checkpoint after scene `sceneIndex` (web getValidScenes): reuses the last one when they run out.
    public string IdleVideoFor(int sceneIndex)
    {
        if (idleVideos.Length == 0) return null;                    // presenter without idles
        int checkpoint = 0;                                        // checkpoint counter
        for (int i = 0; i < sceneIndex && i < scenes.Length; i++)  // count earlier checkpoints
            if (scenes[i].hasCheckpoint) checkpoint++;
        return idleVideos[Mathf.Min(checkpoint, idleVideos.Length - 1)]; // idleVideos[idx] ?? last
    }

    // Last idle loop, used as the bridge when the final scene's video ends before its audio.
    public string LastIdleVideo()
    {
        return idleVideos.Length > 0 ? idleVideos[idleVideos.Length - 1] : null; // idleVideos.slice(-1)[0]
    }
}

// One scene of a presenter's experience (web scenes[] entry).
[Serializable]
public class ExperienceScene
{
    public string[] videos = new string[0];       // one or more clips played back to back (StreamingAssets paths)
    public AudioClip[] audios = new AudioClip[0]; // one or more voice tracks chained
    public bool hasCheckpoint;                    // idle checkpoint after this scene
    public string objectVideo;                    // 360° video of the object to show (StreamingAssets path)
    [TextArea] public string hint;                // "Muestra ... a la cámara"
    public string[] detectLabels = new string[0]; // Teachable Machine classes that confirm the checkpoint
}
