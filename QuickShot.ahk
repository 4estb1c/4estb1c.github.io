; High-level:
; - Double Shift: opens QuickShot to paste from preset text (email/phone)
; - Ctrl+Shift+F: opens command palette (">"-prefixed commands)
; - Both support filtering, Enter/double-click execution, and cycling navigation
; === Data sources ===
global QuickList := ["fbicker@arrowstreetcapital.com", "9179755325"]
global CommandList := [">Paste", ">Password", ">Setup imports", ">Fullscreen"]

RunSelectedCommand() {
    global GUIOpen
    GuiControlGet, ListBox,, ListBox
    if (ListBox != "") {
        CloseGUI()
        Sleep 100
        WinActivate, A

        ; Dispatch command
        if (ListBox = ">Paste") {
            Send ^v
        } else if (ListBox = ">Fullscreen") {
            Send {F11}
        } else if (ListBox = ">Setup imports") {
            ; Save current clipboard
            ClipSaved := ClipboardAll

            ; Build text safely (Chr(37) = '%')
            text := Chr(37) . "load_ext autoreload`n"
                . Chr(37) . "autoreload 2`n"
                . "import numpy as np`n"
                . "import pandas as pd`n"
                . "import plotly.express as px"

            ; Paste it
            Clipboard := text
            ClipWait, 1
            Send ^v

            ; Restore clipboard
            Sleep, 100
            Clipboard := ClipSaved
            VarSetCapacity(ClipSaved, 0)
        } else if (ListBox = ">Password") {
            SendRaw yteWASf2nmXQ4V!
        }
    }
}

#NoEnv
#SingleInstance Force
SetBatchLines -1

global GUIOpen := false
global ListBoxItems := []
global CurrentIndex := 1
global ListBox
global MyHwnd
global Mode := "" ; either "quick" or "cmd"

; === Hotkeys ===

~Shift::
    if (A_PriorHotkey = "~Shift" and A_TimeSincePriorHotkey < 200) {
        if !GUIOpen {
            Mode := "quick"
            ShowSearchGUI(QuickList, "QuickShot [fbicker] 🎈")
        }
    }
    KeyWait, Shift
return

^+f:: ; Ctrl+Shift+F
    if !GUIOpen {
        Mode := "cmd"
        ShowSearchGUI(CommandList, "CMD Palette")
    }
return

; === GUI Logic ===

ShowSearchGUI(sourceList, title) {
    global GUIOpen, ListBoxItems, CurrentIndex, MyHwnd

    GUIOpen := true
    Gui, MyGui:New, +AlwaysOnTop +ToolWindow +HwndMyHwnd
    Gui, MyGui:Color, F5F5F5
    Gui, MyGui:Font, s10, Segoe UI

    ; Get active monitor
    WinGetPos, winX, winY,,, A
    SysGet, MonitorCount, MonitorCount
    activeMon := 1
    Loop % MonitorCount {
        SysGet, mon, Monitor, %A_Index%
        if (winX >= monLeft && winX < monRight && winY >= monTop && winY < monBottom) {
            activeMon := A_Index
            break
        }
    }
    SysGet, mon, MonitorWorkArea, %activeMon%
    guiW := 325
    guiH := 280
    guiX := monLeft + (monRight - monLeft - guiW) // 2
    guiY := monTop + (monBottom - monTop - guiH) // 3

    ; Add controls
    initialText := (Mode = "cmd") ? ">" : ""
    Gui, MyGui:Add, Edit, vSearchInput gMyGuiOnEdit w300, %initialText%
    filtered := JoinFiltered(sourceList, initialText)
    ListBoxItems := StrSplit(filtered, "|")
    CurrentIndex := 1
    Gui, MyGui:Add, ListBox, vListBox gMyGuiOnSelect w300 h220, %filtered%
    Gui, MyGui:Show, x%guiX% y%guiY% w%guiW% h%guiH%, %title%
    GuiControl, MyGui:Focus, SearchInput
    if (Mode = "cmd")
        SendInput {Right} ; move caret past ">"

    GuiControl, MyGui:Choose, ListBox, 1
    SetTimer, CheckFocusLoss, 100
    OnMessage(0x100, "HandleKeyPress")
}

CloseGUI() {
    global GUIOpen
    Gui, MyGui:Destroy
    GUIOpen := false
    SetTimer, CheckFocusLoss, Off
}

CheckFocusLoss:
    if (GUIOpen) {
        WinGet, activeID, ID, A
        if (activeID != MyHwnd)
            CloseGUI()
    }
return

MyGuiGuiEscape:
    CloseGUI()
return

MyGuiOnEdit:
    global ListBoxItems, CurrentIndex
    GuiControlGet, SearchInput,, SearchInput
    src := (Mode = "cmd") ? CommandList : QuickList
    filtered := JoinFiltered(src, SearchInput)
    ListBoxItems := StrSplit(filtered, "|")
    GuiControl, MyGui:, ListBox, |%filtered%
    CurrentIndex := 1
    GuiControl, MyGui:Choose, ListBox, 1
return

MyGuiOnSelect:
    if (A_GuiEvent = "DoubleClick") {
        if (Mode = "cmd")
            RunSelectedCommand()
        else
            SendSelectedText()
    }
return

HandleKeyPress(wParam, lParam, msg, hwnd) {
    global GUIOpen, CurrentIndex, ListBoxItems
    if (!GUIOpen)
        return

    if (wParam = 13) { ; Enter
        if (Mode = "cmd")
            RunSelectedCommand()
        else
            SendSelectedText()
        return 0
    }

    if (wParam = 38 || wParam = 40) { ; Up/Down arrows
        dir := (wParam = 38) ? -1 : 1
        CurrentIndex += dir
        CurrentIndex := Mod(ListBoxItems.MaxIndex() + CurrentIndex - 1, ListBoxItems.MaxIndex()) + 1
        GuiControl, MyGui:Choose, ListBox, %CurrentIndex%
        return 0
    }
}

JoinFiltered(arr, filter) {
    out := ""
    if (Mode = "cmd" && SubStr(filter, 1, 1) != ">")
        return ""

    clean := (Mode = "cmd") ? SubStr(filter, 2) : filter

    Loop % arr.MaxIndex() {
        val := arr[A_Index]
        if (Mode = "cmd" && SubStr(val, 1, 1) != ">")
            continue
        if (clean = "" or InStr(val, clean))
            out .= val . "|"
    }
    return RTrim(out, "|")
}

SendSelectedText() {
    global GUIOpen
    GuiControlGet, ListBox,, ListBox
    if (ListBox != "") {
        CloseGUI()
        Sleep 100
        WinActivate, A
        SendInput %ListBox%
    }
}
