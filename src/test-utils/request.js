function createHeaders(init = {}) {
  const map = Object.fromEntries(
    Object.entries(init).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return {
    get(key) {
      return map[key.toLowerCase()] ?? null;
    },
  };
}

export function createJsonRequest(url, body = {}, headers = {}) {
  return {
    url,
    headers: createHeaders(headers),
    async json() {
      return body;
    },
  };
}

export function createGetRequest(url, headers = {}) {
  return {
    url,
    headers: createHeaders(headers),
  };
}
