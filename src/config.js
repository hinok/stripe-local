import assert from 'assert';
import path from 'path';
import fs from 'fs';

export const createConfig = opts => {
  assert(typeof opts === 'object' && opts !== null, 'Options must be an object');

  if (opts.configJson) {
    const fileContents = fs.readFileSync(path.resolve(__dirname, opts.configJson), {
      encoding: 'utf-8',
    });
    const parsedJson = JSON.parse(fileContents);

    assert(
      typeof parsedJson === 'object' && parsedJson !== null,
      `${opts.configJson} should contain an object with Stripe keys, webhooks and signing secrets`,
    );

    return parsedJson;
  }

  assert(opts.secretKey, 'Must pass your Stripe secret key!');
  assert(opts.webhookUrl, 'Must pass a webhook URL!');

  return {
    [opts.secretKey]: {
      [opts.webhookUrl]: opts.webhookSecret,
    },
  };
};

export const validateConfig = config => {
  assert(Object.keys(config).length > 0, 'Must pass at least one Stripe secret key');
  assert(Object.keys(config[Object.keys(config)[0]]).length > 0, 'Must pass at least one webhook');
};
