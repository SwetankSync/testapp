const express = require('express');
const { requireAuth, requireRole } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const treeRoutes = require('./routes/tree');
const walletRoutes = require('./routes/wallet');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', requireAuth, requireRole('MEMBER', 'ADMIN'), userRoutes);
app.use('/api/order', requireAuth, requireRole('MEMBER'), orderRoutes);
app.use('/api/admin', requireAuth, requireRole('ADMIN'), adminRoutes);
app.use('/api/tree', requireAuth, treeRoutes);
app.use('/api/wallet', requireAuth, requireRole('MEMBER', 'ADMIN'), walletRoutes);
app.use('/api/maintenance', requireAuth, requireRole('ADMIN'), maintenanceRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

module.exports = app;
