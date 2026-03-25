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

export function HeroSection({ config }: { config: HeroConfig }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px", paddingTop: "64px" }}>
      {/* Split video layout */}
      <div className="flex h-full">

        {/* Left half — vídeo 1 */}
        <div className="relative hidden md:flex" style={{ width: "50%" }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.75)" }}
          >
            <source src={config.videoLeft} type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(13,11,11,0.2) 0%, rgba(13,11,11,0.6) 100%)" }} />
          <div className="absolute bottom-10 left-8 z-10">
            <p className="label-slc mb-1" style={{ color: "rgba(247,244,238,0.6)" }}>Categoria</p>
            <Link href={config.labelLeftHref} className="font-serif text-2xl font-light text-white hover:text-[#B8963E] transition-colors">
              {config.labelLeft} →
            </Link>
          </div>
        </div>

        {/* Center divider */}
        <div className="hidden md:block flex-shrink-0" style={{ width: "2px", backgroundColor: "#B8963E", zIndex: 10 }} />

        {/* Right half — vídeo 2 + texto centralizado no mobile */}
        <div className="relative flex-1">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.72)" }}
          >
            <source src={config.videoRight} type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(13,11,11,0.2) 0%, rgba(13,11,11,0.6) 100%)" }} />

          {/* Texto central sobreposto */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="label-slc mb-4" variants={fadeInUp} style={{ color: "rgba(247,244,238,0.6)" }}>
              S Luxury Collection
            </motion.p>
            <motion.h1
              className="font-serif font-light leading-none mb-1"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", color: "#F7F4EE" }}
              variants={fadeInUp}
            >
              {config.title}
            </motion.h1>
            <motion.h1
              className="font-serif italic font-light leading-none mb-6"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", color: "#B8963E" }}
              variants={fadeInUp}
            >
              {config.titleItalic}
            </motion.h1>
            <motion.hr className="divider-gold" style={{ margin: "0 auto 1.5rem", width: "2.5rem" }} variants={fadeInUp} />
            <motion.p className="label-slc mb-8" variants={fadeInUp} style={{ color: "rgba(247,244,238,0.7)" }}>
              {config.tagline}
            </motion.p>
            <motion.div className="flex gap-4 flex-wrap justify-center" variants={fadeInUp}>
              <Link
                href={config.cta1Href}
                className="px-8 py-3 text-[10px] tracking-[0.4em] uppercase transition-all"
                style={{ backgroundColor: "#B8963E", color: "#F7F4EE" }}
              >
                {config.cta1Text}
              </Link>
              <Link
                href={config.cta2Href}
                className="px-8 py-3 text-[10px] tracking-[0.4em] uppercase border transition-all"
                style={{ borderColor: "rgba(247,244,238,0.5)", color: "#F7F4EE" }}
              >
                {config.cta2Text}
              </Link>
            </motion.div>
          </motion.div>

          {/* Label categoria direita (desktop) */}
          <div className="absolute bottom-10 right-8 z-10 text-right hidden md:block">
            <p className="label-slc mb-1" style={{ color: "rgba(247,244,238,0.6)" }}>Categoria</p>
            <Link href={config.labelRightHref} className="font-serif text-2xl font-light text-white hover:text-[#B8963E] transition-colors">
              ← {config.labelRight}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
