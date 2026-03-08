import { spawnSync } from "child_process";

describe("Display Server Detection", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    // Spy on console.debug
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
  });

  afterEach(() => {
    // Restore environment and console
    process.env = originalEnv;
    consoleDebugSpy.mockRestore();
    // Clear the module cache to reset cached display server
    jest.resetModules();
  });

  describe("detectDisplayServer", () => {
    it("should detect Wayland when WAYLAND_DISPLAY is set", () => {
      // Reset module cache to clear cached display server
      jest.resetModules();

      // Set WAYLAND_DISPLAY
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      // Re-import to get fresh module state
      const { detectDisplayServer: detect } = require("../src/os");
      const result = detect();

      expect(result).toBe("wayland");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Detected Wayland via WAYLAND_DISPLAY"),
      );
    });

    it("should detect Wayland when XDG_SESSION_TYPE=wayland and WAYLAND_DISPLAY unset", () => {
      jest.resetModules();

      // Set XDG_SESSION_TYPE without WAYLAND_DISPLAY
      process.env = {
        ...originalEnv,
        XDG_SESSION_TYPE: "wayland",
      };
      delete process.env.WAYLAND_DISPLAY;

      const { detectDisplayServer: detect } = require("../src/os");
      const result = detect();

      expect(result).toBe("wayland");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Detected Wayland via XDG_SESSION_TYPE"),
      );
    });

    it("should detect X11 when no Wayland indicators present", () => {
      jest.resetModules();

      // Clear Wayland indicators
      process.env = { ...originalEnv };
      delete process.env.WAYLAND_DISPLAY;
      delete process.env.XDG_SESSION_TYPE;

      const { detectDisplayServer: detect } = require("../src/os");
      const result = detect();

      expect(result).toBe("x11");
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Detected X11"),
      );
    });

    it("should cache detection result for process lifetime", () => {
      jest.resetModules();

      // Set WAYLAND_DISPLAY
      process.env = { ...originalEnv, WAYLAND_DISPLAY: "wayland-0" };

      const { detectDisplayServer: detect } = require("../src/os");

      // First call
      const result1 = detect();
      expect(result1).toBe("wayland");

      // Clear debug spy to track second call
      consoleDebugSpy.mockClear();

      // Second call
      const result2 = detect();
      expect(result2).toBe("wayland");

      // Debug should not be called again (cached)
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });
});

describe("Tool Availability Checking", () => {
  let spawnSyncMock: jest.SpyInstance;

  beforeEach(() => {
    // Mock spawnSync
    spawnSyncMock = jest.spyOn(require("child_process"), "spawnSync");
  });

  afterEach(() => {
    spawnSyncMock.mockRestore();
  });

  describe("isToolAvailable", () => {
    it("should return true when tool is installed", () => {
      // Mock successful command
      spawnSyncMock.mockReturnValue({
        status: 0,
        stdout: "/usr/bin/xclip",
        stderr: "",
      });

      const { isToolAvailable } = require("../src/os");
      const result = isToolAvailable("xclip");

      expect(result).toBe(true);
      expect(spawnSyncMock).toHaveBeenCalledWith(
        "command",
        ["-v", "xclip"],
        expect.objectContaining({
          shell: true,
          encoding: "utf-8",
        }),
      );
    });

    it("should return false when tool is not installed", () => {
      // Mock failed command
      spawnSyncMock.mockReturnValue({
        status: 1,
        stdout: "",
        stderr: "command not found",
      });

      const { isToolAvailable } = require("../src/os");
      const result = isToolAvailable("nonexistent");

      expect(result).toBe(false);
    });

    it("should work for any tool name parameter", () => {
      // Test with different tool names
      spawnSyncMock.mockReturnValue({ status: 0, stdout: "", stderr: "" });

      const { isToolAvailable } = require("../src/os");
      expect(isToolAvailable("xclip")).toBe(true);
      expect(isToolAvailable("wl-copy")).toBe(true);
      expect(isToolAvailable("custom-tool")).toBe(true);

      // Verify correct spawnSync calls
      expect(spawnSyncMock).toHaveBeenCalledTimes(3);
    });
  });
});
