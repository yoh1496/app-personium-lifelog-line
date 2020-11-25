/*global _p*/
// eslint-disable-next-line no-unused-vars
function init(request) {
  try {
    // 認証に使用するメソッドをPOSTに限定する
    personium.validateRequestMethod(['POST'], request);
    // アクセス元のWebページURLを照合する
    personium.verifyOrigin(request);

    // セルで認証し情報を取得する
    const appCell = _p.as('serviceSubject').cell();
    // トークンを取得する
    const ret = appCell.getToken();
    // ステータスコード200で結果（トークン）を返す
    return personium.createResponse(200, ret);
  } catch (e) {
    return personium.createErrorResponse(e);
  }
}

var personium = require('personium').personium;
