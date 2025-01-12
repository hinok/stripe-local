import minimist from 'minimist';
import stripeLocal from './index';

export default function() {
  const argv = minimist(process.argv.slice(2));

  if (argv._[0] === 'help' || argv.help || argv.h) {
    return console.log(`
  Usage:

    stripe-local [options]

  Options:

    --key, -k         Your Stripe secret key
    --url, -u         The local URL to send webhooks
    --sign, -s        Your Stripe webhook signing secret
    --json, -j        Path to JSON file with Stripe secret keys, webhooks and their signing secrets
    --interval, -i    The interval to poll for new events
    `);
  }

  stripeLocal({
    secretKey: argv.key || argv.k,
    webhookUrl: argv.url || argv.u,
    webhookSecret: argv.sign || argv.s,
    configJson: argv.json || argv.j,
    interval: argv.interval || argv.i,
  });
}
