# Backend APIs

## Runtime
- Entry file: `src/index.js`
- Health check: `GET /health`

## Auth & Identity
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/validate-sponsor/:id`
- `POST /api/auth/forgot-password`
- Alias endpoints:
  - `POST /api/register`
  - `POST /api/login`
  - `GET /api/validate-sponsor/:id`

## Dashboard & Team
- `GET /dashboard/stats`
- `GET /team/tree`
- Alias endpoint: `GET /api/tree/my-downline`

## Orders
- `POST /api/order/submit`
- `POST /api/order/create`
- `POST /api/order/upload`
- `GET /api/order/my`
- `GET /api/admin/orders/pending`
- `POST /api/admin/orders/approve`
- `POST /api/admin/orders/reject`
- Alias endpoint: `POST /api/orders/upload`

## Calculations Engine
- `POST /api/calculations/distribute`

## Wallet & Payout
- `GET /api/wallet/balances`
- `GET /api/wallet/balance` (alias)
- `GET /api/wallet/history`
- `POST /api/wallet/withdraw`
- `POST /api/payout/request` (alias)

## Admin Member Control
- `PATCH /api/admin/members/:memberId` (block/unblock/change sponsor)

## Admin Reports
- `GET /api/admin/reports/expenses`
- `POST /api/admin/reports/expenses`

## Notices CMS
- `GET /api/notices`
- `GET /api/notices/admin` (Admin only)
- `POST /api/notices/admin` (Admin only)
- `PATCH /api/notices/admin/:noticeId` (Admin only)

## Maintenance
- `POST /api/maintenance/hold/run` (Admin only)

## Schema Notes
- `levels` table added for milestone configuration (`450`, `900`, `1800`, `3600`).
- `expenses` table added for admin reporting.
- `password_resets` table added for forgot-password flow.
- Notifications are wired through `src/services/notifications.js` as provider placeholders for SMS/WhatsApp.
- Monthly hold processing and release flow is implemented in `src/services/holdService.js`.
