import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/pages/login-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { ProtectedRoute } from '@/router/protected-route'

// Route-level code splitting: every admin/member page is its own chunk,
// only fetched when the user actually navigates there, instead of one
// ~2.5MB bundle shipping every page (including recharts/@react-pdf/renderer
// transitively) on first load. AppLayout wraps its <Outlet/> in <Suspense>,
// so login/not-found stay eager (small, and login shouldn't wait on a
// dynamic import on the critical first-paint path).
const AnnouncementsPage = lazy(() => import('@/pages/admin/announcements/announcements-page').then((m) => ({ default: m.AnnouncementsPage })))
const AttendancePage = lazy(() => import('@/pages/admin/attendance/attendance-page').then((m) => ({ default: m.AttendancePage })))
const BooksPage = lazy(() => import('@/pages/admin/books/books-page').then((m) => ({ default: m.BooksPage })))
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard-page').then((m) => ({ default: m.AdminDashboardPage })))
const ExpensesPage = lazy(() => import('@/pages/admin/expenses/expenses-page').then((m) => ({ default: m.ExpensesPage })))
const MembersPage = lazy(() => import('@/pages/admin/members/members-page').then((m) => ({ default: m.MembersPage })))
const NotificationsPage = lazy(() => import('@/pages/admin/notifications/notifications-page').then((m) => ({ default: m.NotificationsPage })))
const PaymentsPage = lazy(() => import('@/pages/admin/payments/payments-page').then((m) => ({ default: m.PaymentsPage })))
const ReportsPage = lazy(() => import('@/pages/admin/reports/reports-page').then((m) => ({ default: m.ReportsPage })))
const SeatsPage = lazy(() => import('@/pages/admin/seats/seats-page').then((m) => ({ default: m.SeatsPage })))
const SettingsPage = lazy(() => import('@/pages/admin/settings/settings-page').then((m) => ({ default: m.SettingsPage })))

const MemberAttendancePage = lazy(() => import('@/pages/member/attendance-page').then((m) => ({ default: m.MemberAttendancePage })))
const MemberBooksPage = lazy(() => import('@/pages/member/books-page').then((m) => ({ default: m.MemberBooksPage })))
const MemberDashboardPage = lazy(() => import('@/pages/member/dashboard-page').then((m) => ({ default: m.MemberDashboardPage })))
const MemberMembershipPage = lazy(() => import('@/pages/member/membership-page').then((m) => ({ default: m.MemberMembershipPage })))
const MemberNotificationsPage = lazy(() => import('@/pages/member/notifications-page').then((m) => ({ default: m.MemberNotificationsPage })))
const MemberProfilePage = lazy(() => import('@/pages/member/profile-page').then((m) => ({ default: m.MemberProfilePage })))

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AppLayout role="ADMIN" />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'members', element: <MembersPage /> },
          { path: 'seats', element: <SeatsPage /> },
          { path: 'payments', element: <PaymentsPage /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'books', element: <BooksPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'announcements', element: <AnnouncementsPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['MEMBER']} />,
    children: [
      {
        path: '/member',
        element: <AppLayout role="MEMBER" />,
        children: [
          { index: true, element: <MemberDashboardPage /> },
          { path: 'profile', element: <MemberProfilePage /> },
          { path: 'membership', element: <MemberMembershipPage /> },
          { path: 'attendance', element: <MemberAttendancePage /> },
          { path: 'books', element: <MemberBooksPage /> },
          { path: 'notifications', element: <MemberNotificationsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
