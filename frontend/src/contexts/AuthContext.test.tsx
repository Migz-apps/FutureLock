import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const auth = useAuth();
  return <>
    <span data-testid="state">{`${auth.isLoading}:${auth.isAuthenticated}:${auth.role}:${auth.identity}`}</span>
    <button onClick={() => auth.login('Creator', 'email', 'creator@example.com')}>login</button>
    <button onClick={() => auth.logout()}>logout</button>
  </>;
}

describe('AuthContext', () => {
  afterEach(() => vi.restoreAllMocks());

  it('restores an authenticated session from the canonical /auth/me endpoint', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      role: 'Buyer', identityType: 'email', identity: 'buyer@example.com'
    }), { headers: { 'content-type': 'application/json' } }));
    render(<AuthProvider><Probe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('false:true:Buyer:buyer@example.com'));
    expect(fetchMock).toHaveBeenCalledWith('https://api.test.futurelock.example/auth/me',
      expect.objectContaining({ credentials: 'include' }));
  });

  it('treats unauthorized and network failures as safely logged out', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('{"message":"Authentication required"}', {
      status: 401, headers: { 'content-type': 'application/json' }
    }));
    const view = render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('false:false:null:null'));
    view.unmount();

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('offline'));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('false:false:null:null'));
  });

  it('updates local identity on login and clears it after cookie logout', async () => {
    const fetchMock = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('{"message":"Logged out"}', { headers: { 'content-type': 'application/json' } }));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('false:false'));

    fireEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('state')).toHaveTextContent('false:true:Creator:creator@example.com');
    await act(async () => fireEvent.click(screen.getByText('logout')));
    expect(screen.getByTestId('state')).toHaveTextContent('false:false:null:null');
    expect(fetchMock).toHaveBeenLastCalledWith('https://api.test.futurelock.example/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }));
  });
});
