import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import liff from '@line/liff';
import { useLINECellAssociationStatus } from '../lib/useLINECellAssociationStatus';
import { APP_CELL_URL } from './AppConstants';

function usePersoniumAuthInfo(cellUrl, code, state) {
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
  }, [cellUrl, code, state]);

  return { loading, error, authInfo };
}

function CellAssociationEdit({ authInfo, targetCell }) {
  const [handling, setHandling] = useState(false);
  const {
    loading,
    error,
    associationStatus,
    associateCell,
    updateAssociationStatus,
  } = useLINECellAssociationStatus(liff.getAccessToken(), APP_CELL_URL);

  const handleAssociate = useCallback(() => {
    setHandling(true);
    associateCell(targetCell, authInfo.access_token)
      .then(() => {
        updateAssociationStatus();
      })
      .catch(res => {
        console.log(res);
      })
      .then(() => {
        setHandling(false);
      });
  }, [
    associateCell,
    authInfo.access_token,
    targetCell,
    updateAssociationStatus,
  ]);

  if (loading) return <h1>Loading...</h1>;

  if (error)
    return (
      <>
        <h1>Error happened</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  if (associationStatus.associated) {
    // already associated
    // remove
    return (
      <>
        <h3>セル連携</h3>
        <div>
          現在このLINEIDは下記セルと連携されています。連携を解除しますか？
          <br />
          {associationStatus.targetCell}
        </div>
        <button disabled>連携解除</button>
      </>
    );
  } else {
    // not associated
    return (
      <>
        <h3>新規セル連携</h3>
        <div>
          下記のセルとの連携を設定しますか？
          <br />
          {targetCell}
        </div>
        <button onClick={handleAssociate} disabled={handling}>
          連携
        </button>
      </>
    );
  }
}

export function CellAssociation({ authCode, targetCell }) {
  const { loading, error, authInfo } = usePersoniumAuthInfo(
    targetCell,
    authCode.code,
    authCode.state
  );

  if (loading) return <h1>Authentication...</h1>;

  if (error)
    return (
      <>
        <h1>Error happened</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  return <CellAssociationEdit authInfo={authInfo} targetCell={targetCell} />;
}

CellAssociation.propTypes = {
  authCode: PropTypes.shape({
    code: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
  }).isRequired,
  targetCell: PropTypes.string.isRequired,
};
