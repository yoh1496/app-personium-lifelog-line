import React, { Component, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Menu, Segment, Loader, Container } from 'semantic-ui-react';
import { Route, Link } from 'react-router-dom';
import { ImageListPage } from './ImageListPage';
// import { LineRegistration } from './LineRegistration';

function HeadMenu({ onMenuClick, activeItem }) {
  return (
    <Menu pointing fixed="top" inverted>
      <Container>
        <Menu.Item
          as={Link}
          to="/"
          name="Locations"
          active={activeItem === 'Locations'}
          onClick={onMenuClick}
        />
        <Menu.Item
          as={Link}
          to="/photos"
          name="Photos"
          active={activeItem === 'Photos'}
          onClick={onMenuClick}
        />
        <Menu.Item
          as={Link}
          to="/info"
          name="Cell"
          active={activeItem === 'Cell'}
          onClick={onMenuClick}
        />
        <Menu.Item
          as={Link}
          to="/line"
          name="LINE"
          active={activeItem === 'LINE'}
          onClick={onMenuClick}
        />
      </Container>
    </Menu>
  );
}

HeadMenu.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  activeItem: PropTypes.string.isRequired,
};

const App = ({ appCell, userCell, authCode }) => {
  const [loading, setLoading] = useState(true);
  const [userAccessToken, setUserAccessToken] = useState(null);
  const [userBoxUrl, setUserBoxURl] = useState(null);
  const [images, setImages] = useState([]);
  const [activeItem, setActiveItem] = useState('Home');
  const [pCookiePeer, setPCookiePeer] = useState(null);

  useEffect(() => {
    // login action
    (async () => {
      let tokens = null;
      if (authCode === null) {
        // get AppAuthToken
        const res = await fetch(`/__/auth/start_oauth2?cellUrl=${userCell}`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        tokens = await res.json();
      } else {
        // get AppAuthToken from receive_redirect
        const { state, code } = authCode;
        const res = await fetch(
          `/__/auth/receive_redirect?state=${state}&code=${code}&cellUrl=${userCell}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        tokens = await res.json();
      }

      if (tokens === null) throw 'not Authorized';

      const client_secret_res = await fetch(`/__/auth/get_client_secret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams([
          ['p_target', userCell],
          ['access_token', tokens.access_token],
        ]).toString(),
      });

      const jsonDat = await client_secret_res.json();

      // get token with cookie
      const data = new URLSearchParams();
      // data.set('p_target', userCell);
      data.set('grant_type', 'refresh_token');
      data.set('p_cookie', 'true');
      data.set('refresh_token', tokens.refresh_token);
      data.set('client_id', appCell);
      data.set('client_secret', jsonDat.access_token);

      const userResult = await fetch(`${userCell}__token`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
      });

      const userResultJson = await userResult.json();
      console.log(userResultJson);

      const appUserToken = userResultJson.access_token;

      const boxResult = await fetch(`${userCell}__box?schema=${appCell}`, {
        credentials: 'include',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${appUserToken}`,
        },
      });
      const userBoxUrl = boxResult.headers.get('Location');

      const imagesResult = await fetch(
        `${userBoxUrl}receivedData/receivedMessage`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${appUserToken}`,
          },
        }
      );
      const imagesResultJson = await imagesResult.json();

      setLoading(false);
      setUserAccessToken(appUserToken);
      setUserBoxURl(userBoxUrl);
      setPCookiePeer(userResultJson.p_cookie_peer);
      setImages(
        Object.values(imagesResultJson.d.results).map(item => item.__id)
      );
    })();
  }, [appCell, userCell, authCode]);

  const handleMenuClick = useCallback(ev => {
    console.log(ev);
  }, []);

  if (loading)
    return (
      <Segment>
        <Loader />
      </Segment>
    );

  return (
    <>
      <HeadMenu onMenuClick={handleMenuClick} activeItem={activeItem} />
      <Container style={{ marginTop: '7em' }}>
        <Route
          path="/"
          exact
          component={() => (
            <ImageListPage
              images={images}
              p_cookie_peer={pCookiePeer}
              userBoxUrl={userBoxUrl}
            />
          )}
        />
        <Route path="/info" exact>
          <h1>App</h1>
          <dl>
            <dt>cell</dt>
            <dd>{userCell}</dd>
            <dt>token</dt>
            <dd>{userAccessToken ? userAccessToken : ''}</dd>
          </dl>
        </Route>
        <Route path="/line" exact>
          {/* <LineRegistration /> */}
        </Route>
      </Container>
    </>
  );
};

App.propTypes = {
  userCell: PropTypes.string.isRequired,
  appCell: PropTypes.string.isRequired,
  authCode: PropTypes.shape({
    state: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
  }).isRequired,
};

export { App };
