import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CardCanvas, { drawCard, CANVAS_W, CANVAS_H } from "@/components/CardCanvas";
import { defaultCardData, type CardData } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Upload } from "lucide-react";

export default function Editor() {
  const navigate = useNavigate();
  const location = useLocation();
  const templateImage = (location.state as { templateImage?: string })?.templateImage;

  const [cardData, setCardData] = useState<CardData>({ ...defaultCardData });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback((patch: Partial<CardData>) => {
    setCardData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({
        artworkUrl: reader.result as string,
        artworkOffset: { x: 0, y: 0 },
        artworkScale: 0.5,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d")!;

    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.onload = () => {
      if (cardData.artworkUrl) {
        const artImg = new Image();
        artImg.crossOrigin = "anonymous";
        artImg.onload = () => {
          drawCard(ctx, templateImg, artImg, cardData);
          downloadCanvas(canvas);
        };
        artImg.src = cardData.artworkUrl;
      } else {
        drawCard(ctx, templateImg, null, cardData);
        downloadCanvas(canvas);
      }
    };
    templateImg.src = templateImage!;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    const link = document.createElement("a");
    link.download = `${cardData.name || "card"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!templateImage) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Card Editor</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Preview */}
          <div className="flex flex-col items-center gap-4">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                <TabsTrigger value="template" className="flex-1">Template</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="flex justify-center pt-4">
                <CardCanvas
                  templateImage={templateImage}
                  cardData={cardData}
                  onArtworkOffsetChange={(offset) => update({ artworkOffset: offset })}
                  onArtworkScaleChange={(scale) => update({ artworkScale: scale })}
                />
              </TabsContent>
              <TabsContent value="template" className="flex justify-center pt-4">
                <img
                  src={templateImage}
                  alt="Template"
                  className="w-full max-w-[400px] rounded-lg shadow-2xl"
                />
              </TabsContent>
            </Tabs>
            <p className="text-sm text-muted-foreground text-center">
              Drag artwork to reposition • Scroll to zoom
            </p>
          </div>

          {/* Right: Form */}
          <div className="space-y-5">
            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-2">Card Details</h2>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={cardData.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Card Name"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    value={cardData.cost}
                    onChange={(e) => update({ cost: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="atk">ATK</Label>
                  <Input
                    id="atk"
                    value={cardData.atk}
                    onChange={(e) => update({ atk: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    value={cardData.level}
                    onChange={(e) => update({ level: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Card Text</Label>
                <Textarea
                  id="text"
                  value={cardData.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Describe the card's abilities..."
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Artwork</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {cardData.artworkUrl ? "Replace Artwork" : "Upload Artwork"}
              </Button>
              {cardData.artworkUrl && (
                <div className="space-y-2">
                  <Label>Scale: {cardData.artworkScale.toFixed(2)}</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.01"
                    value={cardData.artworkScale}
                    onChange={(e) => update({ artworkScale: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>

            <Button className="w-full h-12 text-lg font-bold" onClick={handleExport}>
              <Download className="mr-2 h-5 w-5" />
              Export as PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
