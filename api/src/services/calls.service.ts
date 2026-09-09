import type { PrismaClient } from '../generated/prisma/client.js'
import { AppError, ForbiddenError, NotFoundError } from '../middleware/error-handler.js'
import { CampaignsRepository } from '../repositories/campaigns.repository.js'
import { env } from '../config/env.js'
import type { NegotiateTracksInput, RenegotiateInput } from '../schemas/calls.schema.js'

const CALLS_API_BASE = 'https://rtc.live.cloudflare.com/v1'

export class CallsService {
  private readonly campaignsRepo: CampaignsRepository

  constructor(db: PrismaClient) {
    this.campaignsRepo = new CampaignsRepository(db)
  }

  async createSession(campaignId: string, userId: string) {
    await this.assertCampaignAccess(campaignId, userId)
    return this.callCloudflare(`/apps/${env.CLOUDFLARE_CALLS_APP_ID}/sessions/new`, { method: 'POST' })
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
  }
}
