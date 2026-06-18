# Royal Kludge RK M87 SignalRGB Plugin

A custom SignalRGB plugin for the **Royal Kludge RK M87** mechanical keyboard.

This plugin enables direct per-key canvas lighting control and custom color modes for the RK M87.

## Features

- **Canvas Mode**: Synchronizes per-key backlighting with the active SignalRGB effects.
- **Forced Color Mode**: Configures a single solid color override.
- **Shutdown Color**: Sets a customizable color when the system enters sleep/shutdown.
- **Red/Green Swap Toggle**: A toggle switch in case your R/G channels are inverted.
- Conflicting process detection for `DeviceDriver.exe` (Royal Kludge's official software) to prevent device control conflicts.

## Installation

1. Download the [`Royal Kludge RK M87.js`](./Royal%20Kludge%20RK%20M87.js) file from this repository.
2. Copy the file into your SignalRGB Plugins directory. Typically this is located at:
   `%userprofile%\Documents\WhirlwindFX\Plugins`
3. Restart **SignalRGB**.
4. The keyboard should be auto-detected by SignalRGB!

## Protocol Notes

A sanitized USB capture ([`m87_protocol_sanitized.pcapng`](./m87_protocol_sanitized.pcapng)) is included in this repo — it contains only the M87's vendor control interface traffic (no keystrokes or other devices), just the lighting protocol.

**Heads-up for auto-detection:** the M87 (`258A:01A2`) does *not* use the report-6 stream that the other `01xx` RK boards use. Live per-key color goes through HID feature report `0x09` on the vendor command collection (interface 1, usage `0x0002`, usage_page `0xff02`), 520-byte reports:

- **Mode-entry prelude:** `0x0b` (session) → `0x84` (enter) → `0x04` (effect config).
- **Subcommand `0x08`** = live stream, **`0x06`** = static profile write (chokes if streamed).
- **Per-key layout:** 8-byte header `09 08 00 00 01 00 7a 01`, then 3 bytes/LED at `8 + index*3`, where `index = col*6 + row`.
- It also conflicts with RK's `DeviceDriver.exe`.

## Support & Details
- **Vendor ID**: `0x258A`
- **Product ID**: `0x01A2`
- **Electrical Columns**: 19 x 6 matrix

## Disclaimer
This is a custom user plugin and is not officially affiliated with SignalRGB or Royal Kludge. Use at your own risk.
