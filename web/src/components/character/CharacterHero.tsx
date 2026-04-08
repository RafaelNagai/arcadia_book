import { motion, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"
import type { Character } from "@/data/characterTypes"
import type { Accent } from "./types"
import { EmberParticles } from "./EmberParticles"

export function CharacterHero({
  character,
  accent,
  scrollY,
}: {
  character: Character
  accent: Accent
  scrollY: MotionValue<number>
}) {
  const heroImgY     = useTransform(scrollY, [0, 900], [0, -220])
  const heroContentY = useTransform(scrollY, [0, 600], [0, 90])
  const heroOpacity  = useTransform(scrollY, [0, 420], [1, 0])
  const hintOpacity  = useTransform(scrollY, [0, 180], [0.65, 0])

  return (
    <div style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
      <motion.div
        style={{
          y: heroImgY,
          position: "absolute",
          top: "-20%",
          left: 0,
          right: 0,
          bottom: "-20%",
        }}
      >
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `radial-gradient(ellipse 55% 55% at 65% 35%, ${accent.glow} 0%, transparent 65%), linear-gradient(155deg, rgba(4,10,20,0.97) 0%, rgba(8,18,36,0.78) 50%, rgba(4,10,20,1) 100%)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.05,
                backgroundImage: `repeating-linear-gradient(0deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 56px)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "60%",
                transform: "translate(-50%, -50%)",
                fontSize: "min(32rem, 58vw)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: accent.text,
                opacity: 0.04,
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {character.name[0]}
            </div>
          </div>
        )}
      </motion.div>

      {/* Gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(4,10,20,0.97) 0%, rgba(4,10,20,0.4) 45%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(4,10,20,0.52) 0%, transparent 55%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          pointerEvents: "none",
          background: `linear-gradient(90deg, ${accent.text} 0%, ${accent.text}44 50%, transparent 80%)`,
        }}
      />

      <EmberParticles color={accent.text} />

      {/* Hero content */}
      <motion.div
        style={{
          y: heroContentY,
          opacity: heroOpacity,
          position: "absolute",
          bottom: "9%",
          left: 0,
          right: 0,
          paddingLeft: "max(2rem, env(safe-area-inset-left))",
          paddingRight: "2rem",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs uppercase tracking-[0.24em] font-semibold"
              style={{ color: accent.text, fontFamily: "var(--font-ui)" }}
            >
              {character.race}
            </span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
            <span
              className="text-xs uppercase tracking-[0.18em]"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)" }}
            >
              Nível {character.level}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(3.2rem, 9vw, 7rem)",
              lineHeight: 0.92,
              color: "#EEF4FC",
              letterSpacing: "-0.02em",
              textShadow: `0 0 80px ${accent.glow}`,
              marginBottom: "0.75rem",
            }}
          >
            {character.name}
          </h1>
          <p
            className="text-sm font-semibold mb-3"
            style={{
              color: accent.text,
              fontFamily: "var(--font-ui)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {character.concept}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(200,220,240,0.6)",
              borderLeft: `2px solid ${accent.text}55`,
              paddingLeft: "1rem",
              maxWidth: 480,
            }}
          >
            "{character.quote}"
          </p>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{
          opacity: hintOpacity,
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 10,
        }}
        className="flex flex-col items-center gap-1.5"
      >
        <span
          style={{
            color: "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          ficha
        </span>
        <div
          style={{
            width: 1,
            height: 28,
            background: `linear-gradient(to bottom, ${accent.text}55, transparent)`,
          }}
        />
      </motion.div>
    </div>
  )
}
