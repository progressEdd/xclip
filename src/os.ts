import * as os from "os";
import { spawn, spawnSync } from "child_process";
import isWsl from "is-wsl";
import { IClipboard } from "./clipboard_interface";
import { Win10Clipboard } from "./clipboard/win10";
import { Win32Clipboard } from "./clipboard/win32";
import { WslClipboard } from "./clipboard/wsl";
import { LinuxClipboard } from "./clipboard/linux";
import { DarwinClipboard } from "./clipboard/darwin";

export type Platform = "darwin" | "win32" | "win10" | "linux" | "wsl";

/**
 * Check if a command-line tool is available in the system PATH.
 * @param toolName - Name of the tool to check (e.g., "xclip", "wl-copy")
 * @returns true if tool is available, false otherwise
 */
export function isToolAvailable(toolName: string): boolean {
  try {
    const result = spawnSync("command", ["-v", toolName], {
      shell: true,
      encoding: "utf-8",
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

export function getCurrentPlatform(): Platform {
  const platform = process.platform;
  if (isWsl) {
    return "wsl";
  }
  if (platform === "win32") {
    const currentOS = os.release().split(".")[0];
    if (currentOS === "10") {
      return "win10";
    } else {
      return "win32";
    }
  } else if (platform === "darwin") {
    return "darwin";
  } else {
    return "linux";
  }
}

export function getShell(): IShell {
  const platform = getCurrentPlatform();
  switch (platform) {
    case "win10":
      return new Win10Shell();
    case "linux":
      return new LinuxShell();
    case "darwin":
      return new DarwinShell();
    case "win32":
      return new Win32Shell();
    case "wsl":
      return new WslShell();
    default:
      throw new Error("Unsupported platform");
  }
}

/**
 * Run command and get stdout
 * @param shell
 * @param options
 */
export function runCommand(
  shell: string,
  options: string[],
  timeout = 10000
): Promise<string> {
  return new Promise((resolve, reject) => {
    let errorTriggered = false;
    let output = "";
    let errorMessage = "";
    const process = spawn(shell, options, { timeout });

    process.stdout.on("data", (chunk) => {
      output += `${chunk}`;
    });

    process.stderr.on("data", (chunk) => {
      errorMessage += `${chunk}`;
    });

    process.on("exit", (code) => {
      if (process.killed) {
        console.log("Process took too long and was killed");
      }

      if (!errorTriggered) {
        if (code === 0) {
          resolve(output);
        } else {
          // Include both stdout and stderr in error message for better diagnostics
          const errorParts = [];
          if (errorMessage) errorParts.push(errorMessage);
          if (output) errorParts.push(`stdout: ${output}`);
          const fullError =
            errorParts.length > 0
              ? errorParts.join("\n")
              : `Command exited with code ${code} (no output)`;
          reject(new Error(fullError));
        }
      }
    });

    process.on("error", (error) => {
      errorTriggered = true;
      reject(error);
    });
  });
}

export interface IShell {
  runScript(script: string, parameters?: string[]): Promise<string>;
  getClipboard(): IClipboard;
}

class Win10Shell implements IShell {
  getClipboard(): IClipboard {
    return new Win10Clipboard();
  }
  async runScript(script: string, parameters: string[]): Promise<string> {
    const shell = "powershell";
    const command = [
      "-noprofile",
      "-noninteractive",
      "-nologo",
      "-sta",
      "-executionpolicy",
      "bypass",
      "-windowstyle",
      "hidden",
      "-file",
      script,
    ].concat(parameters);

    const stdout = await runCommand(shell, command);
    return stdout;
  }
}

class Win32Shell implements IShell {
  getClipboard(): IClipboard {
    return new Win32Clipboard();
  }
  async runScript(script: string, parameters: string[]): Promise<string> {
    const shell = "powershell";
    const command = [
      "-noprofile",
      "-noninteractive",
      "-nologo",
      "-sta",
      "-executionpolicy",
      "bypass",
      "-windowstyle",
      "hidden",
      "-file",
      script,
    ].concat(parameters);

    const stdout = await runCommand(shell, command);
    return stdout;
  }
}

class WslShell implements IShell {
  getClipboard(): IClipboard {
    return new WslClipboard();
  }
  async runScript(script: string, parameters: string[]): Promise<string> {
    const shell =
      "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
    const command = [
      "-noprofile",
      "-noninteractive",
      "-nologo",
      "-sta",
      "-executionpolicy",
      "bypass",
      "-windowstyle",
      "hidden",
      "-file",
      script,
    ].concat(parameters);

    const stdout = await runCommand(shell, command);
    return stdout;
  }
}

class LinuxShell implements IShell {
  getClipboard(): IClipboard {
    return new LinuxClipboard();
  }
  async runScript(script: string, parameters: string[]): Promise<string> {
    const shell = "sh";
    const command = [script].concat(parameters);
    const stdout = await runCommand(shell, command);
    return stdout;
  }
}

class DarwinShell implements IShell {
  getClipboard(): IClipboard {
    return new DarwinClipboard();
  }
  async runScript(script: string, parameters: string[]): Promise<string> {
    const shell = "osascript";
    const command = [script].concat(parameters);
    const stdout = await runCommand(shell, command);
    return stdout;
  }
}
