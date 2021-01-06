import { useState, useEffect } from 'react';

export function usePersoniumAuthInfo(cellUrl, code, state, APP_CELL_URL) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);

  useEffect(() => {
    const authUrl = new URL(`${APP_CELL_URL}__/auth/receive_redirect`);
    authUrl.searchParams.set('cellUrl', cellUrl);
    authUrl.searchParams.set('code', code);
    authUrl.searchParams.set('state', state);
    let unmounted = false;
    fetch(authUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(res => {
        if (!res.ok) {
          throw {
            status: res.status,
            statusText: res.statusText,
          };
        }
        return res.json();
      })
      .then(jsonDat => {
        if (!unmounted) {
          setAuthInfo(jsonDat);
          setLoading(false);
        }
      })
      .catch(res => {
        setLoading(false);
        setError(res);
      });
    return function cleanup() {
      unmounted = true;
    };
  }, [cellUrl, code, state, APP_CELL_URL]);

  return { loading, error, authInfo };
}
