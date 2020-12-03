import React from 'react';
import { Container, Header, List, Segment, Sticky } from 'semantic-ui-react';
import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { usePersoniumConfig } from './lib/Personium/Context/PersoniumConfig';

export const Top = () => {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();
  const { boxUrl } = useBoxUrl();
  return (
    <>
      <Sticky>
        <Header block>Personium Lifelog</Header>
      </Sticky>
      <Container
        style={{ paddingTop: '1em', paddingBottom: '7em' }}
      ></Container>
    </>
  );
};
