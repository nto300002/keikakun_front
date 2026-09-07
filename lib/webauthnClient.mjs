export function arrayBufferToBase64Url(value) {
  const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlToArrayBuffer(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

export function isWebAuthnSupported() {
  return typeof window !== 'undefined' && 'PublicKeyCredential' in window && !!navigator.credentials;
}

export function getJapaneseWebAuthnError(error, context = '認証') {
  const name = error?.name;
  if (name === 'NotAllowedError' || name === 'TimeoutError') return `${context}がキャンセルされたか、時間切れになりました。もう一度お試しください。`;
  if (name === 'InvalidStateError') return 'このパスキーはすでに登録されています。別の認証器をお試しください。';
  if (name === 'NotSupportedError') return 'この認証器は対応していません。対応ブラウザまたはセキュリティキーをご利用ください。';
  if (name === 'SecurityError') return 'このページではパスキーを利用できません。安全な接続またはlocalhostでお試しください。';
  if (name === 'AbortError') return `${context}を完了できませんでした。もう一度お試しください。`;
  if (error instanceof Error && error.message) return error.message;
  return `${context}に失敗しました。もう一度お試しください。`;
}

export function serializePublicKeyCredential(credential) {
  const response = credential.response;
  const serializedResponse = {
    clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
  };
  if ('attestationObject' in response) {
    serializedResponse.attestationObject = arrayBufferToBase64Url(response.attestationObject);
  }
  if (typeof response.getAuthenticatorData === 'function') {
    serializedResponse.authenticatorData = arrayBufferToBase64Url(response.getAuthenticatorData());
  }
  if (typeof response.getPublicKey === 'function') {
    const publicKey = response.getPublicKey();
    if (publicKey) serializedResponse.publicKey = arrayBufferToBase64Url(publicKey);
  }
  if (typeof response.getTransports === 'function') {
    serializedResponse.transports = response.getTransports();
  }
  if ('signature' in response) {
    serializedResponse.signature = arrayBufferToBase64Url(response.signature);
  }
  if ('authenticatorData' in response) {
    serializedResponse.authenticatorData = arrayBufferToBase64Url(response.authenticatorData);
  }
  if ('userHandle' in response && response.userHandle) {
    serializedResponse.userHandle = arrayBufferToBase64Url(response.userHandle);
  }
  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    response: serializedResponse,
    type: credential.type,
  };
}

export function toCreationOptions(publicKey) {
  return {
    ...publicKey,
    challenge: base64UrlToArrayBuffer(publicKey.challenge),
    user: { ...publicKey.user, id: base64UrlToArrayBuffer(publicKey.user.id) },
    excludeCredentials: (publicKey.excludeCredentials ?? []).map((item) => ({
      ...item,
      id: base64UrlToArrayBuffer(item.id),
    })),
  };
}

export function toRequestOptions(publicKey) {
  return {
    ...publicKey,
    challenge: base64UrlToArrayBuffer(publicKey.challenge),
    allowCredentials: (publicKey.allowCredentials ?? []).map((item) => ({
      ...item,
      id: base64UrlToArrayBuffer(item.id),
    })),
  };
}
