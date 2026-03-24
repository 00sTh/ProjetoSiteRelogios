"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

// URLs dos vídeos — trocar por vídeos reais de luxo
const VIDEO_LEFT = "https://res.cloudinary.com/dwmkytbxf/video/upload/v1/slc/hero-left.mp4";
const VIDEO_RIGHT = "https://res.cloudinary.com/dwmkytbxf/video/upload/v1/slc/hero-right.mp4";

// Fallback: vídeos públicos de relógios/luxo enquanto não há upload próprio
const FALLBACK_LEFT = "https://www.w3schools.com/html/mov_bbb.mp4";
const FALLBACK_RIGHT = "https://www.w3schools.com/html/mov_bbb.mp4";

export function HeroSection() {
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
            <source src="https://player.vimeo.com/progressive_redirect/playback/824804225/rendition/720p/file.mp4?loc=external" type="video/mp4" />
          </video>
          {/* Overlay escuro + gradiente para o centro */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(13,11,11,0.2) 0%, rgba(13,11,11,0.6) 100%)" }} />
          {/* Label categoria */}
          <div className="absolute bottom-10 left-8 z-10">
            <p className="label-slc mb-1" style={{ color: "rgba(247,244,238,0.6)" }}>Categoria</p>
            <Link href="/relogios" className="font-serif text-2xl font-light text-white hover:text-[#B8963E] transition-colors">
              Relógios de Luxo →
            </Link>
          </div>
        </div>

        {/* Center divider — linha dourada */}
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
            <source src="https://player.vimeo.com/progressive_redirect/playback/517090527/rendition/720p/file.mp4?loc=external" type="video/mp4" />
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
              Objetos de
            </motion.h1>
            <motion.h1
              className="font-serif italic font-light leading-none mb-6"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", color: "#B8963E" }}
              variants={fadeInUp}
            >
              Desejo.
            </motion.h1>
            <motion.hr className="divider-gold" style={{ margin: "0 auto 1.5rem", width: "2.5rem" }} variants={fadeInUp} />
            <motion.p className="label-slc mb-8" variants={fadeInUp} style={{ color: "rgba(247,244,238,0.7)" }}>
              Relógios · Perfumes · Bolsas · Sapatos
            </motion.p>
            <motion.div className="flex gap-4 flex-wrap justify-center" variants={fadeInUp}>
              <Link
                href="/relogios"
                className="px-8 py-3 text-[10px] tracking-[0.4em] uppercase transition-all"
                style={{ backgroundColor: "#B8963E", color: "#F7F4EE" }}
              >
                Explorar Coleção
              </Link>
              <Link
                href="/perfumes"
                className="px-8 py-3 text-[10px] tracking-[0.4em] uppercase border transition-all"
                style={{ borderColor: "rgba(247,244,238,0.5)", color: "#F7F4EE" }}
              >
                Ver Perfumes
              </Link>
            </motion.div>
          </motion.div>

          {/* Label categoria direita (desktop) */}
          <div className="absolute bottom-10 right-8 z-10 text-right hidden md:block">
            <p className="label-slc mb-1" style={{ color: "rgba(247,244,238,0.6)" }}>Categoria</p>
            <Link href="/perfumes" className="font-serif text-2xl font-light text-white hover:text-[#B8963E] transition-colors">
              ← Perfumes
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
