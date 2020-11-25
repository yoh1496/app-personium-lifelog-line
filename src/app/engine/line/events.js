/*global _p*/
// eslint-disable-next-line no-unused-vars
function events(request) {
  let debugInfo = {};

  try {
    const reqBody = request.input.readAll();
    console.log(reqBody);
    console.log(JSON.stringify(request.headers));
    const signature = request.headers['x-line-signature'];

    if (!debugEnabled) {
      verifySignature(signature, reqBody, lineSecret.ChannelSecret);
    }

    const jsonBody = JSON.parse(reqBody);
    debugInfo = handleEvent(jsonBody);
  } catch (e) {
    console.log('error happened:' + JSON.stringify(e.message));
    return {
      status: 400,
      headers: {},
      body: [debugEnabled ? JSON.stringify(e) : ''],
    };
  }

  // Send 200 if we can receive.
  return {
    status: 200,
    headers: {},
    body: [debugEnabled ? JSON.stringify(debugInfo) : ''],
  };
}

function verifySignature(signature, reqBody, ChannelSecret) {
  const SHA256 = new Hashes.SHA256();
  const b64_hmac = SHA256.b64_hmac(ChannelSecret, reqBody);
  console.log('SHA256.b64_hmac encoded data: ' + b64_hmac);
  if (signature != b64_hmac) {
    // eslint-disable-next-line prettier/prettier
    const message = 'Signature Verification Error. (signature=' + signature + ', result=' + b64_hmac + ')';
    console.log(message);
    throw new Error(message);
  }
}

function handleMessage(jsonBody) {
  // Handling Message event
  // Example : {"type":"message","source":{"accountId":"wo.00001@works-00001"},"createdTime":1604653405421,"content":{"type":"text","text":"XXXX"}}
  const accountId = jsonBody.source.accountId;
  const accountEntitySet = getEntitySet('LWData', 'Accounts');
  const accountData = findAccount(accountEntitySet, accountId).d.results[0];
  let res = null;

  if (!accountData) {
    console.log('Account is not found');
    res = postMessageToAccount(accountId, 'アカウントが見つかりませんでした。');
    console.log(res);
    return res;
  }

  console.log('Account is found: ' + JSON.stringify(accountData));

  if (accountData.status !== 'active') {
    res = postMessageToAccount(
      accountId,
      'アカウントは有効になっていません。管理者にお問い合わせください。'
    );
    console.log(res);
    return res;
  }

  // Account is found.
  res = postMessageToAccount(
    accountId,
    'こんにちは ' + accountData.cellUrl + ' さん！'
  );
  console.log(res);

  const randomStickerId = (
    1988 +
    (Math.floor(Math.random() * 10) % 10)
  ).toString();
  const packageId = '446';
  res = postStickerToAccount(accountId, randomStickerId, packageId);
  console.log(res);

  return res;
}

function handleEvent(jsonBody) {
  // Handling Event and call functions corresponding to event type.
  const { type } = jsonBody;

  if (type === 'message') {
    return handleMessage(jsonBody);
  } else {
    console.log('nothing is matched' + JSON.stringify(jsonBody));
  }
}

function getEntitySet(ODataName, entitySetName) {
  return _p
    .as('serviceSubject')
    .cell()
    .box()
    .odata(ODataName)
    .entitySet(entitySetName);
}

function findAccount(entitySet, accountId) {
  try {
    return entitySet
      .query()
      .filter("accountId eq '" + accountId + "'")
      .run();
  } catch (e) {
    console.log(JSON.stringify(e));
    if (e.code === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

function API_POST_MessagePush(body) {
  const contentType = 'application/json';

  const result = personium.httpPOSTMethod(
    'https://apis.worksmobile.com/r/' +
      lineSecret.APIID +
      '/message/v1/bot/' +
      lineSecret.botNo +
      '/message/push',
    {
      Accept: 'application/json',
      Authorization: 'Bearer ' + lineSecret.accessToken,
      consumerKey: lineSecret.consumerKey,
    },
    contentType,
    JSON.stringify(body),
    200
  );

  return result;
}

function postMessageToAccount(accountId, message) {
  const body = {
    accountId: accountId,
    content: {
      type: 'text',
      text: message,
    },
  };

  return API_POST_MessagePush(body);
}

function postStickerToAccount(accountId, stickerId, packageId) {
  const body = {
    accountId: accountId,
    content: {
      type: 'sticker',
      packageId: packageId,
      stickerId: stickerId,
    },
  };

  return API_POST_MessagePush(body);
}

var personium = require('personium').personium;
var console = require('console').console;
require('jshashes');
const { lineSecret } = require('line_secret');
const debugEnabled = false;
