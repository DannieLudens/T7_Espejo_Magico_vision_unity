using System;                 // Action, DateTimeOffset, Uri
using System.Collections;     // IEnumerator
using System.IO;              // File, Path, Directory
using UnityEngine;            // Debug, JsonUtility, Application
using UnityEngine.Networking; // UnityWebRequest, WWWForm

// Uploads the photo and returns the URL for the QR (port of processAndShowQR in js/photo-booth.js).
// Priority: Cloudinary (public URL, works on any network) -> local fallback (LAN URL + copy on the kiosk).
// The web deploy uses signed uploads (cloudinary.signUrl, a Vercel function that keeps the API secret);
// the local kiosk keeps the unsigned preset of the web version.
public static class PhotoUploader
{
    // Cloudinary upload response (only the field the QR needs).
    [Serializable]
    class CloudinaryResponse
    {
        public string secure_url; // HTTPS URL of the uploaded image
    }

    // Signature returned by the signing endpoint (api/cloudinary-sign.js); every field is signed or public.
    [Serializable]
    class SignResponse
    {
        public string cloudName;      // account cloud name
        public string apiKey;         // public API key
        public long timestamp;        // signed timestamp (valid for 1 hour)
        public string signature;      // SHA-1 of the signed params + API secret
        public string folder;         // fixed destination folder
        public string allowedFormats; // jpg only
        public string transformation; // incoming size limit
    }

    // Uploads the JPEG and calls done with the URL to encode in the QR.
    public static IEnumerator Process(byte[] jpeg, Action<string> done)
    {
        var cfg = AppConfig.Current.cloudinary;                                     // APP_CONFIG.cloudinary
        bool signed = !string.IsNullOrEmpty(cfg.signUrl);                           // web deploy
        bool unsigned = !string.IsNullOrEmpty(cfg.cloudName) && !string.IsNullOrEmpty(cfg.uploadPreset); // local kiosk
        if (cfg.enabled && (signed || unsigned))
        {
            string url = null;                                                      // result of the upload
            if (signed) yield return UploadSigned(jpeg, cfg.signUrl, u => url = u); // secret stays on the server
            else yield return UploadToCloudinary(jpeg, cfg, u => url = u);          // await uploadToCloudinary
            if (!string.IsNullOrEmpty(url)) { done(url); yield break; }             // public URL
        }
        done(LocalFallback(jpeg));                                                  // _fallbackLocalQR
    }

    // POST to the unsigned upload preset (no backend needed, same request as the web).
    static IEnumerator UploadToCloudinary(byte[] jpeg, AppConfig.CloudinarySettings cfg, Action<string> done)
    {
        var form = new WWWForm();                                                   // multipart/form-data
        form.AddBinaryData("file", jpeg, "espejo-magico.jpg", "image/jpeg");        // form.append('file', blob, ...)
        form.AddField("upload_preset", cfg.uploadPreset);                           // unsigned preset
        form.AddField("folder", "espejo-magico");                                   // same folder as the web
        string endpoint = "https://api.cloudinary.com/v1_1/" + Uri.EscapeDataString(cfg.cloudName) + "/image/upload";
        using (var request = UnityWebRequest.Post(endpoint, form))
        {
            request.timeout = 30;                                                   // do not hang the kiosk
            yield return request.SendWebRequest();                                  // await fetch
            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning("[PhotoBooth] Fallo en upload, usando fallback local: " + request.responseCode + " " + request.error); // web warning
                done(null);
                yield break;
            }
            var data = JsonUtility.FromJson<CloudinaryResponse>(request.downloadHandler.text); // res.json()
            Debug.Log("[PhotoBooth] Subida a Cloudinary: " + data.secure_url);       // web log
            done(data.secure_url);
        }
    }

    // Asks the signing endpoint for a signature, then uploads with it (no preset or secret in the client).
    static IEnumerator UploadSigned(byte[] jpeg, string signUrl, Action<string> done)
    {
        string endpoint = signUrl.StartsWith("/") ? Origin() + signUrl : signUrl;  // relative to the page
        SignResponse sign;
        using (var request = new UnityWebRequest(endpoint, UnityWebRequest.kHttpVerbPOST))
        {
            request.downloadHandler = new DownloadHandlerBuffer();                   // JSON answer
            request.timeout = 15;
            yield return request.SendWebRequest();
            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning("[PhotoBooth] Sin firma de Cloudinary, usando fallback local: " + request.responseCode + " " + request.error);
                done(null);
                yield break;
            }
            sign = JsonUtility.FromJson<SignResponse>(request.downloadHandler.text);
        }

        var form = new WWWForm();                                                   // signed upload
        form.AddBinaryData("file", jpeg, "espejo-magico.jpg", "image/jpeg");
        form.AddField("api_key", sign.apiKey);
        form.AddField("timestamp", sign.timestamp.ToString());
        form.AddField("signature", sign.signature);
        form.AddField("folder", sign.folder);                                       // the signed values, unchanged
        form.AddField("allowed_formats", sign.allowedFormats);
        form.AddField("transformation", sign.transformation);
        string upload = "https://api.cloudinary.com/v1_1/" + Uri.EscapeDataString(sign.cloudName) + "/image/upload";
        using (var request = UnityWebRequest.Post(upload, form))
        {
            request.timeout = 30;                                                   // do not hang the kiosk
            yield return request.SendWebRequest();
            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning("[PhotoBooth] Fallo en upload firmado, usando fallback local: " + request.responseCode + " " + request.error);
                done(null);
                yield break;
            }
            var data = JsonUtility.FromJson<CloudinaryResponse>(request.downloadHandler.text);
            Debug.Log("[PhotoBooth] Subida a Cloudinary (firmada): " + data.secure_url);
            done(data.secure_url);
        }
    }

    // Keeps a copy on the kiosk and builds the LAN URL like the web (photo.html?id=...).
    static string LocalFallback(byte[] jpeg)
    {
        string id = "photo_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();       // 'photo_' + Date.now()
#if !UNITY_WEBGL || UNITY_EDITOR
        string folder = Path.Combine(Application.persistentDataPath, "Fotos");       // _triggerDownload equivalent
        Directory.CreateDirectory(folder);
        string file = Path.Combine(folder, "espejo-magico-" + id + ".jpg");
        File.WriteAllBytes(file, jpeg);
        Debug.Log("[PhotoBooth] Foto guardada en el kiosco: " + file);
#endif
        string kiosk = AppConfig.Current.photobooth.kioskUrl;                        // APP_CONFIG.photobooth.kioskUrl
        string origin = string.IsNullOrEmpty(kiosk) ? Origin() : kiosk;             // || window.location.origin
        string url = origin.TrimEnd('/') + "/photo.html?id=" + id;                   // same pattern as the web
        Debug.Log("[PhotoBooth] QR local: " + url);
        if (string.IsNullOrEmpty(kiosk))
            Debug.Log("[PhotoBooth] TIP: configura photobooth.kioskUrl con la IP LAN del museo para que el QR funcione desde el celular del visitante.");
        return url;
    }

    // window.location.origin on WebGL; localhost on the desktop kiosk.
    static string Origin()
    {
        if (Application.platform == RuntimePlatform.WebGLPlayer && Uri.TryCreate(Application.absoluteURL, UriKind.Absolute, out var page))
            return page.GetLeftPart(UriPartial.Authority);                          // scheme://host:port
        return "http://localhost";                                                   // desktop has no page origin
    }
}
