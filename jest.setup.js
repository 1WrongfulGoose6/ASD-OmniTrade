import '@testing-library/jest-dom';

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
const undici = require('undici');

if (!globalThis.fetch) globalThis.fetch = undici.fetch;
if (!globalThis.Request) globalThis.Request = undici.Request;
if (!globalThis.Response) globalThis.Response = undici.Response;
if (!globalThis.Headers) globalThis.Headers = undici.Headers;
