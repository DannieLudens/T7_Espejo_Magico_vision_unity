/**
 * espejo-bridge.js — browser side of the Unity WebGL build.
 * Owns the webcam and runs the same JS models as the web kiosk:
 *   - MediaPipe Hands 0.4  (js/hand-tracker.js options)
 *   - MediaPipe Face Mesh 0.4 (js/face-filter.js options, only while the photobooth asks for it)
 *   - Snap Camera Kit       (js/snap-filter.js flow, photobooth lenses)
 * Unity polls the results through Assets/Plugins/WebGL/EspejoBridge.jslib and copies the video /
 * Snap canvas into its own textures, so nothing here touches the Unity canvas.
 * Landmarks are stored raw (not mirrored); the C# side converts them to mirror view.
 */
'use strict';

window.EspejoBridge = (() => {
  /* Same constants as the web kiosk */
  const HANDS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/';         // hand-tracker.js locateFile
  const FACE_CDN  = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/';     // face-filter.js locateFile
  const SCRIPT_URL = document.currentScript ? document.currentScript.src : location.href; // base for the Snap bundle
  const SNAP_SDK_URLS = [                                                          // snap-filter.js SNAP_SDK_URLS
    new URL('snap-kit-bundle.js', SCRIPT_URL).href,                                // local Vite build (copied from the web)
    'https://esm.sh/@snap/camera-kit?bundle',
    'https://esm.sh/@snap/camera-kit@0.9.14?bundle',
  ];

  let video = null;          // <video> with the webcam stream (hidden)
  let stream = null;         // MediaStream shared by hands, face and Snap
  let started = false;       // start() already called

  let hands = null;          // MediaPipe Hands instance
  const handData = new Float32Array(21 * 3); // x, y, z per landmark
  let handCount = 0;         // landmarks in handData (0 = no hand)
  let handDirty = false;     // a new result is waiting for Unity

  let faceMesh = null;       // MediaPipe Face Mesh instance (created on first use)
  let faceOn = false;        // photobooth asked for face landmarks
  let faceLoop = false;      // face send loop running
  const faceData = new Float32Array(478 * 3);
  let faceCount = 0;
  let faceDirty = false;

  const snap = { state: 0, kit: null, session: null, canvas: null, initialized: false, sdk: null }; // 0 idle, 1 loading, 2 ready, -1 failed

  /* ── Camera + hands ─────────────────────────────────────── */

  async function start() {
    if (started) return;
    started = true;
    video = document.createElement('video');                  // #webcam
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;';
    document.body.appendChild(video);
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = stream;
      await video.play();
      console.log('[HandTracker] Cámara iniciada:', stream.getVideoTracks()[0].label);
    } catch (err) {
      console.warn('[HandTracker] Sin acceso a cámara.', err);
      return;
    }
    if (typeof Hands === 'undefined') {
      console.warn('[HandTracker] MediaPipe Hands no cargado. Verifica el CDN.');
      return;
    }
    hands = new Hands({ locateFile: (file) => HANDS_CDN + file });
    hands.setOptions({
      maxNumHands:            1,
      modelComplexity:        1,
      minDetectionConfidence: 0.85,
      minTrackingConfidence:  0.75
    });
    hands.onResults(onHandResults);
    runLoop(() => hands, () => true);                          // Camera helper equivalent
    console.log('[HandTracker] MediaPipe Hands listo.');
  }

  /* Sends one frame at a time to a model, once per animation frame (camera_utils Camera onFrame). */
  async function runLoop(getModel, keepGoing) {
    while (keepGoing()) {
      const model = getModel();
      if (model && video && video.readyState >= 2) {
        try { await model.send({ image: video }); } catch (e) { console.warn('[Bridge] send:', e); }
      }
      await new Promise(r => requestAnimationFrame(r));
    }
  }

  function onHandResults(results) {
    const lm = results.multiHandLandmarks && results.multiHandLandmarks[0];
    if (!lm) { handCount = 0; handDirty = true; return; }      // handLost
    for (let i = 0; i < 21; i++) {
      handData[i * 3] = lm[i].x; handData[i * 3 + 1] = lm[i].y; handData[i * 3 + 2] = lm[i].z;
    }
    handCount = 21;
    handDirty = true;
  }

  /* Copies the newest hand result into Unity's heap; -1 when nothing changed. */
  function pollHand(heap, offset, max) {
    if (!handDirty) return -1;
    handDirty = false;
    const n = Math.min(handCount * 3, max);
    if (n > 0) heap.set(handData.subarray(0, n), offset);
    return n;
  }

  /* ── Face Mesh (photobooth fallback filter) ─────────────── */

  function faceStart() {
    faceOn = true;
    if (typeof FaceMesh === 'undefined') {
      console.warn('[FaceFilter] MediaPipe FaceMesh no cargado. Verifica el CDN.');
      return;
    }
    if (!faceMesh) {
      faceMesh = new FaceMesh({ locateFile: (file) => FACE_CDN + file });
      faceMesh.setOptions({
        maxNumFaces:            1,
        refineLandmarks:        true,
        minDetectionConfidence: 0.65,
        minTrackingConfidence:  0.55
      });
      faceMesh.onResults(onFaceResults);
    }
    if (!faceLoop) {
      faceLoop = true;
      runLoop(() => faceMesh, () => faceOn).then(() => { faceLoop = false; });
    }
    console.log('[FaceFilter] MediaPipe Face Mesh listo.');
  }

  function faceStop() {
    faceOn = false;                                            // the loop ends after the current frame
    faceCount = 0;
    faceDirty = true;
  }

  function onFaceResults(results) {
    if (!faceOn) return;
    const lm = results.multiFaceLandmarks && results.multiFaceLandmarks[0];
    if (!lm) { faceCount = 0; faceDirty = true; return; }
    const n = Math.min(lm.length, 478);
    for (let i = 0; i < n; i++) {
      faceData[i * 3] = lm[i].x; faceData[i * 3 + 1] = lm[i].y; faceData[i * 3 + 2] = lm[i].z;
    }
    faceCount = n;
    faceDirty = true;
  }

  function pollFace(heap, offset, max) {
    if (!faceDirty) return -1;
    faceDirty = false;
    const n = Math.min(faceCount * 3, max);
    if (n > 0) heap.set(faceData.subarray(0, n), offset);
    return n;
  }

  /* ── Snap Camera Kit ────────────────────────────────────── */

  async function snapStart(apiToken, lensGroupId, lensId, width, height) {
    snap.state = 1;
    try {
      if (!stream) throw new Error('Stream de webcam no disponible.');
      if (!snap.initialized) {
        let sdk = null, lastErr = null;
        for (const url of SNAP_SDK_URLS) {
          try {
            console.log('[SnapFilter] Probando SDK desde:', url);
            sdk = await import(url);
            if (sdk && sdk.bootstrapCameraKit) { console.log('[SnapFilter] SDK cargado desde:', url); break; }
            sdk = null;
          } catch (e) {
            lastErr = e;
            console.warn('[SnapFilter] Falló', url, '—', (e.message || '').slice(0, 120));
          }
        }
        if (!sdk) throw lastErr || new Error('Ninguna URL del SDK funcionó.');
        const { bootstrapCameraKit, createMediaStreamSource, Transform2D } = sdk;
        snap.kit = await bootstrapCameraKit({ apiToken });
        snap.canvas = document.createElement('canvas');        // #snap-canvas (never gets another context)
        snap.canvas.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;';
        document.body.appendChild(snap.canvas);
        snap.session = await snap.kit.createSession({ liveRenderTarget: snap.canvas });
        const mirror = (Transform2D && Transform2D.MirrorX != null) ? Transform2D.MirrorX : undefined;
        const source = createMediaStreamSource(stream, mirror != null ? { transform: mirror, cameraType: 'user' } : { cameraType: 'user' });
        await snap.session.setSource(source);
        await snap.session.source.setRenderSize(width, height);
        snap.initialized = true;
        console.log('[SnapFilter] ✅ Inicializado correctamente.');
      } else {
        console.log('[SnapFilter] Ya inicializado, reutilizando sesión.');
      }
      const lens = await snap.kit.lensRepository.loadLens(lensId, lensGroupId);
      await snap.session.applyLens(lens);
      await snap.session.play();
      console.log('[SnapFilter] ✅ Lens "' + lensId + '" aplicado');
      snap.state = 2;
    } catch (err) {
      console.error('[SnapFilter] ❌ Error al inicializar:', (err && err.message) || err);
      console.info('[SnapFilter] El photobooth usará el filtro de Face Mesh como fallback.');
      snap.state = -1;
    }
  }

  async function snapPause() {
    if (snap.session) { try { await snap.session.pause(); } catch (_) {} }
    if (snap.state === 2 || snap.state === 1) snap.state = 0;
  }

  /* ── Video frame for Unity ──────────────────────────────── */

  let frameCanvas = null;    // video drawn at exactly the Unity texture size
  let frameCtx = null;

  /* Draws the current webcam frame into a canvas of width x height. Uploading the <video> straight
   * fails on some webcams (e.g. OBS Virtual Camera) whose decoded frame is bigger than videoWidth x
   * videoHeight: Chrome rejects it with "Offset overflows texture dimensions" and the texture stays gray. */
  function videoFrame(width, height) {
    if (!video || video.readyState < 2) return null;
    if (!frameCanvas) {
      frameCanvas = document.createElement('canvas');
      frameCtx = frameCanvas.getContext('2d', { alpha: false });
    }
    if (frameCanvas.width !== width || frameCanvas.height !== height) {
      frameCanvas.width = width;                               // resizing clears the canvas
      frameCanvas.height = height;
    }
    frameCtx.drawImage(video, 0, 0, width, height);            // scales whatever the decoder delivers
    return frameCanvas;
  }

  return {
    start, pollHand, faceStart, faceStop, pollFace, snapStart, snapPause, videoFrame,
    video: () => video,
    snapCanvas: () => snap.canvas,
    snapState: () => snap.state,
  };
})();
