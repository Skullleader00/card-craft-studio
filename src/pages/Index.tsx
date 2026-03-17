import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { defaultTemplates, type CardTemplate } from "@/lib/templates";
import { Plus } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CardTemplate[]>(defaultTemplates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateClick = (template: CardTemplate) => {
    navigate("/editor", { state: { template } });
  };

  const handleAddTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newTemplate: CardTemplate = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        image: dataUrl,
        frameImage: dataUrl,
      };
      setTemplates((prev) => [...prev, newTemplate]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Card Forge
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a template to start crafting your trading card
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="aspect-[5/7] overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3 text-center">
                <span className="text-sm font-medium text-foreground">{template.name}</span>
              </div>
            </button>
          ))}

          {/* Add template tile */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center aspect-[5/7] bg-card rounded-xl border-2 border-dashed border-border transition-all duration-300 hover:border-primary hover:bg-secondary/50"
          >
            <Plus className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Add Template</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddTemplate}
          />
        </div>
      </div>
    </div>
  );
}
