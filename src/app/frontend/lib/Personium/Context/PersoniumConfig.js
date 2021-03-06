import React, { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const defaultConfig = {
  appCellUrl: null,
  targetCellUrl: null,
};

const PersoniumConfigContext = createContext(defaultConfig);

export function usePersoniumConfig() {
  const [config, setConfig] = useContext(PersoniumConfigContext);

  return {
    config: {
      appCellUrl: config.appCellUrl,
      targetCellUrl: config.targetCellUrl,
    },
    setConfig: {
      setAppCellUrl: useCallback(
        appCellUrl => setConfig(c => Object.assign({}, c, { appCellUrl })),
        [setConfig]
      ),
      setTargetCellUrl: useCallback(
        targetCellUrl =>
          setConfig(c => Object.assign({}, c, { targetCellUrl })),
        [setConfig]
      ),
      rawSetConfig: setConfig,
    },
  };
}

export function PersoniumConfigProvider({ children, defConfig }) {
  const [config, setConfig] = useState(defConfig);
  return (
    <PersoniumConfigContext.Provider value={[config, setConfig]}>
      {children}
    </PersoniumConfigContext.Provider>
  );
}

PersoniumConfigProvider.propTypes = {
  defConfig: PropTypes.shape({
    appCellUrl: PropTypes.string,
    targetCellUrl: PropTypes.string,
  }).isRequired,
  children: PropTypes.node.isRequired,
};
