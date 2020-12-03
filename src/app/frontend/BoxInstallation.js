import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { usePersoniumBoxInstall } from './lib/Personium/Util/usePersoniumBoxInstall';
import { AppConstant } from './Constants';

export const BoxInstallation = () => {
  const { refetchBoxUrl } = useBoxUrl();
  const { error, loading, installBar, status } = usePersoniumBoxInstall(
    AppConstant.barFileUrl,
    AppConstant.installBoxName
  );
  const [started, setStarted] = useState(false);

  const handleRefresh = useCallback(() => {
    refetchBoxUrl();
  }, [refetchBoxUrl]);

  const handleClickBoxInstallation = useCallback(() => {
    setStarted(true);
    installBar().then(() => {
      console.log('install started');
    });
  }, [installBar, setStarted]);

  if (!started) {
    return (
      <div>
        <h4>Box is not installed</h4>
        <button onClick={handleClickBoxInstallation}>Box Install</button>
      </div>
    );
  }

  if (loading)
    return (
      <div>
        <h4>Box Installing...</h4>
        {status.map(({ time, text }) => {
          <p key={`status-${time}`}>
            {time}: {text}
          </p>;
        })}
      </div>
    );

  if (error)
    return (
      <div>
        <h4>Box Install failed</h4>
        <p>{error.text}</p>
      </div>
    );

  return (
    <div>
      <h4>Box installation is executed</h4>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
};

BoxInstallation.propTypes = {
  onRefresh: PropTypes.func.isRequired,
};
