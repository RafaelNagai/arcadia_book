import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  PARTS,
  getChaptersByPart,
  getChapterBySlug,
} from "@/data/chapterManifest";
import type { Part, ChapterMeta } from "@/data/chapterManifest";
import versionData from "@version";

const PART_NUMBERS: Record<Part, string> = {
  Fundamentos: "I",
  "O Arcano": "II",
  "O Navio e a Tripulação": "III",
  Mecânicas: "IV",
  "O Mundo": "V",
  "One-Shots": "VI",
};

const SIDEBAR_OPEN_GROUPS_KEY = "arcadia_sidebar_open_groups";

function loadOpenGroups(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SIDEBAR_OPEN_GROUPS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveOpenGroups(groups: Record<string, boolean>) {
  try {
    localStorage.setItem(SIDEBAR_OPEN_GROUPS_KEY, JSON.stringify(groups));
  } catch {
    // localStorage indisponível (modo privado, quota etc.) — falha silenciosa
  }
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transform: open ? "rotate(90deg)" : "none",
        transition: "transform 0.2s ease",
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface SidebarProps {
  onClose?: () => void;
  onSearchOpen: () => void;
}

function ChapterRow({
  chapter,
  onClose,
  hasChildren,
  isOpen,
  onToggle,
}: {
  chapter: ChapterMeta;
  onClose?: () => void;
  hasChildren?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const isChild = !!chapter.parentSlug;
  return (
    <div className="flex items-stretch gap-0.5">
      <NavLink
        to={`/capitulo/${chapter.slug}`}
        onClick={onClose}
        className={({ isActive }) =>
          [
            "flex flex-1 min-w-0 items-center gap-3 py-2 rounded-md text-sm transition-all duration-150",
            isChild ? "px-2" : "px-3",
            isActive
              ? "border-l-2 bg-opacity-20 font-medium"
              : "border-l-2 border-transparent hover:bg-opacity-10",
          ].join(" ")
        }
        style={({ isActive }) => ({
          paddingLeft: isChild ? 28 : undefined,
          borderLeftColor: isActive ? "var(--color-arcano)" : "transparent",
          backgroundColor: isActive ? "rgba(200,146,42,0.1)" : undefined,
          color: isActive
            ? "var(--color-arcano-glow)"
            : isChild
              ? "var(--color-text-muted)"
              : "var(--color-text-secondary)",
          fontFamily: "var(--font-ui)",
        })}
      >
        {isChild ? (
          <span
            className="text-xs shrink-0"
            style={{ color: "var(--color-text-muted)", opacity: 0.5 }}
          >
            └
          </span>
        ) : (
          <span
            className="text-xs w-5 shrink-0 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            {String(chapter.order).padStart(2, "0")}
          </span>
        )}
        <span
          className="truncate"
          style={{ fontSize: isChild ? "0.8rem" : undefined }}
        >
          {chapter.title}
        </span>
      </NavLink>
      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.();
          }}
          aria-label={isOpen ? `Recolher ${chapter.title}` : `Expandir ${chapter.title}`}
          aria-expanded={isOpen}
          className="flex items-center justify-center rounded-md shrink-0 transition-colors duration-150 hover:bg-opacity-10"
          style={{
            width: 28,
            color: "var(--color-text-muted)",
          }}
        >
          <ChevronIcon open={!!isOpen} />
        </button>
      )}
    </div>
  );
}

export function Sidebar({ onClose, onSearchOpen }: SidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    loadOpenGroups,
  );

  const activeSlug = location.pathname.startsWith("/capitulo/")
    ? location.pathname.slice("/capitulo/".length)
    : null;
  const activeChapter = activeSlug ? getChapterBySlug(activeSlug) : undefined;
  const activeGroupSlug = activeChapter
    ? (activeChapter.parentSlug ?? activeChapter.slug)
    : null;
  const activePart = activeChapter ? activeChapter.part : null;

  function isDefaultOpen(key: string) {
    return key === activeGroupSlug || key === activePart;
  }

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const current = prev[key] ?? isDefaultOpen(key);
      const next = { ...prev, [key]: !current };
      saveOpenGroups(next);
      return next;
    });
  }

  return (
    <nav className="flex flex-col h-full overflow-y-auto py-6 px-4">
      {/* Logo */}
      <NavLink to="/" onClick={onClose} className="mb-8 block text-center px-2">
        <img
          src="/assets/images/logo.png"
          alt="Arcádia"
          className="w-full mx-auto"
          style={{
            maxWidth: 160,
            filter: "drop-shadow(0 0 12px rgba(100,220,200,0.3))",
          }}
        />
        <p
          className="text-xs mt-2"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
          }}
        >
          Livro (v{versionData.version})
        </p>
      </NavLink>

      {/* Search button */}
      <button
        onClick={onSearchOpen}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-6 transition-colors duration-150 hover:border-opacity-60"
        style={{
          color: "var(--color-text-muted)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          fontFamily: "var(--font-ui)",
        }}
      >
        <SearchIcon />
        <span className="flex-1 text-left text-xs">Buscar…</span>
        <kbd
          style={{
            fontSize: "0.6rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            opacity: 0.7,
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Chapter groups */}
      {PARTS.map((part) => {
        const allChapters = getChaptersByPart(part);
        const parents = allChapters.filter((c) => !c.parentSlug);
        const childrenByParent = allChapters.reduce<
          Record<string, ChapterMeta[]>
        >((acc, c) => {
          if (c.parentSlug) {
            if (!acc[c.parentSlug]) acc[c.parentSlug] = [];
            acc[c.parentSlug].push(c);
          }
          return acc;
        }, {});

        const isPartOpen = openGroups[part] ?? isDefaultOpen(part);
        const partLabel = `Parte ${PART_NUMBERS[part]} — ${part}`;

        return (
          <div key={part} className="mb-6">
            <button
              type="button"
              onClick={() => toggleGroup(part)}
              aria-expanded={isPartOpen}
              aria-label={isPartOpen ? `Recolher ${partLabel}` : `Expandir ${partLabel}`}
              className="w-full flex items-center gap-1.5 mb-3 px-2 rounded-md transition-colors duration-150 hover:bg-opacity-10"
            >
              <ChevronIcon open={isPartOpen} />
              <span
                className="text-xs font-semibold uppercase tracking-widest text-left"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {partLabel}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isPartOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                  className="space-y-0.5"
                >
                  {parents.map((chapter) => {
                    const children = childrenByParent[chapter.slug] ?? [];
                    const hasChildren = children.length > 0;
                    const isOpen =
                      hasChildren &&
                      (openGroups[chapter.slug] ?? isDefaultOpen(chapter.slug));

                    return (
                      <li key={chapter.id}>
                        <ChapterRow
                          chapter={chapter}
                          onClose={onClose}
                          hasChildren={hasChildren}
                          isOpen={isOpen}
                          onToggle={() => toggleGroup(chapter.slug)}
                        />
                        {hasChildren && (
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                                className="space-y-0.5 mt-0.5"
                              >
                                {children.map((child) => (
                                  <li key={child.id}>
                                    <ChapterRow chapter={child} onClose={onClose} />
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        )}
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Footer */}
      <div
        className="mt-auto pt-6 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <NavLink
          to="/"
          onClick={onClose}
          className="text-xs px-2 transition-colors"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
          }}
        >
          ← Página inicial
        </NavLink>
      </div>
    </nav>
  );
}
