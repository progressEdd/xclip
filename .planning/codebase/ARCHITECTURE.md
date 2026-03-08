# Architecture

**Analysis Date:** 2026-03-06

## Pattern Overview

**Overall:** Strategy Pattern with Factory

**Key Characteristics:**

- Platform-specific implementations via inheritance from abstract base
- Runtime platform detection and factory-based instantiation
- External script execution for native clipboard operations
- Interface-driven design with strong TypeScript typing

## Layers

**Public API Layer:**

- Purpose: Exports public interface for consumers
- Location: `src/index.ts`
- Contains: Re-exports of types, interfaces, and factory functions
- Depends on: All other layers
- Used by: External consumers via npm package

**Platform Detection Layer:**

- Purpose: Detects runtime platform and provides shell instances
- Location: `src/os.ts`
- Contains: Platform detection logic, shell classes, command execution
- Depends on: Interface layer, implementation layer
- Used by: Public API layer, implementation layer

**Interface Layer:**

- Purpose: Defines contracts for clipboard and shell operations
- Location: `src/clipboard_interface.ts`
- Contains: IClipboard interface, ClipboardType enum
- Depends on: Node.js built-ins
- Used by: All layers

**Implementation Layer:**

- Purpose: Platform-specific clipboard implementations
- Location: `src/clipboard/`
- Contains: Concrete clipboard classes extending BaseClipboard
- Depends on: Interface layer, platform detection layer, script layer
- Used by: Platform detection layer (via shell classes)

**Script Layer:**

- Purpose: Native scripts for clipboard operations
- Location: `res/scripts/`
- Contains: Shell scripts (.sh), PowerShell scripts (.ps1), AppleScripts (.applescript)
- Depends on: OS-specific clipboard tools (xclip, pbcopy, powershell)
- Used by: Implementation layer

## Data Flow

**Copy Operation:**

1. Consumer calls `shell.getClipboard()` to get platform-specific clipboard
2. Consumer calls `clipboard.copyTextPlain(fileUrl)` with file URL
3. Clipboard implementation resolves file path and locates script
4. Clipboard calls `shell.runScript(scriptPath, params)`
5. Shell spawns child process with appropriate command
6. Script interacts with OS clipboard
7. Result (success/failure) bubbles back to consumer

**Paste Operation:**

1. Consumer calls `shell.getClipboard()`
2. Consumer calls `clipboard.getTextPlain()`
3. Clipboard implementation locates appropriate script
4. Clipboard calls `shell.runScript(scriptPath)`
5. Shell spawns child process, captures stdout
6. Script outputs clipboard content to stdout
7. Clipboard strips final newline and returns content

**State Management:**

- Stateless: All operations are independent
- Clipboard state managed by OS, not library
- No caching or internal state tracking

## Key Abstractions

**IClipboard Interface:**

- Purpose: Defines clipboard operations contract
- Examples: `src/clipboard_interface.ts`
- Pattern: Interface with 7 methods for copy/paste operations

**BaseClipboard Abstract Class:**

- Purpose: Shared clipboard type detection logic
- Examples: `src/clipboard/base_clipboard.ts`
- Pattern: Template Method - defines detectType algorithm, delegates onDetectType to subclasses

**IShell Interface:**

- Purpose: Abstracts shell execution and clipboard creation
- Examples: `src/os.ts`
- Pattern: Factory Method - getClipboard() creates platform-specific clipboard

**Platform Enum:**

- Purpose: Type-safe platform identification
- Examples: `src/os.ts` (Platform type)
- Pattern: Union type for compile-time platform checking

## Entry Points

**Package Entry:**

- Location: `src/index.ts`
- Triggers: `import` from consumer code
- Responsibilities: Re-exports public API surface

**Platform Detection:**

- Location: `src/os.ts` (`getCurrentPlatform()`)
- Triggers: Any clipboard operation
- Responsibilities: Determines runtime environment

**Command Execution:**

- Location: `src/os.ts` (`runCommand()`)
- Triggers: Shell script operations
- Responsibilities: Spawns child processes, handles timeouts, captures output

## Error Handling

**Strategy:** Try-catch with boolean fallback

**Patterns:**

- Copy operations return `Promise<boolean>` - true on success, false on failure
- Get operations throw on critical errors, return empty string for missing content
- Process timeout (10s default) prevents hanging on unresponsive scripts
- Console.error for user-facing issues (e.g., "xclip not installed")

## Cross-Cutting Concerns

**Logging:** Console.debug for operation details, console.error for user issues

**Validation:**

- File path validation via fileURLToPath
- Platform validation at detection time
- Command timeout prevents infinite waits

**Authentication:** Not applicable - no external services

**Process Management:**

- spawn for non-blocking execution
- Timeout handling with process.kill
- stdout/stderr stream aggregation

---

_Architecture analysis: 2026-03-06_
