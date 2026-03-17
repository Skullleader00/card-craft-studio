import templateGold from "@/assets/template-gold.png";
import templateSilver from "@/assets/template-silver.png";
import templateCrimson from "@/assets/template-crimson.png";
import templateEmerald from "@/assets/template-emerald.png";
import flameRedFrame from "@/assets/flame-red-frame.png";
import flameRedTextboxText from "@/assets/flame-red-textbox-text.png";
import flameRedTextboxName from "@/assets/flame-red-textbox-name.png";
import flameRedLevel from "@/assets/flame-red-level.png";

export interface OverlayLayer {
  image: string;
  /** Position and size on the 600x840 canvas */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LevelIconConfig {
  image: string;
  /** Position of first icon */
  x: number;
  startY: number;
  /** Spacing between icons */
  spacing: number;
  size: number;
  /** Max icons to show */
  maxCount: number;
}

export interface TextFieldConfig {
  x: number;
  y: number;
  maxWidth: number;
  font: string;
  color: string;
  align: CanvasTextAlign;
}

export interface CardTemplateConfig {
  /** Area where artwork is drawn (clipped) */
  artArea: { x: number; y: number; w: number; h: number };
  /** Text field positions */
  nameField: TextFieldConfig;
  costField: TextFieldConfig;
  atkField: TextFieldConfig;
  descField: { x: number; y: number; maxWidth: number; font: string; color: string; lineHeight: number };
  /** Optional level icons instead of text */
  levelIcons?: LevelIconConfig;
  levelField?: TextFieldConfig;
}

export interface CardTemplate {
  id: string;
  name: string;
  /** Main preview/thumbnail image */
  image: string;
  /** Frame layer drawn on top of artwork */
  frameImage: string;
  /** Additional overlay layers drawn after the frame */
  overlays?: OverlayLayer[];
  /** Layout config for this template */
  config?: CardTemplateConfig;
}

const defaultConfig: CardTemplateConfig = {
  artArea: { x: 75, y: 100, w: 450, h: 400 },
  nameField: { x: 90, y: 60, maxWidth: 350, font: "bold 28px serif", color: "#f5e6c8", align: "left" },
  costField: { x: 520, y: 60, maxWidth: 80, font: "bold 26px serif", color: "#ffd700", align: "right" },
  atkField: { x: 90, y: 780, maxWidth: 200, font: "bold 24px serif", color: "#ff6b6b", align: "left" },
  descField: { x: 100, y: 540, maxWidth: 430, font: "16px serif", color: "#d4c5a0", lineHeight: 22 },
  levelField: { x: 520, y: 90, maxWidth: 80, font: "18px serif", color: "#c0c0c0", align: "right" },
};

const flameRedConfig: CardTemplateConfig = {
  artArea: { x: 42, y: 28, w: 480, h: 560 },
  nameField: { x: 300, y: 770, maxWidth: 370, font: "bold italic 26px serif", color: "#000000", align: "center" },
  costField: { x: 68, y: 72, maxWidth: 80, font: "bold 48px sans-serif", color: "#ffffff", align: "center" },
  atkField: { x: 548, y: 790, maxWidth: 80, font: "bold 44px sans-serif", color: "#ffffff", align: "center" },
  descField: { x: 70, y: 625, maxWidth: 420, font: "bold 18px sans-serif", color: "#000000", lineHeight: 24 },
  levelIcons: {
    image: flameRedLevel,
    x: 540,
    startY: 170,
    spacing: 56,
    size: 44,
    maxCount: 8,
  },
};

export const defaultTemplates: CardTemplate[] = [
  {
    id: "flame-red",
    name: "Flame Red",
    image: flameRedFrame,
    frameImage: flameRedFrame,
    overlays: [
      { image: flameRedTextboxText, x: 0, y: 0, w: 600, h: 840 },
      { image: flameRedTextboxName, x: 0, y: 0, w: 600, h: 840 },
    ],
    config: flameRedConfig,
  },
  { id: "gold", name: "Golden Dynasty", image: templateGold, frameImage: templateGold },
  { id: "silver", name: "Cyber Tech", image: templateSilver, frameImage: templateSilver },
  { id: "crimson", name: "Dark Gothic", image: templateCrimson, frameImage: templateCrimson },
  { id: "emerald", name: "Forest Spirit", image: templateEmerald, frameImage: templateEmerald },
];

export interface CardData {
  name: string;
  cost: string;
  atk: string;
  level: string;
  text: string;
  artworkUrl: string | null;
  artworkOffset: { x: number; y: number };
  artworkScale: number;
}

export const defaultCardData: CardData = {
  name: "Card Name",
  cost: "3",
  atk: "2500",
  level: "4",
  text: "This creature possesses incredible power.",
  artworkUrl: null,
  artworkOffset: { x: 0, y: 0 },
  artworkScale: 1,
};

export function getTemplateConfig(template?: CardTemplate): CardTemplateConfig {
  return template?.config ?? defaultConfig;
}
