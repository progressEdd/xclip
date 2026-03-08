import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("LinuxClipboard Unified Backend", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleDebugSpy: jest.SpyInstance;
  let spawnSyncMock: jest.SpyInstance;

  beforeEach(() => {
    originalEnv = process.env;
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
    spawnSyncMock = jest.spyOn(require("child_process"), "spawnSync");
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleDebugSpy.mockRestore();
    spawnSyncMock.mockRestore();
    jest.resetModules();
  });

  describe("Backend Selection in Constructor", () => {
    it("should select wl-clipboard backend when Wayland detected and wl-copy available", () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "wl-copy") {
            return { status: 0, stdout: "/usr/bin/wl-copy", stderr: "" };
          }
        }
        return { status: 1, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");
      const clipboard = new LinuxClipboard();

      // Verify it's a LinuxClipboard instance
      expect(clipboard.constructor.name).toBe("LinuxClipboard");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Selected wl-clipboard backend for Wayland")
      );
    });

    it("should select xclip backend when X11 detected and xclip available", () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "xclip") {
            return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
          }
        }
        return { status: 1, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv };
      delete process.env.WAYLAND_DISPLAY;
      delete process.env.XDG_SESSION_TYPE;
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");
      const clipboard = new LinuxClipboard();

      expect(clipboard.constructor.name).toBe("LinuxClipboard");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Selected xclip backend for X11")
      );
    });

    it("should fallback to xclip when Wayland detected but wl-copy unavailable", () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "wl-copy") {
            return { status: 1, stdout: "", stderr: "not found" };
          }
          if (args[1] === "xclip") {
            return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
          }
        }
        return { status: 1, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");
      const clipboard = new LinuxClipboard();

      expect(clipboard.constructor.name).toBe("LinuxClipboard");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("falling back to xclip")
      );
    });

    it("should throw error when no clipboard tools available on Wayland", () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          return { status: 1, stdout: "", stderr: "not found" };
        }
        return { status: 1, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");

      expect(() => new LinuxClipboard()).toThrow(/No clipboard tool available/);
    });

    it("should throw error when xclip not available on X11", () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          return { status: 1, stdout: "", stderr: "not found" };
        }
        return { status: 1, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv };
      delete process.env.WAYLAND_DISPLAY;
      delete process.env.XDG_SESSION_TYPE;
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");

      expect(() => new LinuxClipboard()).toThrow(/xclip not installed/);
    });
  });

  describe("LinuxClipboard with wl-clipboard backend", () => {
    it("should copy text using wl-clipboard scripts", async () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v" && args[1] === "wl-copy") {
          return { status: 0, stdout: "/usr/bin/wl-copy", stderr: "" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");
      const clipboard = new LinuxClipboard();

      const tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, "test text");

      const result = await clipboard.copyTextPlain(
        new URL(`file://${tmpFile}`)
      );

      fs.unlinkSync(tmpFile);
      expect(result).toBe(true);
    });

    it("should get text using wl-clipboard scripts", async () => {
      const testText = "wayland-test-text";

      spawnSyncMock.mockImplementation(
        (cmd: string, args: string[], options: any) => {
          if (cmd === "command" && args[0] === "-v" && args[1] === "wl-copy") {
            return { status: 0, stdout: "/usr/bin/wl-copy", stderr: "" };
          }
          if (cmd === "sh") {
            return { status: 0, stdout: testText, stderr: "" };
          }
          return { status: 0, stdout: "", stderr: "" };
        }
      );

      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");
      const clipboard = new LinuxClipboard();

      const result = await clipboard.getTextPlain();
      expect(typeof result).toBe("string");
    });
  });

  describe("LinuxClipboard with xclip backend", () => {
    it("should copy text using xclip scripts", async () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v" && args[1] === "xclip") {
          return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      process.env = { ...originalEnv };
      delete process.env.WAYLAND_DISPLAY;
      jest.resetModules();

      const { LinuxClipboard } = require("../src/clipboard/linux");
      const clipboard = new LinuxClipboard();

      const tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, "test text");

      const result = await clipboard.copyTextPlain(
        new URL(`file://${tmpFile}`)
      );

      fs.unlinkSync(tmpFile);
      expect(result).toBe(true);
    });
  });
});

describe("LinuxShell Integration", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleDebugSpy: jest.SpyInstance;
  let spawnSyncMock: jest.SpyInstance;

  beforeEach(() => {
    originalEnv = process.env;
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
    spawnSyncMock = jest.spyOn(require("child_process"), "spawnSync");
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleDebugSpy.mockRestore();
    spawnSyncMock.mockRestore();
    jest.resetModules();
  });

  it("should return LinuxClipboard from LinuxShell.getClipboard()", () => {
    spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === "command" && args[0] === "-v" && args[1] === "xclip") {
        return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
      }
      return { status: 1, stdout: "", stderr: "" };
    });

    process.env = { ...originalEnv };
    delete process.env.WAYLAND_DISPLAY;
    jest.resetModules();

    const { getShell } = require("../src/os");
    const shell = getShell();
    const clipboard = shell.getClipboard();

    expect(clipboard.constructor.name).toBe("LinuxClipboard");
  });

  it("should return LinuxClipboard with wl-clipboard backend when Wayland detected", () => {
    spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === "command" && args[0] === "-v") {
        if (args[1] === "wl-copy") {
          return { status: 0, stdout: "/usr/bin/wl-copy", stderr: "" };
        }
      }
      return { status: 1, stdout: "", stderr: "" };
    });

    process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };
    jest.resetModules();

    const { getShell } = require("../src/os");
    const shell = getShell();
    const clipboard = shell.getClipboard();

    expect(clipboard.constructor.name).toBe("LinuxClipboard");
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining("Selected wl-clipboard backend for Wayland")
    );
  });
});
