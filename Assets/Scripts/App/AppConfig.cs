using System;                  // Serializable, Action
using UnityEngine;             // Debug, JsonUtility, RuntimeInitializeOnLoadMethod
using UnityEngine.Networking;  // UnityWebRequest

// Runtime settings (port of APP_CONFIG in js/config.js). Values live in StreamingAssets/config.json,
// which is gitignored like the web config.js; config.example.json documents the shape.
[Serializable]
public class AppConfig
{
    [Serializable]
    public class CloudinarySettings
    {
        public bool enabled;          // upload photos to Cloudinary
        public string cloudName = ""; // account cloud name
        public string uploadPreset = ""; // unsigned upload preset (local kiosk / Editor only)
        public string signUrl = "";   // endpoint that signs uploads (web deploy); when set, no preset is needed
    }

    [Serializable]
    public class SnapSettings
    {
        public bool enabled;              // use Snap Camera Kit lenses in the WebGL photobooth
        public string apiToken = "";      // Camera Kit API token (public once deployed, restricted by Trusted Origins)
        public string lensGroupId = "";   // Lens Group UUID
        public LensIds lensIds = new LensIds(); // lens UUID per presenter

        // Lens UUID for a presenter id, or null when missing / placeholder.
        public string LensFor(string presenterId)
        {
            string id = null;
            switch (presenterId)
            {
                case "p_noticias": id = lensIds.p_noticias; break;
                case "ph_noticias": id = lensIds.ph_noticias; break;
                case "p_cmoda": id = lensIds.p_cmoda; break;
                case "ph_deportes": id = lensIds.ph_deportes; break;
            }
            return string.IsNullOrEmpty(id) || id.StartsWith("TU_") ? null : id; // web: !lensId || startsWith('TU_')
        }
    }

    [Serializable]
    public class LensIds
    {
        public string p_noticias = "";  // Presentadora de Noticias
        public string ph_noticias = ""; // Presentador de Noticias
        public string p_cmoda = "";     // Presentadora Colombia Moda
        public string ph_deportes = ""; // Presentador de Deportes
    }

    [Serializable]
    public class PhotoboothSettings
    {
        public int countdownSeconds = 3;   // countdown length
        public int photoWidth = 1280;      // output resolution
        public int photoHeight = 720;
        public float jpegQuality = 0.92f;  // JPEG quality 0..1
        public bool watermarkLogo = true;  // Telemedellín logo on the photo
        public int qrDisplayMs = 90000;    // time the QR stays before returning to the tutorial
        public string kioskUrl = "";       // LAN address for the local QR fallback
    }

    public CloudinarySettings cloudinary = new CloudinarySettings(); // APP_CONFIG.cloudinary
    public SnapSettings snap = new SnapSettings();                   // APP_CONFIG.snap
    public PhotoboothSettings photobooth = new PhotoboothSettings(); // APP_CONFIG.photobooth

    public static AppConfig Current { get; private set; } = new AppConfig(); // defaults until the file loads
    public static bool Loaded { get; private set; }                          // config.json was read

    // Starts loading config.json before the first scene (works on desktop and WebGL).
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Load()
    {
        string url = MediaPaths.StreamingUrl("config.json");                // StreamingAssets/config.json
        if (!url.Contains("://")) url = new Uri(url).AbsoluteUri;           // desktop folder path -> file:/// URL
        var request = UnityWebRequest.Get(url);                             // same loader on every platform
        request.SendWebRequest().completed += _ =>
        {
            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    Current = JsonUtility.FromJson<AppConfig>(request.downloadHandler.text); // parse
                    Loaded = true;
                    Debug.Log("[Config] config.json cargado — Cloudinary " + (Current.cloudinary.enabled ? "activo" : "inactivo")); // never log secrets
                }
                catch (Exception e)
                {
                    Debug.LogWarning("[Config] config.json inválido: " + e.Message); // keep defaults
                }
            }
            else
            {
                Debug.LogWarning("[Config] Sin config.json (copia config.example.json) — se usan valores por defecto."); // like a missing config.js
            }
            request.Dispose(); // free the request
        };
    }
}
