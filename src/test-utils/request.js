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

function createCookies(init = {}) {
  const store = new Map(Object.entries(init));
  return {
    get(name) {
      if (!store.has(name)) return undefined;
      return { name, value: store.get(name) };
    },
  };
}

export function createJsonRequest(url, body = {}, { headers = {}, cookies = {}, method = "POST" } = {}) {
  return {
    url,
    method,
    headers: createHeaders(headers),
    cookies: createCookies(cookies),
    async json() {
      return body;
    },
  };
}

export function createGetRequest(url, headers = {}) {
  return {
    url,
    method: "GET",
    headers: createHeaders(headers),
    cookies: createCookies({}),
  };
}
