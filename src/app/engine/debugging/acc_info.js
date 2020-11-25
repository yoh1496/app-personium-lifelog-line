exports.accInfo = (function() {
  /*
   * Begin of your Personium app configurations
   */
  var rootUrl = 'https://appdev.personium.io'; // for example: https://demo.personium.io
  var appCellName = 'app-ishiguro-01'; // for example: app-minimal
  /*
   * End of your Personium app configurations
   */

  /*
   * Don't modify anything from here on
   */
  var accInfo = {};
  var splittedUrl = rootUrl.split('//');
  var appCellUrl = splittedUrl[0] + '//' + appCellName + '.' + splittedUrl[1];
  if (!appCellUrl.endsWith('/')) appCellUrl += '/'; // always with ending slash

  accInfo.APP_CELL_URL = appCellUrl;
  accInfo.APP_CELL_ADMIN_INFO = {
    cellUrl: appCellName,
  };

  return accInfo;
})();
