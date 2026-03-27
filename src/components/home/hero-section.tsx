"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export type HeroConfig = {
  title: string;
  titleItalic: string;
  tagline: string;
  cta1Text: string;
  cta1Href: string;
  cta2Text: string;
  cta2Href: string;
  videoLeft: string;
  videoRight: string;
  labelLeft: string;
  labelLeftHref: string;
  labelRight: string;
  labelRightHref: string;
};

const IFRAME_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "177.78vh",
  height: "100vh",
  minWidth: "100%",
  minHeight: "56.25vw",
  transform: "translate(-50%, -50%) scale(1.5)",
  pointerEvents: "none",
};

export function HeroSection({ config: _ }: { config: HeroConfig }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "600px", paddingTop: "64px" }}
    >
      {/* SLC — logo flutuante centralizado entre os dois lados (desktop) */}
      <div className="absolute z-20 hidden md:flex flex-col items-center" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <span
          className="font-serif tracking-[0.7em] uppercase"
          style={{ fontSize: "0.7rem", color: "rgba(184,150,62,0.85)", textShadow: "0 1px 6px rgba(0,0,0,0.8)", letterSpacing: "0.7em" }}
        >
          SLC
        </span>
      </div>

      <div className="flex h-full">

        {/* ── Esquerda: Moda Masculina ── */}
        <div className="relative hidden md:flex" style={{ width: "50%" }}>
          {/* Vídeo */}
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/mMuPO0r8KKM?autoplay=1&mute=1&loop=1&playlist=mMuPO0r8KKM&controls=0&rel=0&playsinline=1&modestbranding=1"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute"
              style={{ ...IFRAME_STYLE, filter: "brightness(0.6)" }}
            />
          </div>

          {/* Overlay frio — azul-escuro */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(160deg, rgba(8,14,32,0.35) 0%, rgba(8,14,32,0.72) 100%)" }}
          />

          {/* Texto centralizado */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeInUp}
              className="mb-4"
              style={{ fontSize: "0.6rem", letterSpacing: "0.55em", textTransform: "uppercase", color: "#7A9CC8", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
            >
              Coleção
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="font-serif font-light leading-none"
              style={{ fontSize: "clamp(2rem,3.5vw,3.8rem)", color: "#D8E4F8", textShadow: "0 2px 10px rgba(0,0,0,0.75)" }}
            >
              Moda
            </motion.h2>
            <motion.h2
              variants={fadeInUp}
              className="font-serif italic font-light leading-none mb-6"
              style={{ fontSize: "clamp(2rem,3.5vw,3.8rem)", color: "#D8E4F8", textShadow: "0 2px 10px rgba(0,0,0,0.75)" }}
            >
              Masculina
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              style={{ width: "2rem", height: "1px", backgroundColor: "#7A9CC8", margin: "0 auto 1.5rem" }}
            />
            <motion.div variants={fadeInUp}>
              <Link
                href="/relogios"
                className="transition-opacity hover:opacity-70"
                style={{ fontSize: "0.6rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "#B0C4E8", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
              >
                Explorar →
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Divisor dourado */}
        <div className="hidden md:block flex-shrink-0" style={{ width: "2px", backgroundColor: "#B8963E", zIndex: 10 }} />

        {/* ── Direita: Moda Feminina ── */}
        <div className="relative flex-1">
          {/* Vídeo */}
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/3HN847uE9Kc?autoplay=1&mute=1&loop=1&playlist=3HN847uE9Kc&controls=0&rel=0&playsinline=1&modestbranding=1"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute"
              style={{ ...IFRAME_STYLE, filter: "brightness(0.58)" }}
            />
          </div>

          {/* Overlay quente — bordeaux-rosê */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(160deg, rgba(42,8,18,0.3) 0%, rgba(42,8,18,0.68) 100%)" }}
          />

          {/* Texto centralizado */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeInUp}
              className="mb-4"
              style={{ fontSize: "0.6rem", letterSpacing: "0.55em", textTransform: "uppercase", color: "#C47860", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
            >
              Coleção
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="font-serif font-light leading-none"
              style={{ fontSize: "clamp(2rem,3.5vw,3.8rem)", color: "#F4D4C8", textShadow: "0 2px 10px rgba(0,0,0,0.75)" }}
            >
              Moda
            </motion.h2>
            <motion.h2
              variants={fadeInUp}
              className="font-serif italic font-light leading-none mb-6"
              style={{ fontSize: "clamp(2rem,3.5vw,3.8rem)", color: "#F4D4C8", textShadow: "0 2px 10px rgba(0,0,0,0.75)" }}
            >
              Feminina
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              style={{ width: "2rem", height: "1px", backgroundColor: "#C47860", margin: "0 auto 1.5rem" }}
            />
            <motion.div variants={fadeInUp}>
              <Link
                href="/bolsas"
                className="transition-opacity hover:opacity-70"
                style={{ fontSize: "0.6rem", letterSpacing: "0.45em", textTransform: "uppercase", color: "#E8B8A8", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
              >
                Explorar →
              </Link>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
