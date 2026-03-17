import { Truck, RotateCcw, ShieldCheck, Star, Heart, Package, Leaf, Sparkles, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Truck, RotateCcw, ShieldCheck, Star, Heart, Package, Leaf, Sparkles, Shield,
};

function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? ShieldCheck;
}

interface WhyImportsProps {
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

export function WhyImports({
  benefit1Icon = "Truck",
  benefit1Title = "Worldwide Shipping",
  benefit1Text = "Premium delivery to your door, wherever you are.",
  benefit2Icon = "RotateCcw",
  benefit2Title = "30-Day Returns",
  benefit2Text = "Satisfaction guaranteed or full refund.",
  benefit3Icon = "ShieldCheck",
  benefit3Title = "Secure Checkout",
  benefit3Text = "End-to-end encrypted transactions, always.",
}: WhyImportsProps) {
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
        borderTop: "1px solid rgba(201,201,201,0.15)",
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(201,201,201,0.15)]">
          {benefits.map(({ icon: Icon, title, description }, idx) => (
            <div key={idx} className="flex items-start gap-4 px-8 py-6">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#C9C9C9" }} />
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
