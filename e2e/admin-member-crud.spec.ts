import path from 'node:path'

import type { Browser, BrowserContext, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { getAdminToken } from './api-helpers'
import { loginAsAdmin } from './ui-helpers'

const TEST_LOGO_PATH = path.join(process.cwd(), 'e2e', 'fixtures', 'test-logo.png')

// Both tests below only need "logged in as admin" — sharing one real login
// across them (rather than each test file doing its own) is what keeps
// this suite's total login count comfortably under apps/accounts' 10/min/IP
// rate limit. See smoke-navigation.spec.ts for the fuller explanation of
// why a live shared context, not a saved storageState, is what makes that
// safe with this app's rotating refresh tokens.
test.describe.configure({ mode: 'serial' })

test.describe('admin workflows', () => {
  let context: BrowserContext
  let page: Page

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
    await loginAsAdmin(page)
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('admin can create, edit, and permanently delete a member end-to-end through the UI', async () => {
    const suffix = `${Date.now()}`
    const email = `e2e-crud-${suffix}@test.com`
    const fullName = 'Crud E2E'

    await page.goto('/admin/members')

    // Create
    await page.getByRole('button', { name: 'Add Member' }).click()
    const createDialog = page.getByRole('dialog')
    await createDialog.getByLabel('Email (login)').fill(email)
    await createDialog.getByLabel('First name').fill('Crud')
    await createDialog.getByLabel('Last name').fill('E2E')
    await createDialog.getByLabel('Mobile', { exact: true }).fill(`9${suffix}`.slice(0, 10))
    await createDialog.getByLabel('Joining date').fill(new Date().toISOString().slice(0, 10))
    await createDialog.getByRole('button', { name: 'Create member' }).click()
    await expect(page.getByText(/Member RR\d+ created/)).toBeVisible()

    // Row now exists with a generated member_id — find it by email in the table
    const row = page.getByRole('row').filter({ hasText: email })
    await expect(row).toBeVisible()

    // Edit
    await row.getByRole('button', { name: 'Row actions' }).click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    const editDialog = page.getByRole('dialog')
    await expect(editDialog.getByText(`Edit ${fullName}`)).toBeVisible()
    await editDialog.getByLabel('Mobile', { exact: true }).fill(`8${suffix}`.slice(0, 10))
    await editDialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Member updated.')).toBeVisible()

    // Delete — through the real confirmation dialog, not a direct API call.
    // Asserting on the row disappearing rather than the success toast: the
    // create step's toast is deliberately shown for 20s (it carries the
    // one-time generated password), so it's often still on screen stacked
    // over later toasts by the time this step runs — the row leaving the
    // table is the durable, non-flaky signal that the delete really happened.
    await row.getByRole('button', { name: 'Row actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete permanently' }).click()
    await expect(page.getByText(`Delete ${fullName}?`)).toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('row').filter({ hasText: email })).toHaveCount(0)
  })

  // This exercises the real, persistent Library row (single-tenant — only
  // ever one), so it backs up whatever logo is already set and restores it
  // afterward rather than leaving the admin's real branding replaced by a
  // test fixture image.
  test('saving a new logo in Library Settings reflects in the sidebar without a page reload', async ({ request }) => {
    // A second login here (for API-side assertions the UI session's
    // in-memory-only access token can't be read for) — still a net win
    // over the pre-merge two logins this and the previous test used to do
    // between them.
    const adminToken = await getAdminToken(request)
    const authHeader = { Authorization: `Bearer ${adminToken}` }

    const before = await (await request.get('/api/v1/settings/library/', { headers: authHeader })).json()
    const originalLogoUrl: string | null = before.data.logo
    const originalLogoBuffer = originalLogoUrl ? await (await request.get(originalLogoUrl)).body() : null

    await page.goto('/admin/settings')

    const sidebarLogoBefore = await page.locator('aside img').getAttribute('src').catch(() => null)

    await page.locator('#library-logo').setInputFiles(TEST_LOGO_PATH)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Library profile updated.')).toBeVisible()

    // The actual claim under test: the sidebar (mounted the whole time,
    // outside the settings form) picks up the change on its own — no
    // reload, no manual refetch — because both read the same
    // ['settings', 'library-profile'] query key and the save invalidates it.
    await expect(async () => {
      const src = await page.locator('aside img').getAttribute('src')
      expect(src).toBeTruthy()
      expect(src).not.toBe(sidebarLogoBefore)
    }).toPass({ timeout: 5000 })

    if (originalLogoBuffer) {
      await request.patch('/api/v1/settings/library/', {
        headers: authHeader,
        multipart: { logo: { name: 'restored-logo.png', mimeType: 'image/png', buffer: originalLogoBuffer } },
      })
      // Not strictly needed for test isolation, but leaves no doubt in the
      // report that the restore itself actually succeeded.
      const after = await (await request.get('/api/v1/settings/library/', { headers: authHeader })).json()
      expect(after.data.logo).toBeTruthy()
    }
    // If there was no original logo, it's left as the test fixture —
    // clearing an ImageField back to empty via the API is its own edge
    // case and isn't this environment's reality (the persistent dev
    // library already has one).
  })
})
