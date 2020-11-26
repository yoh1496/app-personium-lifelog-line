/*global _p*/
// eslint-disable-next-line no-unused-vars
function init(request) {
  try {
    personium.validateRequestMethod(['GET'], request);
    personium.verifyOrigin(request);

    var params = personium.parseQuery(request);
    // verify parameter information
    personium.setAllowedKeys(['lineAccessToken']);
    personium.setRequiredKeys(['lineAccessToken']);
    personium.validateKeys(params);

    const lineAccessToken = params.lineAccessToken;
    verifyLineAccessToken(lineAccessToken, ChannelId);

    const result = getLineProfile(lineAccessToken);
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
    const userId = profile.userId;

    const userDataTable = getTable('Accounts');
    const userData = getEntry(userDataTable, userId);
    if (!userData || userData.status !== 'active') {
      return {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: ['valid userData not found.'],
      };
    }

    var state = [moment().valueOf(), '-per'].join('');
    var setCookieStr = createCookie(state);
    var redirectUrl = getRedirectUrl(userData.targetCell, state);

    return {
      status: 200,
      headers: {
        'Set-Cookie': setCookieStr,
      },
      body: [JSON.stringify({ url: redirectUrl, result: userData })],
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

  if (result.status !== '200') {
    throw new _p.PersoniumException(JSON.stringify(result));
  }

  const parsedBody = JSON.parse(result.body);
  if (parsedBody.client_id !== client_id) {
    throw new _p.PersoniumException(JSON.stringify(result));
  }
}

function getLineProfile(lineAccessToken) {
  const headers = {
    Authorization: 'Bearer ' + lineAccessToken,
  };
  const result = httpClient.get('https://api.line.me/v2/profile', headers);
  return result;
}

function getTable(tableName) {
  return _p
    .as('serviceSubject')
    .cell()
    .box()
    .odata('LINEData')
    .entitySet(tableName);
}

function getEntry(table, __id) {
  return table.retrieve(__id);
}

function createCookie(state) {
  var shaObj = new jsSHA(state, 'ASCII');
  var hash = shaObj.getHash('SHA-512', 'HEX');
  var cookieStr = ['personium', '=', hash].join('');

  return cookieStr;
}

function getRedirectUrl(cellUrl, state) {
  var appCellUrl = personium.getAppCellUrl();
  var redirectUri = appCellUrl + '__/front/app?cellUrl=' + cellUrl;
  var paramsStr = [
    'response_type=code',
    'client_id=' + encodeURIComponent(appCellUrl),
    'redirect_uri=' + encodeURIComponent(redirectUri),
    'state=' + encodeURIComponent(state),
  ].join('&');

  return [cellUrl, '__authz?', paramsStr].join('');
}

var httpClient = new _p.extension.HttpClient();
var personium = require('personium').personium;
var jsSHA = require('sha_dev2').jsSHA;
var moment = require('moment').moment;
const { ChannelId } = require('line_secret').lineSecret;
