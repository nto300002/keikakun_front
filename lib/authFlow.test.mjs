import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuthFlowClient } from './authFlow.ts';

const okJsonResponse = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

test('login returns auth response even when csrf initialization fails after success', async () => {
  const calls = [];
  const client = createAuthFlowClient({
    apiBaseUrl: 'http://backend.test',
    apiV1Prefix: '/api/v1',
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return okJsonResponse({ role: 'owner', requires_mfa_verification: false });
    },
    initializeCsrfToken: async () => false,
  });

  const result = await client.login({
    username: 'owner@example.com',
    password: 'password',
  });

  assert.equal(result.role, 'owner');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://backend.test/api/v1/auth/token');
});

test('verifyMfa posts to exempt endpoint without csrf prefetch and tolerates csrf init failure', async () => {
  const calls = [];
  const client = createAuthFlowClient({
    apiBaseUrl: 'http://backend.test',
    apiV1Prefix: '/api/v1',
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return okJsonResponse({ role: 'manager', requires_mfa_verification: false });
    },
    initializeCsrfToken: async () => false,
  });

  const result = await client.verifyMfa({
    temporary_token: 'temporary-token',
    totp_code: '123456',
  });

  assert.equal(result.role, 'manager');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://backend.test/api/v1/auth/token/verify-mfa');
  assert.equal(calls[0].init?.headers?.['X-CSRF-Token'], undefined);
});

test('logout posts to exempt endpoint without csrf prefetch', async () => {
  const calls = [];
  const client = createAuthFlowClient({
    apiBaseUrl: 'http://backend.test',
    apiV1Prefix: '/api/v1',
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return okJsonResponse({ message: 'ログアウトしました' });
    },
    initializeCsrfToken: async () => {
      throw new Error('csrf should not be initialized for logout');
    },
  });

  const result = await client.logout();

  assert.equal(result.message, 'ログアウトしました');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://backend.test/api/v1/auth/logout');
  assert.equal(calls[0].init?.method, 'POST');
});
