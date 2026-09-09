import type { SupabaseClient } from '@supabase/supabase-js'
import type { PrismaClient } from '../generated/prisma/client.js'
import { AppError, ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { env } from '../config/env.js'
import { isVideoCallBetaAllowed } from '../config/featureFlags.js'
import type { NegotiateTracksInput, RenegotiateInput } from '../schemas/calls.schema.js'

const CALLS_API_BASE = 'https://rtc.live.cloudflare.com/v1'
const BETA_CACHE_TTL_MS = 10 * 60 * 1000
// No heartbeat: the GM calls createSession once per join, so a generous TTL
// covers a full real session; POST /session/leave clears it immediately on
// the happy path (button click + component unmount).
const GM_SESSION_TTL_MS = 6 * 60 * 60 * 1000
const VIDEO_CALL_BETA_MESSAGE =
  'A chamada de vídeo é uma funcionalidade nova, ainda em fase de testes, e está disponível apenas para contas premium no momento.'
const GM_NOT_IN_CALL_MESSAGE =
  'O mestre ainda não entrou na chamada. Assim que ele entrar, você será conectado automaticamente.'

interface BetaCacheEntry {
  allowed: boolean
  expiresAt: number
}

export class CallsService {
  private readonly campaignsRepo: CampaignsRepository
  private readonly betaCache = new Map<string, BetaCacheEntry>()
  private readonly gmActiveSessions = new Map<string, number>()

  constructor(
    db: PrismaClient,
    private readonly supabase: SupabaseClient,
  ) {
    this.campaignsRepo = new CampaignsRepository(db)
  }

  async createSession(campaignId: string, userId: string) {
    const { isGm } = await this.assertCampaignAccess(campaignId, userId)

    if (!isGm) {
      const expiresAt = this.gmActiveSessions.get(campaignId)
      if (!expiresAt || expiresAt < Date.now()) {
        throw new AppError(409, 'GM_NOT_IN_CALL', GM_NOT_IN_CALL_MESSAGE)
      }
    }

    const session = await this.callCloudflare(`/apps/${env.CLOUDFLARE_CALLS_APP_ID}/sessions/new`, { method: 'POST' })
    if (isGm) this.gmActiveSessions.set(campaignId, Date.now() + GM_SESSION_TTL_MS)
    return session
  }

  async leaveSession(campaignId: string, userId: string) {
    const campaign = await this.campaignsRepo.findById(campaignId)
    if (campaign?.gmUserId === userId) this.gmActiveSessions.delete(campaignId)
  }

  async negotiateTracks(campaignId: string, sessionId: string, userId: string, input: NegotiateTracksInput) {
    await this.assertCampaignAccess(campaignId, userId)
    return this.callCloudflare(
      `/apps/${env.CLOUDFLARE_CALLS_APP_ID}/sessions/${sessionId}/tracks/new`,
      { method: 'POST', body: JSON.stringify(input) },
    )
  }

  // Cloudflare Realtime answers a track pull with requiresImmediateRenegotiation
  // when it needs a fresh SDP offer/answer round-trip on the same session
  async renegotiate(campaignId: string, sessionId: string, userId: string, input: RenegotiateInput) {
    await this.assertCampaignAccess(campaignId, userId)
    return this.callCloudflare(
      `/apps/${env.CLOUDFLARE_CALLS_APP_ID}/sessions/${sessionId}/renegotiate`,
      { method: 'PUT', body: JSON.stringify(input) },
    )
  }

  private async callCloudflare(path: string, init: RequestInit) {
    const res = await fetch(`${CALLS_API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.CLOUDFLARE_CALLS_APP_SECRET}`,
      },
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new AppError(502, 'CLOUDFLARE_REALTIME_ERROR', 'Falha ao comunicar com o serviço de chamada')
    return json
  }

  private async assertCampaignAccess(campaignId: string, userId: string) {
    const campaign = await this.campaignsRepo.findById(campaignId)
    if (!campaign) throw new NotFoundError('Campanha não encontrada')
    const isGm = campaign.gmUserId === userId
    const isPlayer = campaign.characters.some(cc => cc.character.userId === userId)
    if (!isGm && !isPlayer) throw new ForbiddenError()

    await this.assertVideoCallBetaAccess(campaign.gmUserId)

    return { campaign, isGm }
  }

  private async assertVideoCallBetaAccess(gmUserId: string) {
    const now = Date.now()
    const cached = this.betaCache.get(gmUserId)
    if (cached && cached.expiresAt > now) {
      if (!cached.allowed) throw new AppError(403, 'VIDEO_CALL_BETA_RESTRICTED', VIDEO_CALL_BETA_MESSAGE)
      return
    }

    const { data, error } = await this.supabase.auth.admin.getUserById(gmUserId)
    if (error) {
      // Resolution failed (e.g. transient Supabase issue): fail closed but
      // skip caching, so a real allowed GM isn't locked out by a fluke.
      throw new AppError(403, 'VIDEO_CALL_BETA_RESTRICTED', VIDEO_CALL_BETA_MESSAGE)
    }

    const allowed = isVideoCallBetaAllowed(data.user?.email)
    this.betaCache.set(gmUserId, { allowed, expiresAt: now + BETA_CACHE_TTL_MS })
    if (!allowed) throw new AppError(403, 'VIDEO_CALL_BETA_RESTRICTED', VIDEO_CALL_BETA_MESSAGE)
  }
}
