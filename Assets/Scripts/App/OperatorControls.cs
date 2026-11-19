using System;                    // Action
using UnityEngine;               // MonoBehaviour, Cursor
using UnityEngine.InputSystem;   // Keyboard

// Operator keyboard shortcuts of the web keydown handlers (js/app.js and js/captions.js):
// V audio panel, G card glass panel (menu only), C captions (plus the ripple panel in the mirror),
// ` system cursor. The mouse pointer is hidden like body { cursor: none } until ` restores it.
public class OperatorControls : MonoBehaviour
{
    [SerializeField] AppStateMachine machine;   // current state
    [SerializeField] OperatorPanel soundPanel;  // #sound-panel
    [SerializeField] OperatorPanel glassPanel;  // #glass-panel
    [SerializeField] MirrorScreen mirrorScreen; // owns #mirror-config

    public static bool SystemCursor { get; private set; }   // body.system-cursor
    public static event Action SystemCursorChanged;         // the standby mirror button reacts

    bool _backquoteTyped; // '`' arrived as text input this frame (dead-key layouts)

    // Hides the OS pointer like cursor: none.
    void Start()
    {
        ApplyCursor(); // initial state
    }

    // Listens to typed characters so ` works on layouts where it is a dead key.
    void OnEnable()
    {
        if (Keyboard.current != null) Keyboard.current.onTextInput += OnText; // e.key === '`'
    }

    // Stops listening.
    void OnDisable()
    {
        if (Keyboard.current != null) Keyboard.current.onTextInput -= OnText;
    }

    // Remembers a typed backquote.
    void OnText(char c)
    {
        if (c == '`') _backquoteTyped = true; // composed character
    }

    // Handles the shortcuts once per frame.
    void Update()
    {
        var keyboard = Keyboard.current;                                       // null on kiosks without keyboard
        bool backquote = _backquoteTyped;                                      // typed '`'
        _backquoteTyped = false;
        if (keyboard == null) return;
        backquote |= keyboard.backquoteKey.wasPressedThisFrame;                // US layout key

        if (backquote)                                                         // Tecla ` → cursor del sistema
        {
            SystemCursor = !SystemCursor;                                      // classList.toggle('system-cursor')
            ApplyCursor();
            SystemCursorChanged?.Invoke();
        }
        if (keyboard.vKey.wasPressedThisFrame) soundPanel.Toggle();            // Tecla V → panel de audio
        if (keyboard.gKey.wasPressedThisFrame && machine.Current == AppState.Menu) glassPanel.Toggle(); // Tecla G (menú)
        if (keyboard.cKey.wasPressedThisFrame)                                 // Tecla C (two listeners in the web)
        {
            Captions.Toggle();                                                 // captions.js
            if (machine.Current == AppState.Mirror) mirrorScreen.ToggleConfig(); // app.js ripple panel
        }
    }

    // Shows or hides the OS pointer.
    static void ApplyCursor()
    {
        Cursor.visible = SystemCursor; // cursor: auto / none
    }
}
