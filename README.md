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

## Support & Details
- **Vendor ID**: `0x258A`
- **Product ID**: `0x01A2`
- **Electrical Columns**: 19 x 6 matrix

## Disclaimer
This is a custom user plugin and is not officially affiliated with SignalRGB or Royal Kludge. Use at your own risk.
