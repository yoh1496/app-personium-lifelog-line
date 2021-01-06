/*global _p*/
// eslint-disable-next-line no-unused-vars
function init(request) {
  try {
    personium.validateRequestMethod(['POST', 'DELETE'], request);
    personium.verifyOrigin(request);

    console.log(request.method);
    if (request.method === 'DELETE') return disassociate(request);

    var params = personium.parseBodyAsQuery(request);
    // verify parameter information
    personium.setAllowedKeys(['lineAccessToken', 'cellUrl', 'accessToken']);
    personium.setRequiredKeys(['lineAccessToken', 'cellUrl', 'accessToken']);
    personium.validateKeys(params);

    const { lineAccessToken, cellUrl, accessToken } = params;

    verifyAccessToken(
      accessToken,
      cellUrl,
      'https://app-ishiguro-01.appdev.personium.io/'
    );
    verifyLineAccessToken(lineAccessToken, LINE_CHANNEL_ID);

    const profile = getLineProfile(lineAccessToken);
    const userId = profile.userId;

    const userDataTable = getTable('Accounts');

    const userData = getEntry(userDataTable, userId);

    // associate
    if (userData !== null) {
      throw new _p.PersoniumException('already associated');
    }
    updateTableEntry(userDataTable, {
      __id: userId,
      targetCell: cellUrl,
      status: 'active',
    });

    return {
      status: 200,
      headers: {},
      body: [JSON.stringify({ url: cellUrl })],
    };
  } catch (e) {
    return personium.createErrorResponse(e);
  }
}

function disassociate(request) {
  // disassociate
  console.log(JSON.stringify(request));
  if (
    request.headers['authorization'] === undefined ||
    request.headers['authorization'] === null
  ) {
    throw new _p.PersoniumException('Authorization header is none');
  }
  const access_token = request.headers['authorization'].replace('Bearer ', '');
  const client_id = 'https://app-ishiguro-01.appdev.personium.io/';
  console.log(access_token);

  const queries = personium.parseQuery(request);
  const { cellUrl } = queries;

  if (cellUrl === null || cellUrl === undefined) {
    throw new _p.PersoniumException('cellUrl is not contained in query');
  }

  verifyAccessToken(access_token, cellUrl, client_id);

  const userDataTable = getTable('Accounts');
  const userData = findAccount(userDataTable, cellUrl).d.results[0];

  if (userData === null || userData === undefined) {
    throw new _p.PersoniumException('not associated yet');
  }
  console.log(JSON.stringify(userData));
  deleteEntry(userDataTable, userData.__id);

  return {
    status: 200,
    headers: {},
    body: [JSON.stringify({ url: cellUrl })],
  };
}

// /* not work */
// function getCellUrlFromAccessToken(accessToken, client_id) {
//   const appToken = _p
//     .as('serviceSubject')
//     .cell(client_id)
//     .getToken();
//   const result = httpClient.post(
//     client_id + '__introspect',
//     {
//       Authorization: 'Bearer ' + appToken.acceses_token,
//     },
//     'application/x-www-form-urlencoded',
//     'token=' + appToken.acceses_token
//   );
//   console.log(JSON.stringify(result));
//   console.log(result.body);
//   const parsedBody = JSON.parse(result.body);
//   return parsedBody;
// }

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
  try {
    return table.retrieve(__id);
  } catch (e) {
    console.log(JSON.stringify(e));
    if (e.code === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

function findAccount(entitySet, targetCell) {
  try {
    return entitySet
      .query()
      .filter("targetCell eq '" + targetCell + "'")
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

var httpClient = new _p.extension.HttpClient();
var personium = require('personium').personium;
const { LINE_CHANNEL_ID } = require('line_secret').lineSecret;
var console = require('console').console;
