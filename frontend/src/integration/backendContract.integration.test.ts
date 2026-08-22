import { describe, expect, it } from 'vitest';

const backendUrl = (process.env.TEST_BACKEND_URL || '').replace(/\/+$/, '');
const testEmail = process.env.TEST_EMAIL || '';
const testPassword = process.env.TEST_PASSWORD || '';
const enabled = process.env.RUN_BACKEND_INTEGRATION === 'true'
  && /^https?:\/\//.test(backendUrl)
  && testEmail.length > 0
  && testPassword.length > 0;

const suite = enabled ? describe : describe.skip;

suite('frontend-to-backend authentication contract', () => {
  it('serves public intelligence while rejecting anonymous protected API requests', async () => {
    const publicResponse = await fetch(`${backendUrl}/api/v1/intel/public`, {
      headers: { Accept: 'application/json' }, credentials: 'include'
    });
    expect(publicResponse.status).toBe(200);
    expect(await publicResponse.json()).toEqual(expect.any(Array));

    const meResponse = await fetch(`${backendUrl}/auth/me`, { credentials: 'include' });
    expect(meResponse.status).toBe(401);

    const buyerResponse = await fetch(`${backendUrl}/api/buyer/vault`, { credentials: 'include' });
    expect(buyerResponse.status).toBe(401);
  });

  it('logs in through the browser API contract and restores the session using its HttpOnly cookie', async () => {
    const login = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    expect(login.status).toBe(200);
    const session = await login.json();
    expect(session).toMatchObject({ identity: testEmail.toLowerCase() });
    expect(['Buyer', 'Creator']).toContain(session.role);

    const accessCookie = login.headers.get('set-cookie')?.split(';')[0];
    expect(accessCookie).toMatch(/^access_token=/);
    const me = await fetch(`${backendUrl}/auth/me`, {
      credentials: 'include', headers: { Cookie: accessCookie as string, Accept: 'application/json' }
    });
    expect(me.status).toBe(200);
    const identity = await me.json();
    expect(identity).toMatchObject({ identity: testEmail.toLowerCase(), role: session.role });
    expect(identity).not.toHaveProperty('hashedPassword');
    expect(identity).not.toHaveProperty('secretSalt');
  });
});
