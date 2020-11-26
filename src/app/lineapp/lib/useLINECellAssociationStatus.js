import { useState, useEffect, useCallback } from 'react';

export function useLINECellAssociationStatus(lineAccessToken, appCellUrl) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [associationStatus, setAssociationStatus] = useState(null);

  const associateCell = useCallback(
    async (cellUrl, accessToken) => {
      const body = new URLSearchParams();
      body.set('lineAccessToken', lineAccessToken);
      body.set('cellUrl', cellUrl);
      body.set('accessToken', accessToken);

      const res = await fetch(
        `${appCellUrl}__/line/register_line_association`,
        {
          method: 'POST',
          body: body.toString(),
        }
      );

      if (res.ok) {
        return true;
      } else {
        throw { status: res.status, statusText: res.statusText };
      }
    },
    [lineAccessToken, appCellUrl]
  );

  const updateAssociationStatus = useCallback(async () => {
    setLoading(true);

    const requestAuthUrl = new URL(
      `${location.origin}/__/line/request_oauth2_url`
    );
    requestAuthUrl.searchParams.set('lineAccessToken', lineAccessToken);

    const res = await fetch(requestAuthUrl, {
      credentials: 'include',
    });

    console.log(res.headers);

    if (res.status === 404) {
      setAssociationStatus({ associated: false });
      setLoading(false);
      return;
    }

    // without error
    const { url } = await res.json();
    const authUrl = new URL(url);
    const redirectUri = new URL(
      decodeURIComponent(authUrl.searchParams.get('redirect_uri'))
    );
    const targetCell = redirectUri.searchParams.get('cellUrl');
    setAssociationStatus({ associated: true, authUrl: url, targetCell });
    setLoading(false);
  }, [lineAccessToken, setLoading, setAssociationStatus]);

  useEffect(() => {
    console.log('useEffect');

    updateAssociationStatus().then(() => {
      console.log('done');
    });

    return function cleanup() {
      console.log('cleanup');
    };
  }, [updateAssociationStatus]);

  return {
    loading,
    error,
    associationStatus,
    associateCell,
    updateAssociationStatus,
  };
}
