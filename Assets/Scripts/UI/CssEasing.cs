using UnityEngine; // Mathf

// CSS timing functions so Unity animations follow the same curves as the web keyframes.
public static class CssEasing
{
    // CSS "ease" = cubic-bezier(0.25, 0.1, 0.25, 1).
    public static float Ease(float t)
    {
        return CubicBezier(0.25f, 0.1f, 0.25f, 1f, t); // default CSS transition curve
    }

    // CSS "ease-in-out" = cubic-bezier(0.42, 0, 0.58, 1).
    public static float EaseInOut(float t)
    {
        return CubicBezier(0.42f, 0f, 0.58f, 1f, t); // used by the looping keyframes
    }

    // CSS "ease-out" = cubic-bezier(0, 0, 0.58, 1).
    public static float EaseOut(float t)
    {
        return CubicBezier(0f, 0f, 0.58f, 1f, t); // used by the bulb flash
    }

    // The web "pop" curve cubic-bezier(0.34, 1.56, 0.64, 1), overshoots above 1.
    public static float BackOut(float t)
    {
        return CubicBezier(0.34f, 1.56f, 0.64f, 1f, t); // indicator and cursor pop
    }

    // Ping-pong 0 -> 1 -> 0 over one cycle, eased like a CSS keyframe with 0%/50%/100% stops.
    public static float PingPong(float time, float period)
    {
        float p = Mathf.Repeat(time, period) / period; // 0..1 position in the cycle
        float tri = p < 0.5f ? p * 2f : (1f - p) * 2f; // triangle wave 0..1..0
        return EaseInOut(tri);                         // each half eased (symmetric curve)
    }

    // Evaluates cubic-bezier(x1, y1, x2, y2) at progress t (solves x with Newton iterations).
    public static float CubicBezier(float x1, float y1, float x2, float y2, float t)
    {
        t = Mathf.Clamp01(t); // CSS progress is always 0..1
        float u = t;          // initial guess for the curve parameter
        for (int i = 0; i < 8; i++) // a few Newton steps are enough for UI precision
        {
            float error = Bezier(x1, x2, u) - t;  // distance from the wanted x
            float slope = BezierSlope(x1, x2, u); // dx/du
            if (Mathf.Abs(error) < 1e-5f || Mathf.Abs(slope) < 1e-6f) break; // converged or flat
            u -= error / slope;                   // Newton step
        }
        return Bezier(y1, y2, Mathf.Clamp01(u)); // y value at the solved parameter
    }

    // One axis of a cubic bezier with fixed endpoints 0 and 1.
    static float Bezier(float p1, float p2, float u)
    {
        float v = 1f - u;                                          // complement of the parameter
        return 3f * v * v * u * p1 + 3f * v * u * u * p2 + u * u * u; // Bernstein form
    }

    // Derivative of Bezier with respect to u.
    static float BezierSlope(float p1, float p2, float u)
    {
        float v = 1f - u;                                                  // complement of the parameter
        return 3f * v * v * p1 + 6f * v * u * (p2 - p1) + 3f * u * u * (1f - p2); // analytic derivative
    }
}
