# Phase 1: Detection & Backend Selection - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

System correctly detects display server (Wayland/X11) and selects appropriate clipboard backend with clear logging. This phase focuses on detection logic, backend selection, and logging - clipboard operations themselves are Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Detection Timing & Caching

- **When to detect:** Module load time (eager initialization)
  - Detection runs immediately when os.ts module loads
  - Result cached for entire process lifetime
  - Rationale: Display server rarely changes mid-session, eager init is simpler

- **Where to cache:** Static variable in os.ts
  - Module-level variable stores detection result
  - No separate cache module or class needed
  - Follows existing codebase simplicity patterns

- **Cache invalidation:** None
  - Cache persists for process lifetime
  - No refresh mechanism needed for v1
  - Matches typical desktop session behavior

### Detection Method

- **Primary indicators:** Environment variables
  - Check WAYLAND_DISPLAY for Wayland detection
  - Check XDG_SESSION_TYPE as secondary indicator
  - Use multiple methods for robustness (per PROJECT.md Key Decisions)

- **Detection approach:** Check environment variables in-memory
  - Fast operation (no shell commands needed)
  - Read via process.env in Node.js
  - No external dependencies

</decisions>

<specifics>
## Specific Ideas

- Follow existing platform detection pattern in getCurrentPlatform()
- Keep detection logic simple and fast (env vars only, no shell commands)
- Ensure detection is reliable across different Linux distributions

</specifics>

<code_context>

## Existing Code Insights

### Reusable Assets

- **getCurrentPlatform() in src/os.ts:**
  - Currently returns "linux" for all Linux systems
  - No caching - runs on every call
  - Can be extended to detect Wayland vs X11

- **Platform type in src/os.ts:**
  - Union type: "darwin" | "win32" | "win10" | "linux" | "wsl"
  - May need extension for Wayland variant

- **LinuxClipboard in src/clipboard/linux.ts:**
  - Existing Linux clipboard implementation
  - Uses xclip exclusively
  - Can serve as template for WaylandClipboard

### Established Patterns

- **Platform detection pattern:**
  - Check platform-specific indicators in getCurrentPlatform()
  - Return string literal from Platform union type
  - Simple, synchronous checks

- **Shell script naming:**
  - Pattern: {platform}\_{operation}.{ext}
  - Example: linux_get_clipboard_text_plain.sh
  - Scripts stored in res/scripts/

- **Clipboard class naming:**
  - Pattern: {Platform}Clipboard
  - Extend BaseClipboard
  - Implement IClipboard interface

### Integration Points

- **Platform detection:** src/os.ts getCurrentPlatform()
- **Shell factory:** src/os.ts getShell() - selects shell instance
- **Linux clipboard:** src/clipboard/linux.ts - needs Wayland variant or extension
- **Shell scripts:** res/scripts/linux*\*.sh - may need wayland*\*.sh variants

</code_context>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

_Phase: 01-detection-backend-selection_
_Context gathered: 2026-03-06_
