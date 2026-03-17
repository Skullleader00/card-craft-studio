import { useRef, useEffect, useCallback, useState } from "react";
import type { CardData } from "@/lib/templates";

interface CardCanvasProps {
  templateImage: string;
  cardData: CardData;
  onArtworkOffsetChange?: (offset: { x: number; y: number }) => void;
  onArtworkScaleChange?: (scale: number) => void;
  interactive?: boolean;
}

const CANVAS_W = 600;
const CANVAS_H = 840;

// Art area within the card frame (approximate)
const ART_X = 75;
const ART_Y = 100;
const ART_W = 450;
const ART_H = 400;

export function drawCard(
  ctx: CanvasRenderingContext2D,
  templateImg: HTMLImageElement,
  artworkImg: HTMLImageElement | null,
  data: CardData
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw artwork behind template
  if (artworkImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(ART_X, ART_Y, ART_W, ART_H);
    ctx.clip();
    const scale = data.artworkScale;
    const drawW = artworkImg.naturalWidth * scale;
    const drawH = artworkImg.naturalHeight * scale;
    const cx = ART_X + ART_W / 2 + data.artworkOffset.x;
    const cy = ART_Y + ART_H / 2 + data.artworkOffset.y;
    ctx.drawImage(artworkImg, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // Draw template frame on top
  ctx.drawImage(templateImg, 0, 0, CANVAS_W, CANVAS_H);

  // Draw text fields
  ctx.fillStyle = "#f5e6c8";
  ctx.textBaseline = "middle";

  // Name
  ctx.font = "bold 28px serif";
  ctx.fillText(data.name, 90, 60, 350);

  // Cost (top right)
  ctx.font = "bold 26px serif";
  ctx.fillStyle = "#ffd700";
  ctx.textAlign = "right";
  ctx.fillText(data.cost, 520, 60);
  ctx.textAlign = "left";

  // Level (below cost)
  ctx.font = "18px serif";
  ctx.fillStyle = "#c0c0c0";
  ctx.textAlign = "right";
  ctx.fillText(`Lv.${data.level}`, 520, 90);
  ctx.textAlign = "left";

  // ATK (bottom left)
  ctx.font = "bold 24px serif";
  ctx.fillStyle = "#ff6b6b";
  ctx.fillText(`ATK ${data.atk}`, 90, CANVAS_H - 60);

  // Description text (bottom area)
  ctx.font = "16px serif";
  ctx.fillStyle = "#d4c5a0";
  const lines = wrapText(ctx, data.text, ART_W - 20);
  let ty = 540;
  for (const line of lines) {
    if (ty > CANVAS_H - 80) break;
    ctx.fillText(line, 100, ty);
    ty += 22;
  }
}

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

export default function CardCanvas({
  templateImage,
  cardData,
  onArtworkOffsetChange,
  onArtworkScaleChange,
  interactive = true,
}: CardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateImgRef = useRef<HTMLImageElement | null>(null);
  const artworkImgRef = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCard(ctx, templateImgRef.current, artworkImgRef.current, cardData);
  }, [cardData]);

  // Load template image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      templateImgRef.current = img;
      render();
    };
    img.src = templateImage;
  }, [templateImage, render]);

  // Load artwork image
  useEffect(() => {
    if (!cardData.artworkUrl) {
      artworkImgRef.current = null;
      render();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      artworkImgRef.current = img;
      render();
    };
    img.src = cardData.artworkUrl;
  }, [cardData.artworkUrl, render]);

  // Re-render on data changes
  useEffect(() => {
    render();
  }, [render]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive || !cardData.artworkUrl) return;
    const coords = getCanvasCoords(e);
    if (coords.x >= ART_X && coords.x <= ART_X + ART_W && coords.y >= ART_Y && coords.y <= ART_Y + ART_H) {
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

export { CANVAS_W, CANVAS_H };
