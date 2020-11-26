/*global _p*/
// eslint-disable-next-line no-unused-vars
function init(request) {
  try {
    personium.validateRequestMethod(['POST'], request);
    personium.verifyOrigin(request);

    var params = personium.parseBodyAsQuery(request);
    // verify parameter information
    personium.setAllowedKeys(['lineAccessToken', 'cellUrl', 'accessToken']);
    personium.setRequiredKeys(['lineAccessToken', 'cellUrl', 'accessToken']);
    personium.validateKeys(params);

    const lineAccessToken = params.lineAccessToken;
    const accessToken = params.accessToken;
    const cellUrl = params.cellUrl;

    verifyAccessToken(
      accessToken,
      cellUrl,
      'https://app-ishiguro-01.appdev.personium.io/'
    );
    verifyLineAccessToken(lineAccessToken, ChannelId);

    const profile = getLineProfile(lineAccessToken);
    const userId = profile.userId;

    const userDataTable = getTable('Accounts');

    updateTableEntry(userDataTable, {
      __id: userId,
      targetCell: cellUrl,
      status: 'active',
    });

    // deleteEntry(userDataTable, userData.__id);

    // const userData = getEntry(userDataTable, userId);
    // if (!userData || userData.status !== 'active') {
    //   return {
    //     status: 404,
    //     headers: { 'Content-Type': 'text/plain' },
    //     body: ['valid userData not found.'],
    //   };
    // }

    return {
      status: 200,
      headers: {},
      body: [JSON.stringify({ url: cellUrl })],
    };
  } catch (e) {
    return personium.createErrorResponse(e);
  }
}

function verifyLineAccessToken(lineAccessToken, client_id) {
  const result = httpClient.get(
    'https://api.line.me/oauth2/v2.1/verify?access_token=' + lineAccessToken,
    { Accept: 'application/json' }
  );

  console.log(JSON.stringify(result));

  if (result.status !== '200') {
    console.log('status is not 200');
    throw new _p.PersoniumException(JSON.stringify(result));
  }

  const parsedBody = JSON.parse(result.body);
  if (parsedBody.client_id !== client_id) {
    console.log('client_id is mismatched:' + client_id);
    throw new _p.PersoniumException(JSON.stringify(result));
  }
}

function verifyAccessToken(accessToken, cellUrl, client_id) {
  const result = httpClient.post(
    cellUrl + '__introspect',
    {
      Authorization: 'Bearer ' + accessToken,
    },
    'application/x-www-form-urlencoded',
    'token=' + accessToken
  );

  if (result.status !== '200') {
    throw new _p.PersoniumException(JSON.stringify(result));
  }

  const parsedBody = JSON.parse(result.body);
  if (parsedBody.client_id !== client_id) {
    throw new _p.PersoniumException(JSON.stringify(result));
  }

  if (parsedBody.iss !== cellUrl) {
    throw new _p.PersoniumException(JSON.stringify(result));
  }

  if (!parsedBody.active) {
    throw new _p.PersoniumException(JSON.stringify(result));
  }
}

function getLineProfile(lineAccessToken) {
  const headers = {
    Authorization: 'Bearer ' + lineAccessToken,
  };
  const result = httpClient.get('https://api.line.me/v2/profile', headers);

  if (result.status !== '200') {
    throw new _p.PersoniumException(
      JSON.stringify({
        message: {
          value: 'status code is not 200',
          at: 'getLineProfile',
          details: result.body,
        },
      })
    );
  }
  const profile = JSON.parse(result.body);

  return profile;
}

function getTable(tableName) {
  return _p
    .as('serviceSubject')
    .cell()
    .box()
    .odata('LINEData')
    .entitySet(tableName);
}

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

function getEntry(table, __id) {
  return table.retrieve(__id);
}

var httpClient = new _p.extension.HttpClient();
var personium = require('personium').personium;
const { ChannelId } = require('line_secret').lineSecret;
var console = require('console').console;
