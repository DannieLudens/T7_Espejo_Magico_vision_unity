using System;         // Action
using TMPro;          // TMP_Text
using UnityEngine;    // MonoBehaviour, Mathf
using UnityEngine.UI; // Slider

// <input type="range" min max step> with its value label (web .ctrl-row input + span).
[RequireComponent(typeof(Slider))]
public class StepSlider : MonoBehaviour
{
    [SerializeField] TMP_Text label;      // value span
    [SerializeField] float step = 1f;     // step attribute
    [SerializeField] int decimals;        // toFixed(decimals)
    [SerializeField] string suffix = "";  // "%" on the audio panel

    public event Action<float> Changed;   // 'input' event

    Slider _slider;  // Unity slider
    bool _silent;    // ignore our own snapping writes

    public float Value => Slider.value;   // current value

    Slider Slider => _slider != null ? _slider : (_slider = GetComponent<Slider>()); // lazy cache

    // Listens to user drags.
    void Awake()
    {
        Slider.onValueChanged.AddListener(OnSliderChanged); // input listener
    }

    // Sets the value from code without raising Changed (web sync of slider.value and label).
    public void SetValue(float value)
    {
        _silent = true;
        Slider.value = Snap(value);  // el.value = v
        _silent = false;
        UpdateLabel();               // lb.textContent
    }

    // Snaps to the step, updates the label and notifies.
    void OnSliderChanged(float raw)
    {
        if (_silent) return;                       // programmatic change
        float snapped = Snap(raw);                 // browsers only allow step multiples
        if (!Mathf.Approximately(snapped, raw))
        {
            _silent = true;
            Slider.value = snapped;                // move the thumb to the step
            _silent = false;
        }
        UpdateLabel();                             // textContent = v.toFixed(d)
        Changed?.Invoke(snapped);                  // set(v)
    }

    // Rounds to min + n * step.
    float Snap(float value)
    {
        float min = Slider.minValue;                                          // min attribute
        float n = Mathf.Round((value - min) / step);                           // nearest step
        return Mathf.Clamp(min + n * step, Slider.minValue, Slider.maxValue); // stay in range
    }

    // Writes the formatted value.
    void UpdateLabel()
    {
        label.text = Slider.value.ToString("F" + decimals, System.Globalization.CultureInfo.InvariantCulture) + suffix; // "0.950" / "100%"
    }
}
