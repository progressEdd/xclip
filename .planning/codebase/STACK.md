# Technology Stack

**Analysis Date:** 2026-03-06

## Languages

**Primary:**

- TypeScript 4.9.5 - All source code

**Secondary:**

- JavaScript - Build tools, configuration scripts, shell scripts for clipboard operations

## Runtime

**Environment:**

- Node.js - Target ES2022
- Tested with Node 20.x

**Package Manager:**

- npm 10.8.2
- Lockfile: Not committed (no package-lock.json in repo)

## Frameworks

**Core:**

- None - This is a standalone library package with no framework dependencies

**Testing:**

- Jest 27.5.1 - Test runner and assertion framework
- ts-jest 27.1.5 - TypeScript preprocessor for Jest

**Build/Dev:**

- TypeScript 4.9.5 - Compiler for CJS, ESM, and type definitions
- ESLint 7.32.0 - Code linting
- Prettier 2.8.8 - Code formatting
- Husky 7.0.4 - Git hooks
- commitlint 17.6.7 - Commit message linting

## Key Dependencies

**Critical:**

- `is-wsl` 2.2.0 - Detects Windows Subsystem for Linux environment
- `shelljs` 0.8.5 - Cross-platform shell commands (used for mkdir in `src/utils.ts`)

**Infrastructure:**

- Node.js built-in modules: `os`, `child_process`, `fs`, `path`, `url` - Core operations
- External system tools: `xclip` (Linux), `powershell` (Windows), `pbpaste` (Mac) - Clipboard access

**Development:**

- `@typescript-eslint/parser` 5.48.1 - TypeScript ESLint parser
- `@typescript-eslint/eslint-plugin` 5.48.1 - TypeScript ESLint rules
- `eslint-config-prettier` 8.8.0 - Disables ESLint rules that conflict with Prettier
- `eslint-plugin-prettier` 4.2.1 - Runs Prettier as ESLint rule
- `cpx` 1.5.0 - Copies files and directories (for building `res/` directory)
- `pinst` 2.1.6 - Enables/disables git hooks during npm publish
- `ts-loader` 9.4.2 - TypeScript loader for webpack (may be unused)

## Configuration

**Environment:**

- No environment variables required
- No `.env` files
- Platform-specific system tools must be installed:
  - Linux: `xclip` command
  - Windows: `powershell` command
  - macOS: `pbpaste` command

**Build:**

- TypeScript configuration: `tsconfig.json` (base), `config/tsconfig.cjs.json` (CommonJS), `config/tsconfig.esm.json` (ES Modules), `config/tsconfig.types.json` (Type definitions)
- ESLint configuration: `.eslintrc.js`
- Prettier configuration: `.prettierrc.json`
- Jest configuration: `jest.config.js`
- Commitlint configuration: `commitlint.config.js`

**Build Outputs:**

- `dist/cjs/` - CommonJS module
- `dist/esm/` - ES Module
- `dist/types/` - TypeScript declaration files
- `dist/res/` - Resource scripts (copied from `res/`)

## Platform Requirements

**Development:**

- Node.js 20.x or compatible version
- npm or yarn package manager
- Git (for version control and hooks)

**Production:**

- Node.js runtime environment
- Platform-specific clipboard tools:
  - Linux: `xclip` must be installed (`sudo apt-get install xclip` on Ubuntu)
  - Windows: PowerShell (built-in on Windows)
  - macOS: pbpaste/pbcopy (built-in on macOS)
  - WSL: PowerShell accessible at `/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`

**Deployment:**

- Published to npm registry as `@telesoho/xclip` or `xclip`
- GitHub Actions automated publishing on version tags

---

_Stack analysis: 2026-03-06_
