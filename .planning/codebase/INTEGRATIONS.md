# External Integrations

**Analysis Date:** 2026-03-06

## APIs & External Services

**None - This is a standalone library**

No external APIs or third-party services are integrated. The library operates entirely through local system clipboard commands.

## Data Storage

**Databases:**

- None

**File Storage:**

- Local filesystem only - Uses Node.js `fs` module for file operations
- Temporary file creation for clipboard image data (uses `os.tmpdir()`)

**Caching:**

- None

## Authentication & Identity

**Auth Provider:**

- None - Library does not require authentication

**NPM Publishing:**

- Auth: npm registry authentication via `NODE_AUTH_TOKEN` secret
- Implementation: GitHub Actions workflow in `.github/workflows/publish.yml`

## Monitoring & Observability

**Error Tracking:**

- None - No external error tracking services

**Logs:**

- Console logging only (`console.debug`, `console.error` in `src/clipboard/linux.ts` and `src/os.ts`)
- No structured logging framework

## CI/CD & Deployment

**Hosting:**

- npm registry - Package distributed as `xclip` or `@telesoho/xclip`
- GitHub - Source code repository

**CI Pipeline:**

- GitHub Actions
  - Test workflow: `.github/workflows/test.yml`
    - Runs on: ubuntu-latest, windows-latest, macOS-latest
    - Node version: 20.x
    - Triggers: push/PR to main/master
    - Steps: lint, test
    - Special setup: XVFB for Linux clipboard tests, `xclip` installation for Ubuntu
  - Publish workflow: `.github/workflows/publish.yml`
    - Runs on: ubuntu-latest
    - Triggers: version tags (v\*)
    - Steps: build, publish to npm
    - Creates GitHub release via `softprops/action-gh-release@v1`

**Git Hooks:**

- Husky pre-commit hook: Runs tests before commit (`.husky/pre-commit`)
- Husky commit-msg hook: Validates commit messages with commitlint (`.husky/commit-msg`)
- Hooks disabled during publish via `pinst`

## Environment Configuration

**Required env vars:**

- None for library usage
- `NPM_TOKEN` - Required for automated npm publishing (stored as GitHub secret)

**Secrets location:**

- GitHub repository secrets - `NPM_TOKEN` for npm registry authentication
- `CI` environment variable set during GitHub Actions test runs

**CI environment variables:**

- `CI=true` - Set in GitHub Actions test workflow
- `ELECTRON_NO_ATTACH_CONSOLE=1` - Set in GitHub Actions test workflow
- `DISPLAY=:99.0` - Set in GitHub Actions for Linux GUI/clipboard tests

## Webhooks & Callbacks

**Incoming:**

- None

**Outgoing:**

- None

## System Dependencies

**External Commands (Platform-Specific):**

**Linux:**

- `xclip` - Clipboard manipulation
- `sh` - Shell execution
- Scripts located in `res/scripts/linux_*.sh`

**Windows (Win10/Win32):**

- `powershell` - PowerShell execution
- Scripts located in `res/scripts/win*.ps1`

**macOS (Darwin):**

- `osascript` - AppleScript execution
- `pbpaste`, `pbcopy` - Built-in clipboard commands
- Scripts located in `res/scripts/darwin_*.applescript`

**WSL:**

- PowerShell at `/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`
- Uses Windows PowerShell scripts for clipboard operations

**Process Execution:**

- Uses Node.js `child_process.spawn()` to execute external commands
- Command timeout: 10000ms (10 seconds) - defined in `src/os.ts`

## Package Registry

**npm Registry:**

- URL: `https://registry.npmjs.org`
- Package name: `xclip` (scoped as `@telesoho/xclip`)
- Access: Public
- Publish config: `access: public` in `package.json`

---

_Integration audit: 2026-03-06_
