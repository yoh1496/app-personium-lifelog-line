import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import 'semantic-ui-css/semantic.min.css';

// import LoginActionCreators from './actions/loginActionCreators';
import { App } from './App';
import { PersoniumAuthProvider } from './lib/Personium/Context/PersoniumAuthentication';
import { PersoniumConfigProvider } from './lib/Personium/Context/PersoniumConfig';

// BootScript
const SS_LAST_LOGIN_CELL = 'lastLoginCell';
// const appUrlSplit = `${location.origin}${location.pathname}`.split('/');
// const appCellUrl = `${appUrlSplit.slice(0, 3).join('/')}/`;
const appCellUrl = 'https://app-ishiguro-01.appdev.personium.io/';

const currentHash = location.hash.replace(/^#\/?/g, '#');
console.log({ currentHash });

let nextPath = '/';
let targetCell = null;

if (currentHash.startsWith('#cell')) {
  // boot from Home App
  const [target] = currentHash
    .replace(/^#\/?/g, '')
    .split('&')
    .map(kv => kv.split('='))
    .filter(([k]) => k === 'cell');

  if (target) {
    // need to login
    targetCell = target[1];
  } else {
    // from cache ?
    throw `Something is wrong. Is hash wrong? ${currentHash}`;
  }
} else {
  nextPath = currentHash;
  const lastLoginCell = localStorage.getItem(SS_LAST_LOGIN_CELL);
  localStorage.removeItem(SS_LAST_LOGIN_CELL);
  targetCell = lastLoginCell ? lastLoginCell : null;
}

let authCode = null;

// handling oauth2 callback
const queryParams = new URLSearchParams(location.search);
if (queryParams.has('code') && queryParams.has('state')) {
  if (queryParams.has('cellUrl')) targetCell = queryParams.get('cellUrl');
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
  '?' + queryParams.toString() + nextPath
);

const bootArgs = { authCode };

ReactDOM.render(
  <Router>
    <PersoniumConfigProvider
      defConfig={{
        appCellUrl,
        targetCellUrl: targetCell,
      }}
    >
      <PersoniumAuthProvider>
        <App bootArgs={bootArgs} />
      </PersoniumAuthProvider>
    </PersoniumConfigProvider>
  </Router>,
  document.getElementById('root')
);
