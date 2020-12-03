import React from 'react';
import { Container, Header, List, Segment, Sticky } from 'semantic-ui-react';
import { usePersoniumAuthentication } from './lib/Personium/Context/PersoniumAuthentication';
import { useBoxUrl } from './lib/Personium/Context/PersoniumBox';
import { usePersoniumConfig } from './lib/Personium/Context/PersoniumConfig';

export const AuthInfo = () => {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication();
  const { boxUrl } = useBoxUrl();
  return (
    <>
      <Sticky>
        <Header block>Auth info</Header>
      </Sticky>
      <Container style={{ paddingTop: '1em', paddingBottom: '7em' }}>
        <Segment style={{ overflow: 'hidden' }}>
          <List>
            <List.Item>
              <List.Header>Cell</List.Header>
              <List.Description>{config.targetCellUrl}</List.Description>
            </List.Item>
            <List.Item>
              <List.Header>Box</List.Header>
              <List.Description>{boxUrl}</List.Description>
            </List.Item>
            <List.Item>
              <List.Header>token</List.Header>
              <List.Description>{auth.access_token}</List.Description>
            </List.Item>
          </List>
        </Segment>
      </Container>
    </>
  );
};
