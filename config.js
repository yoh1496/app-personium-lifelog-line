module.exports = {
  personium: {
    CELL_NAME: 'app-ishiguro-01',
    CELL_FQDN: 'app-ishiguro-01.appdev.personium.io',
    CELL_ADMIN: process.env.PERSONIUM_USER,
    CELL_ADMIN_PASS: process.env.PERSONIUM_PASS,
    DIRECTORY_MAPPING: [
      {
        filePattern: [
          'src/app/engine/front/*',
          '!src/app/engine/front/*.example.*',
        ],
        srcDir: 'src/app/engine/front',
        dstDir: 'front',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'tokenAcc',
          endPoints: {
            app: 'launchSPA.js',
            lineapp: 'launchLINEApp.js',
            linesetup: 'launchLINESetup.js',
          },
        },
      },
      {
        filePattern: [
          'src/app/engine/debugging/*',
          '!src/app/engine/debugging/*.example.*',
        ],
        srcDir: 'src/app/engine/debugging',
        dstDir: 'debugging',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'botUser',
          endPoints: {
            getEventListenerToken: 'getEventListenerToken.js',
          },
        },
      },
      {
        filePattern: [
          'src/app/engine/line/*',
          '!src/app/engine/line/*.example.*',
        ],
        srcDir: 'src/app/engine/line',
        dstDir: 'line',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'botUser',
          endPoints: {
            events: 'events.js',
            get_cellurl: 'get_cellurl.js',
            register_line_association: 'register_line_association.js',
          },
        },
      },
      {
        filePattern: ['src/app/engine/auth/*'],
        srcDir: 'src/app/engine/auth',
        dstDir: 'auth',
        resourceType: 'service',
        meta: {
          language: 'JavaScript',
          subject: 'me',
          endPoints: {
            start_oauth2: 'start_oauth2.js',
            request_oauth2_url: 'request_oauth2_url.js',
            receive_redirect: 'receive_redirect.js',
            get_client_secret: 'get_client_secret.js',
          },
        },
      },
      {
        filePattern: [
          'src/app/public',
          'src/app/public/**/*',
          '!src/app/public/**/*.example.*',
        ],
        srcDir: 'src/app/public',
        dstDir: 'public',
        resourceType: 'collection',
      },
      {
        filePattern: ['src/assets/**/*', '!src/assets/**/*.example.*'],
        srcDir: 'src/assets',
        dstDir: '',
        resourceType: 'staticfile',
      },
    ],
  },
  network: {
    http_proxy: process.env.http_proxy || '',
    https_proxy: process.env.https_proxy || '',
  },
};

process.env.http_proxy = '';
process.env.https_proxy = '';
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';

console.log('------------------------------------------------------');
console.log(' <info>');
console.log('   Proxy env values are contained in `config.network` ');
console.log('------------------------------------------------------');
