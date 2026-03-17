import templateGold from "@/assets/template-gold.png";
import templateSilver from "@/assets/template-silver.png";
import templateCrimson from "@/assets/template-crimson.png";
import templateEmerald from "@/assets/template-emerald.png";

export interface CardTemplate {
  id: string;
  name: string;
  image: string;
}

export const defaultTemplates: CardTemplate[] = [
  { id: "gold", name: "Golden Dynasty", image: templateGold },
  { id: "silver", name: "Cyber Tech", image: templateSilver },
  { id: "crimson", name: "Dark Gothic", image: templateCrimson },
  { id: "emerald", name: "Forest Spirit", image: templateEmerald },
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
