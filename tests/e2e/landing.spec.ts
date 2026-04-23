import { expect, test } from "@playwright/test"

test.describe("landing page", () => {
  test("renders hero and navigates to /quran", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { level: 1, name: /toolkit for studying/i })
    ).toBeVisible()

    const quranLink = page.getByRole("link", { name: /qur'an/i }).first()
    await expect(quranLink).toHaveAttribute("href", "/quran")
  })
})
