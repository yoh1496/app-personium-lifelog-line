import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Segment, Loader, Container } from 'semantic-ui-react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Timeline } from './Timeline';

import { HeadMenu } from './HeadMenu';

import { BoxInstallation } from './BoxInstallation';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { usePersoniumConfig } from './lib/Personium/Context/PersoniumConfig';
import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';

export function Main() {
  const { boxUrl } = useBoxUrl();
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const handleMenuClick = useCallback(ev => {
    console.log(ev);
  }, []);

  useEffect(() => {});

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const todayLocation = useMemo(() => {
    const loc = `/timeline/${year}-${('0' + month).slice(-2)}-${(
      '0' + day
    ).slice(-2)}`;
    console.log('todayLocation', loc);
    return loc;
  }, [month, year, day]);

  if (boxUrl === null) {
    return <BoxInstallation />;
  }

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
        <Switch>
          <Redirect exact from="/timeline" to={todayLocation} />
          <Route path="/timeline/:year(\d+)-:month(\d+)-:day(\d+)">
            <Timeline />
          </Route>
          {/* component={() => (
            <ImageListPage
              images={images}
              p_cookie_peer={pCookiePeer}
              userBoxUrl={userBoxUrl}
            />
          )} */}
          <Route path="/info" exact>
            <h1>App</h1>
            <dl>
              <dt>cell</dt>
              <dd>{config.targetCellUrl}</dd>
              <dt>token</dt>
              <dd>{auth.access_token ? auth.access_token : ''}</dd>
            </dl>
          </Route>
          <Route path="/line" exact>
            {/* <LineRegistration /> */}
          </Route>
        </Switch>
      </Container>
    </>
  );
}
