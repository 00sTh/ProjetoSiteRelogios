"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

interface SectionTitleProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
  titleClassName?: string;
  animate?: boolean;
}

export function SectionTitle({
  label,
  title,
  subtitle,
  align = "center",
  className,
  titleClassName,
  animate = true,
}: SectionTitleProps) {
  const alignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[align];

  const content = (
    <div className={cn("flex flex-col gap-3", alignClass, className)}>
      {label && (
        <span className="label-luxury text-[#C9C9C9] font-medium tracking-[0.3em]">
          {label}
        </span>
      )}
      <h2
        className={cn(
          "font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#F5F5F5] leading-tight",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#9A9A9A] text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-2 h-px w-16 bg-gradient-to-r from-transparent via-[#C9C9C9] to-transparent",
          align === "center" && "mx-auto",
          align === "right" && "ml-auto"
        )}
      />
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
    >
      {content}
    </motion.div>
  );
}
