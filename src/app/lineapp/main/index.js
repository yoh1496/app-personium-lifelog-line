import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { AfterLogin } from './AfterLogin';
import liff from '@line/liff';

import { LIFF_ID, APP_CELL_URL } from './AppConstants';
import { useLiffInitialize } from '../lib/useLiffInitialize';

function App() {
  const { loading, error } = useLiffInitialize(LIFF_ID);
  const handleClick = useCallback(() => {
    liff.login({
      redirectUri: `${APP_CELL_URL}__/front/lineapp`,
    });
  }, []);

  if (loading) return <h1>Initializing...</h1>;

  if (error)
    return (
      <>
        <h1>Error happened.</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  if (liff.isLoggedIn()) {
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
