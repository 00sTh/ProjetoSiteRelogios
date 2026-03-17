"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { GoldButton } from "@/components/ui/gold-button";
import { SectionTitle } from "@/components/ui/section-title";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface NossaHistoriaTeaserProps {
  videoUrl?: string;
  videoTitle?: string;
  videoDesc?: string;
}

export function NossaHistoriaTeaser({
  videoUrl,
  videoTitle = "The Story of S Luxury Collection",
  videoDesc,
}: NossaHistoriaTeaserProps) {
  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,201,201,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center space-y-10"
        >
          <motion.div variants={fadeInUp}>
            <SectionTitle
              label="The Craft"
              title="The Art of Fine Timekeeping"
              subtitle="Born from a passion for the world's finest timepieces and eyewear. Rigorous curation, guaranteed authenticity, and a premium experience in every detail."
              align="center"
              animate={false}
            />
          </motion.div>

          {/* Video teaser card */}
          <motion.div variants={fadeInUp}>
            <div
              className="relative rounded-3xl overflow-hidden mx-auto max-w-2xl cursor-pointer group"
              style={{
                background: "linear-gradient(135deg, #111111 0%, #1A1A1A 100%)",
                border: "1px solid rgba(201,201,201,0.25)",
                aspectRatio: "16/9",
              }}
            >
              {/* Background texture */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 40%, rgba(201,201,201,0.4) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(201,201,201,0.15) 0%, transparent 40%)",
                }}
              />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="flex flex-col items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(201,201,201,0.5)]"
                    style={{
                      backgroundColor: "rgba(201,201,201,0.15)",
                      border: "2px solid rgba(201,201,201,0.6)",
                    }}
                  >
                    <Play
                      className="h-8 w-8 ml-1"
                      style={{ color: "#C9C9C9" }}
                    />
                  </div>
                  <p
                    className="font-serif text-xl italic"
                    style={{ color: "#F5F5F5" }}
                  >
                    {videoTitle}
                  </p>
                </motion.div>
              </div>

              {/* Bottom gradient */}
              <div
                className="absolute bottom-0 left-0 right-0 h-16"
                style={{
                  background: "linear-gradient(to top, rgba(10,10,10,0.8), transparent)",
                }}
              />

              {/* Duration badge */}
              <div
                className="absolute bottom-4 right-4 px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#9A9A9A",
                }}
              >
                3:47
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex justify-center gap-4 flex-wrap">
            <GoldButton variant="primary" size="lg" asChild>
              <Link href="/videos">
                Watch the Story <Play className="h-4 w-4 ml-1" />
              </Link>
            </GoldButton>
            <GoldButton variant="outline" size="lg" asChild>
              <Link href="/about">
                Our Mission <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </GoldButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
