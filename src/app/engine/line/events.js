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
      verifySignature(signature, reqBody, LINE_CHANNEL_SECRET);
    }

    const jsonBody = JSON.parse(reqBody);
    debugInfo = handleEvent(jsonBody.events[0]);
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
  const SHA256 = new Hashes.SHA256(); // eslint-disable-line
  const b64_hmac = SHA256.b64_hmac(ChannelSecret, reqBody);
  console.log('SHA256.b64_hmac encoded data: ' + b64_hmac);
  if (signature != b64_hmac) {
    // eslint-disable-next-line prettier/prettier
    const message = 'Signature Verification Error. (signature=' + signature + ', result=' + b64_hmac + ')';
    console.log(message);
    throw new Error(message);
  }
}

const NOT_IMPLEMENTED_ERROR = new Error('Not implemented yet');

var getTableFromOtherCell = function(cell, box, odataName, tableName) {
  return _p
    .as('serviceSubject')
    .cell(cell)
    .box(box)
    .odata(odataName)
    .entitySet(tableName);
};
var getTable = function(tableName) {
  return _p
    .as('serviceSubject')
    .cell()
    .box()
    .odata('LINEData')
    .entitySet(tableName);
};

var getEntry = function(table, __id) {
  return table.retrieve(__id);
};

var deleteEntry = function(table, __id) {
  return table.del(__id);
};

var updateTableEntry = function(table, data) {
  var obj;
  try {
    obj = getEntry(table, data.__id);
    obj = table.merge(obj.__id, data, '*');
    // get the final merged reply
    obj = getEntry(table, data.__id);
  } catch (e) {
    // Create a new entry
    obj = table.create(data);
  }
  return obj;
};

var downloadContent = function(messageId) {
  const headers = {
    Authorization: 'Bearer ' + LINE_BOT_ACCESS_TOKEN,
  };
  const result = httpClient.get(
    'https://api-data.line.me/v2/bot/message/' + messageId + '/content',
    headers,
    true
  );

  return result;
};

var replyMessage = function(replyToken, messages) {
  const headers = {
    Authorization: 'Bearer ' + LINE_BOT_ACCESS_TOKEN,
  };
  const body = {
    replyToken: replyToken,
    messages: messages,
  };
  console.log(JSON.stringify(body));
  const result = httpClient.post(
    'https://api.line.me/v2/bot/message/reply',
    headers,
    'application/json',
    JSON.stringify(body)
  );
  return result;
};

var createMessageObject = function(text) {
  return {
    type: 'text',
    text: text,
  };
};

var getUserBox = function(userCell, token) {
  var url = userCell + '__box';
  var headers = {
    Accept: 'application/json',
    Authorization: 'Bearer ' + token,
  };
  var boxRes = httpClient.get(url, headers);
  if (boxRes.status == '403' || boxRes.status == '404') {
    var err = [
      'io.personium.client.DaoException: ' + boxRes.status,
      JSON.stringify({
        code: boxRes.status,
        message: {
          lang: 'en',
          value: 'Necessary privilege is lacking.',
        },
      }),
    ].join('');
    throw new _p.PersoniumException(err);
  }
  console.log('getUserBox ' + userCell + ',' + token);
  console.log(boxRes.body);
  return JSON.parse(boxRes.body).Url;
};

function handleFollow(jsonBody) {
  const { source, replyToken } = jsonBody;
  if (source.type !== 'user') {
    throw 'source.type is not supported: ' + source.type;
  }
  const result = replyMessage(replyToken, [
    createMessageObject('友達登録ありがとうございます！'),
    createMessageObject(
      'アプリと連携すると、日々の入力をこのトークから行えるようになります。'
    ),
    createMessageObject(
      'まずは、下のメニューから「Associate with your cell」を実行してください。'
    ),
  ]);
  console.log(JSON.stringify(result));
  return result;
}

function handleMessage(jsonBody) {
  // Handling Message event
  const { message, source } = jsonBody;
  if (source.type !== 'user') {
    throw 'source.type is not supported: ' + source.type;
  }

  const { userId } = source;
  console.log('handleMessage started');

  const userDataTable = getTable('Accounts');
  const userData = getEntry(userDataTable, userId);
  if (!userData) {
    throw 'no user found: ' + userId;
  }
  console.log(JSON.stringify(userData));

  if (userData.status !== 'active') {
    throw 'user is not active';
  } else {
    if (message.type === 'image') {
      // handling image
      const { contentProvider } = message;
      if (contentProvider.type === 'line') {
        // download image from line
        const downloadResult = downloadContent(message.id);
        console.log('-- Object.keys --');
        console.log(JSON.stringify(Object.keys(downloadResult)));
        const downloadResultHeaders = JSON.parse(downloadResult.headers);
        console.log('-- downloadResultHeaders --');
        console.log(JSON.stringify(downloadResultHeaders));
        const targetCell = _p.as('serviceSubject').cell(userData.targetCell);
        const targetBoxUrl = getUserBox(
          userData.targetCell,
          targetCell.getToken().access_token
        );
        console.log('targetBoxUrl: ' + JSON.stringify(targetBoxUrl));

        const boxParts = targetBoxUrl.split('/').filter(i => i != '');
        console.log(JSON.stringify(boxParts));

        const boxName = boxParts[boxParts.length - 1];
        const targetBox = targetCell.box(boxName);
        targetBox.put(
          'data/binary/' + message.id,
          downloadResultHeaders['Content-Type'],
          downloadResult.body
        );

        const diaryDataTable = getTableFromOtherCell(
          userData.targetCell,
          boxName,
          'receivedData',
          'receivedMessage'
        );
        updateTableEntry(diaryDataTable, {
          __id: message.id,
          datatype: 'image',
        });
      } else {
        throw NOT_IMPLEMENTED_ERROR;
      }
    } else {
      throw NOT_IMPLEMENTED_ERROR;
    }
  }

  return 'done';
}

function handleEvent(jsonBody) {
  // Handling Event and call functions corresponding to event type.
  const { type } = jsonBody;

  if (type === 'message') {
    return handleMessage(jsonBody);
  } else if (type === 'follow') {
    return handleFollow(jsonBody);
  } else {
    console.log('nothing is matched' + JSON.stringify(jsonBody));
  }
}

var personium = require('personium').personium;
var console = require('console').console;
require('jshashes');
var httpClient = new _p.extension.HttpClient();
const {
  LINE_BOT_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET,
} = require('line_secret').lineSecret;
const debugEnabled = false;
