using System.Collections;            // IEnumerator
using System.Collections.Generic;    // List, Dictionary
using System.Globalization;          // CultureInfo
using TMPro;                         // TMP_Text
using UnityEngine;                   // MonoBehaviour, AudioSource, PlayerPrefs
using UnityEngine.Networking;        // UnityWebRequest
using UnityEngine.UI;                // Image

// Closed captions for the voice-over (port of js/captions.js): each voice clip has a WebVTT file with the
// same name in StreamingAssets/captions; while the attached AudioSource plays, the cue under its current
// time is shown in a dark box above the bottom frame strip. Key C toggles them and the choice is saved.
public class Captions : MonoBehaviour
{
    const string StorageKey = "cc_enabled";   // _CC_STORAGE_KEY
    const string CaptionsDir = "captions/";   // _CC_CAPTIONS_DIR inside StreamingAssets
    const float MaxTextWidth = 1382.4f - 40f; // max-width: 72 % minus the 1em side padding
    const float PaddingX = 20f, PaddingY = 9f; // padding: 0.45em 1em at 20 px
    const float LineHeight = 29f;             // line-height: 1.45

    [SerializeField] RectTransform box;       // #cc-text box (bottom-center anchored)
    [SerializeField] TMP_Text text;           // caption line(s)
    [SerializeField] CanvasGroup overlay;     // #cc-overlay opacity
    [SerializeField] CanvasGroup badge;       // #cc-badge opacity
    [SerializeField] Image badgeBorder;       // border: 2px solid currentColor
    [SerializeField] TMP_Text badgeLabel;     // "CC"

    static Captions _instance;                // single overlay in Main.unity

    class Cue { public float Start, End; public string Text; } // {start, end, text}

    static readonly Dictionary<string, List<Cue>> Cache = new Dictionary<string, List<Cue>>(); // parsed files

    static readonly Color BadgeOn = Color.white;                                          // #fff
    static readonly Color BadgeOff = new Color(102f / 255f, 102f / 255f, 102f / 255f, 1f); // #666

    bool _enabled;              // _ccEnabled
    List<Cue> _cues;            // _ccCues
    AudioSource _source;        // _ccCurrentEl
    int _request;               // increments on every attach so stale downloads are dropped
    bool _showing;              // .cc-showing
    string _shownText = "";     // text currently laid out
    CssTransition _overlayOpacity;   // transition: opacity 0.2s
    CssTransition _badgeOpacity;     // transition: opacity 0.3s
    CssTransition _badgeColor;       // transition: color 0.3s (0 = off, 1 = on)

    public static bool Enabled => _instance != null && _instance._enabled; // areCaptionsEnabled()

    // Restores the saved preference (web initCaptions).
    void Awake()
    {
        _instance = this;                                                       // static API target
        _enabled = PlayerPrefs.GetString(StorageKey, "false") == "true";        // saved === 'true'
        _overlayOpacity = new CssTransition(0f, 0.2f, CssEasing.Ease);          // hidden
        _badgeOpacity = new CssTransition(_enabled ? 1f : 0.45f, 0.3f, CssEasing.Ease); // badge state
        _badgeColor = new CssTransition(_enabled ? 1f : 0f, 0.3f, CssEasing.Ease);
        text.text = "";                                                         // empty
        Debug.Log("[CC] Subtítulos inicializados — " + (_enabled ? "ON" : "OFF"));
    }

    // Binds a voice source to the captions of its clip (web attachCaptions(audioEl, getCaptionUrl(src))).
    public static void Attach(AudioSource source, AudioClip clip)
    {
        if (_instance == null) return;                         // no overlay in this scene
        Detach();                                              // clear the previous binding
        if (source == null || clip == null) return;            // nothing to caption
        _instance.StartCoroutine(_instance.Load(source, clip.name, ++_instance._request)); // fetch + parse
    }

    // Unbinds the source and hides the text (web detachCaptions).
    public static void Detach()
    {
        if (_instance == null) return;
        _instance._request++;      // drop pending downloads
        _instance._source = null;  // _ccCurrentEl = null
        _instance._cues = null;    // _ccCues = []
        _instance.Clear();         // _ccClear
    }

    // The clip of this source ended (audio 'ended' listener added by attachCaptions).
    public static void NotifyEnded(AudioSource source)
    {
        if (_instance != null && _instance._source == source) _instance.Clear(); // _ccClear
    }

    // Toggles captions and saves the choice (web toggleCaptions, key C).
    public static void Toggle()
    {
        if (_instance == null) return;
        var cc = _instance;
        cc._enabled = !cc._enabled;                                           // flip
        PlayerPrefs.SetString(StorageKey, cc._enabled ? "true" : "false");    // localStorage.setItem
        PlayerPrefs.Save();
        float now = Time.unscaledTime;
        cc._badgeOpacity.SetTarget(cc._enabled ? 1f : 0.45f, now);            // .cc-badge-on / -off
        cc._badgeColor.SetTarget(cc._enabled ? 1f : 0f, now);
        if (!cc._enabled) cc.Clear();                                         // hide current text
        Debug.Log("[CC] Subtítulos: " + (cc._enabled ? "ON" : "OFF"));
    }

    // Downloads and parses the VTT, then binds the source (async fetch in the web).
    IEnumerator Load(AudioSource source, string clipName, int request)
    {
        if (!Cache.TryGetValue(clipName, out var cues))                            // first use of this file
        {
            string url = MediaPaths.StreamingUrl(CaptionsDir + clipName + ".vtt");  // getCaptionUrl
            if (!url.Contains("://")) url = new System.Uri(url).AbsoluteUri;        // file path on desktop
            using (var www = UnityWebRequest.Get(url))
            {
                yield return www.SendWebRequest();                                  // fetch(vttUrl)
                if (www.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning("[CC] No se pudo cargar el VTT: " + clipName + " " + www.error); // missing file
                    yield break;
                }
                cues = Parse(www.downloadHandler.text);                             // _parseVTT
            }
            Cache[clipName] = cues;                                                 // keep for later visits
            Debug.Log($"[CC] {cues.Count} cues cargadas desde {clipName}.vtt");
        }
        if (request != _request) yield break;                                       // another attach happened meanwhile
        _cues = cues;                                                               // _ccCues
        _source = source;                                                           // timeupdate binding
    }

    // Shows the cue under the playing time and animates the opacities (web _onTimeUpdate + CSS).
    void Update()
    {
        float now = Time.unscaledTime;
        if (_enabled && _cues != null && _cues.Count > 0 && _source != null && _source.isPlaying) // timeupdate fires only while playing
        {
            float t = _source.time;                                                 // audioEl.currentTime
            var cue = _cues.Find(c => t >= c.Start && t <= c.End);                  // first matching cue
            if (cue != null) Show(cue.Text);                                        // cc-showing
            else Clear();                                                           // between cues
        }

        _overlayOpacity.SetTarget(_enabled && _showing ? 1f : 0f, now);            // .cc-active.cc-showing
        overlay.alpha = _overlayOpacity.Evaluate(now);
        badge.alpha = _badgeOpacity.Evaluate(now);                                  // badge opacity
        var color = Color.Lerp(BadgeOff, BadgeOn, _badgeColor.Evaluate(now));       // currentColor
        badgeLabel.color = color;
        badgeBorder.color = color;
    }

    // Puts a cue in the box and sizes it like width: max-content with max-width 72 %.
    void Show(string cueText)
    {
        _showing = true;                                                            // classList.add('cc-showing')
        if (cueText == _shownText) return;                                          // same cue, nothing to lay out
        _shownText = cueText;
        text.text = cueText;                                                        // textContent
        var single = text.GetPreferredValues(cueText, 100000f, 100f);               // one-line width
        float width = Mathf.Min(single.x, MaxTextWidth);                            // wrap at max-width
        text.rectTransform.sizeDelta = new Vector2(width, 0f);                      // text area
        text.ForceMeshUpdate();                                                     // count lines at that width
        int lines = Mathf.Max(1, text.textInfo.lineCount);
        float height = lines * LineHeight;                                          // line boxes
        text.rectTransform.sizeDelta = new Vector2(width, height);
        box.sizeDelta = new Vector2(width + PaddingX * 2f, height + PaddingY * 2f); // padding around the text
    }

    // Hides the text (web _ccClear).
    void Clear()
    {
        _showing = false;      // remove cc-showing
        _shownText = "";       // textContent = ''
        text.text = "";
    }

    // Minimal WebVTT parser: blocks separated by blank lines, "start --> end" then the text lines.
    static List<Cue> Parse(string raw)
    {
        var cues = new List<Cue>();
        var blocks = raw.Replace("\r\n", "\n").Split(new[] { "\n\n" }, System.StringSplitOptions.RemoveEmptyEntries); // split(/\n\n+/)
        foreach (var block in blocks)
        {
            var lines = block.Trim().Split('\n');                                  // block lines
            int timeIndex = System.Array.FindIndex(lines, l => l.Contains("-->")); // time line
            if (timeIndex < 0) continue;                                           // header or note
            var parts = lines[timeIndex].Split(new[] { "-->" }, System.StringSplitOptions.None);
            float start = ToSeconds(parts[0].Trim()), end = ToSeconds(parts[1].Trim().Split(' ')[0]); // ignore cue settings
            if (float.IsNaN(start) || float.IsNaN(end)) continue;                   // malformed
            string cueText = string.Join(" ", lines, timeIndex + 1, lines.Length - timeIndex - 1).Trim(); // join(' ')
            if (cueText.Length > 0) cues.Add(new Cue { Start = start, End = end, Text = cueText });
        }
        return cues;
    }

    // "00:00:03.500" or "00:03.500" to seconds (web _vttToSeconds).
    static float ToSeconds(string value)
    {
        var parts = value.Split(':');
        var c = CultureInfo.InvariantCulture;                                       // decimal point
        if (parts.Length == 3) return float.Parse(parts[0], c) * 3600f + float.Parse(parts[1], c) * 60f + float.Parse(parts[2], c);
        if (parts.Length == 2) return float.Parse(parts[0], c) * 60f + float.Parse(parts[1], c);
        return float.NaN;
    }
}
