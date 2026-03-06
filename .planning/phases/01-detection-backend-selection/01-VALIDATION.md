---
phase: 01
slug: detection-backend-selection
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                     |
| ---------------------- | ----------------------------------------- | ------- | --------- |
| **Framework**          | Jest 27.5.1                               |
| **Config file**        | jest.config.js                            |
| **Quick run command**  | `npm test -- --testNamePattern="Detection | Wayland | Backend"` |
| **Full suite command** | `npm test`                                |
| **Estimated runtime**  | ~5 seconds                                |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testNamePattern="Detection|Wayland|Backend"`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                       | File Exists | Status     |
| -------- | ---- | ---- | ----------- | --------- | --------------------------------------- | ----------- | ---------- |
| 01-01-01 | 01   | 1    | DETECT-01   | unit      | `npm test -- detection.test.ts`         | ✅ W0       | ⬜ pending |
| 01-01-02 | 01   | 1    | DETECT-02   | unit      | `npm test -- detection.test.ts`         | ✅ W0       | ⬜ pending |
| 01-01-03 | 01   | 1    | DETECT-03   | unit      | `npm test -- detection.test.ts`         | ✅ W0       | ⬜ pending |
| 01-01-04 | 01   | 1    | DETECT-04   | unit      | `npm test -- detection.test.ts`         | ✅ W0       | ⬜ pending |
| 01-01-05 | 01   | 1    | BACKEND-01  | unit      | `npm test -- backend-selection.test.ts` | ❌ W0       | ⬜ pending |
| 01-01-06 | 01   | 1    | BACKEND-02  | unit      | `npm test -- backend-selection.test.ts` | ❌ W0       | ⬜ pending |
| 01-01-07 | 01   | 1    | BACKEND-03  | unit      | `npm test -- backend-selection.test.ts` | ❌ W0       | ⬜ pending |
| 01-01-08 | 01   | 1    | BACKEND-04  | unit      | `npm test -- backend-selection.test.ts` | ❌ W0       | ⬜ pending |
| 01-01-09 | 01   | 1    | LOG-01      | unit      | `npm test -- logging.test.ts`           | ❌ W0       | ⬜ pending |
| 01-01-10 | 01   | 1    | LOG-02      | unit      | `npm test -- logging.test.ts`           | ❌ W0       | ⬜ pending |
| 01-01-11 | 01   | 1    | LOG-03      | unit      | `npm test -- logging.test.ts`           | ❌ W0       | ⬜ pending |
| 01-01-12 | 01   | 1    | LOG-04      | unit      | `npm test -- logging.test.ts`           | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `test/detection.test.ts` — tests for Wayland/X11 detection logic
- [ ] `test/backend-selection.test.ts` — tests for clipboard backend selection
- [ ] `test/logging.test.ts` — tests for verbose logging output

_Existing infrastructure (Jest) covers test framework needs. New test files required for phase-specific requirements._

---

## Manual-Only Verifications

| Behavior                         | Requirement | Why Manual                        | Test Instructions                                              |
| -------------------------------- | ----------- | --------------------------------- | -------------------------------------------------------------- |
| Actual Wayland session detection | DETECT-01   | Requires real Wayland environment | 1. Run on Wayland system 2. Check logs show "Wayland detected" |
| Actual xclip fallback            | BACKEND-03  | Requires wl-copy not installed    | 1. Uninstall wl-copy 2. Verify xclip used                      |

_Core detection logic is unit-testable via mocking. Integration tests are manual._

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
