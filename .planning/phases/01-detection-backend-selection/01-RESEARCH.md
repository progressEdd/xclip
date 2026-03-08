# Phase 1: Detection & Backend Selection - Research

**Researched:** 2026-03-06
**Domain:** Linux display server detection, clipboard backend selection, logging
**Confidence:** HIGH

## Summary

This phase implements automatic detection of Linux display servers (Wayland vs X11) and selects the appropriate clipboard backend (wl-clipboard or xclip). The implementation follows existing platform detection patterns in `src/os.ts`, uses environment variable checks (`WAYLAND_DISPLAY`, `XDG_SESSION_TYPE`) for display server detection, and extends the `LinuxShell`/`LinuxClipboard` pattern to support Wayland-specific implementations.

**Primary recommendation:** Extend `getCurrentPlatform()` in `src/os.ts` to detect and cache display server type, then create `WaylandClipboard` class mirroring `LinuxClipboard` pattern using wl-copy/wl-paste commands.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

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

- **Primary indicators:** Environment variables
  - Check WAYLAND_DISPLAY for Wayland detection
  - Check XDG_SESSION_TYPE as secondary indicator
  - Use multiple methods for robustness

- **Detection approach:** Check environment variables in-memory
  - Fast operation (no shell commands needed)
  - Read via process.env in Node.js
  - No external dependencies

### Claude's Discretion

None specified - all detection decisions were locked.

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID         | Description                                                              | Research Support                                             |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| DETECT-01  | System detects Wayland vs X11 display server automatically               | Env var checks: `WAYLAND_DISPLAY` and `XDG_SESSION_TYPE`     |
| DETECT-02  | Detection checks WAYLAND_DISPLAY environment variable                    | Primary indicator - if set, Wayland is active                |
| DETECT-03  | Detection checks XDG_SESSION_TYPE environment variable                   | Secondary indicator - value "wayland" or "x11"               |
| DETECT-04  | Detection uses multiple methods for robustness                           | Combine WAYLAND_DISPLAY + XDG_SESSION_TYPE checks            |
| BACKEND-01 | System selects wl-copy backend when Wayland is detected                  | Check `command -v wl-copy` availability before selection     |
| BACKEND-02 | System selects xclip backend when X11 is detected                        | Existing LinuxClipboard implementation                       |
| BACKEND-03 | System falls back to xclip if Wayland detected but wl-copy not installed | Tool availability check with fallback logic                  |
| BACKEND-04 | System reports clear error if neither tool is available                  | Throw descriptive error after checking both tools            |
| LOG-01     | System logs which display server was detected (Wayland/X11)              | Use `console.debug()` consistent with existing codebase      |
| LOG-02     | System logs which clipboard backend was selected (wl-copy/xclip)         | Log after selection decision made                            |
| LOG-03     | System logs fallback events when expected tool not available             | Log warning when falling back                                |
| LOG-04     | Logs are verbose enough for troubleshooting but not overwhelming         | Use `console.debug()` for info, `console.error()` for errors |

</phase_requirements>

## Standard Stack

### Core

| Library             | Version  | Purpose            | Why Standard                             |
| ------------------- | -------- | ------------------ | ---------------------------------------- |
| TypeScript          | 4.9.5    | Language           | Existing codebase uses strict TypeScript |
| Node.js process.env | Built-in | Environment access | Native, no dependencies needed           |
| xclip               | 0.13+    | X11 clipboard      | Existing implementation dependency       |
| wl-clipboard        | 2.2+     | Wayland clipboard  | Standard Wayland clipboard tools         |

### Supporting

| Library | Version | Purpose              | When to Use            |
| ------- | ------- | -------------------- | ---------------------- |
| Jest    | 27.5.1  | Testing              | Unit/integration tests |
| ts-jest | 27.1.5  | TypeScript transform | Test compilation       |

### External Tools Required

| Tool             | Package        | Purpose                      | Install Command                                       |
| ---------------- | -------------- | ---------------------------- | ----------------------------------------------------- |
| xclip            | `xclip`        | X11 clipboard operations     | `apt install xclip` / `pacman -S xclip`               |
| wl-copy/wl-paste | `wl-clipboard` | Wayland clipboard operations | `apt install wl-clipboard` / `pacman -S wl-clipboard` |

**No new npm dependencies needed** - use existing Node.js APIs.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── os.ts                    # Extend getCurrentPlatform(), add display server detection
├── clipboard/
│   ├── linux.ts             # Existing X11 clipboard (may rename to x11.ts)
│   └── wayland.ts           # NEW: Wayland clipboard implementation
res/scripts/
├── linux_*.sh               # Existing xclip scripts
├── wayland_*.sh             # NEW: wl-copy/wl-paste scripts
```

### Pattern 1: Display Server Detection

**What:** Eager detection with caching at module load
**When to use:** When platform detection is needed for clipboard backend selection
**Example:**

```typescript
// Source: Existing src/os.ts pattern + new detection logic
type DisplayServer = "wayland" | "x11" | "unknown";

// Module-level cache (eager initialization)
let cachedDisplayServer: DisplayServer | null = null;

function detectDisplayServer(): DisplayServer {
  if (cachedDisplayServer !== null) {
    return cachedDisplayServer;
  }

  // Primary: Check WAYLAND_DISPLAY
  if (process.env.WAYLAND_DISPLAY) {
    cachedDisplayServer = "wayland";
    console.debug(
      `[xclip] Detected Wayland via WAYLAND_DISPLAY=${process.env.WAYLAND_DISPLAY}`,
    );
    return cachedDisplayServer;
  }

  // Secondary: Check XDG_SESSION_TYPE
  const sessionType = process.env.XDG_SESSION_TYPE;
  if (sessionType === "wayland") {
    cachedDisplayServer = "wayland";
    console.debug(
      `[xclip] Detected Wayland via XDG_SESSION_TYPE=${sessionType}`,
    );
    return cachedDisplayServer;
  }

  // Default to X11
  cachedDisplayServer = "x11";
  console.debug(`[xclip] Detected X11 (no Wayland indicators found)`);
  return cachedDisplayServer;
}
```

### Pattern 2: Tool Availability Check

**What:** Check if clipboard tool is installed before using
**When to use:** Backend selection and fallback logic
**Example:**

```typescript
// Source: Pattern from existing shell scripts + Node.js spawn
import { spawnSync } from "child_process";

function isToolAvailable(toolName: string): boolean {
  try {
    const result = spawnSync("command", ["-v", toolName], {
      shell: true,
      encoding: "utf-8",
    });
    return result.status === 0;
  } catch {
    return false;
  }
}
```

### Pattern 3: Backend Selection with Fallback

**What:** Select clipboard backend based on display server and tool availability
**When to use:** When initializing clipboard for Linux
**Example:**

```typescript
// Source: Extends existing getShell().getClipboard() pattern
function getLinuxClipboard(): IClipboard {
  const displayServer = detectDisplayServer();

  if (displayServer === "wayland") {
    if (isToolAvailable("wl-copy")) {
      console.debug("[xclip] Selected wl-copy backend for Wayland");
      return new WaylandClipboard();
    } else if (isToolAvailable("xclip")) {
      console.debug(
        "[xclip] Warning: Wayland detected but wl-copy not found, falling back to xclip",
      );
      return new LinuxClipboard(); // XWayland clipboard
    } else {
      throw new Error(
        "No clipboard tool available. Install wl-clipboard or xclip.",
      );
    }
  }

  // X11
  if (isToolAvailable("xclip")) {
    console.debug("[xclip] Selected xclip backend for X11");
    return new LinuxClipboard();
  }

  throw new Error("xclip not installed. Run: apt install xclip");
}
```

### Pattern 4: Shell Script Structure

**What:** Consistent shell script pattern for clipboard operations
**When to use:** Creating Wayland clipboard scripts
**Example:**

```bash
#!/bin/sh
# res/scripts/wayland_get_clipboard_text_plain.sh

# Require wl-paste
command -v wl-paste >/dev/null 2>&1 || { echo "no wl-paste" >&1; exit 1; }

# Get clipboard text
wl-paste --no-newline
```

```bash
#!/bin/sh
# res/scripts/wayland_set_clipboard_text_plain.sh

# Require wl-copy
command -v wl-copy >/dev/null 2>&1 || { echo "no wl-copy" >&1; exit 1; }

# Set clipboard text from file
wl-copy < "$1"
```

### Anti-Patterns to Avoid

- **Shell command for detection:** Don't use shell commands to check env vars - use `process.env` directly
- **Detection on every call:** Don't re-detect on every clipboard operation - cache at module load
- **Silent fallback:** Don't fall back without logging - users need to know what backend is used
- **Platform type explosion:** Don't add "linux-wayland" as separate Platform type - keep display server detection separate from platform detection

## Don't Hand-Roll

| Problem                  | Don't Build                 | Use Instead                                                  | Why                       |
| ------------------------ | --------------------------- | ------------------------------------------------------------ | ------------------------- |
| Display server detection | Parse /proc or run loginctl | `process.env.WAYLAND_DISPLAY`, `process.env.XDG_SESSION_TYPE | Simpler, faster, standard |
| Tool availability check  | Parse which output          | `spawnSync("command -v")`                                    | Standard shell idiom      |
| Clipboard logging        | Custom logger               | `console.debug()`, `console.error()`                         | Existing codebase pattern |

**Key insight:** The display server detection is trivial - just environment variable checks. Don't over-engineer.

## Common Pitfalls

### Pitfall 1: XWayland Fallback Confusion

**What goes wrong:** When Wayland is detected but wl-copy isn't installed, xclip might not work correctly under pure Wayland (no XWayland)

**Why it happens:** xclip requires X11; under pure Wayland without XWayland, it fails silently or hangs

**How to avoid:**

- Log warning when falling back to xclip under Wayland
- Consider checking for DISPLAY env var before falling back to xclip
- Document that wl-clipboard is preferred for Wayland

**Warning signs:** User reports clipboard not working after upgrading to Wayland

### Pitfall 2: Environment Variable Race Condition

**What goes wrong:** Caching display server detection at module load but the env vars change later

**Why it happens:** Theoretically possible if process modifies env vars, though rare in practice

**How to avoid:**

- Document that detection is cached at module load
- This is acceptable per CONTEXT.md decision (display server rarely changes mid-session)

**Warning signs:** None - this is expected behavior per requirements

### Pitfall 3: Missing wl-clipboard Package

**What goes wrong:** User has Wayland but wl-clipboard not installed, gets confusing errors

**Why it happens:** wl-clipboard is often not installed by default with Wayland compositors

**How to avoid:**

- Clear error message: "wl-clipboard not installed. Install with: apt install wl-clipboard"
- Log fallback to xclip if available
- Document prerequisites in README

**Warning signs:** Error messages mentioning "wl-copy: command not found"

### Pitfall 4: wl-paste Blocking on Tiling Window Managers

**What goes wrong:** wl-paste hangs or shows brief window flash on some tiling WMs

**Why it happens:** wl-clipboard needs compositor support for data-control protocol; without it, uses a popup hack

**How to avoid:**

- This is a known wl-clipboard limitation (documented in man page)
- Can't be fixed in library code
- Document known issues with specific compositors

**Warning signs:** Reports of clipboard operations timing out on sway/hyprland

## Code Examples

### wl-copy Commands (from official man pages)

```bash
# Copy text
wl-copy "Hello world!"
echo "text" | wl-copy

# Copy from file
wl-copy < file.txt

# Copy with MIME type
wl-copy --type text/plain "text"
wl-copy --type image/png < image.png

# Clear clipboard
wl-copy --clear
```

### wl-paste Commands (from official man pages)

```bash
# Paste text
wl-paste

# Paste without trailing newline
wl-paste -n

# Paste to file
wl-paste > file.txt

# List available MIME types
wl-paste --list-types

# Paste specific MIME type
wl-paste --type image/png > image.png
```

### xclip Commands (existing scripts)

```bash
# Copy text
xclip -selection clipboard -i file.txt

# Paste text
xclip -selection clipboard -o

# Copy image
xclip -selection clipboard -target image/png -i image.png

# Get content types
xclip -selection clipboard -target TARGETS -o
```

## State of the Art

| Old Approach       | Current Approach         | When Changed | Impact                           |
| ------------------ | ------------------------ | ------------ | -------------------------------- |
| X11-only clipboard | Auto-detect Wayland/X11  | 2026-03      | Supports modern Wayland desktops |
| xclip only         | wl-clipboard for Wayland | 2026-03      | Native Wayland clipboard support |

**Deprecated/outdated:**

- Direct X11 clipboard access (xclip on Wayland without XWayland): Doesn't work on pure Wayland

## Open Questions

1. **Should WaylandLinuxClipboard be a separate class or extend LinuxClipboard?**
   - What we know: Existing LinuxClipboard uses shell scripts with xclip
   - What's unclear: Whether to create separate class or conditionally use different scripts
   - Recommendation: Create separate `WaylandClipboard` class following the `LinuxClipboard` pattern - cleaner separation, easier to maintain

2. **Should Platform type include Wayland variant?**
   - What we know: Current Platform = "darwin" | "win32" | "win10" | "linux" | "wsl"
   - What's unclear: Whether to add "linux-wayland" or keep display server separate
   - Recommendation: Keep display server separate from Platform type. Add internal DisplayServer type. This avoids breaking changes to public API.

3. **How to handle Wayland + XWayland edge cases?**
   - What we know: xclip may work under XWayland, but not always
   - What's unclear: Whether to prefer wl-copy even when DISPLAY is set under Wayland
   - Recommendation: If WAYLAND_DISPLAY is set, prefer wl-copy. Log fallback if using xclip under Wayland.

## Validation Architecture

### Test Framework

| Property           | Value                           |
| ------------------ | ------------------------------- |
| Framework          | Jest 27.5.1 with ts-jest 27.1.5 |
| Config file        | `jest.config.js`                |
| Quick run command  | `npm test`                      |
| Full suite command | `npm run test:cov`              |

### Phase Requirements -> Test Map

| Req ID     | Behavior                   | Test Type                 | Automated Command                         | File Exists? |
| ---------- | -------------------------- | ------------------------- | ----------------------------------------- | ------------ |
| DETECT-01  | Detect Wayland vs X11      | unit                      | `npm test -- --testPathPattern=detection` | ❌ Wave 0    |
| DETECT-02  | Check WAYLAND_DISPLAY      | unit                      | `npm test -- --testPathPattern=detection` | ❌ Wave 0    |
| DETECT-03  | Check XDG_SESSION_TYPE     | unit                      | `npm test -- --testPathPattern=detection` | ❌ Wave 0    |
| DETECT-04  | Multiple detection methods | unit                      | `npm test -- --testPathPattern=detection` | ❌ Wave 0    |
| BACKEND-01 | Select wl-copy for Wayland | unit                      | `npm test -- --testPathPattern=backend`   | ❌ Wave 0    |
| BACKEND-02 | Select xclip for X11       | unit                      | `npm test -- --testPathPattern=backend`   | ❌ Wave 0    |
| BACKEND-03 | Fallback to xclip          | unit                      | `npm test -- --testPathPattern=backend`   | ❌ Wave 0    |
| BACKEND-04 | Error when no tool         | unit                      | `npm test -- --testPathPattern=backend`   | ❌ Wave 0    |
| LOG-01     | Log display server         | unit (mock console.debug) | `npm test -- --testPathPattern=logging`   | ❌ Wave 0    |
| LOG-02     | Log backend selection      | unit (mock console.debug) | `npm test -- --testPathPattern=logging`   | ❌ Wave 0    |
| LOG-03     | Log fallback events        | unit (mock console.debug) | `npm test -- --testPathPattern=logging`   | ❌ Wave 0    |
| LOG-04     | Appropriate log verbosity  | unit (mock console.debug) | `npm test -- --testPathPattern=logging`   | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test:cov`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `test/detection.test.ts` - covers DETECT-01, DETECT-02, DETECT-03, DETECT-04
- [ ] `test/backend-selection.test.ts` - covers BACKEND-01, BACKEND-02, BACKEND-03, BACKEND-04
- [ ] `test/logging.test.ts` - covers LOG-01, LOG-02, LOG-03, LOG-04
- [ ] Mock utilities for:
  - `process.env` manipulation
  - `spawnSync` for tool availability checks
  - `console.debug`/`console.error` for logging verification

**Test strategy:**

- Mock `process.env` to test different display server configurations
- Mock `spawnSync` to test tool availability scenarios
- Mock `console.debug`/`console.error` to verify logging output
- Use Jest's `jest.restoreAllMocks()` in `beforeEach` for clean test isolation

## Sources

### Primary (HIGH confidence)

- wl-clipboard man page (Arch Linux) - https://man.archlinux.org/man/wl-clipboard.1
- wl-copy man page (Arch Linux) - https://man.archlinux.org/man/wl-copy.1
- wl-paste man page (Arch Linux) - https://man.archlinux.org/man/wl-paste.1
- GitHub: bugaevc/wl-clipboard - https://github.com/bugaevc/wl-clipboard
- Existing codebase: `src/os.ts`, `src/clipboard/linux.ts`, shell scripts

### Secondary (MEDIUM confidence)

- Existing test patterns in `test/clipboard.test.ts`
- Jest documentation for mocking environment variables

### Tertiary (LOW confidence)

- None - all claims verified with official sources

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - No new dependencies, using existing patterns
- Architecture: HIGH - Clear existing patterns to follow, minimal extension needed
- Pitfalls: HIGH - Well-documented wl-clipboard limitations, straightforward detection logic

**Research date:** 2026-03-06
**Valid until:** 30 days - stable domain (display server detection is well-established)
