import { fileURLToPath, URL } from "node:url";
import { ClipboardType, IClipboard } from "../clipboard_interface";
import { getShell, isToolAvailable } from "../os";
import * as path from "path";
import { stripFinalNewline } from "../utils";
import { BaseClipboard } from "./base_clipboard";

type DisplayServer = "wayland" | "x11" | "unknown";
type Backend = "xclip" | "wl-clipboard";

// Module-level cache (eager initialization per CONTEXT.md decision)
let cachedDisplayServer: DisplayServer | null = null;

/**
 * Detect display server (Wayland or X11) from environment variables.
 * Result is cached at first call and persists for process lifetime.
 * @returns "wayland" | "x11" | "unknown"
 */
export function detectDisplayServer(): DisplayServer {
  if (cachedDisplayServer !== null) {
    return cachedDisplayServer;
  }

  // Primary: Check WAYLAND_DISPLAY (per RESEARCH.md Pattern 1)
  if (process.env.WAYLAND_DISPLAY) {
    cachedDisplayServer = "wayland";
    console.debug(
      `[xclip] Detected Wayland via WAYLAND_DISPLAY=${process.env.WAYLAND_DISPLAY}`
    );
    return cachedDisplayServer;
  }

  // Secondary: Check XDG_SESSION_TYPE
  const sessionType = process.env.XDG_SESSION_TYPE;
  if (sessionType === "wayland") {
    cachedDisplayServer = "wayland";
    console.debug(
      `[xclip] Detected Wayland via XDG_SESSION_TYPE=${sessionType}`
    );
    return cachedDisplayServer;
  }

  // Default to X11
  cachedDisplayServer = "x11";
  console.debug(`[xclip] Detected X11 (no Wayland indicators found)`);
  return cachedDisplayServer;
}

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
    const displayServer = detectDisplayServer();

    if (displayServer === "wayland") {
      if (isToolAvailable("wl-copy")) {
        console.debug("[xclip] Selected wl-clipboard backend for Wayland");
        return "wl-clipboard";
      }
      if (isToolAvailable("xclip")) {
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
    if (isToolAvailable("xclip")) {
      console.debug("[xclip] Selected xclip backend for X11");
      return "xclip";
    }

    throw new Error(
      "xclip not installed. Install with: apt install xclip (or pacman -S xclip)"
    );
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
