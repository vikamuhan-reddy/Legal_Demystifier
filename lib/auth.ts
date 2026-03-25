import { SignJWT, jwtVerify } from 'jose';
import { serialize, parse } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

const secretKey = process.env.JWT_SECRET || 'your-fallback-secret-key-change-this';
const key = new TextEncoder().encode(secretKey);

export const TOKEN_NAME = 'auth_token';

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function setAuthCookie(res: NextApiResponse, user: { id: string; email: string; name: string }) {
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await encrypt({ user, expires });

  const cookie = serialize(TOKEN_NAME, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export async function removeAuthCookie(res: NextApiResponse) {
  const cookie = serialize(TOKEN_NAME, '', {
    expires: new Date(0),
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export async function getSession(req: NextApiRequest) {
  const cookies = parse(req.headers.cookie || '');
  const session = cookies[TOKEN_NAME];
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}
