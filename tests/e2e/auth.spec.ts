import { expect, test } from "@playwright/test"

test.describe("authentication", () => {
  test("shows invalid credentials error on failed sign-in", async ({ page }) => {
    await page.goto("/auth/sign-in")

    await page.getByLabel("Email").fill("user@example.com")
    await page.getByLabel(/^Password$/).fill("wrong")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(
      page.getByText("Email or password is incorrect.")
    ).toBeVisible()
  })

  test("keeps redirect internal-only after successful sign-in", async ({ page }) => {
    await page.goto("/auth/sign-in?next=https://evil.example/phish")

    await page.getByLabel("Email").fill("user@example.com")
    await page.getByLabel(/^Password$/).fill("correct-password")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL("http://127.0.0.1:3000/")
  })

  test("shows resend activation only for explicit inactive account signal", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in")

    await page.getByLabel("Email").fill("inactive@example.com")
    await page.getByLabel(/^Password$/).fill("correct-password")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(
      page.getByRole("button", { name: "Resend activation email" })
    ).toBeVisible()
  })

  test("guards account page on the server for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/auth/account")

    await expect(page).toHaveURL(/\/auth\/sign-in\?next=%2Fauth%2Faccount/)
    await expect(page.getByText("Welcome back")).toBeVisible()
  })
})
