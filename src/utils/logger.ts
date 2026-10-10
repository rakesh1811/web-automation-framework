import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { env } from '../config/env';
import { paths } from '../config/paths';

fs.mkdirSync(paths.logs, { recursive: true });

export interface LogContext {
  tcId?: string;
  step?: number;
  retry?: number;
  component?: string;
}

const formatContext = (info: winston.Logform.TransformableInfo): string => {
  const parts: string[] = [];
  if (info.tcId) parts.push(`[${String(info.tcId)}]`);
  if (info.step !== undefined) parts.push(`[Step ${String(info.step)}]`);
  if (info.retry !== undefined) parts.push(`[Retry ${String(info.retry)}]`);
  if (info.component) parts.push(`[${String(info.component)}]`);
  return parts.join(' ');
};

const formatLine = winston.format.printf((info) => {
  const context = formatContext(info);
  const stack = info.stack ? `\n${String(info.stack)}` : '';
  return `${String(info.timestamp)} [${info.level.toUpperCase()}] ${context} ${String(info.message)}${stack}`;
});

const baseFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
);

export const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(baseFormat, formatLine),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(paths.logs, 'execution.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
    new winston.transports.File({ filename: path.join(paths.logs, 'error.log'), level: 'error' }),
  ],
});
