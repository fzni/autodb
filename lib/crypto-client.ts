export interface GeneratedKeyData {
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
  keyFingerprint: string;
}

export interface KeyFileFormat {
  app: string;
  version: string;
  handle: string;
  key_fingerprint: string;
  public_key: JsonWebKey;
  private_key: JsonWebKey;
  created_at: string;
}

/**
 * Computes deterministic fingerprint from JWK coordinates
 */
export async function computeClientFingerprint(jwk: JsonWebKey): Promise<string> {
  const canonical = JSON.stringify({
    crv: jwk.crv,
    kty: jwk.kty,
    x: jwk.x,
    y: jwk.y,
  });
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const pairs = hex.match(/.{1,2}/g)?.slice(0, 10).join(':') || hex.slice(0, 20);
  return `SHA256:${pairs}`;
}

/**
 * Generates an ECDSA P-256 keypair in the browser
 */
export async function generateBrowserKeyPair(): Promise<GeneratedKeyData> {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true, // extractable
    ['sign', 'verify']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const keyFingerprint = await computeClientFingerprint(publicKeyJwk);

  return {
    publicKeyJwk,
    privateKeyJwk,
    keyFingerprint,
  };
}

/**
 * Signs a nonce using ECDSA P-256 + SHA-256
 */
export async function signNonceWithPrivateKey(
  privateKeyJwk: JsonWebKey,
  nonce: string
): Promise<string> {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);

  const signatureBuffer = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    privateKey,
    data
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const base64 = btoa(String.fromCharCode.apply(null, signatureArray));
  return base64;
}

/**
 * Creates and triggers download of autodb-private-key.json
 */
export function downloadPrivateKeyFile(
  handle: string,
  keyFingerprint: string,
  publicKeyJwk: JsonWebKey,
  privateKeyJwk: JsonWebKey
): void {
  const fileData: KeyFileFormat = {
    app: 'autodb.tech',
    version: '1.0',
    handle: handle.startsWith('@') ? handle : `@${handle}`,
    key_fingerprint: keyFingerprint,
    public_key: publicKeyJwk,
    private_key: privateKeyJwk,
    created_at: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(fileData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autodb-${handle.replace('@', '')}-key.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
