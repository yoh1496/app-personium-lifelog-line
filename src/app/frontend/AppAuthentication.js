import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { usePersoniumConfig } from './lib/Personium/Context/PersoniumConfig';

export const AppAuthentication = ({ authCode }) => {
  const { config } = usePersoniumConfig();
  const {
    authWithStartOAuth2,
    authWithAuthCode,
    authWithROPC,
  } = usePersoniumAuthentication();

  useEffect(() => {
    // login action
    (async () => {
      const { appCellUrl: appCell, targetCellUrl: userCell } = config;
      const debug_user = localStorage.getItem('debug_user');
      const debug_pass = localStorage.getItem('debug_pass');
      if (debug_user !== null && debug_pass !== null) {
        await authWithROPC(userCell, debug_user, debug_pass, true);
      } else if (authCode === null) {
        await authWithStartOAuth2(appCell, userCell, true, true);
      } else {
        await authWithAuthCode(appCell, userCell, authCode, true);
      }
      localStorage.setItem('lastLoginCell', userCell);
    })();
  }, [authCode, authWithROPC, authWithAuthCode, authWithStartOAuth2, config]);

  return <div>auth...</div>;
};

AppAuthentication.propTypes = {
  authCode: PropTypes.shape({
    code: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
  }),
};
