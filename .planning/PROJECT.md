# xclip - Cross-Platform Clipboard Library

## What This Is

A cross-platform clipboard library for Node.js that supports text and image operations across Windows, macOS, Linux, and WSL. Used by vscode-markdown-paste-image extension to enable clipboard paste functionality in markdown documents.

## Core Value

Works reliably across all major platforms with no breaking changes - existing consumers (like vscode-markdown-paste-image) must continue to work without modification.

## Requirements

### Validated

- ✓ Cross-platform clipboard support (Windows, macOS, Linux, WSL) — existing
- ✓ Text clipboard operations (plain text, HTML) — existing
- ✓ Image clipboard operations (PNG) — existing
- ✓ Platform detection and appropriate clipboard selection — existing
- ✓ Strategy pattern with factory-based instantiation — existing
- ✓ Shell script execution layer for native clipboard operations — existing
- ✓ TypeScript with proper typing and multiple module formats (CJS, ESM, types) — existing
- ✓ Robust error handling with boolean fallbacks — existing

### Active

- [ ] Support wl-copy for Wayland-based Linux systems
- [ ] Detect Wayland vs X11 display servers using multiple methods (WAYLAND_DISPLAY, XDG_SESSION_TYPE)
- [ ] Fallback to xclip if wl-copy is not available on Wayland systems
- [ ] Add verbose logging for troubleshooting clipboard backend selection
- [ ] Ensure no breaking changes for existing consumers

### Out of Scope

- GUI or CLI interface — this is a library only
- Configuration API for users to manually select clipboard backend — auto-detect only
- Clipboard history or persistence features — stateless library
- Direct Wayland protocol support — using command-line tools (wl-copy/wl-paste) only

## Context

This is a well-established cross-platform clipboard library with a clean architecture using the Strategy pattern. Each platform has its own clipboard implementation (LinuxClipboard, DarwinClipboard, Win10Clipboard, etc.) that executes platform-specific shell scripts.

**Current limitation:** Linux support is hardcoded to xclip, which only works on X11. Wayland-based Linux systems (increasingly common) cannot use this library.

**Architecture highlights:**

- Platform detection in `src/os.ts` determines runtime environment
- Shell classes provide factory methods for clipboard instances
- Clipboard implementations delegate to shell scripts in `res/scripts/`
- Stateless design - all operations independent

**Key consumer:** vscode-markdown-paste-image extension - must maintain backward compatibility.

## Constraints

- **Backward Compatibility**: Cannot break existing API or change behavior for X11 users
- **Architecture**: Must fit into existing Strategy pattern and shell script execution model
- **Dependencies**: Minimal - rely on system tools (xclip, wl-copy) rather than adding heavy dependencies
- **Platform Support**: Must continue working on all existing platforms while adding Wayland support

## Key Decisions

| Decision                                                       | Rationale                                            | Outcome   |
| -------------------------------------------------------------- | ---------------------------------------------------- | --------- |
| Auto-detect Wayland vs X11                                     | Users shouldn't need to configure - just works       | — Pending |
| Multiple detection methods (WAYLAND_DISPLAY, XDG_SESSION_TYPE) | More robust than single check                        | — Pending |
| Fallback to xclip if wl-copy missing                           | Graceful degradation for systems with both installed | — Pending |
| Verbose logging for backend selection                          | Helps troubleshooting in mixed environments          | — Pending |

---

_Last updated: 2026-03-06 after initialization_
