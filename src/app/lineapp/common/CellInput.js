import React, { useState, useCallback } from 'react';
import liff from '@line/liff';
import PropTypes from 'prop-types';

export function CellInput({ onEnter }) {
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

  const handleEnter = useCallback(
    e => {
      e.preventDefault();
      onEnter(cellUrl);
      return false;
    },
    [onEnter, cellUrl]
  );

  return (
    <div>
      <form onSubmit={handleEnter}>
        <button onClick={handleLaunchQRScan} type="button">
          QRコード
        </button>
        <input type="text" value={cellUrl} onChange={handleChange} />
        <br />
        <button onClick={handleEnter} type="submit">
          決定(Submit)
        </button>
        <div>{error !== null ? JSON.stringify(error) : null}</div>
      </form>
    </div>
  );
}

CellInput.propTypes = {
  onEnter: PropTypes.func.isRequired,
};
