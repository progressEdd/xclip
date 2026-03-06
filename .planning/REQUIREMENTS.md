# Requirements: xclip Wayland Support

**Defined:** 2026-03-06
**Core Value:** Works reliably across all major platforms with no breaking changes - existing consumers must continue to work without modification.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Wayland Detection

- [ ] **DETECT-01**: System detects Wayland vs X11 display server automatically
- [ ] **DETECT-02**: Detection checks WAYLAND_DISPLAY environment variable
- [ ] **DETECT-03**: Detection checks XDG_SESSION_TYPE environment variable
- [ ] **DETECT-04**: Detection uses multiple methods for robustness

### Clipboard Backend Selection

- [ ] **BACKEND-01**: System selects wl-copy backend when Wayland is detected
- [ ] **BACKEND-02**: System selects xclip backend when X11 is detected
- [ ] **BACKEND-03**: System falls back to xclip if Wayland detected but wl-copy not installed
- [ ] **BACKEND-04**: System reports clear error if neither tool is available

### Clipboard Operations

- [ ] **CLIP-01**: wl-copy backend supports text clipboard operations (copy/paste plain text)
- [ ] **CLIP-02**: wl-copy backend supports HTML clipboard operations (copy/paste HTML)
- [ ] **CLIP-03**: wl-copy backend supports image clipboard operations (copy/paste PNG)
- [ ] **CLIP-04**: All clipboard operations maintain same interface as existing xclip implementation

### Logging and Diagnostics

- [ ] **LOG-01**: System logs which display server was detected (Wayland/X11)
- [ ] **LOG-02**: System logs which clipboard backend was selected (wl-copy/xclip)
- [ ] **LOG-03**: System logs fallback events when expected tool not available
- [ ] **LOG-04**: Logs are verbose enough for troubleshooting but not overwhelming

### Compatibility

- [ ] **COMPAT-01**: No breaking changes to existing public API
- [ ] **COMPAT-02**: Existing X11 users experience no behavior changes
- [ ] **COMPAT-03**: Library works seamlessly with vscode-markdown-paste-image extension
- [ ] **COMPAT-04**: All existing tests continue to pass

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Configuration

- **CONFIG-01**: Allow users to manually override clipboard backend selection
- **CONFIG-02**: Provide configuration options for preferred fallback order

### Extended Wayland Support

- **WAYLAND-01**: Support additional Wayland clipboard tools (wl-clipboard-next, etc.)
- **WAYLAND-02**: Direct Wayland protocol support without external tools

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                 | Reason                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| GUI interface           | This is a library only - no user interface needed                |
| CLI interface           | This is a library only - consumers provide CLI if needed         |
| Clipboard history       | Stateless library design - history is a separate concern         |
| Persistence             | Stateless library design - persistence is a separate concern     |
| Manual configuration    | Auto-detect is sufficient for v1 - configuration adds complexity |
| Direct Wayland protocol | External tools (wl-copy/wl-paste) are sufficient and simpler     |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| DETECT-01   | Phase 1 | Pending |
| DETECT-02   | Phase 1 | Pending |
| DETECT-03   | Phase 1 | Pending |
| DETECT-04   | Phase 1 | Pending |
| BACKEND-01  | Phase 1 | Pending |
| BACKEND-02  | Phase 1 | Pending |
| BACKEND-03  | Phase 1 | Pending |
| BACKEND-04  | Phase 1 | Pending |
| CLIP-01     | Phase 1 | Pending |
| CLIP-02     | Phase 1 | Pending |
| CLIP-03     | Phase 1 | Pending |
| CLIP-04     | Phase 1 | Pending |
| LOG-01      | Phase 1 | Pending |
| LOG-02      | Phase 1 | Pending |
| LOG-03      | Phase 1 | Pending |
| LOG-04      | Phase 1 | Pending |
| COMPAT-01   | Phase 1 | Pending |
| COMPAT-02   | Phase 1 | Pending |
| COMPAT-03   | Phase 1 | Pending |
| COMPAT-04   | Phase 1 | Pending |

**Coverage:**

- v1 requirements: 20 total
- Mapped to phases: 0
- Unmapped: 20 ⚠️

---

_Requirements defined: 2026-03-06_
_Last updated: 2026-03-06 after initial definition_
