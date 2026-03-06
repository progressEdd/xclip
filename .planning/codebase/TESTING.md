# Testing Patterns

**Analysis Date:** 2026-03-06

## Test Framework

**Runner:**

- Jest 27.5.1
- Config: `jest.config.js`

**Assertion Library:**

- Jest built-in matchers

**Run Commands:**

```bash
npm test                 # Run all tests
npm run test:cov         # Run tests with coverage
```

**Test Configuration:**

```javascript
// jest.config.js
module.exports = {
  roots: ["<rootDir>/test"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    // File transformer for assets
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "./config/fileTransformer.js",
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};
```

## Test File Organization

**Location:**

- Tests are in a separate `test/` directory (not co-located with source)
- Test files: `test/*.test.ts`

**Naming:**

- Pattern: `<module>.test.ts`
- Examples: `clipboard.test.ts`, `utils.test.ts`

**Structure:**

```
test/
├── clipboard.test.ts      # Integration tests for clipboard operations
├── utils.test.ts          # Unit tests for utility functions
└── test-data/             # Test fixtures
    ├── test.png
    ├── test.html
    └── test.txt
```

## Test Structure

**Suite Organization:**

```typescript
describe("clipboard tests", () => {
  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  it("get clipboard type test text", async () => {
    const shell = getShell();
    const cb = shell.getClipboard();
    await cb.copyTextPlain(test_text_url);
    await cb.getContentType().then((val) => {
      expect(val).toBe(ClipboardType.Text);
    });
  });
});
```

**Patterns:**

- Use `describe()` to group related tests
- Use `beforeEach()` for test setup
- Use `it()` for individual test cases
- Reset mocks in `beforeEach()`: `jest.resetAllMocks()`
- Set timeout for slow tests: `jest.setTimeout(10000)`

## Mocking

**Framework:** Jest built-in mocking

**Patterns:**

```typescript
// Prevent automatic mocking
jest.unmock("../src/utils");

// Use real timers (not fake timers)
jest.useRealTimers();

// Reset all mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
});
```

**What to Mock:**

- Not extensively used in current tests
- Tests appear to be integration tests using real implementations

**What NOT to Mock:**

- File system operations (use real files)
- Shell commands (use real shell execution)
- Platform detection (use actual platform)

## Fixtures and Factories

**Test Data:**

```typescript
// Define test file paths at module level
const test_png = path.join(__dirname, `./test-data/test.png`);
const test_html = path.join(__dirname, `./test-data/test.html`);
const test_text = path.join(__dirname, `./test-data/test.txt`);

// Convert to URLs for API usage
const test_png_url = pathToFileURL(test_png);
const test_html_url = pathToFileURL(test_html);
const test_text_url = pathToFileURL(test_text);
```

**Location:**

- Test fixtures stored in `test/test-data/`
- Binary and text files included
- Use `os.tmpdir()` for temporary test outputs

**Temporary Files:**

```typescript
import { tmpdir } from "os";

// Create temp file path
const tmpfile = `${tmpdir()}/shell-test/data/test.png`;
utils.prepareDirForFile(tmpfile);

// Use in test
await cb.getImage(tmpfile).then((file) => {
  expect(file).toBe(tmpfile);
  expect(fs.existsSync(tmpfile)).toBe(true);
});
```

## Coverage

**Requirements:** No enforced coverage threshold

**View Coverage:**

```bash
npm run test:cov
```

**Coverage Command:**

```json
"test:cov": "jest --coverage --forceExit --no-cache --runInBand"
```

## Test Types

**Unit Tests:**

- Located in `test/utils.test.ts`
- Test individual utility functions in isolation
- Use `jest.unmock()` to prevent mocking

**Integration Tests:**

- Located in `test/clipboard.test.ts`
- Test complete workflows with real system interactions
- Use actual clipboard operations
- Platform-specific behavior tested

**E2E Tests:**

- Not explicitly separated
- Integration tests serve as E2E tests for clipboard operations

## Common Patterns

**Async Testing:**

```typescript
// Pattern 1: async/await with expect
it("get clipboard type test text", async () => {
  const shell = getShell();
  const cb = shell.getClipboard();
  await cb.copyTextPlain(test_text_url);
  await cb.getContentType().then((val) => {
    expect(val).toBe(ClipboardType.Text);
  });
});

// Pattern 2: async/await with direct assertions
it("get clipboard content test plain text", async () => {
  const shell = getShell();
  const cb = shell.getClipboard();
  await cb.copyTextPlain(test_text_url);
  await cb.getTextPlain().then((text) => {
    const text_content = fs.readFileSync(test_text, "utf8");
    expect(text).toBe(text_content);
  });
});
```

**Error Testing:**

- Not explicitly shown in current tests
- Tests focus on happy paths

**File System Testing:**

```typescript
import * as fs from "fs";

// Read expected content
const text_content = fs.readFileSync(test_text, "utf8");
expect(text).toBe(text_content);

// Check file existence
expect(fs.existsSync(tmpfile)).toBe(true);
```

**Platform-Specific Testing:**

```typescript
// Get platform-specific implementation
const shell = getShell();
const cb = shell.getClipboard();

// Test works on current platform
await cb.copyTextPlain(test_text_url);
await cb.getTextPlain();
```

## Test Execution

**Jest Options Used:**

- `--no-cache`: Disable cache for fresh runs
- `--forceExit`: Force exit after tests complete (needed for async operations)
- `--runInBand`: Run tests serially (not in parallel)
- `--coverage`: Generate coverage report

**Pre-commit Hook:**

- Tests run automatically on pre-commit via Husky
- Config: `.husky/pre-commit`
- Command: `npm run test`

## Test Data Management

**Test Files:**

- `test/test-data/test.png` - Image file for clipboard image tests
- `test/test-data/test.html` - HTML file for clipboard HTML tests
- `test/test-data/test.txt` - Text file for clipboard text tests

**Creating Test Data:**

- Use real files with actual content
- Files are committed to repository
- Use realistic file sizes and content

## Best Practices Observed

**Test Isolation:**

- Each test is independent
- Use `beforeEach()` to reset state
- Use `jest.resetAllMocks()` to clear mocks

**Descriptive Test Names:**

- Use descriptive test names: "get clipboard type test text"
- Group related tests in describe blocks

**Realistic Testing:**

- Test with real files and real system operations
- Don't over-mock - integration tests provide more value
- Test actual clipboard operations, not mocked versions

**Timeout Management:**

- Set appropriate timeouts for slow operations
- Default: 10000ms (10 seconds)
- Use `jest.setTimeout()` in `beforeEach()`

---

_Testing analysis: 2026-03-06_
