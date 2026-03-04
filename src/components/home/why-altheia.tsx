import { Truck, RotateCcw, ShieldCheck, Star, Heart, Package, Leaf, Sparkles, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Truck, RotateCcw, ShieldCheck, Star, Heart, Package, Leaf, Sparkles, Shield,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? ShieldCheck;
}

interface WhyLuxImportProps {
  benefit1Icon?: string;
  benefit1Title?: string;
  benefit1Text?: string;
  benefit2Icon?: string;
  benefit2Title?: string;
  benefit2Text?: string;
  benefit3Icon?: string;
  benefit3Title?: string;
  benefit3Text?: string;
}

export function WhyLuxImport({
  benefit1Icon = "Truck",
  benefit1Title = "Frete grátis acima de R$199",
  benefit1Text = "Entrega em todo o Brasil sem custo adicional.",
  benefit2Icon = "RotateCcw",
  benefit2Title = "Devolução em 30 dias",
  benefit2Text = "Satisfação garantida ou seu dinheiro de volta.",
  benefit3Icon = "ShieldCheck",
  benefit3Title = "Pagamento seguro",
  benefit3Text = "Transações criptografadas e dados protegidos.",
}: WhyLuxImportProps) {
  const benefits = [
    { icon: getIcon(benefit1Icon), title: benefit1Title, description: benefit1Text },
    { icon: getIcon(benefit2Icon), title: benefit2Title, description: benefit2Text },
    { icon: getIcon(benefit3Icon), title: benefit3Title, description: benefit3Text },
  ];

  return (
    <section
      className="py-8 px-4"
      style={{
        backgroundColor: "#111111",
        borderTop: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(212,175,55,0.2)]">
          {benefits.map(({ icon: Icon, title, description }, idx) => (
            <div key={idx} className="flex items-start gap-4 px-8 py-6">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
              <div>
                <p className="font-medium text-sm mb-1" style={{ color: "#F5F5F5" }}>
                  {title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#9A9A9A" }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
