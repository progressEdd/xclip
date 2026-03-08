---
phase: 03-unified-linux-clipboard
created: 2026-03-08
status: planning
---

# Phase 03: Unified Linux Clipboard - Context

## User Vision

**Request:** "Unified clipboard manager for linux (xorg and wayland)"

**Intent:** Consolidate `LinuxClipboard` (xclip/X11) and `WaylandClipboard` (wl-clipboard/Wayland) into a single unified class that internally handles both display servers.

## Current State

### Files

| File                       | Current Purpose                                                        |
| -------------------------- | ---------------------------------------------------------------------- |
| `src/clipboard/linux.ts`   | `LinuxClipboard` class - uses xclip\_\* scripts (X11 only)             |
| `src/clipboard/wayland.ts` | `WaylandClipboard` class - uses wl*clipboard*\* scripts (Wayland only) |
| `src/os.ts`                | `LinuxShell.getClipboard()` contains selection logic                   |

### Selection Logic (currently in os.ts)

```typescript
class LinuxShell implements IShell {
  getClipboard(): IClipboard {
    const displayServer = detectDisplayServer();
    if (displayServer === "wayland") {
      if (isToolAvailable("wl-copy")) {
        return new WaylandClipboard();
      } else if (isToolAvailable("xclip")) {
        return new LinuxClipboard(); // fallback to xclip on Wayland
      }
    }
    // X11 case
    return new LinuxClipboard();
  }
}
```

### Class Structure (both classes are nearly identical)

```
LinuxClipboard (xclip)     WaylandClipboard (wl-clipboard)
├── copyImage()            ├── copyImage()
├── copyTextPlain()        ├── copyTextPlain()
├── copyTextHtml()         ├── copyTextHtml()
├── getContentType()       ├── getContentType()
├── getImage()             ├── getImage()
├── getTextPlain()         ├── getTextPlain()
├── getTextHtml()          ├── getTextHtml()
└── onDetectType()         └── onDetectType()
```

Both classes:

- Extend `BaseClipboard`
- Use same method signatures
- Differ only in: script names + error messages in `onDetectType()`

## Proposed Design

### Unified LinuxClipboard

```typescript
class LinuxClipboard extends BaseClipboard {
  private backend: "xclip" | "wl-clipboard";
  private SCRIPT_PATH = "../../res/scripts/";

  constructor() {
    // Detect display server and tool availability at construction
    this.backend = this.detectBackend();
  }

  private detectBackend(): "xclip" | "wl-clipboard" {
    // Logic moved from os.ts
  }

  private getScriptPrefix(): string {
    return this.backend === "wl-clipboard" ? "wl_clipboard_" : "xclip_";
  }

  // Methods use this.getScriptPrefix() to build script paths
  async getTextPlain() {
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}get_clipboard_text_plain.sh`
    );
    // ...
  }
}
```

### Simplified os.ts

```typescript
class LinuxShell implements IShell {
  getClipboard(): IClipboard {
    return new LinuxClipboard(); // Unified class handles everything
  }
}
```

## Decisions (Confirmed)

| Decision         | Choice                              | Rationale                               |
| ---------------- | ----------------------------------- | --------------------------------------- |
| Class name       | Keep `LinuxClipboard`               | Canonical Linux implementation          |
| wayland.ts       | Delete                              | Internal implementation, not public API |
| Detection timing | Eager (constructor)                 | Consistent with existing patterns       |
| Structure        | Follow darwin.ts / win10.ts pattern | Same class structure as other platforms |

## Requirements

**Functional:**

- [ ] Single `LinuxClipboard` class handles both X11 and Wayland
- [ ] Automatic backend selection based on display server detection
- [ ] Graceful fallback from wl-clipboard to xclip on Wayland
- [ ] Clear error messages when no clipboard tools available

**Non-Functional:**

- [ ] No breaking changes to consumers (API remains the same)
- [ ] All existing tests pass
- [ ] Logging preserved for troubleshooting

## Out of Scope

- Manual backend selection API (auto-detect only for v1)
- Additional clipboard tools (wl-clipboard-next, etc.)
- Direct Wayland protocol support

## Success Criteria

1. Single `LinuxClipboard` class in `src/clipboard/linux.ts`
2. `src/clipboard/wayland.ts` deleted
3. `os.ts` simplified to just `return new LinuxClipboard()`
4. All clipboard operations work on both X11 and Wayland
5. All existing tests pass
6. No breaking changes to consumers
