# Backend APIs

## Runtime
- Entry file: `src/index.js`
- Health check: `GET /health`

## Auth & Profile
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/user/kyc`

## Orders
- `POST /api/order/submit`
- `GET /api/order/my`
- `GET /api/admin/orders/pending`
- `POST /api/admin/orders/approve`
- `POST /api/admin/orders/reject`

## Tree
- `GET /api/tree/downline` (Member/Admin)
- `GET /api/tree/full` (Admin only)
- `GET /api/tree/stats` (Admin only)

## Wallet
- `GET /api/wallet/balances`
- `GET /api/wallet/history`
- `POST /api/wallet/withdraw`

## Notices CMS
- `GET /api/notices`
- `GET /api/notices/admin` (Admin only)
- `POST /api/notices/admin` (Admin only)
- `PATCH /api/notices/admin/:noticeId` (Admin only)

## Maintenance
- `POST /api/maintenance/hold/run` (Admin only)

## Notes
- Notifications are wired through `src/services/notifications.js` as provider placeholders for SMS/WhatsApp.
- Monthly hold processing and release flow is implemented in `src/services/holdService.js`.
