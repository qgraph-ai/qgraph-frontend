export type TokenStore = {
  getAccessToken(): string | null
  setAccessToken(token: string | null): void
  getGuestToken(key?: string): string | null
  setGuestToken(key: string, token: string): void
  clearGuestToken(key: string): void
}

let accessToken: string | null = null
const guestTokens = new Map<string, string>()

export const tokenStore: TokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token
  },
  getGuestToken: (key = "default") => guestTokens.get(key) ?? null,
  setGuestToken: (key, token) => {
    guestTokens.set(key, token)
  },
  clearGuestToken: (key) => {
    guestTokens.delete(key)
  },
}
