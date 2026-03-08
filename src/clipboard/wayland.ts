import { fileURLToPath, URL } from "node:url";
import { ClipboardType, IClipboard } from "../clipboard_interface";
import { getShell } from "../os";
import * as path from "path";
import { stripFinalNewline } from "../utils";
import { BaseClipboard } from "./base_clipboard";

class WaylandClipboard extends BaseClipboard {
  SCRIPT_PATH = "../../res/scripts/";

  async copyImage(imageFile: URL): Promise<boolean> {
    const imageFilePath = fileURLToPath(imageFile);
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      "wayland_set_clipboard_png.sh"
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
      "wayland_set_clipboard_text_plain.sh"
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
      "wayland_set_clipboard_text_html.sh"
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
      "wayland_get_clipboard_content_type.sh"
    );
    try {
      const shell = getShell();
      console.debug("[wayland] Running script:", script);
      const data = await shell.runScript(script);
      console.debug("[wayland] Script output:", data);
      const types = data.split(/\r\n|\n|\r/);
      console.debug("[wayland] Parsed types:", types);
      const result = this.detectType(types);
      console.debug("[wayland] Detected:", result);
      return result;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("[wayland] getContentType error:", errorMsg);
      return ClipboardType.Unknown;
    }
  }

  async getImage(imagePath: string): Promise<string> {
    if (!imagePath) return "";
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      "wayland_save_clipboard_png.sh"
    );
    const shell = getShell();
    const data: string = await shell.runScript(script, [imagePath]);
    return stripFinalNewline(data);
  }

  async getTextPlain(): Promise<string> {
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      "wayland_get_clipboard_text_plain.sh"
    );
    const shell = getShell();
    const data: string = await shell.runScript(script);
    return stripFinalNewline(data);
  }

  async getTextHtml(): Promise<string> {
    const script = path.join(
      __dirname,
      this.SCRIPT_PATH,
      "wayland_get_clipboard_text_html.sh"
    );
    const shell = getShell();
    const data: string = await shell.runScript(script);
    return stripFinalNewline(data);
  }
}

export { WaylandClipboard };
