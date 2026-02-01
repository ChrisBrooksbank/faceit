/**
 * Simple logging utility for FaceIt
 * Provides structured logging with log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = import.meta.env.DEV;
    }

    private log(level: LogLevel, message: string, data?: unknown): void {
        // In development, use console methods
        if (this.isDevelopment) {
            const prefix = `[${level.toUpperCase()}]`;
            const logData = data !== undefined ? [prefix, message, data] : [prefix, message];

            switch (level) {
                case 'debug':
                    // eslint-disable-next-line no-console
                    console.debug(...logData);
                    break;
                case 'info':
                    // eslint-disable-next-line no-console
                    console.info(...logData);
                    break;
                case 'warn':
                    // eslint-disable-next-line no-console
                    console.warn(...logData);
                    break;
                case 'error':
                    // eslint-disable-next-line no-console
                    console.error(...logData);
                    break;
            }
        }

        // Could add production logging service here in the future
    }

    debug(message: string, data?: unknown): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: unknown): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: unknown): void {
        this.log('warn', message, data);
    }

    error(message: string, error?: unknown): void {
        this.log('error', message, error);
    }
}

export const logger = new Logger();
