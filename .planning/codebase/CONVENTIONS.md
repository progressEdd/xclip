# Coding Conventions

**Analysis Date:** 2026-03-06

## Naming Patterns

**Files:**

- Use `snake_case` for all TypeScript files
- Examples: `clipboard_interface.ts`, `base_clipboard.ts`, `win10.ts`

**Classes:**

- Use `PascalCase` for class names
- Examples: `DarwinClipboard`, `Win10Clipboard`, `LinuxShell`

**Interfaces:**

- Use `PascalCase` with "I" prefix for interfaces
- Examples: `IClipboard`, `IShell`

**Functions:**

- Use `camelCase` for function names
- Examples: `getCurrentPlatform()`, `getShell()`, `runCommand()`

**Variables:**

- Use `camelCase` for local variables and parameters
- Examples: `imageFilePath`, `detectedTypes`, `errorMessage`

**Constants:**

- Use `SCREAMING_SNAKE_CASE` for class-level constants
- Examples: `SCRIPT_PATH` in clipboard classes

**Enums:**

- Use `PascalCase` for enum names and values
- Example: `ClipboardType.Text`, `ClipboardType.Html`, `ClipboardType.Image`

**Type Aliases:**

- Use `PascalCase` for type aliases
- Example: `type Platform = "darwin" | "win32" | "win10" | "linux" | "wsl"`

## Code Style

**Formatting:**

- Tool: Prettier with minimal configuration
- Config: `.prettierrc.json` - only sets `endOfLine: "auto"`
- EditorConfig enforces: 2-space indentation, UTF-8, LF line endings, trim trailing whitespace

**Linting:**

- Tool: ESLint with `@typescript-eslint/recommended` config
- Plugin: `eslint-plugin-prettier` - treats Prettier violations as errors
- Config: `.eslintrc.js`

**TypeScript Configuration:**

- Target: ES2022
- Strict mode: enabled
- Module resolution: Node
- Remove comments: true
- Force consistent casing in file names: true

## Import Organization

**Order:**

1. Node.js built-in modules (using `import * as` or named imports)
2. External packages
3. Internal modules (using relative paths)

**Import Styles:**

```typescript
// Node built-ins - namespace imports
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

// Node built-ins - named imports
import { spawn } from "child_process";
import { fileURLToPath, URL } from "node:url";

// External packages
import isWsl from "is-wsl";
import { mkdir } from "shelljs";

// Internal modules - relative paths
import { ClipboardType, IClipboard } from "../clipboard_interface";
import { getShell } from "../os";
import { BaseClipboard } from "./base_clipboard";
```

**Path Aliases:**

- Not configured
- All internal imports use relative paths (`../`, `./`)

## Error Handling

**Patterns:**

- Use try-catch blocks for async operations
- Catch errors with generic parameter: `catch (e)`
- Return `false` on errors in boolean-returning methods
- Return default values (e.g., `ClipboardType.Unknown`) on errors
- Throw errors for truly exceptional cases (e.g., unsupported platforms)

**Examples:**

```typescript
// Return false on error
async copyImage(imageFile: URL): Promise<boolean> {
  try {
    const shell = getShell();
    await shell.runScript(script, params);
    return true;
  } catch (e) {
    return false;
  }
}

// Return default value on error
async getContentType(): Promise<Set<ClipboardType> | ClipboardType> {
  try {
    const shell = getShell();
    const data = await shell.runScript(script);
    return this.detectType(types);
  } catch (e) {
    return ClipboardType.Unknown;
  }
}

// Throw for exceptional cases
switch (platform) {
  case "win10":
    return new Win10Shell();
  // ... other cases
  default:
    throw new Error("Unsupported platform");
}
```

## Logging

**Framework:** Console

**Patterns:**

- Use `console.debug()` for debug information
- Use `console.error()` for error messages
- Use `console.log()` for general information

**Examples:**

```typescript
console.debug("getClipboardContentType", data);
console.error("You need to install xclip command first.");
console.log("Process took too long and was killed");
```

## Comments

**When to Comment:**

- Use JSDoc comments for public functions and interfaces
- Document parameters and return values
- Explain non-obvious logic

**JSDoc/TSDoc:**

```typescript
/**
 * prepare directory for specified file.
 * @param filePath
 */
function prepareDirForFile(filePath: string) {
  // ...
}

/**
 * Run command and get stdout
 * @param shell
 * @param options
 */
export function runCommand(
  shell: string,
  options: string[],
  timeout = 10000,
): Promise<string> {
  // ...
}
```

**Inline Comments:**

- Use sparingly
- Commented-out code is present but should be removed before production

## Function Design

**Size:**

- Keep functions focused on a single responsibility
- Most functions are 5-30 lines

**Parameters:**

- Use default parameter values for optional parameters
- Example: `timeout = 10000`

**Return Values:**

- Use `Promise<T>` for async functions
- Return specific types, not `any`
- Use union types when multiple return types are possible
- Example: `Promise<Set<ClipboardType> | ClipboardType>`

**Async Patterns:**

```typescript
// Always use async/await for asynchronous operations
async getTextPlain(): Promise<string> {
  const shell = getShell();
  const data: string = await shell.runScript(script);
  return stripFinalNewline(data);
}

// Use Promise constructor for complex async operations
export function runCommand(
  shell: string,
  options: string[],
  timeout = 10000
): Promise<string> {
  return new Promise((resolve, reject) => {
    // ... implementation
  });
}
```

## Module Design

**Exports:**

- Use named exports exclusively (no default exports)
- Export at the end of the file
- Use explicit export lists

**Examples:**

```typescript
// Export at end of file
export { ClipboardType, IClipboard };

// Export individual items
export { DarwinClipboard };

// Re-export from index
export {
  ClipboardType,
  IClipboard,
  Platform,
  getCurrentPlatform,
  getShell,
  IShell,
};
```

**Barrel Files:**

- Use `index.ts` as the main entry point
- Re-export public API from index
- Location: `src/index.ts`

## Class Design

**Abstract Classes:**

- Use abstract classes for shared base implementations
- Mark methods as `abstract` when they must be implemented by subclasses
- Implement shared logic in the base class

**Example:**

```typescript
export abstract class BaseClipboard implements IClipboard {
  abstract getImage(imagePath: string): Promise<string>;
  abstract getTextPlain(): Promise<string>;
  // ... other abstract methods

  // Shared implementation
  detectType(types: string[]): Set<ClipboardType> | ClipboardType {
    if (!types) {
      return ClipboardType.Unknown;
    }
    const detectedTypes = this.onDetectType(types);
    // ... shared logic
  }
}
```

**Class Properties:**

- Use `readonly` for constants
- Use `public` by default (implicit)
- Class constants: `SCRIPT_PATH = "../../res/scripts/";`

## File Organization

**Structure:**

- One primary export per file
- Group related classes in subdirectories
- Use `index.ts` for public API surface

**Example:**

```
src/
├── index.ts                    # Main entry point, re-exports
├── clipboard_interface.ts      # Interface definitions
├── os.ts                       # Platform detection and shell management
├── utils.ts                    # Utility functions
└── clipboard/                  # Platform-specific implementations
    ├── base_clipboard.ts
    ├── darwin.ts
    ├── linux.ts
    ├── win10.ts
    ├── win32.ts
    └── wsl.ts
```

---

_Convention analysis: 2026-03-06_
