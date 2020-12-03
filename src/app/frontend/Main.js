import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Segment, Loader } from 'semantic-ui-react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Timeline } from './Timeline';

import { HeadMenu } from './HeadMenu';

import { BoxInstallation } from './BoxInstallation';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { usePersoniumConfig } from './lib/Personium/Context/PersoniumConfig';
import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { LineRegistration } from './LineRegistration';
import { AuthInfo } from './AuthInfo';
import { Top } from './Top';

export function Main() {
  const { loading, boxUrl } = useBoxUrl();
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();
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

  if (loading)
    return (
      <Segment>
        <Loader />
      </Segment>
    );

  if (boxUrl === null) {
    return <BoxInstallation />;
  }

  return (
    <>
      <HeadMenu onMenuClick={handleMenuClick} activeItem={activeItem} />
      <Switch>
        <Redirect exact from="/" to={todayLocation} />
        <Redirect exact from="/timeline" to={todayLocation} />
        <Route path="/timeline/:year(\d+)-:month(\d+)-:day(\d+)">
          <Timeline />
        </Route>
        <Route path="/info" exact>
          <AuthInfo />
        </Route>
        <Route path="/line" exact>
          <LineRegistration />
        </Route>
      </Switch>
    </>
  );
}
