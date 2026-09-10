import { useEffect, useRef, useState } from "react";
import { useCharacterRealtime } from "@/hooks/useCharacterRealtime";

// Curva de escala do selo/nome com a largura real do tile (medida via
// ResizeObserver abaixo) — 140/480 cobrem do filmstrip mobile ao ponto em que
// Grade Igual já bate o teto; 32-60px/0.55-0.7rem preservam os valores
// aprovados nas rodadas anteriores como teto, sem aumentá-los.
const WIDTH_MIN = 140;
const WIDTH_MAX = 480;
const MIN_BADGE = 32;
const MAX_BADGE = 60;
const LEAK_RATIO = 8 / 60;
const MIN_FONT = 0.55;
const MAX_FONT = 0.7;

interface CallParticipantTileProps {
  userId: string;
  stream: MediaStream | null;
  audioTrack: MediaStreamTrack | null;
  displayName: string;
  subtitle?: string;
  image: string | null;
  characterId: string | null;
  hp: number | null;
  maxHp: number | null;
  isGm: boolean;
  muted: boolean;
  volume: number;
  cameraEnabled: boolean;
  sinkId?: string;
}

export function CallParticipantTile({
  userId,
  stream,
  audioTrack,
  displayName,
  subtitle,
  image: initialImage,
  characterId,
  hp: initialHp,
  maxHp: initialMaxHp,
  isGm,
  muted,
  volume,
  cameraEnabled,
  sinkId,
}: CallParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const [hp, setHp] = useState(initialHp);
  const [maxHp, setMaxHp] = useState(initialMaxHp);
  const [image, setImage] = useState(initialImage);
  const [tileWidth, setTileWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;
    // observe() já dispara com o tamanho atual, mesmo padrão de
    // useGalleryLayout.ts/MapTab.tsx — só atualiza estado dentro do callback.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setTileWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // DEBUG(call-mute-sync): confirms live whether the layout-switch fix in
  // CallTab.tsx actually stops tiles from unmounting — this should log once
  // per participant for the whole call, never again on a layout toggle.
  useEffect(() => {
    console.debug('[call:mute] tile mounted', { userId });
  }, [userId]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioTrack) {
      audioTrack.enabled = !muted;
      console.debug('[call:mute] tile audioTrack.enabled applied', { userId, muted, actualEnabled: audioTrack.enabled });
    }
  }, [audioTrack, muted, userId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !sinkId || typeof el.setSinkId !== "function") return;
    // Safari doesn't implement HTMLMediaElement.setSinkId at runtime (even
    // though the type is in lib.dom.d.ts) — the feature check above makes
    // this a silent no-op there, deliberately without a polyfill.
    void el.setSinkId(sinkId).catch(() => {});
  }, [sinkId]);

  // campaign.players already carries hp/currentHp for every member (roster-level
  // exposure, independent of a character's is_public flag) — that seeds this tile
  // on mount; useCharacterRealtime keeps current_hp live from then on.
  useCharacterRealtime(characterId ?? undefined, {
    onCharacterUpdate: (data) => {
      if ("current_hp" in data && data.current_hp != null)
        setHp(data.current_hp as number);
      if ("hp" in data && data.hp != null) setMaxHp(data.hp as number);
      if ("image_url" in data) setImage(data.image_url as string | null);
    },
    onStateUpdate: () => {},
    onInventoryChange: () => {},
  });

  const hpRatio =
    hp != null && maxHp != null && maxHp > 0
      ? Math.max(0, Math.min(1, hp / maxHp))
      : null;
  const hpColor =
    hpRatio == null
      ? "rgba(255,255,255,0.3)"
      : hpRatio > 0.5
        ? "#6FC892"
        : hpRatio > 0.2
          ? "#E8B84B"
          : "#C05050";

  // woundT legitimately equals 0 right at the hpRatio===0.2 boundary (start of the
  // curve), so gating redOverlayOpacity on "woundT > 0" would wrongly zero it there —
  // gate on inWoundRange instead, which correctly yields opacity 0.08 at exactly 20%.
  const inWoundRange = hpRatio != null && hpRatio > 0 && hpRatio <= 0.2;
  const woundT = inWoundRange ? 1 - hpRatio / 0.2 : 0;
  const redOverlayOpacity = !isGm && inWoundRange ? 0.08 + woundT * 0.52 : 0;
  const isDying = !isGm && hpRatio === 0;

  // Antes da primeira medição do observer, tileWidth é null e cai em WIDTH_MAX,
  // que já produz t=1 (selo 60px / fonte 0.7rem, idêntico ao valor fixo
  // anterior) — evita flash de tamanho errado no primeiro paint.
  const t = Math.max(
    0,
    Math.min(1, ((tileWidth ?? WIDTH_MAX) - WIDTH_MIN) / (WIDTH_MAX - WIDTH_MIN)),
  );
  const badgeSize = MIN_BADGE + t * (MAX_BADGE - MIN_BADGE);
  const badgeLeak = Math.round(badgeSize * LEAK_RATIO);
  const nameFontSize = MIN_FONT + t * (MAX_FONT - MIN_FONT);

  return (
    <div ref={tileRef} style={{ position: "relative", aspectRatio: "16 / 9" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          overflow: "hidden",
          background: "rgba(10,15,30,0.9)",
          border: "1px solid rgba(255,255,255,0.07)",
          filter: isDying ? "grayscale(0.95)" : undefined,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#04060C",
            display: "block",
          }}
        />

        {!cameraEnabled && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#04060C",
            }}
          >
            {image ? (
              <img
                src={image}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        )}

        {redOverlayOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: hpColor,
              opacity: redOverlayOpacity,
            }}
          />
        )}
      </div>

      {image && (
        <div
          style={{
            position: "absolute",
            left: -badgeLeak,
            bottom: -badgeLeak,
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(10,15,30,0.92)",
          }}
        >
          <img
            src={image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: image ? badgeSize : 8,
          bottom: 8,
          right: 8,
          padding: "0.05rem 0.55rem",
          borderRadius: 4,
          background: "rgba(4,6,12,0.72)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-ui)",
            fontSize: `${nameFontSize}rem`,
            fontWeight: 700,
            color: "#EEF4FC",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
          {subtitle ? ` · ${subtitle}` : ""}
        </span>
      </div>
    </div>
  );
}
