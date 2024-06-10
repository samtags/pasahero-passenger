export function parse(data, defaultValue) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

export default {
  parse,
};
