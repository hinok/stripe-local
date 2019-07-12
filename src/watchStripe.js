import Stripe from 'stripe';
import { request } from './request';

const currentTimeStamp = () => Math.floor(Date.now() / 1000);

const fetchStripeEvents = (stripe, lastTimestamp) =>
  new Promise((resolve, reject) => {
    stripe.events.list(
      {
        created: {
          gt: lastTimestamp,
        },
      },
      (error, events) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(events);
      },
    );
  });

export function watchStripe({ secretKey, webhookUrls, interval, log }) {
  log(`Forwarding Stripe(${secretKey}) events to:`);
  Object.keys(webhookUrls).map(url => log(`- ${url}`));

  const stripe = Stripe(secretKey);
  let lastTimestamp = currentTimeStamp() - interval / 1000;

  const forwardEvent = event => {
    const eventId = event.id;

    return stripe.events.retrieve(eventId).then(data => {
      log(`Received Stripe Event: ${eventId}`);

      const requests = Object.keys(webhookUrls).map(webhookUrl => {
        const webhookSecret = webhookUrls[webhookUrl];

        return request({
          eventId,
          lastTimestamp,
          webhookSecret,
          webhookUrl,
          data,
          log,
        });
      });

      return Promise.all(requests);
    });
  };

  setInterval(() => {
    log(`Fetching new events for Stripe(${secretKey})`);

    fetchStripeEvents(stripe, lastTimestamp)
      .then(events => {
        lastTimestamp = currentTimeStamp();
        return Promise.all(events.data.map(forwardEvent));
      })
      .catch(error => console.error(error));
  }, interval);
}
