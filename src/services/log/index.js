import Const from "expo-constants";

const headers = new Headers();
headers.append("Api-Key", Const.expoConfig.extra.newRelicKey);
headers.append("Content-Type", "application/json");

const options = {
  method: "POST",
  headers,
  redirect: "follow",
};

function log(message, payload = {}) {
  payload.level = payload.level || "debug";
  payload.entity = payload.entity || {};
  payload.entity.name = "pasahero.passenger";
  payload.message = message;

  const body = JSON.stringify(payload);
  options.body = body;

  fetch("https://log-api.newrelic.com/log/v1", options);
  console[payload.level](message, payload);
}

export default {
  debug: (message, payload = {}) => log(message, { ...payload, level: "debug" }), // prettier-ignore
  info: (message, payload = {}) => log(message, { ...payload, level: "info" }),
  warn: (message, payload = {}) => log(message, { ...payload, level: "warn" }),
  error: (message, payload = {}) => log(message, { ...payload, level: "error" }), // prettier-ignore
};
