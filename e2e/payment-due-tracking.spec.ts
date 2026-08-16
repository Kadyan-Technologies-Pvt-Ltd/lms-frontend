import { expect, test } from '@playwright/test'

import { assignMembership, createTestMember, deleteTestMember, getActivePlan, getAdminToken } from './api-helpers'
import { loginAsAdmin, loginAsMember } from './ui-helpers'

// Regression coverage for a real bug: the admin's Record Payment dialog
// defaulted its "Membership" field to "Not linked", so a payment recorded
// without remembering to change that dropdown never counted toward the
// member's due balance — even though it showed up fine in their payment
// history, which made "I paid but it still shows pending" look like a data
// bug rather than a forgotten click. Fixed by defaulting the dropdown to
// whichever membership currently has a balance; this test drives the actual
// dialog through a real browser to prove the fix, not just the API.
//
// Two sessions are involved (admin records the payment, the member checks
// their own portal), so this uses its own admin browser context rather than
// the default `page` (which becomes the member's session for the second half).
test('recording a payment auto-links to the due membership and both the admin dialog and the member portal reflect it', async ({
  page,
  browser,
  request,
}) => {
  const adminToken = await getAdminToken(request)
  const plan = await getActivePlan(request, adminToken)
  const member = await createTestMember(request, adminToken)
  const membership = await assignMembership(request, adminToken, member.id, plan.id)

  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await loginAsAdmin(adminPage)

  try {
    await adminPage.goto('/admin/payments')

    await adminPage.getByRole('button', { name: 'Record Payment' }).first().click()
    const dialog = adminPage.getByRole('dialog')
    await dialog.getByText('Select member').click()
    await adminPage.getByRole('option', { name: new RegExp(member.full_name) }).click()

    // The core assertion: the Membership field must auto-select the plan
    // with a pending balance, not default to "Not linked".
    await expect(dialog.getByText(new RegExp(`${plan.name}.*due`))).toBeVisible()
    await expect(dialog.getByText('Automatically linked to the membership with a pending balance')).toBeVisible()

    await dialog.getByLabel('Amount (₹)').fill('100')
    await dialog.getByRole('button', { name: 'Record payment' }).click()
    await expect(adminPage.getByText('Payment recorded.')).toBeVisible()

    // Confirm it actually landed linked, from the API's point of view too —
    // the UI assertion above proves the dialog behaved right, this proves
    // the whole round trip did.
    const check = await request.get(`/api/v1/memberships/?member=${member.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const checkBody = await check.json()
    const updated = checkBody.data.find((m: { id: string }) => m.id === membership.id)
    expect(updated.amount_paid).toBe('100.00')
    expect(updated.amount_due).toBe((Number(plan.price) - 100).toFixed(2))

    // And the member sees the same numbers on their own portal — the two
    // panels the user asked to see "properly integrated".
    await loginAsMember(page, member.email, member.generated_password)
    await page.goto('/member/membership')
    await expect(page.getByText('₹100.00', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(`₹${updated.amount_due}`, { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: new RegExp(`Pay pending`) })).toBeVisible()
  } finally {
    await adminContext.close()
    await deleteTestMember(request, adminToken, member.id)
  }
})
