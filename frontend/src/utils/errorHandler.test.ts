import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, getErrorMessage, parseApiResponse } from './errorHandler';

describe('FutureLock API utility', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses the configured backend URL, normalized path, JSON headers, and credentials', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{"ok":true}', {
      headers: { 'content-type': 'application/json' }
    }));

    await apiFetch('auth/me', { method: 'POST', body: JSON.stringify({ hello: 'world' }) });

    expect(fetchMock).toHaveBeenCalledWith('https://api.test.futurelock.example/auth/me', expect.objectContaining({
      credentials: 'include',
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json', Accept: 'application/json' })
    }));
    expect(fetchMock.mock.calls[0][0]).not.toContain('/process.env.');
  });

  it('parses JSON and safe text responses', async () => {
    await expect(parseApiResponse(new Response('{"role":"Buyer"}', {
      headers: { 'content-type': 'application/json' }
    }))).resolves.toEqual({ role: 'Buyer' });
    await expect(parseApiResponse(new Response('healthy'))).resolves.toEqual({ message: 'healthy' });
  });

  it.each([
    [400, 'Invalid input'], [401, 'Authentication failed'], [403, 'Access denied'],
    [404, 'not found'], [409, 'already in use'], [429, 'Too many attempts'], [500, 'unavailable']
  ])('maps HTTP %s to a useful user-safe message', (status, expected) => {
    expect(getErrorMessage({ status, data: {} })).toContain(expected);
  });

  it('throws a structured error for non-successful responses', async () => {
    await expect(parseApiResponse(new Response('{"message":"Bad credentials"}', {
      status: 401, headers: { 'content-type': 'application/json' }
    }))).rejects.toMatchObject({ status: 401, message: 'Bad credentials' });
  });

  it('reports network and timeout failures without exposing internals', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('network failed'));
    await expect(apiFetch('/auth/me')).rejects.toMatchObject({ message: 'Failed to fetch backend.' });
    expect(getErrorMessage({ name: 'AbortError', message: 'AbortError' })).toContain('Could not reach');
  });
});
