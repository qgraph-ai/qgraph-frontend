import { expect, test } from "@playwright/test"

test.describe("preferences", () => {
  test("persists theme and locale choices", async ({ page }) => {
    await page.goto("/")

    const html = page.locator("html")
    await page.getByRole("button", { name: "Toggle theme" }).click()

    const savedTheme = await page.evaluate(() => localStorage.getItem("theme"))
    expect(savedTheme === "dark" || savedTheme === "light").toBeTruthy()
    if (savedTheme === "dark") {
      await expect(html).toHaveClass(/dark/)
    } else {
      await expect(html).not.toHaveClass(/dark/)
    }

    await page.getByRole("button", { name: "Change language" }).click()
    await page.getByRole("menuitemradio", { name: "فارسی" }).click()

    await expect(
      page.getByRole("heading", { level: 1, name: "ابزاری برای مطالعه‌ی قرآن." })
    ).toBeVisible()

    await page.reload()
    await expect(
      page.getByRole("heading", { level: 1, name: "ابزاری برای مطالعه‌ی قرآن." })
    ).toBeVisible()
  })
})
