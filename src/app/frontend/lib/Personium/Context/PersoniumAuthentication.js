import React, { createContext, useContext, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const PersoniumAuthenticationContext = createContext({
  auth: null,
  setAuth: null,
});

const getAppClientSecret = async (appCell, userCell, access_token) => {
  const client_secret_res = await fetch(`${appCell}__/auth/get_client_secret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams([
      ['p_target', userCell],
      ['access_token', access_token],
    ]).toString(),
  });

  return (await client_secret_res.json()).access_token;
};

const refreshAppAuthWithPCookie = async (appCell, userCell, tokens) => {
  const client_secret = await getAppClientSecret(
    appCell,
    userCell,
    tokens.access_token
  );
  // get token with cookie
  const data = new URLSearchParams();
  data.set('grant_type', 'refresh_token');
  data.set('p_cookie', 'true');
  data.set('refresh_token', tokens.refresh_token);
  data.set('client_id', appCell);
  data.set('client_secret', client_secret);

  const userResult = await fetch(`${userCell}__token`, {
    credentials: 'include',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data,
  });

  return await userResult.json();
};

export function usePersoniumAuthentication() {
  const { auth, setAuth } = useContext(PersoniumAuthenticationContext);

  const authWithROPC = async (
    cellUrl,
    username,
    password,
    enablePCookie = false
  ) => {
    const data = new URLSearchParams();
    data.set('grant_type', 'password');
    data.set('username', username);
    data.set('password', password);
    if (enablePCookie) data.set('p_cookie', 'true');
    const res = await fetch(`${cellUrl}__token`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data,
    });

    if (!res.ok) {
      throw {
        status: res.status,
        statusText: res.statusText,
      };
    }
    setAuth(await res.json());
  };

  const authWithAuthCode = async (
    appCell,
    userCell,
    authCode,
    enablePCookie = false
  ) => {
    // get AppAuthToken from receive_redirect
    console.log(authCode);
    const { state, code } = authCode;
    const res = await fetch(
      `${appCell}__/auth/receive_redirect?state=${state}&code=${code}&cellUrl=${userCell}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (enablePCookie) {
      setAuth(
        await refreshAppAuthWithPCookie(appCell, userCell, await res.json())
      );
    } else {
      setAuth(await res.json());
    }
  };

  const authWithStartOAuth2 = async (
    appCell,
    userCell,
    permitRedirect,
    enablePCookie
  ) => {
    // get AppAuthToken
    const authURL = new URL(
      `${appCell}__/auth/start_oauth2?cellUrl=${userCell}`
    );
    const res = await fetch(authURL, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log(res.status);

    if (!res.ok || res.status !== 200)
      return res.body(statusText => {
        throw { status: res.status, statusText };
      });

    if (res.url.startsWith(userCell)) {
      // it must be redirect
      if (permitRedirect) {
        const oauthFormURL = new URL(res.url);
        const redirectURI = oauthFormURL.searchParams.get('redirect_uri');
        const redirectURIobject = new URL(decodeURI(redirectURI));
        redirectURIobject.pathname = '/__/front/app';
        oauthFormURL.searchParams.set(
          'redirect_uri',
          encodeURI(redirectURIobject.toString())
        );
        location.href = oauthFormURL.toString();
      }
      throw 'redirected';
    }

    if (enablePCookie) {
      setAuth(
        await refreshAppAuthWithPCookie(appCell, userCell, await res.json())
      );
    } else {
      setAuth(await res.json());
    }
  };

  const logout = async () => {
    setAuth(null);
  };
  return { auth, authWithROPC, authWithAuthCode, authWithStartOAuth2, logout };
}

export function PersoniumAuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  return (
    <PersoniumAuthenticationContext.Provider value={{ auth, setAuth }}>
      {children}
    </PersoniumAuthenticationContext.Provider>
  );
}

PersoniumAuthProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export function PrivateRoute({ authPath, children, ...rest }) {
  const { auth } = usePersoniumAuthentication();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth !== null ? (
          children
        ) : (
          <Redirect to={{ pathname: authPath, state: { from: location } }} />
        )
      }
    />
  );
}

PrivateRoute.propTypes = {
  authPath: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};
