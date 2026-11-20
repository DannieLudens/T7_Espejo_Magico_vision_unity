using System.Collections.Generic;    // List
using System.IO;                     // File, Path
using UnityEditor;                   // BuildTarget
using UnityEditor.Build;             // IProcessSceneWithReport, IPostprocessBuildWithReport
using UnityEditor.Build.Reporting;   // BuildReport
using UnityEngine;                   // GameObject, MonoBehaviour, Debug
using UnityEngine.SceneManagement;   // Scene

// WebGL builds use the browser MediaPipe JS (WebMediaBridge), so the native homuler objects and models
// are left out: the scene copies lose the plugin's GameObjects (their scripts do not compile for WebGL)
// and the built StreamingAssets lose the .bytes models nobody loads there.
public class WebGLBuildProcessor : IProcessSceneWithReport, IPostprocessBuildWithReport
{
    static readonly string[] NativeObjects = { "HandTrackingSolution", "Canvas/HandTrackingDebug" }; // plugin runner + debug view
    static readonly string[] NativeModels = { "hand_landmarker.bytes", "face_landmarker_v2.bytes" }; // homuler task models

    public int callbackOrder => 0; // run with the defaults

    // Removes the native MediaPipe objects from each scene copy that goes into a WebGL player.
    public void OnProcessScene(Scene scene, BuildReport report)
    {
        if (report == null || report.summary.platform != BuildTarget.WebGL) return; // Play mode or other targets
        var doomed = new List<GameObject>();
        foreach (var root in scene.GetRootGameObjects())
        {
            foreach (var path in NativeObjects)                                       // known objects
            {
                var parts = path.Split(new[] { '/' }, 2);
                if (root.name != parts[0]) continue;
                var target = parts.Length == 1 ? root.transform : root.transform.Find(parts[1]);
                if (target != null) doomed.Add(target.gameObject);
            }
            foreach (var behaviour in root.GetComponentsInChildren<MonoBehaviour>(true)) // anything else from the plugin
            {
                if (behaviour == null) continue;
                string ns = behaviour.GetType().Namespace ?? "";
                if (ns.StartsWith("Mediapipe") && !doomed.Contains(behaviour.gameObject)) doomed.Add(behaviour.gameObject);
            }
        }
        foreach (var go in doomed)
        {
            if (go == null) continue;                                                 // already gone with its parent
            Debug.Log("[WebGLBuild] Quitando objeto nativo de MediaPipe: " + go.name);
            Object.DestroyImmediate(go);
        }
    }

    // Deletes the native models from the built StreamingAssets and prepares the folder for Vercel.
    public void OnPostprocessBuild(BuildReport report)
    {
        if (report.summary.platform != BuildTarget.WebGL) return;
        string folder = Path.Combine(report.summary.outputPath, "StreamingAssets");     // <build>/StreamingAssets
        foreach (var model in NativeModels)
        {
            string file = Path.Combine(folder, model);
            if (!File.Exists(file)) continue;
            File.Delete(file);                                                         // MediaPipe JS loads its own models from the CDN
            Debug.Log("[WebGLBuild] Quitado de StreamingAssets: " + model);
        }
        SanitizeConfig(Path.Combine(folder, "config.json"));                           // the web config is public
        File.WriteAllText(Path.Combine(report.summary.outputPath, ".vercelignore"), VercelIgnore); // keep local test files out
    }

    // Files in the build folder that must never be deployed (local test page, fake camera, docs template,
    // env files the Vercel CLI may create when linking).
    const string VercelIgnore =
        "test.html\nfake-cam.js\ntest-cam.png\nStreamingAssets/config.example.json\n.env*\n.gitignore\n";

    // Everything in a WebGL build is downloadable, so the published config.json drops the unsigned upload preset
    // and the cloud name and points the photobooth to the signing function (api/cloudinary-sign.js) instead.
    // The Snap Camera Kit token stays: it is a browser token by design, restricted by the Snap Trusted Origins.
    static void SanitizeConfig(string path)
    {
        if (!File.Exists(path)) return;                                                // no config.json in the project
        var config = JsonUtility.FromJson<AppConfig>(File.ReadAllText(path));
        config.cloudinary.uploadPreset = "";                                           // would let anyone upload unsigned
        config.cloudinary.cloudName = "";                                              // the function returns it
        config.cloudinary.signUrl = "/api/cloudinary-sign";                            // Vercel Function
        File.WriteAllText(path, JsonUtility.ToJson(config, true));
        Debug.Log("[WebGLBuild] config.json publicado sin preset de Cloudinary (subidas firmadas).");
    }
}
