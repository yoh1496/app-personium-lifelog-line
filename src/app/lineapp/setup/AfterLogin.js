import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import liff from '@line/liff';
import { useLINECellAssociationStatus } from '../lib/useLINECellAssociationStatus';

import { APP_CELL_URL } from './AppConstants';

function useCloseWindow() {
  return useCallback(() => {
    if (liff.isInClient()) {
      liff.closeWindow();
    } else {
      window.close();
    }
  }, []);
}

function CellInput({ onEnter, disabled }) {
  const [cellUrl, setCellUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = useCallback(
    e => {
      setCellUrl(e.target.value);
    },
    [setCellUrl]
  );

  const handleLaunchQRScan = useCallback(() => {
    if (!liff.isInClient()) return setError('not launched in Line App');
    if (!liff.scanCode) return setError('scanCode not supported');

    liff
      .scanCode()
      .then(result => {
        setCellUrl(result.value);
      })
      .catch(err => {
        setError(err);
      });
  }, [setCellUrl, setError]);

  const handleEnter = useCallback(() => {
    onEnter(cellUrl);
  }, [onEnter, cellUrl]);

  return (
    <div>
      <input type="text" value={cellUrl} onChange={handleChange} />
      <br />
      <button onClick={handleLaunchQRScan}>QRコード</button>
      <br />
      <button onClick={handleEnter} disabled={disabled}>
        決定
      </button>
      <div>{error !== null ? JSON.stringify(error) : null}</div>
    </div>
  );
}

CellInput.propTypes = {
  onEnter: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export function AfterLogin() {
  const { loading, error, associationStatus } = useLINECellAssociationStatus(
    liff.getAccessToken(),
    APP_CELL_URL
  );
  const [handling, setHandling] = useState(false);
  console.log(loading, error, associationStatus);

  const closeWindow = useCloseWindow();

  const handleEnterCellUrl = useCallback(
    cellUrl => {
      setHandling(true);
      fetch(`${APP_CELL_URL}__/auth/start_oauth2?cellUrl=${cellUrl}`, {
        method: 'POST',
      }).then(res => {
        const oauthFormURL = new URL(res.url);
        const redirectURI = oauthFormURL.searchParams.get('redirect_uri');
        const redirectURIobject = new URL(decodeURI(redirectURI));
        redirectURIobject.pathname = '/__/front/linesetup';
        oauthFormURL.searchParams.set(
          'redirect_uri',
          encodeURI(redirectURIobject.toString())
        );
        console.log('oauthFormURL', oauthFormURL.toString());
        location.href = oauthFormURL.toString();
        setHandling(false);
      });
    },
    [setHandling]
  );

  if (loading) return <h1>Loading Associate Status...</h1>;

  if (error !== null)
    return (
      <>
        <h1>Error Happened</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  console.log(loading, error, associationStatus);

  const cellAssociated = associationStatus.associated;

  if (cellAssociated) {
    return (
      <>
        <h1>Already accociated.</h1>
        <div>ログインして連携を解除する場合はコチラ</div>
        <button onClick={closeWindow}>Close</button>
      </>
    );
  }

  // Start Association
  return (
    <>
      <h1>Cell Association</h1>
      <CellInput onEnter={handleEnterCellUrl} disabled={handling} />
    </>
  );
}
