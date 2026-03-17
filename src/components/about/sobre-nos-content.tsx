"use client";

import { motion } from "framer-motion";
import { Heart, ShieldCheck, Globe, Star, Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { staggerContainer, fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";

const values = [
  {
    icon: ShieldCheck,
    title: "Autenticidade",
    description:
      "Todos os produtos são 100% originais, adquiridos diretamente de fabricantes e distribuidores autorizados internacionais.",
  },
  {
    icon: Star,
    title: "Curadoria",
    description:
      "Nossa equipe seleciona apenas o que há de melhor no mercado global, testando e aprovando cada produto antes de oferecer.",
  },
  {
    icon: Heart,
    title: "Experiência",
    description:
      "Do atendimento à entrega, cada detalhe é pensado para que você tenha uma experiência de compra premium e sem preocupações.",
  },
  {
    icon: Globe,
    title: "Alcance Global",
    description:
      "Parcerias com fornecedores em mais de 20 países para trazer ao Brasil o que o mundo tem de mais sofisticado e exclusivo.",
  },
];

const timeline = [
  { year: "2019", event: "Fundação da Imports com foco em relógios e acessórios importados" },
  { year: "2020", event: "Expansão para eletrônicos premium e parcerias com fornecedores europeus" },
  { year: "2022", event: "Lançamento das categorias Moda e Bolsas & Carteiras de luxo" },
  { year: "2024", event: "Abertura do centro de distribuição próprio com despacho em 24h" },
  { year: "2025", event: "Parceria com mais de 40 marcas internacionais exclusivas" },
  { year: "2026", event: "Lançamento da nova plataforma digital com experiência premium" },
];

interface SobreNosContentProps {
  aboutTitle: string;
  aboutText: string;
  aboutImageUrl?: string;
}

export function SobreNosContent({ aboutTitle, aboutText }: SobreNosContentProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Hero */}
      <div
        className="relative py-24 px-4 text-center overflow-hidden"
        style={{
          backgroundColor: "#111111",
          borderBottom: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <span
            className="inline-flex items-center gap-2 label-luxury mb-6"
            style={{ color: "#D4AF37" }}
          >
            <Sparkles className="h-3 w-3" />
            Nossa Essência
          </span>
          <h1
            className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ color: "#F5F5F5" }}
          >
            <span className="text-gradient-gold italic">{aboutTitle}</span>
          </h1>
          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "#9A9A9A" }}
          >
            {aboutText}
          </p>
        </motion.div>
      </div>

      {/* Missão */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <SectionTitle
                label="Nossa Missão"
                title="O Melhor do Mundo, no Brasil"
                subtitle="Acreditamos que todo brasileiro merece acesso aos melhores produtos internacionais com autenticidade garantida, preço justo e entrega confiável."
                align="left"
                animate={false}
              />
              <div className="mt-8 space-y-4">
                {[
                  "Produtos 100% originais com nota fiscal",
                  "Importação direta, sem intermediários",
                  "Garantia internacional em todos os produtos",
                  "Suporte ao cliente em português 7 dias por semana",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: "#D4AF37" }}
                    />
                    <span className="text-sm" style={{ color: "#9A9A9A" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <div
                className="relative rounded-3xl p-12 text-center"
                style={{
                  background: "linear-gradient(135deg, #111111 0%, #1A1A1A 100%)",
                  border: "1px solid rgba(212,175,55,0.25)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      "radial-gradient(circle at 60% 40%, rgba(212,175,55,0.12) 0%, transparent 60%)",
                  }}
                />
                <div className="relative z-10">
                  <p className="font-serif text-6xl font-bold mb-3" style={{ color: "#D4AF37" }}>
                    40+
                  </p>
                  <p className="label-luxury mb-8" style={{ color: "#9A9A9A" }}>
                    Marcas Internacionais
                  </p>
                  <div
                    className="h-px my-6"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)",
                    }}
                  />
                  <p className="font-serif text-6xl font-bold mb-3" style={{ color: "#D4AF37" }}>
                    30K+
                  </p>
                  <p className="label-luxury" style={{ color: "#9A9A9A" }}>
                    Clientes Satisfeitos
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 px-4" style={{ backgroundColor: "#111111" }}>
        <div className="container mx-auto max-w-7xl">
          <SectionTitle
            label="Nossos Valores"
            title="O que nos Guia"
            subtitle="Cada decisão na Imports é tomada com base em quatro pilares fundamentais."
            align="center"
            className="mb-16"
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {values.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeInUp}
                className="flex gap-5 p-6 rounded-2xl"
                style={{
                  backgroundColor: "rgba(10,10,10,0.5)",
                  border: "1px solid rgba(212,175,55,0.12)",
                }}
                whileHover={{ borderColor: "rgba(212,175,55,0.4)", boxShadow: "0 0 20px rgba(212,175,55,0.08)" }}
              >
                <div
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#D4AF37" }} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg mb-2" style={{ color: "#F5F5F5" }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A" }}>
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <SectionTitle
            label="Nossa Trajetória"
            title="Uma Jornada de Dedicação"
            align="center"
            className="mb-16"
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="relative"
          >
            <div
              className="absolute left-12 top-0 bottom-0 w-px hidden sm:block"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(212,175,55,0.3) 10%, rgba(212,175,55,0.3) 90%, transparent)",
              }}
            />
            <div className="space-y-8">
              {timeline.map(({ year, event }) => (
                <motion.div key={year} variants={fadeInUp} className="flex items-start gap-6 sm:gap-8">
                  <div
                    className="shrink-0 w-24 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10"
                    style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)", color: "#D4AF37" }}
                  >
                    {year}
                  </div>
                  <div
                    className="flex-1 py-3 px-5 rounded-xl"
                    style={{ backgroundColor: "#111111", border: "1px solid rgba(212,175,55,0.12)" }}
                  >
                    <p className="text-sm" style={{ color: "#9A9A9A" }}>{event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
