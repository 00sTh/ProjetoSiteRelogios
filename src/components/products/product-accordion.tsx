"use client";

import { useState } from "react";
import { ChevronDown, Settings2, Shield } from "lucide-react";

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, icon, content, isOpen, onToggle }: AccordionItemProps) {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: "rgba(20,20,20,0.5)",
        border: isOpen
          ? "1px solid rgba(201,201,201,0.35)"
          : "1px solid rgba(201,201,201,0.15)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span style={{ color: "#C9C9C9" }}>{icon}</span>
          <span
            className="font-serif font-semibold text-base"
            style={{ color: "#F5F5F5" }}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-300"
          style={{
            color: "#C9C9C9",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? "600px" : "0px" }}
      >
        <div className="px-5 pb-5">
          <div
            className="h-px mb-4"
            style={{
              background:
                "linear-gradient(to right, rgba(201,201,201,0.2), transparent)",
            }}
          />
          {lines.length > 1 ? (
            <ul className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#9A9A9A" }}>
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: "#C9C9C9" }}
                  />
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A" }}>
              {content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductAccordionProps {
  ingredients?: string | null;
  usage?: string | null;
}

export function ProductAccordion({ ingredients, usage }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      title: "Specifications",
      icon: <Settings2 className="h-4 w-4" />,
      content: ingredients,
    },
    {
      title: "Care & Warranty",
      icon: <Shield className="h-4 w-4" />,
      content: usage,
    },
  ].filter((item) => item.content);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <AccordionItem
          key={item.title}
          title={item.title}
          icon={item.icon}
          content={item.content!}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
