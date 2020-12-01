import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import 'semantic-ui-css/semantic.min.css';

// import LoginActionCreators from './actions/loginActionCreators';
import { App } from './App';

// BootScript
const SS_LAST_LOGIN_CELL = 'lastLoginCell';
const appUrlSplit = `${location.origin}${location.pathname}`.split('/');
const appCellUrl = `${appUrlSplit.slice(0, 3).join('/')}/`;

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
  const lastLoginCell = sessionStorage.getItem(SS_LAST_LOGIN_CELL);
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

if (targetCell) {
  // LoginActionCreators.login(appCellUrl, targetCell).then(loginInfo => {
  //   console.log('initialize done: ', JSON.stringify(loginInfo));
  //   sessionStorage.setItem(SS_LAST_LOGIN_CELL, targetCell);
  //   location.hash = nextPath;
  // });
  ReactDOM.render(
    <Router>
      <App appCell={appCellUrl} userCell={targetCell} authCode={authCode} />
    </Router>,
    document.getElementById('root')
  );
} else {
  ReactDOM.render(
    <h1>Not Implemented yet</h1>,
    document.getElementById('root')
  );
}
