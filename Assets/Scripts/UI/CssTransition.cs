using System;      // Func
using UnityEngine; // Mathf

// One animated float that behaves like a CSS "transition": changing the target restarts
// the animation from the current value with the given duration and timing function.
public class CssTransition
{
    readonly float _duration;          // transition-duration in seconds
    readonly Func<float, float> _ease; // transition-timing-function
    float _from;                       // value when the last change started
    float _to;                         // target value
    float _start;                      // time the last change started

    public float Target => _to;        // current target

    // Creates a transition resting at an initial value.
    public CssTransition(float value, float duration, Func<float, float> ease)
    {
        _from = _to = value;           // at rest
        _duration = duration;          // seconds
        _ease = ease ?? (t => t);      // linear when no curve is given
        _start = -999f;                // finished long ago
    }

    // Sets a new target; animates from the current value (like changing a CSS property mid-transition).
    public void SetTarget(float target, float now)
    {
        if (Mathf.Approximately(target, _to)) return; // nothing changes
        _from = Evaluate(now);                         // continue from where it is
        _to = target;                                  // new destination
        _start = now;                                  // restart the clock
    }

    // Jumps to a value without animating.
    public void Snap(float value)
    {
        _from = _to = value; // no interpolation
        _start = -999f;      // finished
    }

    // Value at the given time.
    public float Evaluate(float now)
    {
        if (_duration <= 0f) return _to;                          // instant transition
        float k = Mathf.Clamp01((now - _start) / _duration);      // progress 0..1
        return Mathf.LerpUnclamped(_from, _to, _ease(k));         // eased value (may overshoot)
    }
}
