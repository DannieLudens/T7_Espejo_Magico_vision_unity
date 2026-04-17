using System;
using Mediapipe.Tasks.Vision.HandLandmarker;

namespace Mediapipe.Unity.Sample.HandLandmarkDetection
{
    public static class PinzaEventBus
    {
        public static Action<HandLandmarkerResult> OnResultado;
    }
}