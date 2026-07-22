import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

// Trigger restart to reload verified activation & delivery configurations for all 4 portals
async function startServer() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Start Express Server
    const server = app.listen(env.port, () => {
      logger.info(`===============================================`);
      logger.info(`  MediChain HMS Backend Server running on port ${env.port}`);
      logger.info(`  Environment: ${env.nodeEnv}`);
      logger.info(`  Super Admin UI: ${env.frontends.superAdmin}`);
      logger.info(`  Doctor Portal UI: ${env.frontends.doctorPortal}`);
      logger.info(`  Hospital Admin UI: ${env.frontends.hospitalAdmin}`);
      logger.info(`===============================================`);
    });

    // 3. Graceful shutdown handler
    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      // Force close if server takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
