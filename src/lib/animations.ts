import type { Variants } from "framer-motion";

// Luxury ease — slow, stately
const luxuryEase = [0.25, 0.46, 0.45, 0.94] as const;
const cinemaEase = [0.77, 0, 0.175, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: luxuryEase } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: luxuryEase } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: luxuryEase } },
};

export const revealLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: luxuryEase } },
};

export const revealRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: luxuryEase } },
};

// Clip-path reveal from bottom — editorial
export const imageReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 1.1, ease: cinemaEase },
  },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: luxuryEase } },
};

// Scale on hover (product card)
export const scaleOnHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.4, ease: luxuryEase } },
};
