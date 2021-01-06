import React from 'react';
import PropTypes from 'prop-types';
import { usePersoniumAuthInfo } from '../lib/usePersoniumAuthInfo';
import { APP_CELL_URL } from './AppConstants';
import { CellAssociationEdit } from './CellAssociationEdit';

export function CellAssociation({ authCode, targetCell }) {
  const { loading, error, authInfo } = usePersoniumAuthInfo(
    targetCell,
    authCode.code,
    authCode.state,
    APP_CELL_URL
  );

  if (loading) return <h1>Authentication...</h1>;

  if (error)
    return (
      <>
        <h1>Error happened</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  return (
    <CellAssociationEdit
      authInfo={authInfo}
      targetCell={targetCell}
      appCellUrl={APP_CELL_URL}
    />
  );
}

CellAssociation.propTypes = {
  authCode: PropTypes.shape({
    code: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
  }).isRequired,
  targetCell: PropTypes.string.isRequired,
};
