const levels = ['error', 'warn', 'info', 'debug'];

const timestamp = () => new Date().toISOString();

const build = (level) => (message, meta) => {
  const line = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (meta !== undefined) {
    out(line, meta);
  } else {
    out(line);
  }
};

const logger = {};
levels.forEach((level) => {
  logger[level] = build(level);
});

module.exports = logger;
