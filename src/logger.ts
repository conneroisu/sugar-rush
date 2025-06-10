import { App, TFile, Notice } from 'obsidian';

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  OFF = 6
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

export interface LoggerSettings {
  logLevel: LogLevel;
  enableConsoleLogging: boolean;
  enableFileLogging: boolean;
  logFilePath: string;
  maxLogFileSize: number; // in MB
  maxLogFiles: number;
  includeStackTrace: boolean;
  timestampFormat: string;
}

export class Logger {
  private app: App;
  private settings: LoggerSettings;
  private logBuffer: LogEntry[] = [];
  private isWriting: boolean = false;
  private writePromise?: Promise<void>;

  constructor(app: App, settings: LoggerSettings) {
    this.app = app;
    this.settings = settings;
  }

  updateSettings(settings: LoggerSettings): void {
    this.settings = settings;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.settings.logLevel && this.settings.logLevel !== LogLevel.OFF;
  }

  private formatTimestamp(): string {
    const now = new Date();
    switch (this.settings.timestampFormat) {
      case 'iso':
        return now.toISOString();
      case 'locale':
        return now.toLocaleString();
      case 'unix':
        return now.getTime().toString();
      default:
        return now.toISOString();
    }
  }

  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.TRACE: return 'TRACE';
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.FATAL: return 'FATAL';
      default: return 'UNKNOWN';
    }
  }

  private createLogEntry(level: LogLevel, component: string, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      component,
      message,
      data,
      error
    };
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = this.getLevelName(entry.level).padEnd(5);
    const component = entry.component.padEnd(20);
    
    let logLine = `[${entry.timestamp}] ${levelName} ${component} | ${entry.message}`;
    
    if (entry.data) {
      logLine += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      logLine += `\n  Error: ${entry.error.message}`;
      if (this.settings.includeStackTrace && entry.error.stack) {
        logLine += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    return logLine;
  }

  private async writeToConsole(entry: LogEntry): Promise<void> {
    if (!this.settings.enableConsoleLogging) return;

    const formattedMessage = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.settings.enableFileLogging || !this.settings.logFilePath) return;

    const formattedMessage = this.formatLogEntry(entry) + '\n';
    
    try {
      // Check if log file exists, create if not
      let logFile = this.app.vault.getAbstractFileByPath(this.settings.logFilePath);
      
      if (!logFile) {
        await this.app.vault.create(this.settings.logFilePath, '');
        logFile = this.app.vault.getAbstractFileByPath(this.settings.logFilePath);
      }
      
      if (logFile instanceof TFile) {
        // Check file size and rotate if necessary
        await this.rotateLogFileIfNeeded(logFile);
        
        // Append to log file
        const currentContent = await this.app.vault.read(logFile);
        await this.app.vault.modify(logFile, currentContent + formattedMessage);
      }
    } catch (error) {
      // Fallback to console if file writing fails
      console.error('Sugar Rush Logger: Failed to write to log file:', error);
      console.log('Log entry that failed to write:', formattedMessage);
    }
  }

  private async rotateLogFileIfNeeded(logFile: TFile): Promise<void> {
    try {
      const content = await this.app.vault.read(logFile);
      const sizeInMB = new Blob([content]).size / (1024 * 1024);
      
      if (sizeInMB >= this.settings.maxLogFileSize) {
        await this.rotateLogFiles();
      }
    } catch (error) {
      console.error('Sugar Rush Logger: Failed to check log file size:', error);
    }
  }

  private async rotateLogFiles(): Promise<void> {
    try {
      const basePath = this.settings.logFilePath.replace(/\.[^/.]+$/, '');
      const extension = this.settings.logFilePath.split('.').pop() || 'log';
      
      // Remove oldest log file if we've reached the limit
      const oldestLogPath = `${basePath}.${this.settings.maxLogFiles}.${extension}`;
      const oldestLog = this.app.vault.getAbstractFileByPath(oldestLogPath);
      if (oldestLog instanceof TFile) {
        await this.app.vault.delete(oldestLog);
      }
      
      // Rotate existing log files
      for (let i = this.settings.maxLogFiles - 1; i >= 1; i--) {
        const currentPath = `${basePath}.${i}.${extension}`;
        const nextPath = `${basePath}.${i + 1}.${extension}`;
        
        const currentFile = this.app.vault.getAbstractFileByPath(currentPath);
        if (currentFile instanceof TFile) {
          await this.app.fileManager.renameFile(currentFile, nextPath);
        }
      }
      
      // Rename current log file to .1
      const currentLog = this.app.vault.getAbstractFileByPath(this.settings.logFilePath);
      if (currentLog instanceof TFile) {
        const firstRotatedPath = `${basePath}.1.${extension}`;
        await this.app.fileManager.renameFile(currentLog, firstRotatedPath);
      }
      
      // Create new empty log file
      await this.app.vault.create(this.settings.logFilePath, '');
      
    } catch (error) {
      console.error('Sugar Rush Logger: Failed to rotate log files:', error);
    }
  }

  private async processLogBuffer(): Promise<void> {
    if (this.isWriting || this.logBuffer.length === 0) return;
    
    this.isWriting = true;
    
    try {
      const entriesToProcess = [...this.logBuffer];
      this.logBuffer = [];
      
      for (const entry of entriesToProcess) {
        await Promise.all([
          this.writeToConsole(entry),
          this.writeToFile(entry)
        ]);
      }
    } catch (error) {
      console.error('Sugar Rush Logger: Error processing log buffer:', error);
    } finally {
      this.isWriting = false;
      
      // Process any entries that were added while we were writing
      if (this.logBuffer.length > 0) {
        // Use setTimeout to avoid stack overflow in case of rapid logging
        setTimeout(() => this.processLogBuffer(), 0);
      }
    }
  }

  private async log(level: LogLevel, component: string, message: string, data?: any, error?: Error): Promise<void> {
    if (!this.shouldLog(level)) return;
    
    const entry = this.createLogEntry(level, component, message, data, error);
    this.logBuffer.push(entry);
    
    // Start processing if not already processing
    if (!this.writePromise) {
      this.writePromise = this.processLogBuffer().finally(() => {
        this.writePromise = undefined;
      });
    }
    
    return this.writePromise;
  }

  // Public logging methods
  trace(component: string, message: string, data?: any): Promise<void> {
    return this.log(LogLevel.TRACE, component, message, data);
  }

  debug(component: string, message: string, data?: any): Promise<void> {
    return this.log(LogLevel.DEBUG, component, message, data);
  }

  info(component: string, message: string, data?: any): Promise<void> {
    return this.log(LogLevel.INFO, component, message, data);
  }

  warn(component: string, message: string, data?: any, error?: Error): Promise<void> {
    return this.log(LogLevel.WARN, component, message, data, error);
  }

  error(component: string, message: string, data?: any, error?: Error): Promise<void> {
    return this.log(LogLevel.ERROR, component, message, data, error);
  }

  fatal(component: string, message: string, data?: any, error?: Error): Promise<void> {
    return this.log(LogLevel.FATAL, component, message, data, error);
  }

  // Utility methods
  async flush(): Promise<void> {
    if (this.writePromise) {
      await this.writePromise;
    }
  }

  async clearLogFile(): Promise<void> {
    try {
      const logFile = this.app.vault.getAbstractFileByPath(this.settings.logFilePath);
      if (logFile instanceof TFile) {
        await this.app.vault.modify(logFile, '');
        new Notice('Sugar Rush: Log file cleared');
      }
    } catch (error) {
      console.error('Sugar Rush Logger: Failed to clear log file:', error);
      new Notice('Sugar Rush: Failed to clear log file');
    }
  }

  async getLogFileContent(): Promise<string> {
    try {
      const logFile = this.app.vault.getAbstractFileByPath(this.settings.logFilePath);
      if (logFile instanceof TFile) {
        return await this.app.vault.read(logFile);
      }
      return '';
    } catch (error) {
      console.error('Sugar Rush Logger: Failed to read log file:', error);
      return '';
    }
  }

  async getLogFileSize(): Promise<number> {
    try {
      const content = await this.getLogFileContent();
      return new Blob([content]).size;
    } catch (error) {
      console.error('Sugar Rush Logger: Failed to get log file size:', error);
      return 0;
    }
  }
}

// Factory function for creating component-specific loggers
export function createComponentLogger(logger: Logger, componentName: string) {
  return {
    trace: (message: string, data?: any) => logger.trace(componentName, message, data),
    debug: (message: string, data?: any) => logger.debug(componentName, message, data),
    info: (message: string, data?: any) => logger.info(componentName, message, data),
    warn: (message: string, data?: any, error?: Error) => logger.warn(componentName, message, data, error),
    error: (message: string, data?: any, error?: Error) => logger.error(componentName, message, data, error),
    fatal: (message: string, data?: any, error?: Error) => logger.fatal(componentName, message, data, error)
  };
}