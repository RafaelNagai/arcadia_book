import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function DiscordBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-24 px-6"
      style={{ background: "var(--color-abyss)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto flex flex-col items-center text-center p-10 rounded-sm border"
        style={{
          background: "var(--color-deep)",
          borderColor: "var(--color-border)",
        }}
      >
        <img
          src="/assets/images/discord-logo.png"
          alt="Discord"
          className="w-16 h-16 mb-6 rounded-full"
        />
        <p
          className="text-xs uppercase tracking-[0.4em] mb-3"
          style={{
            color: "var(--color-arcano-dim)",
            fontFamily: "var(--font-ui)",
          }}
        >
          Junte-se à Tripulação
        </p>
        <h2
          className="font-display text-3xl md:text-4xl font-bold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Entre no Discord de Arcádia
        </h2>
        <p
          className="font-body text-lg leading-relaxed mb-8 max-w-xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Converse com outros navegantes, encontre mesas para jogar, tire
          dúvidas sobre as regras e acompanhe novidades do sistema em
          primeira mão.
        </p>
        <a
          href="https://discord.gg/eEs5t7UUUs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-ui text-xs font-bold uppercase tracking-widest transition-opacity duration-200 hover:opacity-80"
          style={{
            background: "var(--color-arcano)",
            color: "#0A0A0A",
          }}
        >
          Entrar no Servidor
        </a>
      </motion.div>
    </section>
  );
}
