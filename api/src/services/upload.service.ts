import type { SupabaseClient } from '@supabase/supabase-js'
import { ValidationError } from '../middleware/error-handler.js'
import { env } from '../config/env.js'

export class UploadService {
  constructor(private readonly db: SupabaseClient) {}

  async uploadCharacterImage(
    userId: string,
    characterId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<string> {
    const maxBytes = env.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if (buffer.byteLength > maxBytes) {
      throw new ValidationError(`Imagem deve ter no máximo ${env.MAX_IMAGE_SIZE_MB}MB`)
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(mimeType)) {
      throw new ValidationError('Formato inválido. Use JPEG, PNG ou WebP')
    }

    const ext = originalName.split('.').pop() ?? 'jpg'
    const path = `${userId}/${characterId}/${Date.now()}.${ext}`

    const { error } = await this.db.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: true })

    if (error) throw new ValidationError(`Erro no upload: ${error.message}`)

    const { data } = this.db.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async deleteCharacterImage(path: string): Promise<void> {
    const { error } = await this.db.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([path])
    if (error) throw new ValidationError(`Erro ao deletar imagem: ${error.message}`)
  }
}
