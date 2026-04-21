export type TokenStore = {
  getGuestToken(key?: string): string | null
  setGuestToken(key: string, token: string): void
  clearGuestToken(key: string): void
}

const guestTokens = new Map<string, string>()

export const tokenStore: TokenStore = {
  getGuestToken: (key = "default") => guestTokens.get(key) ?? null,
  setGuestToken: (key, token) => {
    guestTokens.set(key, token)
  },
  clearGuestToken: (key) => {
    guestTokens.delete(key)
  },
}
