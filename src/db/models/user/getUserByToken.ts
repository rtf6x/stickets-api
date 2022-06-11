import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import settings from '../../../settings';

interface getUserError {
  code: Number,
  message: String,
}

export interface getUserResult {
  error: getUserError | null,
  user: Document | null,
}

export default async function (token: string): Promise<getUserResult> {
  if (!token || token.length < 32) {
    return { error: { code: 0, message: 'no token provided' }, user: null };
  }
  let tokenData: JwtPayload | string;
  try {
    tokenData = jwt.verify(token, settings.jwtSecret, { complete: false });
  } catch (err) {
    console.error('[getUserResult][jwt.verify]', err);
    return { error: { code: 1, message: 'token is invalid' }, user: null };
  }
  if (!tokenData || typeof tokenData === 'string' || !tokenData._id) {
    return { error: { code: 1, message: 'token is invalid' }, user: null };
  }
  const user = await this.model('user')
    .findOne({ _id: tokenData._id, googleId: tokenData.googleId })
    .lean();

  if (!user) {
    return { error: { code: 2, message: 'user not found' }, user: null };
  }
  return { error: null, user };
};
