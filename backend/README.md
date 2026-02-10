# Backend APIs

## Auth & Profile
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/user/kyc`

## Orders
- `POST /api/order/submit`
- `GET /api/admin/orders/pending`
- `POST /api/admin/orders/approve`

## Tree
- `GET /api/tree/downline` (Member/Admin)
- `GET /api/tree/full` (Admin only)
- `GET /api/tree/stats` (Admin only)

## Wallet
- `GET /api/wallet/balances`
- `GET /api/wallet/history`
- `POST /api/wallet/withdraw`

## Maintenance
- `POST /api/maintenance/hold/run` (Admin only)

## Notes
- Notifications are wired through `src/services/notifications.js` as provider placeholders for SMS/WhatsApp.
- Monthly hold processing and release flow is implemented in `src/services/holdService.js`.
