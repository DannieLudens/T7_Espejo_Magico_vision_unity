using System;      // Uri
using UnityEngine; // Application

// Builds URLs for media served from StreamingAssets; on WebGL VideoPlayer can only play URLs.
// Relative paths mirror the web project's assets folder (e.g. "Videos_Definitivos/.../Idles/Idle 1.mp4").
public static class MediaPaths
{
    // Returns the full URL (WebGL) or file path (Editor/desktop) of a StreamingAssets file.
    public static string StreamingUrl(string relativePath)
    {
        string root = Application.streamingAssetsPath.TrimEnd('/', '\\'); // http URL on WebGL, folder on desktop
        string path = relativePath.TrimStart('/');                          // no leading slash
#if UNITY_WEBGL && !UNITY_EDITOR
        var parts = path.Split('/');                                        // escape each segment, keep separators
        for (int i = 0; i < parts.Length; i++) parts[i] = Uri.EscapeDataString(parts[i]); // "Idle 1.mp4" -> "Idle%201.mp4"
        path = string.Join("/", parts);
#endif
        return root + "/" + path; // combined location
    }
}
