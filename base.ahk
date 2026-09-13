#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.


; home key -> mouse click
Home::
Click, left
return

CapsLock::Send {Backspace}
^CapsLock::Send ^{Backspace}
!CapsLock::Send {Delete}
!^CapsLock::Send ^{Delete}


; Map IJKL + Alt to arrow keys
LAlt & u::Send {Up}
LAlt & n::Send {Left}
LAlt & e::Send {Down}
LAlt & i::Send {Right}

<^>!,::Send ö
<^>!.::Send ő
<^>!;::Send ű

#If GetKeyState("LControl", "P") && !GetKeyState("LShift", "P")
; Map IJKL + Alt + cmd to arrow keys
LAlt & u::Send ^{Up}
LAlt & n::Send ^{Left}
LAlt & e::Send ^{Down}
LAlt & i::Send ^{Right}
#If

#If GetKeyState("LShift", "P") && !GetKeyState("LControl", "P")
; Map IJKL + Alt + shift to arrow keys
LAlt & u::Send +{Up}
LAlt & n::Send +{Left}
LAlt & e::Send +{Down}
LAlt & i::Send +{Right}

#If GetKeyState("LControl", "P") && GetKeyState("LShift", "P")
; Map IJKL + Alt + shift + cmd to arrow keys
LAlt & u::Send ^+{Up}
LAlt & n::Send ^+{Left}
LAlt & e::Send ^+{Down}
LAlt & i::Send ^+{Right}
#If



#Persistent
SetTimer, ShowScancode, 1000
return

ShowScancode:
    Tooltip, % GetKeyScancode()
return

GetKeyScancode() {
    MouseGetPos,,, Control
    SendMessage, 0x418, 0, 0,, ahk_id %Control%
    return "SC" Format("{:03X}", ErrorLevel & 0xFF)
}




