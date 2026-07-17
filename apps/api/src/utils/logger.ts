import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: env.isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    ...(env.isProd
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' })]
      : []),
  ],
});
