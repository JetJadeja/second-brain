export interface LinkCodeResponse {
  code: string
  expires_at: string
}

export interface LinkStatusResponse {
  linked: boolean
  telegram_username?: string
}
