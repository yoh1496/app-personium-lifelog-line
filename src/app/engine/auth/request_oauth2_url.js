// eslint-disable-next-line no-unused-vars
function request_oauth2_url(request) {
  try {
    personium.validateRequestMethod(['GET'], request);
    personium.verifyOrigin(request);

    var params = personium.parseQuery(request);
    // verify parameter information
    personium.setAllowedKeys(['cellUrl']);
    personium.setRequiredKeys(['cellUrl']);
    personium.validateKeys(params);

    const { cellUrl } = params;

    var state = [moment().valueOf(), '-per'].join('');
    var setCookieStr = createCookie(state);
    var redirectUrl = getRedirectUrl(cellUrl, state);

    return {
      status: 200,
      headers: {
        'Set-Cookie': setCookieStr,
      },
      body: [JSON.stringify({ url: redirectUrl })],
    };
  } catch (e) {
    return personium.createErrorResponse(e);
  }
}

function createCookie(state) {
  var shaObj = new jsSHA(state, 'ASCII');
  var hash = shaObj.getHash('SHA-512', 'HEX');
  var cookieStr = [
    'personium=',
    hash,
    // '; Path=/',
    '; Secure',
    '; SameSite=None',
  ].join('');

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

var personium = require('personium').personium;
var jsSHA = require('sha_dev2').jsSHA;
var moment = require('moment').moment;
