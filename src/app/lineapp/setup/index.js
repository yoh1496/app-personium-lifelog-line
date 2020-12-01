import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import liff from '@line/liff';
import { useLiffInitialize } from '../lib/useLiffInitialize';
import { AfterLogin } from './AfterLogin';
import { CellAssociation } from './CellAssociation';

import { APP_CELL_URL, LIFF_ID } from './AppConstants';

let authCode = null;
let targetCell = null;
const currentHash = location.hash;
// handling oauth2 callback
// To avoid mixing authentication with LINE, you must contain cellUrl in query.
const queryParams = new URLSearchParams(location.search);
if (
  queryParams.has('cellUrl') &&
  queryParams.has('code') &&
  queryParams.has('state')
) {
  targetCell = queryParams.get('cellUrl');
  authCode = {
    code: queryParams.get('code'),
    state: queryParams.get('state'),
  };
  queryParams.delete('cellUrl');
  queryParams.delete('code');
  queryParams.delete('state');
  queryParams.delete('last_authenticated');
  queryParams.delete('failed_count');
  queryParams.delete('box_not_installed');
}

window.history.replaceState(
  null,
  null,
  '?' + queryParams.toString() + currentHash
);

function App() {
  const { loading, error, startInit } = useLiffInitialize(LIFF_ID);
  const handleClick = useCallback(() => {
    liff.login({
      redirectUri: `${APP_CELL_URL}__/front/linesetup`,
    });
  }, []);

  useEffect(() => {
    startInit();
  }, [startInit]);

  if (loading) return <h1>Initializing...{queryParams}</h1>;

  if (error)
    return (
      <>
        <h1>Error happened.</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  if (liff.isLoggedIn()) {
    if (authCode !== null) {
      return <CellAssociation authCode={authCode} targetCell={targetCell} />;
    }
    return <AfterLogin />;
  }

  return (
    <>
      <h1>Hello Personium Setup page</h1>
      <dl>
        <dt>Browser Language</dt>
        <dd>{liff.getLanguage()}</dd>
      </dl>
      <button onClick={handleClick}>Login</button>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
