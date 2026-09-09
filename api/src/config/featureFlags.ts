export const VIDEO_CALL_BETA_EMAILS = ['rafakenji23@gmail.com']

export function isVideoCallBetaAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  return VIDEO_CALL_BETA_EMAILS.includes(email.toLowerCase())
}
