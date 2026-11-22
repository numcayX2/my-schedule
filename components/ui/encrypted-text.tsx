"use client";

/*
 * Adapted from Aceternity UI "Encrypted Text"
 * (https://ui.aceternity.com/components/encrypted-text).
 * Local changes for my-schedule:
 * - Server and first client render use a deterministic scramble, so there is
 *   no hydration mismatch (the original called Math.random during render).
 * - prefers-reduced-motion shows the real text immediately.
 * - Screen readers get the real text once; scrambled glyphs are aria-hidden
 *   (the original used the invalid role="text").
 * - Only non-space ASCII characters scramble. Thai and other scripts render
 *   as-is, because scrambled Thai glyphs are unreadable noise.
 */
import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  /** Milliseconds between revealing each real character. */
  revealDelayMs?: number;
  /** Characters used for the scramble. */
  charset?: string;
  /** Milliseconds between scramble flips of unrevealed characters. */
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
};

export const DISPLAY_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/-_";

const scrambles = (ch: string) => /[!-~]/.test(ch);

function seeded(text: string, charset: string) {
  return text
    .split("")
    .map((ch, i) => (scrambles(ch) ? charset[(i * 7 + ch.charCodeAt(0)) % charset.length] : ch));
}

function randomFor(ch: string, charset: string) {
  return scrambles(ch) ? charset[Math.floor(Math.random() * charset.length)] : ch;
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 40,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 45,
  encryptedClassName,
  revealedClassName,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [revealCount, setRevealCount] = useState(0);
  const [scramble, setScramble] = useState<string[]>(() => seeded(text, charset));

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    // Remount (change `key`) to replay for new text; the count starts at 0.
    const start = performance.now();
    let lastFlip = start;
    let frame = 0;

    const update = (now: number) => {
      const count = Math.min(text.length, Math.floor((now - start) / Math.max(1, revealDelayMs)));
      setRevealCount(count);
      if (count >= text.length) return;
      if (now - lastFlip >= flipDelayMs) {
        setScramble(text.split("").map((ch) => randomFor(ch, charset)));
        lastFlip = now;
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isInView, reduceMotion, text, revealDelayMs, charset, flipDelayMs]);

  if (!text) return null;
  const shown = reduceMotion ? text.length : revealCount;

  return (
    <span ref={ref} className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split("").map((char, index) => {
          const revealed = index < shown;
          return (
            <span key={index} className={cn(revealed ? revealedClassName : encryptedClassName)}>
              {revealed ? char : (scramble[index] ?? char)}
            </span>
          );
        })}
      </span>
    </span>
  );
};
