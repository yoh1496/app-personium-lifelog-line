import React from 'react';
import PropTypes from 'prop-types';
import { Header, Segment, Label, Sticky, Container } from 'semantic-ui-react';
import { LineFriendButton } from './LineFriendButton';
import { ExtCellSetupView } from './ExtCellSetup';

export const LineRegistration = () => {
  return (
    <>
      <Sticky>
        <Header block>LINE連携</Header>
      </Sticky>
      <Container style={{ paddingTop: '1em', paddingBottom: '0.8em' }}>
        <Segment>
          <Header as="h3" content="アプリへのRole付与" />
          <p>
            LINEと連携することで、トークから自分のセルに画像を保存することができます。
            <br />
            トークからの入力を有効にするには、ライフログアプリ（https://app-ishiguro-01.appdev.personium.io/）を外部セル登録し、
            <br />
            「LineEventWriter」Roleを付与してください。
            <br />
            外部セル登録と、Role付与は下記ボタンからも実行できます。
          </p>
          <ExtCellSetupView />
        </Segment>
      </Container>
      <Container style={{ paddingBottom: '7em' }}>
        <Segment>
          <Header as="h3" content="LINE友だち追加" />
          <p>下記ボタンから「Personium Lifelog」を友だち追加してください。</p>
          <p>
            <Label>
              <LineFriendButton friendId="@426xuqeg" />
            </Label>
          </p>
          <p>上記リンクが使えない場合はこちら↓</p>
          <p>
            <a href="https://lin.ee/QMUvUFe">
              <img
                src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                alt="友だち追加"
                height="36"
                border="0"
              />
            </a>
          </p>
          <p>QRコード</p>
          <img src="https://qr-official.line.me/sid/M/426xuqeg.png" />{' '}
        </Segment>
      </Container>
    </>
  );
};

LineRegistration.propTypes = {
  userCell: PropTypes.string.isRequired,
};
