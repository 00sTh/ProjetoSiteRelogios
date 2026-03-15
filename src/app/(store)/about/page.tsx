import type { Metadata } from "next";
import { Shield, Globe, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/section-title";
import { GoldButton } from "@/components/ui/gold-button";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind LuxImport — curating the world's finest timepieces and eyewear.",
};

const values = [
  {
    icon: Shield,
    title: "Authenticity",
    description:
      "Every piece we carry is verified for authenticity before it reaches you. We work directly with authorized distributors and brand representatives to ensure you receive exactly what you paid for.",
  },
  {
    icon: Globe,
    title: "Curation",
    description:
      "We scour global markets to identify pieces that meet our rigorous standards of craftsmanship, heritage, and design. Only the finest timepieces and eyewear make it to our collection.",
  },
  {
    icon: Award,
    title: "Trust",
    description:
      "Our relationship with our clients is built on trust, transparency, and excellence. From the moment you browse to the moment your piece arrives, we are committed to an exceptional experience.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh" }}>
      {/* Hero */}
      <div
        className="relative py-24 px-4 text-center overflow-hidden"
        style={{
          backgroundColor: "#111111",
          borderBottom: "1px solid rgba(201,201,201,0.15)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,201,201,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p
            className="label-luxury mb-4"
            style={{ color: "#C9C9C9", letterSpacing: "0.25em", fontSize: "0.65rem" }}
          >
            Our Story
          </p>
          <h1
            className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ color: "#F5F5F5" }}
          >
            Precision. Heritage.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9C9C9 0%, #E8E8E8 50%, #C9C9C9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Excellence.
            </span>
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "#9A9A9A" }}
          >
            LuxImport was founded on the belief that the world's finest timepieces and eyewear
            should be accessible — with guaranteed authenticity, expert curation, and a purchasing
            experience worthy of the pieces themselves.
          </p>
        </div>
      </div>

      {/* Brand story */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionTitle
                label="The Beginning"
                title="Born from a Passion for Fine Horology"
                align="left"
                animate={false}
              />
              <div className="mt-6 space-y-4 text-base leading-relaxed" style={{ color: "#9A9A9A" }}>
                <p>
                  What began as a personal obsession with the art of watchmaking has grown into
                  a curated marketplace for those who appreciate the finest in horological and
                  optical craftsmanship.
                </p>
                <p>
                  We travel the world — from the ateliers of Switzerland to the workshops of
                  Japan — to source pieces that represent the pinnacle of their respective crafts.
                  Every watch, every pair of sunglasses in our collection tells a story of mastery.
                </p>
                <p>
                  Our clients are collectors, enthusiasts, and those who simply understand that
                  a great timepiece or a pair of exceptional sunglasses is not just an accessory —
                  it is an expression of character.
                </p>
              </div>
            </div>

            {/* Decorative panel */}
            <div
              className="relative rounded-3xl overflow-hidden aspect-square"
              style={{
                background: "linear-gradient(135deg, #111111 0%, #1A1A1A 50%, #141414 100%)",
                border: "1px solid rgba(201,201,201,0.15)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 60% 40%, rgba(201,201,201,0.08) 0%, transparent 60%)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 px-8">
                  <p
                    className="font-serif text-5xl font-bold"
                    style={{ color: "#C9C9C9" }}
                  >
                    100%
                  </p>
                  <p className="label-luxury" style={{ color: "#9A9A9A" }}>
                    Authenticated Pieces
                  </p>
                  <div
                    className="h-px w-16 mx-auto"
                    style={{ backgroundColor: "rgba(201,201,201,0.3)" }}
                  />
                  <p
                    className="font-serif text-5xl font-bold"
                    style={{ color: "#C9C9C9" }}
                  >
                    50+
                  </p>
                  <p className="label-luxury" style={{ color: "#9A9A9A" }}>
                    Global Brands
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="py-24 px-4"
        style={{
          backgroundColor: "#111111",
          borderTop: "1px solid rgba(201,201,201,0.12)",
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <SectionTitle
              label="Our Values"
              title="What We Stand For"
              subtitle="Three principles guide everything we do at LuxImport."
              align="center"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl p-8 space-y-5"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid rgba(201,201,201,0.12)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(201,201,201,0.08)",
                    border: "1px solid rgba(201,201,201,0.2)",
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#C9C9C9" }} />
                </div>
                <h3
                  className="font-serif text-2xl font-semibold"
                  style={{ color: "#F5F5F5" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9A9A9A" }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="container mx-auto max-w-2xl space-y-8">
          <SectionTitle
            label="Explore"
            title="Discover the Collection"
            subtitle="Browse our curated selection of the world's finest timepieces and eyewear."
            align="center"
          />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <GoldButton variant="primary" size="lg" asChild>
              <Link href="/products">
                View Collection <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </GoldButton>
            <GoldButton variant="outline" size="lg" asChild>
              <Link href="/products?category=watches">
                Shop Watches
              </Link>
            </GoldButton>
          </div>
        </div>
      </section>
    </div>
  );
}
