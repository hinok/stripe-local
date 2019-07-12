import { createConfig, validateConfig } from './config';
import { watchStripe } from './watchStripe';

const createLogger = quiet => (...args) => !quiet && console.log(...args);

module.exports = (opts = {}) => {
  const config = createConfig(opts);
  validateConfig(config);

  Object.keys(config).map(secretKey =>
    watchStripe({
      secretKey,
      webhookUrls: config[secretKey],
      interval: opts.interval ? parseInt(opts.interval, 10) : 5000,
      log: createLogger(opts.quiet || false),
    }),
  );
};
