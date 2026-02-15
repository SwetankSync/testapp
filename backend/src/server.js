const express = require('express');
const { requireAuth, requireRole } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const treeRoutes = require('./routes/tree');
const walletRoutes = require('./routes/wallet');
const maintenanceRoutes = require('./routes/maintenance');
const noticeRoutes = require('./routes/notice');
const dashboardRoutes = require('./routes/dashboard');
const teamRoutes = require('./routes/team');
const calculationRoutes = require('./routes/calculations');
const reportRoutes = require('./routes/reports');
const { register, login, validateSponsor } = require('./controllers/authController');
const { submitOrder } = require('./controllers/orderController');
const { approveOrder } = require('./controllers/adminApprovalController');
const { getTeamTree } = require('./controllers/teamController');
const { getBalances, withdraw } = require('./controllers/walletController');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Primary namespaced APIs
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/dashboard', requireAuth, requireRole('MEMBER', 'ADMIN'), dashboardRoutes);
app.use('/team', requireAuth, requireRole('MEMBER', 'ADMIN'), teamRoutes);
app.use('/api/user', requireAuth, requireRole('MEMBER', 'ADMIN'), userRoutes);
app.use('/api/order', requireAuth, requireRole('MEMBER'), orderRoutes);
app.use('/api/admin', requireAuth, requireRole('ADMIN'), adminRoutes);
app.use('/api/tree', requireAuth, treeRoutes);
app.use('/api/wallet', requireAuth, requireRole('MEMBER', 'ADMIN'), walletRoutes);
app.use('/api/maintenance', requireAuth, requireRole('ADMIN'), maintenanceRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/admin/reports', requireAuth, requireRole('ADMIN'), reportRoutes);

// Spec-compatible alias APIs
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/validate-sponsor/:id', validateSponsor);
app.post('/api/orders/upload', requireAuth, requireRole('MEMBER'), submitOrder);
app.post('/api/admin/orders/approve-order', requireAuth, requireRole('ADMIN'), approveOrder);
app.get('/api/tree/my-downline', requireAuth, requireRole('MEMBER', 'ADMIN'), getTeamTree);
app.get('/api/wallet/balance', requireAuth, requireRole('MEMBER', 'ADMIN'), getBalances);
app.post('/api/payout/request', requireAuth, requireRole('MEMBER', 'ADMIN'), withdraw);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

module.exports = app;
