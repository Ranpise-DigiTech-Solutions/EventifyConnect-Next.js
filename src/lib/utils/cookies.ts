// src/lib/utils/cookies.ts
import { NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';

const COOKIE_NAME = 'otp_requests';

export const setCookie = (res: NextApiResponse, name: string = COOKIE_NAME, value: string, options: any = {}) => {
  const stringValue = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

  if (options.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge * 1000);
  }

  const cookie = serialize(name, String(stringValue), options);

  // Set cookie header on the response
  res.setHeader('Set-Cookie', cookie);
};

export const getCookie = (req: any, name: string = COOKIE_NAME) => {
  const cookies = parse(req.headers.cookie || '');
  return cookies[name] || '';
};

export const deleteCookie = (res: NextApiResponse, name: string = COOKIE_NAME) => {
  setCookie(res, name, '', { maxAge: -1 });
};
