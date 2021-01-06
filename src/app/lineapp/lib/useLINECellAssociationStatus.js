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

      try {
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
      } catch (e) {
        setError(e);
        throw e;
      }
    },
    [lineAccessToken, appCellUrl]
  );

  const disassociateCell = useCallback(
    async (targetCell, accessToken) => {
      try {
        const disassociateURL = new URL(
          `${appCellUrl}__/line/register_line_association`
        );
        disassociateURL.searchParams.set('cellUrl', targetCell);

        const res = await fetch(disassociateURL.toString(), {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          return true;
        } else {
          throw { status: res.status, statusText: await res.text() };
        }
      } catch (e) {
        setError(e);
        throw e;
      }
    },
    [appCellUrl]
  );

  const updateAssociationStatus = useCallback(async () => {
    setLoading(true);

    const getCellURL = new URL(`${location.origin}/__/line/get_cellurl`);
    getCellURL.searchParams.set('lineAccessToken', lineAccessToken);

    const res = await fetch(getCellURL, { credentials: 'include' });
    console.log(res.headers);

    if (res.status === 404) {
      setAssociationStatus({ associated: false });
      setLoading(false);
      return;
    }

    // without error
    const { cellUrl } = await res.json();
    const requestAuthURL = new URL(
      `${location.origin}/__/auth/request_oauth2_url`
    );
    requestAuthURL.searchParams.set('cellUrl', cellUrl);

    const requestAuthURLRes = await fetch(requestAuthURL, {
      credentials: 'include',
    });
    const { url } = await requestAuthURLRes.json();
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
    disassociateCell,
    updateAssociationStatus,
  };
}
