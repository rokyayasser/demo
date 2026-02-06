const fs = require("fs");
const path = require("path");

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "../../logs");
    this.ensureLogDirectory();
    this.setupLogLevels();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  setupLogLevels() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    this.colors = {
      error: "\x1b[31m", // Red
      warn: "\x1b[33m", // Yellow
      info: "\x1b[32m", // Green
      http: "\x1b[36m", // Cyan
      debug: "\x1b[35m", // Magenta
      reset: "\x1b[0m", // Reset
    };

    this.currentLevel = process.env.LOG_LEVEL || "info";
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  getLogFile() {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.logDir, `${date}.log`);
  }

  writeToFile(level, message, data = null) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level: level.toUpperCase(),
      message,
      data,
    };

    const logString = JSON.stringify(logEntry) + "\n";

    try {
      fs.appendFileSync(this.getLogFile(), logString, "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  formatConsoleMessage(level, message) {
    const timestamp = this.getTimestamp();
    const color = this.colors[level] || this.colors.reset;
    return `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${this.colors.reset}`;
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.currentLevel];
  }

  log(level, message, data = null) {
    if (!this.shouldLog(level)) return;

    // Console output
    console.log(this.formatConsoleMessage(level, message));
    if (data && process.env.NODE_ENV === "development") {
      console.log("Data:", data);
    }

    // File output (only for production or when explicitly enabled)
    if (
      process.env.NODE_ENV === "production" ||
      process.env.LOG_TO_FILE === "true"
    ) {
      this.writeToFile(level, message, data);
    }
  }

  // Convenience methods
  error(message, error = null) {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : null;
    this.log("error", message, errorData);
  }

  warn(message, data = null) {
    this.log("warn", message, data);
  }

  info(message, data = null) {
    this.log("info", message, data);
  }

  http(message, data = null) {
    this.log("http", message, data);
  }

  debug(message, data = null) {
    this.log("debug", message, data);
  }

  // Request logger middleware
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Log request
      this.http(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get("user-agent"),
        query: req.query,
        body: req.body,
      });

      // Log response
      res.on("finish", () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? "warn" : "http";

        this[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode}`, {
          duration: `${duration}ms`,
          status: res.statusCode,
          contentLength: res.get("content-length"),
        });
      });

      next();
    };
  }

  // Database logger
  databaseLogger(operation, collection, query, duration, error = null) {
    const message = `DB ${operation} on ${collection}`;
    const data = {
      operation,
      collection,
      query,
      duration: `${duration}ms`,
    };

    if (error) {
      this.error(message, { ...data, error });
    } else {
      this.debug(message, data);
    }
  }

  // Payment logger
  paymentLogger(operation, data, error = null) {
    const message = `Payment ${operation}`;

    // Sanitize sensitive data
    const sanitizedData = { ...data };
    if (sanitizedData.cardNumber) {
      sanitizedData.cardNumber = "***" + sanitizedData.cardNumber.slice(-4);
    }
    if (sanitizedData.cvv) {
      sanitizedData.cvv = "***";
    }

    if (error) {
      this.error(message, { ...sanitizedData, error });
    } else {
      this.info(message, sanitizedData);
    }
  }

  // Email logger
  emailLogger(operation, recipient, result, error = null) {
    const message = `Email ${operation} to ${recipient}`;
    const data = {
      operation,
      recipient,
      result,
    };

    if (error) {
      this.error(message, { ...data, error });
    } else {
      this.info(message, data);
    }
  }

  // File upload logger
  fileUploadLogger(operation, filename, result, error = null) {
    const message = `File ${operation}: ${filename}`;
    const data = {
      operation,
      filename,
      result,
    };

    if (error) {
      this.error(message, { ...data, error });
    } else {
      this.info(message, data);
    }
  }

  // Performance logger
  performanceLogger(operation, duration, threshold = 1000) {
    const message = `Performance: ${operation} took ${duration}ms`;

    if (duration > threshold) {
      this.warn(message, { operation, duration, threshold });
    } else {
      this.debug(message, { operation, duration });
    }
  }

  // Get recent logs
  getRecentLogs(count = 100) {
    try {
      const logFile = this.getLogFile();
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, "utf8");
      const lines = content.trim().split("\n");
      const logs = lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter((log) => log !== null);

      return logs.slice(-count);
    } catch (error) {
      this.error("Failed to read log file", error);
      return [];
    }
  }

  // Clear old log files (older than 30 days)
  clearOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      files.forEach((file) => {
        const filePath = path.join(this.logDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && file.endsWith(".log")) {
          const fileDate = new Date(file.replace(".log", ""));
          if (fileDate < cutoffDate) {
            fs.unlinkSync(filePath);
            this.info(`Deleted old log file: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error("Failed to clear old logs", error);
    }
  }
}

// Create singleton instance
module.exports = new Logger();
