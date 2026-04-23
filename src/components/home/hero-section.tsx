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

const DEFAULT_IMG_LEFT = "https://res.cloudinary.com/dwmkytbxf/image/upload/v1776974188/slc/categories/hoa3a70va8oh8gpxoyca.jpg";
const DEFAULT_IMG_RIGHT = "https://res.cloudinary.com/dwmkytbxf/image/upload/v1776976180/slc/categories/d9civfnqn9xlseifwhhh.jpg";

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function isYouTube(url: string) {
  return url.includes("youtube.com/embed") || url.includes("youtube-nocookie.com/embed");
}

function toNoCookieHD(url: string): string {
  if (!url) return url;
  return url
    .replace("www.youtube.com/embed", "www.youtube-nocookie.com/embed")
    .replace("youtube.com/embed", "youtube-nocookie.com/embed")
    .replace(/&vq=[^&]*/g, "")
    .replace(/&iv_load_policy=[^&]*/g, "") +
    "&vq=hd1080&iv_load_policy=3";
}

const IFRAME_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "200vw",
  height: "112.5vw",
  minWidth: "177.78vh",
  minHeight: "100vh",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
};

function HeroBg({ url, fallback, brightness }: { url: string; fallback: string; brightness: number }) {
  const src = url || fallback;
  if (isDirectVideo(src)) {
    return (
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: `brightness(${brightness})` }}>
        <source src={src} type="video/mp4" />
      </video>
    );
  }
  if (isYouTube(src)) {
    return (
      <iframe
        src={toNoCookieHD(src)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute"
        style={{ ...IFRAME_STYLE, filter: `brightness(${brightness})` }}
      />
    );
  }
  // imagem (Cloudinary ou qualquer URL)
  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: `brightness(${brightness})` }}
    />
  );
}

export function HeroSection({ config }: { config: HeroConfig }) {
  const videoLeft = config.videoLeft || "";
  const videoRight = config.videoRight || "";

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
          <div className="absolute inset-0 overflow-hidden bg-[#0D0B0B]">
            <HeroBg url={videoLeft} fallback={DEFAULT_IMG_LEFT} brightness={0.6} />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(160deg, rgba(8,14,32,0.35) 0%, rgba(8,14,32,0.72) 100%)" }}
          />

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
          <div className="absolute inset-0 overflow-hidden bg-[#0D0B0B]">
            <HeroBg url={videoRight} fallback={DEFAULT_IMG_RIGHT} brightness={0.58} />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(160deg, rgba(42,8,18,0.3) 0%, rgba(42,8,18,0.68) 100%)" }}
          />

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
