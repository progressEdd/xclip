# Roadmap: xclip Wayland Support

## Overview

This roadmap adds Wayland display server support to xclip, a cross-platform clipboard library. The work enables Linux users on Wayland systems (increasingly common) to use clipboard operations while maintaining full backward compatibility for existing X11 users and consumers like vscode-markdown-paste-image.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Detection & Backend Selection** - Detect Wayland vs X11 display servers and select appropriate clipboard backend with logging
- [ ] **Phase 2: Wayland Clipboard Implementation** - Implement clipboard operations using wl-copy backend for Wayland systems
- [ ] **Phase 3: Validation & Compatibility** - Verify no breaking changes and ensure existing consumers continue working

## Phase Details

### Phase 1: Detection & Backend Selection

**Goal**: System correctly detects display server and selects appropriate clipboard backend with clear logging for troubleshooting
**Depends on**: Nothing (first phase)
**Requirements**: DETECT-01, DETECT-02, DETECT-03, DETECT-04, BACKEND-01, BACKEND-02, BACKEND-03, BACKEND-04, LOG-01, LOG-02, LOG-03, LOG-04
**Success Criteria** (what must be TRUE):

1. Library detects Wayland when WAYLAND_DISPLAY environment variable is set
2. Library detects X11 when WAYLAND_DISPLAY is unset or XDG_SESSION_TYPE=x11
3. Library selects wl-copy backend when Wayland is detected and wl-copy is available
4. Library falls back to xclip when Wayland is detected but wl-copy is not installed
5. Library logs which display server and clipboard backend were selected for troubleshooting
   **Plans**: 3 plans in 3 waves

Plans:

- [x] 01-01: Display server detection and tool availability (Wave 1)
- [x] 01-02: Wayland clipboard and backend selection (Wave 2)
- [x] 01-03: Fix backend selection test mocking strategy (Wave 3 - gap closure)

### Phase 2: Wayland Clipboard Implementation

**Goal**: wl-copy backend performs all clipboard operations correctly with same interface as xclip
**Depends on**: Phase 1
**Requirements**: CLIP-01, CLIP-02, CLIP-03, CLIP-04
**Success Criteria** (what must be TRUE):

1. User can copy and paste plain text on Wayland systems using wl-copy backend
2. User can copy and paste HTML content on Wayland systems using wl-copy backend
3. User can copy and paste PNG images on Wayland systems using wl-copy backend
4. All clipboard operations use the same interface as existing xclip implementation
   **Plans**: 1 plan in 1 wave

Plans:

- [ ] 02-01: Rename Linux scripts to tool-specific naming (xclip*\* and wl_clipboard*\*)

### Phase 3: Validation & Compatibility

**Goal**: Existing consumers experience no disruption from Wayland support additions
**Depends on**: Phase 2
**Requirements**: COMPAT-01, COMPAT-02, COMPAT-03, COMPAT-04
**Success Criteria** (what must be TRUE):

1. All existing test suites pass without modification
2. vscode-markdown-paste-image extension works without any code changes
3. X11 users experience identical behavior to previous library version
4. No breaking changes to public API surface
   **Plans**: TBD

Plans:

- [ ] 03-01: Plan to be created

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase                               | Plans Complete | Status      | Completed  |
| ----------------------------------- | -------------- | ----------- | ---------- |
| 1. Detection & Backend Selection    | 3/3            | Complete    | 2026-03-07 |
| 2. Wayland Clipboard Implementation | 0/1            | Not started | -          |
| 3. Validation & Compatibility       | 0/1            | Not started | -          |
