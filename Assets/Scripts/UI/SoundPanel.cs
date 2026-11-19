using System.Collections; // IEnumerator
using TMPro;              // TMP_Text
using UnityEngine;        // MonoBehaviour, Color, Sprite
using UnityEngine.UI;     // Image, Button

// Audio panel (web #sound-panel, key V): a slider and a mute button per channel and a save button.
public class SoundPanel : MonoBehaviour
{
    // One channel section (.audio-section).
    [System.Serializable]
    public class ChannelRow
    {
        public AudioLevels.Channel channel; // master / voz / video / music
        public StepSlider slider;           // #vol-*
        public Button muteButton;           // #btn-mute-*
        public Image muteIcon;              // 🔊 / 🔇
        public Image muteBackground;        // button background
        public Image muteBorder;            // button border
        public PointerHover muteHover;      // :hover
    }

    [SerializeField] ChannelRow[] rows = new ChannelRow[0]; // four sections
    [SerializeField] Sprite speakerOn;      // 🔊
    [SerializeField] Sprite speakerMuted;   // 🔇
    [SerializeField] Button saveButton;     // #btn-save-audio
    [SerializeField] Image saveIcon;        // 💾 / ✅
    [SerializeField] TMP_Text saveLabel;    // "Guardar configuración" / "Guardado"
    [SerializeField] Image saveBackground;  // .ctrl-btn background
    [SerializeField] PointerHover saveHover; // .ctrl-btn:hover
    [SerializeField] Sprite saveSprite;     // 💾
    [SerializeField] Sprite savedSprite;    // ✅

    static readonly Color Gold = new Color(212f / 255f, 175f / 255f, 55f / 255f, 1f);        // --gold
    static readonly Color TextDim = new Color(240f / 255f, 230f / 255f, 200f / 255f, 0.55f); // --text-dim

    Coroutine _savedFeedback; // setTimeout of the "Guardado" label

    // Syncs the UI with the saved configuration and wires the controls (web DOMContentLoaded block).
    void Awake()
    {
        foreach (var row in rows)
        {
            var r = row;                                                                    // capture
            r.slider.SetValue(AudioLevels.GetLevel(r.channel));                            // _syncAudioUI
            r.slider.Changed += v => AudioLevels.SetLevel(r.channel, Mathf.RoundToInt(v));  // slider input
            r.muteButton.onClick.AddListener(() => AudioLevels.ToggleMute(r.channel));      // mute click
        }
        saveButton.onClick.AddListener(Save); // Guardar
    }

    // Saves and shows the confirmation for 1.8 s.
    void Save()
    {
        AudioLevels.Save();                                                 // _saveAudioConfig
        if (_savedFeedback != null) StopCoroutine(_savedFeedback);          // restart the timer
        _savedFeedback = StartCoroutine(SavedFeedback());                  // '✅ Guardado'
    }

    // Shows "✅ Guardado" and restores the label (setTimeout 1800).
    IEnumerator SavedFeedback()
    {
        saveIcon.sprite = savedSprite;            // ✅
        saveLabel.text = "Guardado";
        yield return new WaitForSecondsRealtime(1.8f);
        saveIcon.sprite = saveSprite;             // 💾
        saveLabel.text = "Guardar configuración";
        _savedFeedback = null;
    }

    // Applies the mute and hover styles.
    void Update()
    {
        foreach (var row in rows)
        {
            bool muted = AudioLevels.IsMuted(row.channel);                         // data-muted
            bool hover = row.muteHover.IsOver;                                     // .mute-btn:hover
            row.muteIcon.sprite = muted ? speakerMuted : speakerOn;                // 🔇 / 🔊
            row.muteBorder.color = muted ? new Color(1f, 100f / 255f, 100f / 255f, 0.4f) // rgba(255,100,100,0.4)
                : hover ? new Color(Gold.r, Gold.g, Gold.b, 0.35f)                 // --gold-dimmed
                : new Color(Gold.r, Gold.g, Gold.b, 0.25f);                        // rgba(212,175,55,0.25)
            float bg = muted ? 0.08f : hover ? 0.12f : 0f;                          // background
            row.muteBackground.color = new Color(Gold.r, Gold.g, Gold.b, bg);
        }
        bool saveHot = saveHover.IsOver;                                           // .ctrl-btn:hover
        saveBackground.color = new Color(Gold.r, Gold.g, Gold.b, saveHot ? 0.18f : 0.08f);
        saveLabel.color = saveHot ? Gold : TextDim;                                // color: var(--gold)
    }
}
