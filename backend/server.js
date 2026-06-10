const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  hsts: process.env.NODE_ENV === 'production',
}));

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.status(426).json({ message: 'HTTPS is required.' });
    }
  }
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/view-requests', require('./routes/viewRequests'));
app.use('/api/favourites', require('./routes/favourites'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OpenSpace API is running 🏠' });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

