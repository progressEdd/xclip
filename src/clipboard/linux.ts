import { fileURLToPath, URL } from "node:url";
import { ClipboardType, IClipboard } from "../clipboard_interface";
import { getShell } from "../os";
import * as path from "path";
import { stripFinalNewline } from "../utils";
import { BaseClipboard } from "./base_clipboard";

type Backend = "xclip" | "wl-clipboard";

class LinuxClipboard extends BaseClipboard {
  SCRIPT_PATH = "../../res/scripts/";
  private backend: Backend;

  constructor() {
    super();
    this.backend = this.detectBackend();
  }

  /**
   * Detect display server and available clipboard tools.
   * Moved from os.ts LinuxShell.getClipboard().
   */
  private detectBackend(): Backend {
    // Check for Wayland
    if (
      process.env.WAYLAND_DISPLAY ||
      process.env.XDG_SESSION_TYPE === "wayland"
    ) {
      if (this.isToolAvailable("wl-copy")) {
        console.debug("[xclip] Selected wl-clipboard backend for Wayland");
        return "wl-clipboard";
      }
      if (this.isToolAvailable("xclip")) {
        console.debug(
          "[xclip] Warning: Wayland detected but wl-copy not found, falling back to xclip (XWayland)"
        );
        console.debug(
          "[xclip] For best Wayland support, install wl-clipboard: apt install wl-clipboard"
        );
        return "xclip";
      }
      throw new Error(
        "No clipboard tool available. Install wl-clipboard (recommended for Wayland) or xclip."
      );
    }

    // X11
    if (this.isToolAvailable("xclip")) {
      console.debug("[xclip] Selected xclip backend for X11");
      return "xclip";
    }

    throw new Error(
      "xclip not installed. Install with: apt install xclip (or pacman -S xclip)"
    );
  }

  /**
   * Check if a command-line tool is available.
   */
  private isToolAvailable(toolName: string): boolean {
    try {
      const { spawnSync } = require("child_process");
      const result = spawnSync("command", ["-v", toolName], {
        shell: true,
        encoding: "utf-8",
      });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get script prefix based on current backend.
   */
  private getScriptPrefix(): string {
    return this.backend === "wl-clipboard" ? "wl_clipboard_" : "xclip_";
  }

  async copyImage(imageFile: URL): Promise<boolean> {
    const imageFilePath = fileURLToPath(imageFile);
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}set_clipboard_png.sh`
    );
    const params = [imageFilePath];

    try {
      const shell = getShell();
      await shell.runScript(script, params);
      return true;
    } catch (e) {
      return false;
    }
  }

  async copyTextPlain(textFile: URL): Promise<boolean> {
    const textFilePath = fileURLToPath(textFile);
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}set_clipboard_text_plain.sh`
    );
    const params = [textFilePath];

    try {
      const shell = getShell();
      await shell.runScript(script, params);
      return true;
    } catch (e) {
      return false;
    }
  }

  async copyTextHtml(htmlFile: URL): Promise<boolean> {
    const htmlFilePath = fileURLToPath(htmlFile);
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}set_clipboard_text_html.sh`
    );
    const params = [htmlFilePath];

    try {
      const shell = getShell();
      await shell.runScript(script, params);
      return true;
    } catch (e) {
      return false;
    }
  }

  onDetectType(types: string[]): Set<ClipboardType> {
    const detectedTypes = new Set<ClipboardType>();

    for (const type of types) {
      switch (type) {
        case "no xclip":
          console.error("You need to install xclip command first.");
          detectedTypes.add(ClipboardType.Unknown);
          return detectedTypes;
        case "image/png":
          detectedTypes.add(ClipboardType.Image);
          break;
        case "text/html":
          detectedTypes.add(ClipboardType.Html);
          break;
        default:
          detectedTypes.add(ClipboardType.Text);
          break;
      }
    }
    return detectedTypes;
  }

  async getContentType(): Promise<Set<ClipboardType> | ClipboardType> {
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}get_clipboard_content_type.sh`
    );
    try {
      const shell = getShell();

      const data = await shell.runScript(script);
      console.debug("getClipboardContentType", data);
      const types = data.split(/\r\n|\n|\r/);

      return this.detectType(types);
    } catch (e) {
      return ClipboardType.Unknown;
    }
  }

  async getImage(imagePath: string): Promise<string> {
    if (!imagePath) return "";
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}save_clipboard_png.sh`
    );
    const shell = getShell();
    const data: string = await shell.runScript(script, [imagePath]);
    return stripFinalNewline(data);
  }

  async getTextPlain(): Promise<string> {
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}get_clipboard_text_plain.sh`
    );
    const shell = getShell();
    const data: string = await shell.runScript(script);
    return stripFinalNewline(data);
  }

  async getTextHtml(): Promise<string> {
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      `${this.getScriptPrefix()}get_clipboard_text_html.sh`
    );
    const shell = getShell();
    const data: string = await shell.runScript(script);
    return stripFinalNewline(data);
  }
}

export { LinuxClipboard };
