import React, { useCallback } from 'react';
import liff from '@line/liff';
import { useLINECellAssociationStatus } from '../lib/useLINECellAssociationStatus';

import { APP_CELL_URL } from './AppConstants';
import { useCloseWindow } from '../lib/useCloseWindow';
import { CellInput } from '../common/CellInput';

async function startOAuth2(cellUrl) {
  return fetch(`${APP_CELL_URL}__/auth/start_oauth2?cellUrl=${cellUrl}`, {
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
  });
}

export function AfterLogin() {
  const { loading, error, associationStatus } = useLINECellAssociationStatus(
    liff.getAccessToken(),
    APP_CELL_URL
  );
  console.log(loading, error, associationStatus);

  const closeWindow = useCloseWindow();

  const handleLoginClick = useCallback(() => {
    if (associationStatus === null) {
      return;
    }
    startOAuth2(associationStatus.targetCell);
  }, [associationStatus]);

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
        <div>
          ログインして連携を解除する場合は
          <a href="#" onClick={handleLoginClick}>
            コチラ
          </a>
        </div>
        <button onClick={closeWindow}>Close</button>
      </>
    );
  }

  // Start Association
  return (
    <>
      <h1>Cell Association</h1>
      <CellInput onEnter={startOAuth2} />
    </>
  );
}
