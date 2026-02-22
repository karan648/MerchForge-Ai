import {
  randomBytes,
  scrypt as scryptCallback,
  type ScryptOptions,
  timingSafeEqual,
} from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;

function assertPasswordLength(password: string) {
  if (password.length < 8 || password.length > 72) {
    throw new Error("Password must be between 8 and 72 characters.");
  }
}

export async function hashPassword(password: string): Promise<string> {
  assertPasswordLength(password);

  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptBuffer(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, nRaw, rRaw, pRaw, salt, expectedHash] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p) || !salt || !expectedHash) {
    return false;
  }

  const expected = Buffer.from(expectedHash, "hex");
  const derived = await scryptBuffer(password, salt, expected.length, {
    N: n,
    r,
    p,
  });

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

function scryptBuffer(
  password: string,
  salt: string,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Buffer.from(derivedKey));
    });
  });
}
