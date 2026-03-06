# Codebase Structure

**Analysis Date:** 2026-03-06

## Directory Layout

```
xclip/
├── config/              # TypeScript build configurations
├── res/                 # Static resources (scripts)
│   └── scripts/         # Platform-specific clipboard scripts
├── src/                 # TypeScript source code
│   └── clipboard/       # Platform-specific implementations
├── test/                # Jest test files
│   └── test-data/       # Test fixtures (images, HTML, text)
├── tools/               # Build utilities
├── .husky/              # Git hooks
├── .github/             # GitHub workflows
└── .planning/           # GSD planning documents
```

## Directory Purposes

**src/:**

- Purpose: All TypeScript source code
- Contains: Entry point, interfaces, implementations, utilities
- Key files: `index.ts`, `os.ts`, `clipboard_interface.ts`, `utils.ts`

**src/clipboard/:**

- Purpose: Platform-specific clipboard implementations
- Contains: One class per platform (darwin, linux, win10, win32, wsl)
- Key files: `base_clipboard.ts`, `linux.ts`, `darwin.ts`, `win32.ts`

**res/scripts/:**

- Purpose: Native scripts executed by clipboard implementations
- Contains: Shell scripts (.sh), PowerShell (.ps1), AppleScripts (.applescript)
- Key files: All scripts follow `{platform}_{operation}.sh` naming

**config/:**

- Purpose: TypeScript compiler configurations for different outputs
- Contains: tsconfig variants for CJS, ESM, and type declarations
- Key files: `tsconfig.cjs.json`, `tsconfig.esm.json`, `tsconfig.types.json`

**test/:**

- Purpose: Jest test suites and test data
- Contains: Integration tests for clipboard operations
- Key files: `clipboard.test.ts`, `utils.test.ts`

**test/test-data/:**

- Purpose: Test fixtures for clipboard operations
- Contains: Sample PNG, HTML, and text files
- Key files: `test.png`, `test.html`, `test.txt`

**tools/:**

- Purpose: Build and maintenance scripts
- Contains: Node.js utilities for cleanup and package.json manipulation
- Key files: `cleanup.js`, `packagejson.js`

## Key File Locations

**Entry Points:**

- `src/index.ts`: Package public API exports
- `src/os.ts`: Platform detection and shell factory

**Configuration:**

- `tsconfig.json`: Base TypeScript configuration
- `config/tsconfig.cjs.json`: CommonJS output config
- `config/tsconfig.esm.json`: ES Module output config
- `config/tsconfig.types.json`: Type declaration output config
- `jest.config.js`: Test runner configuration

**Core Logic:**

- `src/clipboard_interface.ts`: Interface definitions (IClipboard, ClipboardType)
- `src/os.ts`: Platform detection, shell classes, command execution
- `src/utils.ts`: Shared utilities (prepareDirForFile, stripFinalNewline, base64Encode)

**Implementation:**

- `src/clipboard/base_clipboard.ts`: Abstract base class with type detection
- `src/clipboard/linux.ts`: Linux clipboard using xclip
- `src/clipboard/darwin.ts`: macOS clipboard using pbcopy/pbpaste
- `src/clipboard/win32.ts`: Windows clipboard using PowerShell
- `src/clipboard/win10.ts`: Windows 10+ specific clipboard
- `src/clipboard/wsl.ts`: WSL clipboard using Windows PowerShell

**Testing:**

- `test/clipboard.test.ts`: Integration tests for all clipboard operations
- `test/utils.test.ts`: Unit tests for utility functions

## Naming Conventions

**Files:**

- TypeScript source: `snake_case.ts` (e.g., `clipboard_interface.ts`, `base_clipboard.ts`)
- Test files: `*.test.ts` (e.g., `clipboard.test.ts`)
- Shell scripts: `{platform}_{operation}.{ext}` (e.g., `linux_get_clipboard_text_plain.sh`)
- TypeScript configs: `tsconfig.{variant}.json`

**Classes:**

- Concrete implementations: `{Platform}Clipboard` (e.g., `LinuxClipboard`, `DarwinClipboard`)
- Abstract base: `Base{Concept}` (e.g., `BaseClipboard`)
- Shell classes: `{Platform}Shell` (e.g., `LinuxShell`, `Win10Shell`)

**Interfaces:**

- Prefix with `I`: `IClipboard`, `IShell`

**Constants:**

- SCREAMING_SNAKE_CASE: `SCRIPT_PATH`

## Where to Add New Code

**New Platform Support:**

1. Create clipboard implementation: `src/clipboard/{platform}.ts`
   - Extend `BaseClipboard`
   - Implement all abstract methods
   - Implement `onDetectType()`
2. Add platform type to union in `src/os.ts`:
   ```typescript
   export type Platform =
     | "darwin"
     | "win32"
     | "win10"
     | "linux"
     | "wsl"
     | "newplatform";
   ```
3. Add shell class in `src/os.ts`:
   ```typescript
   class NewPlatformShell implements IShell {
     getClipboard(): IClipboard { return new NewPlatformClipboard(); }
     async runScript(script: string, parameters: string[]): Promise<string> { ... }
   }
   ```
4. Add case to `getShell()` switch in `src/os.ts`
5. Add detection logic to `getCurrentPlatform()` in `src/os.ts`
6. Create scripts in `res/scripts/`:
   - `{platform}_get_clipboard_text_plain.{ext}`
   - `{platform}_get_clipboard_text_html.{ext}`
   - `{platform}_get_clipboard_content_type.{ext}`
   - `{platform}_save_clipboard_png.{ext}`
   - `{platform}_set_clipboard_png.{ext}`
   - `{platform}_set_clipboard_text_plain.{ext}`
   - `{platform}_set_clipboard_text_html.{ext}`

**New Clipboard Operation:**

1. Add method to `IClipboard` interface in `src/clipboard_interface.ts`
2. Add abstract method to `BaseClipboard` in `src/clipboard/base_clipboard.ts`
3. Implement in all platform clipboard classes:
   - `src/clipboard/linux.ts`
   - `src/clipboard/darwin.ts`
   - `src/clipboard/win32.ts`
   - `src/clipboard/win10.ts`
   - `src/clipboard/wsl.ts`
4. Create platform-specific scripts in `res/scripts/`

**New Utility Function:**

1. Add to `src/utils.ts`
2. Export from `src/utils.ts`
3. Add unit test to `test/utils.test.ts`

**New Tests:**

- Integration tests: `test/clipboard.test.ts`
- Utility tests: `test/utils.test.ts`
- Test fixtures: `test/test-data/`

## Special Directories

**dist/:**

- Purpose: Build output (not in repo)
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)
- Contains: `cjs/`, `esm/`, `types/`, `res/`

**res/scripts/:**

- Purpose: Platform-specific native scripts
- Generated: No (hand-written)
- Committed: Yes
- Copied to dist during build

**.husky/:**

- Purpose: Git hooks for commitlint
- Generated: Yes (by husky install)
- Comitted: Yes

---

_Structure analysis: 2026-03-06_
