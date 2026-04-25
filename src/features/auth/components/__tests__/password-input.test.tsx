import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PasswordInput } from "@/features/auth/components/password-input"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

describe("PasswordInput", () => {
  it("keeps the visibility toggle keyboard-focusable", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PasswordInput
        aria-label="Password"
        toggleAriaLabelShow="Show password"
        toggleAriaLabelHide="Hide password"
      />
    )

    await user.tab()
    expect(screen.getByLabelText("Password")).toHaveFocus()

    await user.tab()
    const toggle = screen.getByRole("button", { name: /show password/i })
    expect(toggle).toHaveFocus()
  })
})
