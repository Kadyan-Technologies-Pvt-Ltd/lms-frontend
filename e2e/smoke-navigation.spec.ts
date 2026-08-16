import type { Browser, BrowserContext, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { createTestMember, deleteTestMember, getAdminToken } from './api-helpers'
import { expectNoConsoleErrors, loginAsAdmin, loginAsMember } from './ui-helpers'

// [route, sidebar nav-link label, text to assert on the loaded page]. Nav
// label and page heading are the same for every admin route and most member
// routes — kept as separate columns anyway since the member dashboard's nav
// label is "Dashboard" but the page itself says "Welcome, <name>".
const ADMIN_ROUTES = [
  ['/admin', 'Dashboard', 'Dashboard'],
  ['/admin/members', 'Members', 'Members'],
  ['/admin/seats', 'Seats', 'Seats'],
  ['/admin/payments', 'Payments', 'Payments'],
  ['/admin/attendance', 'Attendance', 'Attendance'],
  ['/admin/books', 'Books', 'Books'],
  ['/admin/notifications', 'Notifications', 'Notifications'],
  ['/admin/announcements', 'Announcements', 'Announcements'],
  ['/admin/expenses', 'Expenses', 'Expenses'],
  ['/admin/reports', 'Reports', 'Reports'],
  ['/admin/settings', 'Settings', 'Settings'],
] as const

const MEMBER_ROUTES = [
  ['/member', 'Dashboard', 'Welcome'],
  ['/member/profile', 'My Profile', 'My Profile'],
  ['/member/membership', 'My Membership', 'My Membership'],
  ['/member/attendance', 'My Attendance', 'My Attendance'],
  ['/member/books', 'Books', 'Books'],
  ['/member/notifications', 'Notifications', 'Notifications'],
] as const

// One real login per describe block, reused (via one live browser context,
// not a saved-to-disk storageState snapshot) across every route in that
// block. This project rotates + blacklists the refresh token on every use
// (see apps/accounts — ROTATE_REFRESH_TOKENS / BLACKLIST_AFTER_ROTATION),
// so a *saved* cookie is single-use: the first test to consume it rotates
// it, and every other test replaying the same saved snapshot gets a
// blacklisted token and 401s. A live context has no such problem — its
// cookie jar just holds whatever the last rotation produced.
//
// Navigation within a block clicks the real sidebar links (client-side
// routing) instead of page.goto() (a full SPA reload). Two reasons: (1)
// it's what "click and functionality" actually means — a real user doesn't
// hit F5 between every page; (2) a full reload re-triggers the bootstrap
// silent-refresh every time, and doing that on every one of 17 routes back
// to back is enough real refresh-endpoint traffic to legitimately trip its
// 20/min/IP rate limit (a genuine, correct security control, not a bug —
// but it did initially mask a real bug: lib/api/client.ts's
// refreshAccessToken() wasn't deduped for direct callers, only the
// interceptor's own retry path, so React 18 StrictMode's dev-only
// double-effect-invocation fired two concurrent refresh calls on every
// full reload; with a single-use rotating token the loser got blacklisted
// and the user bounced to /login. That's fixed in client.ts. Clicking
// through instead of reloading sidesteps the rate limit and is the more
// realistic test besides.
test.describe.configure({ mode: 'serial' })

async function clickNavAndAssert(page: Page, navLabel: string, assertText: string, byHeading: boolean) {
  await expectNoConsoleErrors(page, async () => {
    await page.getByRole('link', { name: navLabel, exact: true }).click()
    const locator = byHeading
      ? page.getByRole('heading', { name: new RegExp(assertText, 'i') })
      : page.getByText(new RegExp(assertText, 'i'))
    await expect(locator.first()).toBeVisible()
  })
}

test.describe('admin: every nav route renders without console errors', () => {
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

  for (const [route, navLabel, heading] of ADMIN_ROUTES) {
    test(`${route}`, async () => {
      await clickNavAndAssert(page, navLabel, heading, true)
    })
  }
})

test.describe('member: every nav route renders without console errors', () => {
  let context: BrowserContext
  let page: Page
  let adminToken: string
  let member: Awaited<ReturnType<typeof createTestMember>>

  test.beforeAll(async ({ browser, request }: { browser: Browser; request: import('@playwright/test').APIRequestContext }) => {
    adminToken = await getAdminToken(request)
    member = await createTestMember(request, adminToken)
    context = await browser.newContext()
    page = await context.newPage()
    await loginAsMember(page, member.email, member.generated_password)
  })

  test.afterAll(async ({ request }) => {
    await context.close()
    await deleteTestMember(request, adminToken, member.id)
  })

  for (const [route, navLabel, heading] of MEMBER_ROUTES) {
    test(`${route}`, async () => {
      await clickNavAndAssert(page, navLabel, heading, false)
    })
  }
})
