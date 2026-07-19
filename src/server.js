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

// Start server only if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MatchDay Copilot server running on port ${PORT}`);
  });
}

// Export app for testing
module.exports = app;
