import React, { useCallback } from 'react';
import liff from '@line/liff';
import { useCloseWindow } from '../lib/useCloseWindow';
import { useLINECellAssociationStatus } from '../lib/useLINECellAssociationStatus';

import { APP_CELL_URL } from './AppConstants';
import { CellInput } from '../common/CellInput';

export function AfterLogin() {
  const { loading, error, associationStatus } = useLINECellAssociationStatus(
    liff.getAccessToken(),
    APP_CELL_URL
  );

  const closeWindow = useCloseWindow();

  const handleEnterCellUrl = useCallback(cellUrl => {
    console.log(cellUrl);
  }, []);

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
      <br />
      <button onClick={closeWindow}>閉じる</button>
    </>
  );
}
