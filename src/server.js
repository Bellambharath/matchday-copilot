const express = require('express');
const path = require('path');
const helmet = require('helmet');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', chatRoutes);

// Global error-handling middleware to prevent stack trace leaks
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({ error: 'Something went wrong. Please try again.' });
});

// Start server only if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MatchDay Copilot server running on port ${PORT}`);
  });
}

// Export app for testing
module.exports = app;
