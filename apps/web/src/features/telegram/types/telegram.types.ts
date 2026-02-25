export type LinkCodeResponse = {
  code: string
  expires_at: string
}

export type LinkStatusResponse =
  | { linked: true; telegram_username: string | null }
  | { linked: false }

export type OnboardingState =
  | { status: 'checking' }
  | { status: 'hidden' }
  | { status: 'initial' }
  | { status: 'generating' }
  | { status: 'code-generated'; code: string; expiresAt: string }
  | { status: 'connected'; username: string | null }
  | { status: 'dismissing' }
