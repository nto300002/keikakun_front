import test from 'node:test';
import assert from 'node:assert/strict';

import {
  arrayBufferToBase64Url,
  isWebAuthnSupported,
  getJapaneseWebAuthnError,
  serializePublicKeyCredential,
} from './webauthnClient.mjs';

test('arrayBufferToBase64Url encodes without padding', () => {
  assert.equal(arrayBufferToBase64Url(new Uint8Array([0, 255, 16]).buffer), 'AP8Q');
});

test('getJapaneseWebAuthnError normalizes browser cancellation and timeout', () => {
  assert.match(getJapaneseWebAuthnError({ name: 'NotAllowedError' }, 'パスキー認証'), /キャンセルされたか/);
  assert.match(getJapaneseWebAuthnError({ name: 'NotAllowedError' }, 'パスキー認証'), /時間切れ/);
});

test('serializePublicKeyCredential converts ArrayBuffer fields', () => {
  const credential = {
    id: 'credential-id',
    rawId: new Uint8Array([1, 2, 3]).buffer,
    response: {
      clientDataJSON: new Uint8Array([4, 5]).buffer,
      attestationObject: new Uint8Array([6, 7, 8]).buffer,
      getTransports: () => ['internal'],
    },
    type: 'public-key',
  };

  assert.deepEqual(serializePublicKeyCredential(credential), {
    id: 'credential-id',
    rawId: 'AQID',
    response: {
      clientDataJSON: 'BAU',
      attestationObject: 'BgcI',
      transports: ['internal'],
    },
    type: 'public-key',
  });
});

test('isWebAuthnSupported safely handles unsupported browsers', () => {
  const original = globalThis.PublicKeyCredential;
  try {
    delete globalThis.PublicKeyCredential;
    assert.equal(isWebAuthnSupported(), false);
  } finally {
    if (original) globalThis.PublicKeyCredential = original;
  }
});
