/*global _p*/
// eslint-disable-next-line no-unused-vars
function get_client_secret(request) {
  try {
    personium.validateRequestMethod(['POST'], request);
    personium.verifyOrigin(request);

    var params = personium.parseBodyAsQuery(request);
    // verify parameter information
    personium.setAllowedKeys(['p_target', 'access_token']);
    personium.setRequiredKeys(['p_target', 'access_token']);
    personium.validateKeys(params);

    const { p_target, access_token } = params;

    verifyAccessToken(access_token, p_target, APP_CELL_URL);

    const appToken = personium.getAppToken(p_target);

    return personium.createResponse(200, {
      access_token: appToken.access_token,
    });
  } catch (e) {
    return personium.createErrorResponse(e);
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

const { APP_CELL_URL } = require('acc_info').accInfo;
var personium = require('personium').personium;
var httpClient = new _p.extension.HttpClient();
