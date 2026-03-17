"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const extraVideos = [
  {
    id: "1",
    title: "Ritual de Manhã com Lumina",
    duration: "2:15",
    description: "Aprenda a aplicar o Sérum Lumina para máxima eficácia.",
  },
  {
    id: "2",
    title: "Ingredientes da Amazônia",
    duration: "4:30",
    description: "Conheça os ativos raros coletados de forma sustentável na floresta.",
  },
  {
    id: "3",
    title: "Ciência por Trás da Fórmula",
    duration: "5:12",
    description: "Nosso laboratório e o processo de criação dos produtos S Luxury Collection.",
  },
];

interface VideosContentProps {
  featuredVideoUrl?: string;
  featuredVideoTitle: string;
  featuredVideoDesc: string;
}

export function VideosContent({
  featuredVideoUrl,
  featuredVideoTitle,
  featuredVideoDesc,
}: VideosContentProps) {
  // Extract YouTube ID from URL if provided
  const youtubeId = featuredVideoUrl
    ? featuredVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1]
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Hero */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ backgroundColor: "#111111", borderBottom: "1px solid rgba(212,175,55,0.2)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 label-luxury mb-4" style={{ color: "#D4AF37" }}>
              <Sparkles className="h-3 w-3" />
              S Luxury Collection Stories
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4" style={{ color: "#F5F5F5" }}>
              Vídeos & Histórias
            </h1>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: "#9A9A9A" }}>
              Mergulhe no universo S Luxury Collection — da pesquisa científica aos rituais de beleza que transformam.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Featured video */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-16"
        >
          <div
            className="relative rounded-3xl overflow-hidden cursor-pointer group"
            style={{
              background: "linear-gradient(135deg, #111111 0%, #1A1A1A 100%)",
              border: "1px solid rgba(212,175,55,0.25)",
              aspectRatio: "16/9",
            }}
          >
            {youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title={featuredVideoTitle}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 40%, rgba(212,175,55,0.4) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(30,122,90,0.5) 0%, transparent 40%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                    style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "2px solid rgba(212,175,55,0.6)" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Play className="h-10 w-10 ml-1" style={{ color: "#D4AF37" }} />
                  </motion.div>
                  <div className="text-center px-8">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2" style={{ color: "#F5F5F5" }}>
                      {featuredVideoTitle}
                    </h2>
                    <p className="text-base max-w-lg" style={{ color: "#9A9A9A" }}>
                      {featuredVideoDesc}
                    </p>
                  </div>
                </div>
                <div
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold label-luxury"
                  style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
                >
                  Em destaque
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* More videos */}
        <SectionTitle label="Mais Vídeos" title="Explore o Canal" align="left" className="mb-10" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {extraVideos.map((video) => (
            <motion.div
              key={video.id}
              variants={fadeInUp}
              className="group cursor-pointer rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#111111", border: "1px solid rgba(212,175,55,0.15)" }}
              whileHover={{ boxShadow: "0 0 25px rgba(212,175,55,0.1)" }}
            >
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #1A1A1A 0%, #111111 100%)" }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.5) 0%, transparent 60%)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}
                  >
                    <Play className="h-5 w-5 ml-0.5" style={{ color: "#D4AF37" }} />
                  </div>
                </div>
                <div
                  className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#9A9A9A" }}
                >
                  {video.duration}
                </div>
              </div>
              <div className="p-5">
                <h3
                  className="font-serif font-semibold text-base mb-2 group-hover:text-[#D4AF37] transition-colors"
                  style={{ color: "#F5F5F5" }}
                >
                  {video.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A" }}>
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
