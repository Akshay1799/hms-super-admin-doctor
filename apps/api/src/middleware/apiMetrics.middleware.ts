import { Request, Response, NextFunction } from 'express';

export function apiMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // In production, this would go to Datadog/Prometheus or a dedicated APM schema.
    // For Epic 5, we log the observability metrics here.
    const log = `[Metrics] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Latency: ${latencyMs}ms | IP: ${req.ip}`;
    
    // Threshold alerting for Fraud / DoS Detection
    if (parseFloat(latencyMs) > 2000) {
      console.warn(`[Metrics Alert] High Latency detected on ${req.originalUrl}: ${latencyMs}ms`);
    }

    if (res.statusCode >= 400 && res.statusCode < 500) {
      // Potentially track anomalies (e.g., too many 401s or 403s from same IP)
      console.info(`[Metrics Alert] Client Error ${res.statusCode} on ${req.originalUrl}`);
    }

    console.log(log);
  });

  next();
}
