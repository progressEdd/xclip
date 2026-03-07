import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("WaylandClipboard Implementation", () => {
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

  describe("WaylandClipboard.copyTextPlain", () => {
    it("should successfully copy text using wl-copy", async () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v" && args[1] === "wl-copy") {
          return { status: 0, stdout: "/usr/bin/wl-copy", stderr: "" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      jest.resetModules();
      const { WaylandClipboard } = require("../src/clipboard/wayland");
      const clipboard = new WaylandClipboard();

      const tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, "test text");

      const result = await clipboard.copyTextPlain(
        new URL(`file://${tmpFile}`)
      );

      fs.unlinkSync(tmpFile);

      expect(result).toBe(true);
    });
  });

  describe("WaylandClipboard.getTextPlain", () => {
    it("should successfully retrieve text using wl-paste", async () => {
      const testText = "wayland-paste-test-text";

      spawnSyncMock.mockImplementation(
        (cmd: string, args: string[], options: any) => {
          if (cmd === "command" && args[0] === "-v" && args[1] === "wl-paste") {
            return { status: 0, stdout: "/usr/bin/wl-paste", stderr: "" };
          }
          if (cmd === "sh") {
            return { status: 0, stdout: testText, stderr: "" };
          }
          return { status: 0, stdout: "", stderr: "" };
        }
      );

      jest.resetModules();
      const { WaylandClipboard } = require("../src/clipboard/wayland");
      const clipboard = new WaylandClipboard();

      const result = await clipboard.getTextPlain();

      expect(typeof result).toBe("string");
    });
  });

  describe("WaylandClipboard.copyImage", () => {
    it("should successfully copy PNG using wl-copy", async () => {
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v" && args[1] === "wl-copy") {
          return { status: 0, stdout: "/usr/bin/wl-copy", stderr: "" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      jest.resetModules();
      const { WaylandClipboard } = require("../src/clipboard/wayland");
      const clipboard = new WaylandClipboard();

      const tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.png`);
      fs.writeFileSync(tmpFile, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

      const result = await clipboard.copyImage(new URL(`file://${tmpFile}`));

      fs.unlinkSync(tmpFile);

      expect(result).toBe(true);
    });
  });

  describe("WaylandClipboard.getImage", () => {
    it("should successfully retrieve PNG using wl-paste", async () => {
      const tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.png`);

      spawnSyncMock.mockImplementation(
        (cmd: string, args: string[], options: any) => {
          if (cmd === "command" && args[0] === "-v" && args[1] === "wl-paste") {
            return { status: 0, stdout: "/usr/bin/wl-paste", stderr: "" };
          }
          if (cmd === "sh") {
            fs.writeFileSync(tmpFile, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
            return { status: 0, stdout: tmpFile, stderr: "" };
          }
          return { status: 0, stdout: "", stderr: "" };
        }
      );

      jest.resetModules();
      const { WaylandClipboard } = require("../src/clipboard/wayland");
      const clipboard = new WaylandClipboard();

      const result = await clipboard.getImage(tmpFile);

      expect(result).toBe(tmpFile);

      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });
  });

  describe("WaylandClipboard.getContentType", () => {
    it("should correctly detect content type", async () => {
      spawnSyncMock.mockImplementation(
        (cmd: string, args: string[], options: any) => {
          if (cmd === "command" && args[0] === "-v" && args[1] === "wl-paste") {
            return { status: 0, stdout: "/usr/bin/wl-paste", stderr: "" };
          }
          if (cmd === "sh") {
            return { status: 0, stdout: "text/plain\ntext/html\n", stderr: "" };
          }
          return { status: 0, stdout: "", stderr: "" };
        }
      );

      jest.resetModules();
      const { WaylandClipboard } = require("../src/clipboard/wayland");
      const clipboard = new WaylandClipboard();

      const result = await clipboard.getContentType();

      expect(result).toBeDefined();
    });
  });

  describe("Error handling when wl-copy/wl-paste not installed", () => {
    it("should handle missing wl-paste gracefully", async () => {
      spawnSyncMock.mockImplementation(
        (cmd: string, args: string[], options: any) => {
          if (cmd === "command" && args[0] === "-v") {
            return { status: 1, stdout: "", stderr: "command not found" };
          }
          if (cmd === "sh") {
            return { status: 1, stdout: "no wl-paste", stderr: "" };
          }
          return { status: 1, stdout: "", stderr: "error" };
        }
      );

      jest.resetModules();
      const { WaylandClipboard } = require("../src/clipboard/wayland");
      const clipboard = new WaylandClipboard();

      const result = await clipboard.getTextPlain();

      expect(result).toBeDefined();
    });
  });
});

describe("Backend Selection Logic", () => {
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

  describe("LinuxShell.getClipboard backend selection", () => {
    it("should return WaylandClipboard when Wayland detected and wl-copy available", () => {
      // Set up mock BEFORE resetting modules or requiring
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "wl-copy" || args[1] === "wl-paste") {
            return { status: 0, stdout: `/usr/bin/${args[1]}`, stderr: "" };
          }
          return { status: 1, stdout: "", stderr: "" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      // Set environment
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      // Reset modules AFTER mock is set up to clear cached display server
      jest.resetModules();

      // Require module - mock will intercept calls
      const { getShell } = require("../src/os");
      const shell = getShell();
      const clipboard = shell.getClipboard();

      expect(clipboard.constructor.name).toBe("WaylandClipboard");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Selected wl-copy backend for Wayland")
      );
    });

    it("should return LinuxClipboard when X11 detected and xclip available", () => {
      // Set up mock BEFORE resetting modules
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "xclip") {
            return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
          }
          return { status: 1, stdout: "", stderr: "" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      // Set environment for X11
      process.env = { ...originalEnv };
      delete process.env.WAYLAND_DISPLAY;
      delete process.env.XDG_SESSION_TYPE;

      // Reset modules AFTER mock is set up
      jest.resetModules();

      const { getShell } = require("../src/os");
      const shell = getShell();
      const clipboard = shell.getClipboard();

      expect(clipboard.constructor.name).toBe("LinuxClipboard");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Selected xclip backend for X11")
      );
    });

    it("should fallback to xclip with warning when Wayland detected but wl-copy unavailable", () => {
      // Set up mock BEFORE resetting modules
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "wl-copy" || args[1] === "wl-paste") {
            return { status: 1, stdout: "", stderr: "command not found" };
          }
          if (args[1] === "xclip") {
            return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
          }
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      // Set environment for Wayland
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      // Reset modules AFTER mock is set up
      jest.resetModules();

      const { getShell } = require("../src/os");
      const shell = getShell();
      const clipboard = shell.getClipboard();

      expect(clipboard.constructor.name).toBe("LinuxClipboard");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Warning: Wayland detected but wl-copy not found"
        )
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("install wl-clipboard")
      );
    });

    it("should throw clear error when neither tool available", () => {
      // Set up mock BEFORE resetting modules
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          return { status: 1, stdout: "", stderr: "command not found" };
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      // Set environment for Wayland
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      // Reset modules AFTER mock is set up
      jest.resetModules();

      const { getShell } = require("../src/os");

      expect(() => {
        const shell = getShell();
        shell.getClipboard();
      }).toThrow(/No clipboard tool available/);
    });

    it("should log backend selection for troubleshooting", () => {
      // Set up mock BEFORE resetting modules
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "wl-copy" || args[1] === "wl-paste") {
            return { status: 0, stdout: `/usr/bin/${args[1]}`, stderr: "" };
          }
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      // Set environment for Wayland
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      // Reset modules AFTER mock is set up
      jest.resetModules();

      const { getShell } = require("../src/os");
      const shell = getShell();
      shell.getClipboard();

      expect(consoleDebugSpy).toHaveBeenCalled();
      const debugCalls = consoleDebugSpy.mock.calls.map((call) => call[0]);
      expect(debugCalls.some((call) => call.includes("Selected"))).toBe(true);
    });

    it("should log fallback events with install instructions", () => {
      // Set up mock BEFORE resetting modules
      spawnSyncMock.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === "command" && args[0] === "-v") {
          if (args[1] === "wl-copy" || args[1] === "wl-paste") {
            return { status: 1, stdout: "", stderr: "" };
          }
          if (args[1] === "xclip") {
            return { status: 0, stdout: "/usr/bin/xclip", stderr: "" };
          }
        }
        return { status: 0, stdout: "", stderr: "" };
      });

      // Set environment for Wayland
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      // Reset modules AFTER mock is set up
      jest.resetModules();

      const { getShell } = require("../src/os");
      const shell = getShell();
      shell.getClipboard();

      const debugCalls = consoleDebugSpy.mock.calls.map((call) => call[0]);
      expect(debugCalls.some((call) => call.includes("falling back"))).toBe(
        true
      );
      expect(
        debugCalls.some((call) => call.includes("install wl-clipboard"))
      ).toBe(true);
    });
  });
});
