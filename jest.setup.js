import '@testing-library/jest-dom';

// Polyfill fetch/Request/Response using Next's built-in shim if available.
try {
  require('next/dist/server/node-polyfill-fetch');
} catch {
  // ignore; we'll fall back to manual wiring below
}

// Polyfills required before importing undici.
const { TextEncoder, TextDecoder } = require('node:util');
if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;

const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');
if (!globalThis.ReadableStream) globalThis.ReadableStream = ReadableStream;
if (!globalThis.WritableStream) globalThis.WritableStream = WritableStream;
if (!globalThis.TransformStream) globalThis.TransformStream = TransformStream;

const { Blob } = require('node:buffer');
if (!globalThis.Blob) globalThis.Blob = Blob;

// Provide fetch primitives for route handler tests when running under Jest.
let undici;
try {
  undici = require('undici');
} catch (err) {
  try {
    undici = require('node:undici');
  } catch {
    undici = null;
  }
}

const fetchImpl = globalThis.fetch || undici?.fetch;
if (!globalThis.fetch && fetchImpl) globalThis.fetch = fetchImpl;

if (!globalThis.Request) {
  if (undici?.Request) {
    globalThis.Request = undici.Request;
  } else {
    globalThis.Request = class Request {};
  }
}

if (!globalThis.Response) {
  if (undici?.Response) {
    globalThis.Response = undici.Response;
  } else {
    class PolyfillResponse {
      constructor(body = null, init = {}) {
        this._body = body == null ? null : String(body);
        this.status = init.status || 200;
        this.statusText = init.statusText || '';
        this.headers = new globalThis.Headers(init.headers || {});
        this.ok = this.status >= 200 && this.status < 300;
        this.bodyUsed = false;
      }
      get body() {
        return this._body;
      }
      async json() {
        this.bodyUsed = true;
        return this._body ? JSON.parse(this._body) : null;
      }
      async text() {
        this.bodyUsed = true;
        return this._body ?? '';
      }
      static json(body, init = {}) {
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        const headers = new globalThis.Headers(init.headers || {});
        if (headers.set && (!headers.has || !headers.has('content-type'))) {
          headers.set('content-type', 'application/json');
        }
        return new PolyfillResponse(payload, { ...init, headers });
      }
    }
    globalThis.Response = PolyfillResponse;
  }
}

if (!globalThis.Headers) {
  if (undici?.Headers) {
    globalThis.Headers = undici.Headers;
  } else {
    class SimpleHeaders {
      constructor(init = {}) {
        this._map = new Map();
        if (init && typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => {
            this.set(key, value);
          });
        }
      }
      set(name, value) {
        this._map.set(String(name).toLowerCase(), String(value));
      }
      append(name, value) {
        this.set(name, value);
      }
      has(name) {
        return this._map.has(String(name).toLowerCase());
      }
      get(name) {
        return this._map.get(String(name).toLowerCase()) || null;
      }
      entries() {
        return this._map.entries();
      }
      [Symbol.iterator]() {
        return this.entries();
      }
    }
    globalThis.Headers = SimpleHeaders;
  }
}

if (globalThis.Response && typeof globalThis.Response.json !== 'function') {
  const OriginalResponse = globalThis.Response;
  OriginalResponse.json = function json(body, init = {}) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const headers = new globalThis.Headers(init.headers || {});
    if (headers.set && (!headers.has || !headers.has('content-type'))) {
      headers.set('content-type', 'application/json');
    }
    return new OriginalResponse(payload, { ...init, headers });
  };
}
