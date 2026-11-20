// C# <-> browser glue for the WebGL build (see Assets/WebGLTemplates/EspejoMagico/TemplateData/espejo-bridge.js).
// Results are polled from C# every frame; the video and the Snap canvas are uploaded straight into
// Unity's GL textures (flipped so they are bottom-up like every Unity texture).
mergeInto(LibraryManager.library, {

  // Starts the webcam and MediaPipe Hands (web initHandTracker).
  EM_Start: function () {
    if (window.EspejoBridge) window.EspejoBridge.start();
  },

  // Webcam size once it plays, 0 before.
  EM_VideoWidth: function () {
    var v = window.EspejoBridge && window.EspejoBridge.video();
    return v && v.readyState >= 2 ? v.videoWidth : 0;
  },

  EM_VideoHeight: function () {
    var v = window.EspejoBridge && window.EspejoBridge.video();
    return v && v.readyState >= 2 ? v.videoHeight : 0;
  },

  // Uploads an HTML image source into a Unity texture of the same size; returns 1 on success.
  $EM_Upload: function (source, texId) {
    var texture = GL.textures[texId];
    if (!source || !texture) return 0;
    var previous = GLctx.getParameter(GLctx.TEXTURE_BINDING_2D);     // keep Unity's cached binding valid
    GLctx.bindTexture(GLctx.TEXTURE_2D, texture);
    GLctx.pixelStorei(GLctx.UNPACK_FLIP_Y_WEBGL, true);              // HTML sources are top-down
    GLctx.texSubImage2D(GLctx.TEXTURE_2D, 0, 0, 0, GLctx.RGBA, GLctx.UNSIGNED_BYTE, source);
    GLctx.pixelStorei(GLctx.UNPACK_FLIP_Y_WEBGL, false);
    GLctx.bindTexture(GLctx.TEXTURE_2D, previous);
    return 1;
  },

  // Copies the current webcam frame into the camera texture (through a canvas of the texture size).
  EM_UpdateVideoTexture__deps: ['$EM_Upload'],
  EM_UpdateVideoTexture: function (texId, width, height) {
    var frame = window.EspejoBridge && window.EspejoBridge.videoFrame(width, height);
    if (!frame) return 0;
    return EM_Upload(frame, texId);
  },

  // Newest hand landmarks (x, y, z floats) into a C# float[]; -1 when nothing changed, 0 when no hand.
  EM_PollHand: function (ptr, max) {
    if (!window.EspejoBridge) return -1;
    return window.EspejoBridge.pollHand(HEAPF32, ptr >> 2, max);
  },

  // Face Mesh on / off (web initFaceFilter / stopFaceFilter).
  EM_FaceStart: function () {
    if (window.EspejoBridge) window.EspejoBridge.faceStart();
  },

  EM_FaceStop: function () {
    if (window.EspejoBridge) window.EspejoBridge.faceStop();
  },

  EM_PollFace: function (ptr, max) {
    if (!window.EspejoBridge) return -1;
    return window.EspejoBridge.pollFace(HEAPF32, ptr >> 2, max);
  },

  // Snap Camera Kit: init (once) + lens for the presenter (web initSnapFilter + applySnapLens).
  EM_SnapStart: function (token, group, lens, width, height) {
    if (window.EspejoBridge) window.EspejoBridge.snapStart(UTF8ToString(token), UTF8ToString(group), UTF8ToString(lens), width, height);
  },

  // 0 idle, 1 loading, 2 ready, -1 failed.
  EM_SnapState: function () {
    return window.EspejoBridge ? window.EspejoBridge.snapState() : -1;
  },

  // Pauses the session but keeps it alive (web pauseSnapFilter).
  EM_SnapPause: function () {
    if (window.EspejoBridge) window.EspejoBridge.snapPause();
  },

  // Snap output canvas size (setRenderSize), 0 before the session exists.
  EM_SnapWidth: function () {
    var c = window.EspejoBridge && window.EspejoBridge.snapCanvas();
    return c ? c.width : 0;
  },

  EM_SnapHeight: function () {
    var c = window.EspejoBridge && window.EspejoBridge.snapCanvas();
    return c ? c.height : 0;
  },

  // Copies the Snap output canvas into a texture of the render size.
  EM_UpdateSnapTexture__deps: ['$EM_Upload'],
  EM_UpdateSnapTexture: function (texId) {
    var c = window.EspejoBridge && window.EspejoBridge.snapCanvas();
    if (!c || c.width === 0) return 0;
    return EM_Upload(c, texId);
  }
});
