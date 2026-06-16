export function Name() { return "Royal Kludge RK M87"; }
export function Publisher() { return "Thai An"; }
export function VendorId() { return 0x258A; }
export function ProductId() { return 0x01A2; }
export function Size() { return [19, 6]; }
export function DefaultPosition(){ return [0, 5]; }
export function DefaultScale(){ return 8.0; }
export function DeviceType(){ return "keyboard"; }
// Don't run alongside RK's own software (DeviceDriver.exe) — both fight over the
// vendor channel and wedge it. SignalRGB will hold off while RK's app is running.
export function ConflictingProcesses(){ return ["DeviceDriver.exe"]; }

/* global
LightingMode:readonly
forcedColor:readonly
shutdownColor:readonly
rgSwap:readonly
*/

export function ControllableParameters(){
    return [
        {"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", description: "Determines where the device's RGB comes from. Canvas pulls from the active Effect; Forced overrides it with a single color.", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
        {"property":"forcedColor", "group":"lighting", "label":"Forced Color", description: "The color used when 'Forced' Lighting Mode is enabled.", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
        {"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", description: "Color sent when the system is going to sleep / shutting down.", "min":"0", "max":"360", "type":"color", "default":"#000000"},
        {"property":"rgSwap", "group":"lighting", "label":"Swap Red and Green", description: "Toggle if the keyboard's red and green channels look swapped.", "type":"boolean", "default":"true"},
    ];
}

/*
 * ---------------------------------------------------------------------------
 * LED MAPPING  (verified against a USB capture of RK's own software)
 * ---------------------------------------------------------------------------
 * Each key has a hardware LED index = electricalColumn * 6 + electricalRow
 * (6 matrix rows, 0..5). In the live color report the three colour bytes for a
 * key live at offset 8 + index * 3 (see SendPacket).
 *
 * vKeyPositions -> where the key sits on the SignalRGB canvas (for sampling).
 * vKeys         -> the hardware LED index for that key (what we write to).
 * The two are intentionally decoupled: canvas X is not the electrical column.
 * ---------------------------------------------------------------------------
 */

const vKeyNames = [
    // Row 0 — function row
    "Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Calculator", "Print Screen", "Scroll Lock", "Pause Break",
    // Row 1 — number row
    "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_", "=+", "Backspace", "Insert", "Home", "Page Up",
    // Row 2 — QWERTY row
    "Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Delete", "End", "Page Down",
    // Row 3 — home row
    "CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter",
    // Row 4 — bottom letter row
    "Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift", "Up Arrow",
    // Row 5 — modifier row
    "Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Fn", "Menu", "Right Ctrl", "Left Arrow", "Down Arrow", "Right Arrow"
];

const vKeyPositions = [
    // Row 0
    [0,0], [2,0], [3,0], [4,0], [5,0], [6,0], [7,0], [8,0], [9,0], [10,0], [11,0], [12,0], [13,0], [15,0], [16,0], [17,0], [18,0],
    // Row 1
    [0,1], [1,1], [2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [10,1], [11,1], [12,1], [13,1], [16,1], [17,1], [18,1],
    // Row 2
    [0,2], [1,2], [2,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [10,2], [11,2], [12,2], [13,2], [16,2], [17,2], [18,2],
    // Row 3
    [0,3], [1,3], [2,3], [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [10,3], [11,3], [13,3],
    // Row 4
    [0,4], [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [10,4], [12,4], [17,4],
    // Row 5
    [0,5], [1,5], [2,5], [6,5], [10,5], [11,5], [12,5], [13,5], [16,5], [17,5], [18,5]
];

// Hardware LED index per key (index = electricalColumn * 6 + row).
const vKeys = [
    // Row 0:  Esc F1..F12        Cal PrtSc ScrLk Pause   (cols 0..12, 13,14,15,16)
    0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96,
    // Row 1:  ` 1..0 - = Back     Ins Home PgUp           (cols 0..13, 14,15,16)
    1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97,
    // Row 2:  Tab Q..P [ ] \      Del End PgDn            (cols 0..13, 14,15,16)
    2, 8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86, 92, 98,
    // Row 3:  Caps A..L ; ' Enter                         (cols 0..11, 13)
    3, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 81,
    // Row 4:  LShift Z../ RShift Up                       (cols 0..10, 13, 15)
    4, 10, 16, 22, 28, 34, 40, 46, 52, 58, 64, 82, 94,
    // Row 5:  LCtrl LWin LAlt Space RAlt Fn Menu RCtrl  Left Down Right
    5, 11, 17, 35, 59, 65, 71, 83, 89, 95, 101
];

export function LedNames() { return vKeyNames; }
export function LedPositions() { return vKeyPositions; }

// Live per-key colors stream via report 0x09 / subcommand 0x08 on the command
// collection (COL07: interface 1, usage 0x0002, usage_page 0xff02, 520-byte
// feature reports). This is the path RK uses for live effects (e.g. Music
// Visualizer); subcommand 0x06 is for writing a static profile and chokes when
// streamed. Layout: 8-byte header, then interleaved 3-byte color per LED at
// 8 + ledIndex*3, where ledIndex = col*6 + row (the same vKeys values).
const STREAM_HEADER = [0x09, 0x08, 0x00, 0x00, 0x01, 0x00, 0x7a, 0x01];
const REPORT_LENGTH = 520;            // COL07 feature-report length

// RK's live-effect config (subcommand 0x04), captured verbatim from a Music
// Visualizer session. Sent once to put the board in live-streaming mode.
const LIVE_EFFECT_CONFIG = [0x09, 0x04, 0x00, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0x03, 0x03, 0x04, 0x00, 0x00, 0x13, 0x04, 0x0b, 0x00, 0x0c, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x99, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64, 0x01, 0x01, 0x00, 0x00, 0x01, 0xff, 0xff, 0x14, 0x10, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x17, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x5a, 0xa5];

export function Initialize() {
    // Live-streaming prelude: 0x0b (session init) -> 0x84 (enter custom mode) ->
    // 0x04 (live effect config). After this the board displays the per-key
    // colours we stream as subcommand 0x08. (0x0b's time payload is left zeroed;
    // this board has no clock, so it is cosmetic.)
    device.send_report([0x09, 0x0b, 0x00, 0x00, 0x01, 0x00, 0x0e], REPORT_LENGTH);
    device.send_report([0x09, 0x84, 0x00, 0x00, 0x01, 0x00, 0x80], REPORT_LENGTH);
    device.send_report(LIVE_EFFECT_CONFIG, REPORT_LENGTH);
}

export function Render() {
    SendPacket();
}

export function Shutdown(SystemSuspending) {
    if(SystemSuspending) {
        SendPacket(true); // Apply the shutdown color on sleep/shutdown.
    }
    // Otherwise: do nothing. Keyboard reverts to hardware mode when streaming stops.
}

function SendPacket(shutdown = false) {
    const packet = new Array(REPORT_LENGTH).fill(0);
    for(let h = 0; h < STREAM_HEADER.length; h++) {
        packet[h] = STREAM_HEADER[h];
    }

    for(let iIdx = 0; iIdx < vKeys.length; iIdx++) {
        const iPxX = vKeyPositions[iIdx][0];
        const iPxY = vKeyPositions[iIdx][1];
        let col;

        if(shutdown) {
            col = hexToRgb(shutdownColor);
        } else if(LightingMode === "Forced") {
            col = hexToRgb(forcedColor);
        } else {
            col = device.color(iPxX, iPxY);
        }

        const off = 8 + vKeys[iIdx] * 3;  // interleaved 3-byte color per LED
        // rgSwap swaps R and G if hues look wrong.
        packet[off]     = rgSwap ? col[1] : col[0];
        packet[off + 1] = rgSwap ? col[0] : col[1];
        packet[off + 2] = col[2];
    }

    device.send_report(packet, REPORT_LENGTH);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}

export function Validate(endpoint) {
    // Open only the command collection COL07 (usage 0x0002 / usage_page 0xff02),
    // which carries the per-key color report (0x09). It's the sole endpoint we
    // write to, so no set_endpoint juggling is needed.
    return endpoint.interface === 1 && endpoint.usage === 0x0002 && endpoint.usage_page === 0xff02;
}

export function ImageUrl() {
    return "https://rkgamingstore.com/cdn/shop/files/RKROYALKLUDGEM8780_TKLGasketMountWirelessGamingKeyboard_1.png?v=1762463296&width=1024";
}
