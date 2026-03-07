import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY || process.env.RESEND_API_KEY_DEVIZLY;
    if (!key) {
      throw new Error('RESEND_API_KEY is not set');
    }
    _resend = new Resend(key);
  }
  return _resend;
}

// Keep backward compat — lazy proxy
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return (getResend() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
