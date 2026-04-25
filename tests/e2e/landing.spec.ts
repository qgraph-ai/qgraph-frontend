import { expect, test } from "@playwright/test"

test.describe("landing page", () => {
  test("renders hero and navigates to /quran", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { level: 1, name: /toolkit for studying/i })
    ).toBeVisible()

    await page.getByRole("link", { name: /qur'an/i }).first().click()
    await expect(page).toHaveURL(/\/quran$/)
  })
})

test.describe("quran reader", () => {
  test("navigates from surah index to reader page", async ({ page }) => {
    await page.goto("/quran")

    await page.getByRole("link", { name: /al-fātiḥah/i }).click()
    await expect(page).toHaveURL(/\/quran\/1$/)
    await expect(
      page.getByRole("heading", { level: 1, name: "ٱلْفَاتِحَة" })
    ).toBeVisible()
  })
})
