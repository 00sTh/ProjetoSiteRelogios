"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative w-full" style={{ height: "100vh", minHeight: "600px", paddingTop: "64px" }}>
      <div className="flex h-full">
        {/* Left: editorial image */}
        <div className="relative hidden md:block" style={{ width: "60%" }}>
          <Image
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=90"
            alt="SLC Luxury Collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 70%, #F7F4EE)" }} />
        </div>

        {/* Right: text panel */}
        <motion.div
          className="flex flex-col justify-center px-10 md:px-16"
          style={{ width: "100%", maxWidth: "100%", flex: "1", backgroundColor: "#F7F4EE" }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="label-slc mb-6" variants={fadeInUp} style={{ color: "rgba(13,11,11,0.4)" }}>
            S Luxury Collection
          </motion.p>
          <motion.h1 className="font-serif font-light leading-none mb-2" style={{ fontSize: "clamp(3rem,6vw,5rem)", color: "#0D0B0B" }} variants={fadeInUp}>
            Objetos de
          </motion.h1>
          <motion.h1 className="font-serif italic font-light leading-none mb-8" style={{ fontSize: "clamp(3rem,6vw,5rem)", color: "#B8963E" }} variants={fadeInUp}>
            Desejo.
          </motion.h1>
          <motion.hr className="divider-gold ml-0" style={{ margin: "0 0 2rem 0", width: "3rem" }} variants={fadeInUp} />
          <motion.p className="label-slc mb-10" variants={fadeInUp}>
            Relógios · Perfumes · Bolsas · Sapatos
          </motion.p>
          <motion.div className="flex gap-4 flex-wrap" variants={fadeInUp}>
            <Link
              href="/relogios"
              className="px-8 py-3 text-[10px] tracking-[0.4em] uppercase transition-all"
              style={{ backgroundColor: "#0D0B0B", color: "#F7F4EE" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#1C1917"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "#0D0B0B"; }}
            >
              Explorar Coleção
            </Link>
            <Link href="/perfumes" className="cta-link py-3">
              Ver Perfumes
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
