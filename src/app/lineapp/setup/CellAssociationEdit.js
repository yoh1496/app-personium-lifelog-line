import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import liff from '@line/liff/dist/lib';
import { useLINECellAssociationStatus } from '../lib/useLINECellAssociationStatus';

const getAppClientSecret = async (appCell, userCell, access_token) => {
  const client_secret_res = await fetch(`${appCell}__/auth/get_client_secret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams([
      ['p_target', userCell],
      ['access_token', access_token],
    ]).toString(),
  });

  return (await client_secret_res.json()).access_token;
};

export function CellAssociationEdit({ authInfo, targetCell, appCellUrl }) {
  const [handling, setHandling] = useState(false);
  const {
    loading,
    error,
    associationStatus,
    associateCell,
    disassociateCell,
    updateAssociationStatus,
  } = useLINECellAssociationStatus(liff.getAccessToken(), appCellUrl);

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

  const handleDisassociate = useCallback(() => {
    setHandling(true);
    disassociateCell(targetCell, authInfo.access_token)
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
    disassociateCell,
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
        <button onClick={handleDisassociate}>連携解除</button>
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

CellAssociationEdit.propTypes = {
  authInfo: PropTypes.shape({
    access_token: PropTypes.string.isRequired,
  }),
  targetCell: PropTypes.string.isRequired,
  appCellUrl: PropTypes.string.isRequired,
};
