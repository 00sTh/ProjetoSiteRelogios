"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { GoldButton } from "@/components/ui/gold-button";
import { useRef, useState, useEffect, type RefObject } from "react";

// ─── Minimal YT Player types (no @types/youtube needed) ───────────────────────

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getDuration(): number;
  getCurrentTime(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          width?: string | number;
          height?: string | number;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// ─── Load YouTube IFrame API — singleton, safe for multiple VideoBackground ───

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return ytApiPromise;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  leftVideoUrl?: string | null;
  rightVideoUrl?: string | null;
  heroLogoUrl?: string | null;
}

// ─── YouTube helpers ──────────────────────────────────────────────────────────

function toYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com") && u.pathname.includes("/embed/"))
      return u.pathname.split("/embed/")[1]?.split("?")[0] ?? null;
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    return null;
  } catch { return null; }
}

// ─── Video controls UI ────────────────────────────────────────────────────────

function VideoControls({
  isMuted,
  isPaused,
  onMuteToggle,
  onPauseToggle,
}: {
  isMuted: boolean;
  isPaused: boolean;
  onMuteToggle: () => void;
  onPauseToggle: () => void;
}) {
  const btn =
    "flex items-center justify-center w-8 h-8 rounded-full border transition-opacity opacity-60 hover:opacity-100";
  const bStyle = {
    backgroundColor: "rgba(10,35,25,0.72)",
    borderColor: "rgba(201,162,39,0.45)",
    color: "#C9A227",
  };
  return (
    <div className="flex gap-2">
      <button onClick={onPauseToggle} aria-label={isPaused ? "Reproduzir" : "Pausar"} className={btn} style={bStyle}>
        {isPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
      </button>
      <button onClick={onMuteToggle} aria-label={isMuted ? "Ativar som" : "Silenciar"} className={btn} style={bStyle}>
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Video background ─────────────────────────────────────────────────────────
// Uses the full YouTube IFrame Player API (not postMessage hacks).
// Polling getCurrentTime() 0.4 s before end → seekTo(0) while still PLAYING,
// so the player never reaches ENDED state and never shows the black frame.

function VideoBackground({
  url,
  playerRef: externalPlayerRef,
}: {
  url: string;
  playerRef?: RefObject<YTPlayer | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalPlayerRef = useRef<YTPlayer | null>(null);
  const activeRef = externalPlayerRef ?? internalPlayerRef;
  const videoId = toYouTubeId(url);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    let destroyed = false;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let duration = 0;

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current || !window.YT?.Player) return;

      const player = new window.YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          // No loop=1/playlist — with loop=1 YouTube never emits ENDED
          // (confirmed bug: issuetracker.google.com/issues/240837347).
          // We handle looping entirely via JS polling below.
        },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            if (e.data === 1 /* PLAYING */) {
              // Grab duration once the video starts (may be 0 before this)
              duration = e.target.getDuration();

              if (!pollId) {
                pollId = setInterval(() => {
                  // Seek back 0.4 s before end — while still PLAYING.
                  // This prevents the ENDED state entirely, no black frame.
                  const cur = player.getCurrentTime();
                  if (duration > 0 && cur >= duration - 0.4) {
                    player.seekTo(0, true);
                  }
                }, 200);
              }
            } else {
              if (pollId) { clearInterval(pollId); pollId = null; }
              // Safety net: if ENDED somehow fires despite polling, restart.
              if (e.data === 0 /* ENDED */) {
                e.target.seekTo(0, true);
                e.target.playVideo();
              }
            }
          },
        },
      });

      activeRef.current = player;
    });

    return () => {
      destroyed = true;
      if (pollId) clearInterval(pollId);
      activeRef.current?.destroy();
      activeRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — videoId/refs stable

  if (videoId) {
    return (
      // overflow-hidden + scale(1.1) clips YouTube title bar / watermark at edges
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={containerRef}
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1.1)",
            height: "100vh",
            width: "calc(100vh * 16 / 9)",
            minWidth: "100%",
            minHeight: "100%",
          }}
        />
      </div>
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    >
      <source src={url} />
    </video>
  );
}

// ─── Gradient fallback ────────────────────────────────────────────────────────

function EmeraldGradient() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(160deg, #051F18 0%, #0A3D2F 45%, #0F4A37 75%, #0A3D2F 100%)",
      }}
    />
  );
}

// ─── Framer Motion variants ───────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.4 } },
};

const panelVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.6, ease: "easeOut" } },
};

const logoVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "circOut" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const lineGrow: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

// ─── Split-screen (Dior) ──────────────────────────────────────────────────────

function SplitHero({
  title,
  subtitle,
  leftVideoUrl,
  rightVideoUrl,
  heroLogoUrl,
}: {
  title: string;
  subtitle: string;
  leftVideoUrl?: string | null;
  rightVideoUrl?: string | null;
  heroLogoUrl?: string | null;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const mobilePlayerRef = useRef<YTPlayer | null>(null);
  const leftPlayerRef   = useRef<YTPlayer | null>(null);
  const rightPlayerRef  = useRef<YTPlayer | null>(null);

  const hasVideo = !!(leftVideoUrl || rightVideoUrl);

  const callAll = (fn: (p: YTPlayer) => void) => {
    [mobilePlayerRef, leftPlayerRef, rightPlayerRef].forEach((r) => {
      if (r.current) fn(r.current);
    });
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    callAll(next ? (p) => p.mute() : (p) => p.unMute());
  };

  const handlePauseToggle = () => {
    const next = !isPaused;
    setIsPaused(next);
    callAll(next ? (p) => p.pauseVideo() : (p) => p.playVideo());
  };

  return (
    <section className="relative h-screen overflow-hidden">

      {/* ── Mobile: painel único ── */}
      <div className="md:hidden absolute inset-0">
        {leftVideoUrl ? (
          <VideoBackground url={leftVideoUrl} playerRef={mobilePlayerRef} />
        ) : rightVideoUrl ? (
          <VideoBackground url={rightVideoUrl} playerRef={mobilePlayerRef} />
        ) : (
          <EmeraldGradient />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(10,61,47,0.55)" }}
        />
      </div>

      {/* ── Desktop: 50 / 50 ── */}
      <div className="hidden md:flex absolute inset-0">
        <motion.div
          className="relative w-1/2 h-full overflow-hidden"
          variants={panelVariant}
          initial="hidden"
          animate="visible"
        >
          {leftVideoUrl ? <VideoBackground url={leftVideoUrl} playerRef={leftPlayerRef} /> : <EmeraldGradient />}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(10,61,47,0.22) 0%, rgba(10,61,47,0.60) 100%)" }}
          />
        </motion.div>

        <motion.div
          className="relative w-1/2 h-full overflow-hidden"
          variants={panelVariant}
          initial="hidden"
          animate="visible"
        >
          {rightVideoUrl ? <VideoBackground url={rightVideoUrl} playerRef={rightPlayerRef} /> : <EmeraldGradient />}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to left, rgba(10,61,47,0.22) 0%, rgba(10,61,47,0.60) 100%)" }}
          />
        </motion.div>
      </div>

      {/* ── Linha divisória central (desktop) ── */}
      <motion.div
        className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px z-10"
        variants={lineGrow}
        initial="hidden"
        animate="visible"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.55) 20%, rgba(201,162,39,0.55) 80%, transparent 100%)",
          transformOrigin: "top",
        }}
      />

      {/* ── Conteúdo central ── */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={lineGrow}
          className="h-14 w-px mb-5"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(201,162,39,0.7))", transformOrigin: "top" }}
        />

        <motion.div variants={logoVariant} className="mb-4 text-center">
          {heroLogoUrl ? (
            <Image
              src={heroLogoUrl}
              alt="Althéia"
              width={340}
              height={120}
              priority
              className="object-contain w-[200px] md:w-[340px] h-auto"
            />
          ) : (
            <span
              className="font-serif font-bold tracking-[0.22em] uppercase"
              style={{ color: "#F5F0E6", fontSize: "clamp(2.4rem, 6.5vw, 5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
            >
              Althéia
            </span>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="w-14 h-px mb-5" style={{ backgroundColor: "rgba(201,162,39,0.65)" }} />

        <motion.p
          variants={fadeUp}
          className="text-center max-w-[260px] md:max-w-[340px] mb-8"
          style={{ color: "#C9A227", fontSize: "0.6rem", letterSpacing: "0.22em", lineHeight: 2, textTransform: "uppercase" }}
        >
          {subtitle}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
          <GoldButton variant="primary" size="lg" asChild>
            <Link href="/products">
              Descubra a coleção <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </GoldButton>
          <GoldButton variant="outline" size="lg" asChild>
            <Link href="/videos">
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Assista o filme
            </Link>
          </GoldButton>
        </motion.div>

        <motion.div
          variants={lineGrow}
          className="h-14 w-px mt-5"
          style={{ background: "linear-gradient(to top, transparent, rgba(201,162,39,0.7))", transformOrigin: "bottom" }}
        />
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0A3D2F, transparent)" }}
      />

      {/* Video controls */}
      {hasVideo && (
        <div className="absolute bottom-8 right-8 z-30">
          <VideoControls
            isMuted={isMuted}
            isPaused={isPaused}
            onMuteToggle={handleMuteToggle}
            onPauseToggle={handlePauseToggle}
          />
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-5 h-9 rounded-full border flex items-start justify-center pt-1.5"
          style={{ borderColor: "rgba(201,162,39,0.5)" }}
        >
          <div className="w-0.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A227" }} />
        </div>
      </motion.div>
    </section>
  );
}

// ─── Hero legado ──────────────────────────────────────────────────────────────

function LegacyHero({
  title,
  subtitle,
  heroImageUrl,
  heroVideoUrl,
}: {
  title: string;
  subtitle: string;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const videoPlayerRef = useRef<YTPlayer | null>(null);
  const isYouTube = heroVideoUrl ? !!toYouTubeId(heroVideoUrl) : false;

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (next) videoPlayerRef.current?.mute();
    else videoPlayerRef.current?.unMute();
  };

  const handlePauseToggle = () => {
    const next = !isPaused;
    setIsPaused(next);
    if (next) videoPlayerRef.current?.pauseVideo();
    else videoPlayerRef.current?.playVideo();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {heroVideoUrl ? (
        <>
          <VideoBackground url={heroVideoUrl} playerRef={videoPlayerRef} />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,61,47,0.65)" }} />
        </>
      ) : heroImageUrl ? (
        <>
          <Image src={heroImageUrl} alt="Hero" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,61,47,0.60)" }} />
        </>
      ) : (
        <EmeraldGradient />
      )}

      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)" }}
      />

      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-6 flex flex-col items-center">
          <div
            className="h-12 w-px mb-6"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(201,162,39,0.6))" }}
          />
          <span
            className="font-serif font-bold tracking-[0.2em] uppercase"
            style={{ color: "#F5F0E6", fontSize: "clamp(2.8rem, 8vw, 5.5rem)" }}
          >
            Althéia
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="w-16 h-px mx-auto mb-5" style={{ backgroundColor: "rgba(201,162,39,0.5)" }} />

        <motion.h1
          variants={fadeUp}
          className="font-serif text-3xl md:text-5xl font-bold italic leading-tight mb-4"
          style={{ color: "#F5F0E6" }}
        >
          {title}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#C8BBA8" }}
        >
          {subtitle}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
          <GoldButton variant="primary" size="lg" asChild>
            <Link href="/products">
              Explorar Coleção <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </GoldButton>
          <GoldButton variant="outline" size="lg" asChild>
            <Link href="/sobre-nos">Nossa História</Link>
          </GoldButton>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-12 h-px max-w-xs mx-auto"
          style={{ backgroundColor: "rgba(201,162,39,0.25)" }}
        />
      </motion.div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0A3D2F, transparent)" }}
      />

      {isYouTube && (
        <div className="absolute bottom-8 right-8 z-20">
          <VideoControls
            isMuted={isMuted}
            isPaused={isPaused}
            onMuteToggle={handleMuteToggle}
            onPauseToggle={handlePauseToggle}
          />
        </div>
      )}

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-5 h-9 rounded-full border flex items-start justify-center pt-1.5"
          style={{ borderColor: "rgba(201,162,39,0.4)" }}
        >
          <div className="w-0.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A227" }} />
        </div>
      </motion.div>
    </section>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function HeroSection({
  title = "A Verdade da Beleza",
  subtitle = "Luxo que cuida da pele e da alma.",
  heroImageUrl,
  heroVideoUrl,
  leftVideoUrl,
  rightVideoUrl,
  heroLogoUrl,
}: HeroSectionProps) {
  if (leftVideoUrl || rightVideoUrl) {
    return (
      <SplitHero
        title={title}
        subtitle={subtitle}
        leftVideoUrl={leftVideoUrl}
        rightVideoUrl={rightVideoUrl}
        heroLogoUrl={heroLogoUrl}
      />
    );
  }

  return (
    <LegacyHero
      title={title}
      subtitle={subtitle}
      heroImageUrl={heroImageUrl}
      heroVideoUrl={heroVideoUrl}
    />
  );
}
