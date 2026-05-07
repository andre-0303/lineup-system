import { toPng } from "html-to-image";

export async function generateLineupPNG(containerId: string): Promise<string> {
  const element = document.getElementById(containerId);
  if (!element) throw new Error("Elemento de preview não encontrado.");

  return toPng(element, {
    width: 1080,
    height: 1080,
    pixelRatio: 1,
    cacheBust: true,
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
