using UnityEngine; // Application

// Builds URLs for media served from StreamingAssets; on WebGL VideoPlayer can only play URLs.
// Relative paths mirror the web project's assets folder (e.g. "videos/Prototipo/Tuto1.mp4").
public static class MediaPaths
{
    // Returns the full URL or file path of a StreamingAssets file.
    public static string StreamingUrl(string relativePath)
    {
        return Application.streamingAssetsPath.TrimEnd('/', '\\') + "/" + relativePath.TrimStart('/'); // http URL on WebGL, file path on desktop
    }
}
