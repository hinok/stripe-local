import axios from 'axios';
import crypto from 'crypto';

const generateSignature = (secret, payload) =>
  crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

const createHandleError = (eventId, log) => error => {
  if (error.response) {
    if (error.response.status === 400) {
      log(`400 - event ${eventId}`);
      return;
    }
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(error.response.data);
    console.error(error.response.status);
    console.error(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error', error.message);
  }
};

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function request({ eventId, lastTimestamp, webhookSecret, webhookUrl, data, log }) {
  log(`Signing Event: ${eventId}`);

  const signature = generateSignature(webhookSecret, `${lastTimestamp}.${JSON.stringify(data)}`);

  const headers = {
    'stripe-signature': `t=${lastTimestamp},v1=${signature}`,
  };

  return axiosInstance
    .post(webhookUrl, data, { headers })
    .then(res => log(`OK - event ${eventId} on ${webhookUrl}`, res.data))
    .catch(createHandleError(eventId, log));
}
