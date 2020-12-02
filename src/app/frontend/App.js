import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { usePersoniumConfig } from './lib/Personium/Context/PersoniumConfig';
import { AppAuthentication } from './AppAuthentication';
import { PersoniumBoxProvider } from './lib/Personium/Context/PersoniumBox';
import { Main } from './Main';

export const App = ({ bootArgs }) => {
  const { config, setConfig } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();

  const [inputCell, setInputCell] = useState('');

  const handleSubmit = useCallback(
    ev => {
      ev.preventDefault();
      setConfig.setTargetCellUrl(inputCell);
    },
    [setConfig, inputCell]
  );

  const handleChange = useCallback(
    ev => {
      setInputCell(ev.target.value);
    },
    [setInputCell]
  );

  console.log('config:', config);

  if (config.appCellUrl === undefined || config.appCellUrl === null) {
    console.log('config is illegal state', config);
    return null;
  }

  if (config.targetCellUrl === null) {
    // ask cell url
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input type="text" onChange={handleChange} value={inputCell} />
          <button type="submit">Enter</button>
        </form>
      </div>
    );
  }

  if (auth === null) {
    return <AppAuthentication authCode={bootArgs.authCode} />;
  }

  // initialization is done
  return (
    <PersoniumBoxProvider>
      <Main />
    </PersoniumBoxProvider>
  );
};

App.propTypes = {
  bootArgs: PropTypes.shape({
    authCode: PropTypes.shape({
      code: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
    }),
  }).isRequired,
};
