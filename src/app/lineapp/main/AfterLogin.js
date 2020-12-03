import React, { useEffect, useState, useCallback } from 'react';
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

function CellInput({ onEnter }) {
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
  });

  return (
    <div>
      <input type="text" value={cellUrl} onChange={handleChange} />
      <br />
      <button onClick={handleLaunchQRScan}>QRコード</button>
      <br />
      <button onClick={handleEnter}>決定</button>
      <div>{error !== null ? JSON.stringify(error) : null}</div>
    </div>
  );
}

export function AfterLogin() {
  const { loading, error, associationStatus } = useLINECellAssociationStatus(
    liff.getAccessToken(),
    APP_CELL_URL
  );

  const closeWindow = useCloseWindow();

  const handleEnterCellUrl = useCallback(cellUrl => {
    console.log(cellUrl);
  });

  const handleClick = useCallback(() => {
    location.href = associationStatus.authUrl;
  }, [associationStatus]);

  if (loading) return <h1>Loading Associate Status...</h1>;

  if (error !== null)
    return (
      <>
        <h1>Error Happened</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  const cellAssociated = associationStatus.associated;
  const authUrl = associationStatus.authUrl;

  if (!cellAssociated) {
    // Start Association
    return (
      <>
        <h1>Cell Association</h1>
        <CellInput onEnter={handleEnterCellUrl} />
      </>
    );
  }

  if (authUrl === null) {
    return (
      <>
        <h1>Something wrong</h1>
        <div>authUrl is null</div>
      </>
    );
  }

  return (
    <>
      <h1>Already accociated.</h1>
      <div>アプリを起動する</div>
      <button onClick={handleClick}>起動</button>
    </>
  );
}
