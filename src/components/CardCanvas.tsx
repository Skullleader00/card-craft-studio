import { useRef, useEffect, useCallback, useState } from "react";
import type { CardData, CardTemplate, CardTemplateConfig } from "@/lib/templates";
import { getTemplateConfig } from "@/lib/templates";

interface CardCanvasProps {
  template: CardTemplate;
  cardData: CardData;
  onArtworkOffsetChange?: (offset: { x: number; y: number }) => void;
  onArtworkScaleChange?: (scale: number) => void;
  interactive?: boolean;
}

export const CANVAS_W = 600;
export const CANVAS_H = 840;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  templateImg: HTMLImageElement,
  artworkImg: HTMLImageElement | null,
  data: CardData,
  config: CardTemplateConfig,
  overlayImgs?: HTMLImageElement[],
  overlayConfigs?: { x: number; y: number; w: number; h: number }[],
  levelIconImg?: HTMLImageElement | null,
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const art = config.artArea;

  // Draw artwork behind template
  if (artworkImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(art.x, art.y, art.w, art.h);
    ctx.clip();
    const scale = data.artworkScale;
    const drawW = artworkImg.naturalWidth * scale;
    const drawH = artworkImg.naturalHeight * scale;
    const cx = art.x + art.w / 2 + data.artworkOffset.x;
    const cy = art.y + art.h / 2 + data.artworkOffset.y;
    ctx.drawImage(artworkImg, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // Draw template frame on top
  ctx.drawImage(templateImg, 0, 0, CANVAS_W, CANVAS_H);

  // Draw overlay layers
  if (overlayImgs && overlayConfigs) {
    for (let i = 0; i < overlayImgs.length; i++) {
      const img = overlayImgs[i];
      const cfg = overlayConfigs[i];
      if (img && cfg) {
        ctx.drawImage(img, cfg.x, cfg.y, cfg.w, cfg.h);
      }
    }
  }

  // Draw level icons if configured
  if (config.levelIcons && levelIconImg) {
    const lc = config.levelIcons;
    const count = Math.min(parseInt(data.level) || 0, lc.maxCount);
    for (let i = 0; i < count; i++) {
      ctx.drawImage(levelIconImg, lc.x - lc.size / 2, lc.startY + i * lc.spacing, lc.size, lc.size);
    }
  }

  // Draw text fields
  ctx.textBaseline = "middle";

  // Name
  const nf = config.nameField;
  ctx.font = nf.font;
  ctx.fillStyle = nf.color;
  ctx.textAlign = nf.align;
  const nameX = nf.align === "center" ? nf.x : nf.x;
  ctx.fillText(data.name, nameX, nf.y, nf.maxWidth);

  // Cost
  const cf = config.costField;
  ctx.font = cf.font;
  ctx.fillStyle = cf.color;
  ctx.textAlign = cf.align;
  ctx.fillText(data.cost, cf.x, cf.y, cf.maxWidth);

  // ATK
  const af = config.atkField;
  ctx.font = af.font;
  ctx.fillStyle = af.color;
  ctx.textAlign = af.align;
  ctx.fillText(data.atk, af.x, af.y, af.maxWidth);

  // Level text (if no icons)
  if (config.levelField && !config.levelIcons) {
    const lf = config.levelField;
    ctx.font = lf.font;
    ctx.fillStyle = lf.color;
    ctx.textAlign = lf.align;
    ctx.fillText(`Lv.${data.level}`, lf.x, lf.y, lf.maxWidth);
  }

  // Description text
  ctx.textAlign = "left";
  const df = config.descField;
  ctx.font = df.font;
  ctx.fillStyle = df.color;
  const lines = wrapText(ctx, data.text, df.maxWidth);
  let ty = df.y;
  for (const line of lines) {
    if (ty > CANVAS_H - 80) break;
    ctx.fillText(line, df.x, ty);
    ty += df.lineHeight;
  }
}

export default function CardCanvas({
  template,
  cardData,
  onArtworkOffsetChange,
  onArtworkScaleChange,
  interactive = true,
}: CardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const artworkImgRef = useRef<HTMLImageElement | null>(null);
  const overlayImgsRef = useRef<HTMLImageElement[]>([]);
  const levelIconImgRef = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const config = getTemplateConfig(template);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCard(
      ctx,
      templateImgRef.current,
      artworkImgRef.current,
      cardData,
      config,
      overlayImgsRef.current,
      template.overlays?.map((o) => ({ x: o.x, y: o.y, w: o.w, h: o.h })),
      levelIconImgRef.current,
    );
  }, [cardData, config, template.overlays]);

  // Load template frame
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { templateImgRef.current = img; render(); };
    img.src = template.frameImage;
  }, [template.frameImage, render]);

  // Load overlay images
  useEffect(() => {
    if (!template.overlays?.length) { overlayImgsRef.current = []; render(); return; }
    let loaded = 0;
    const imgs: HTMLImageElement[] = new Array(template.overlays.length);
    template.overlays.forEach((ov, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imgs[i] = img; loaded++; if (loaded === template.overlays!.length) { overlayImgsRef.current = imgs; render(); } };
      img.src = ov.image;
    });
  }, [template.overlays, render]);

  // Load level icon
  useEffect(() => {
    if (!config.levelIcons) { levelIconImgRef.current = null; render(); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { levelIconImgRef.current = img; render(); };
    img.src = config.levelIcons.image;
  }, [config.levelIcons, render]);

  // Load artwork image
  useEffect(() => {
    if (!cardData.artworkUrl) { artworkImgRef.current = null; render(); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { artworkImgRef.current = img; render(); };
    img.src = cardData.artworkUrl;
  }, [cardData.artworkUrl, render]);

  useEffect(() => { render(); }, [render]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    };
  };

  const art = config.artArea;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive || !cardData.artworkUrl) return;
    const coords = getCanvasCoords(e);
    if (coords.x >= art.x && coords.x <= art.x + art.w && coords.y >= art.y && coords.y <= art.y + art.h) {
      setDragging(true);
      dragStart.current = coords;
      offsetStart.current = { ...cardData.artworkOffset };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const coords = getCanvasCoords(e);
    onArtworkOffsetChange?.({
      x: offsetStart.current.x + (coords.x - dragStart.current.x),
      y: offsetStart.current.y + (coords.y - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive || !cardData.artworkUrl) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    onArtworkScaleChange?.(Math.max(0.1, cardData.artworkScale + delta));
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="w-full max-w-[400px] rounded-lg shadow-2xl cursor-move"
      style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
}
