// eslint-disable-next-line no-unused-vars
function launch(request) {
  const tempHeaders = { 'Content-Type': 'text/html' };

  return {
    status: 200,
    headers: tempHeaders,
    body: [
      [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">',
        '</link>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">',
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/vConsole/3.3.4/vconsole.min.js" integrity="sha512-/9dW/D2rWkAaLlyBbFEY50QbnpNP97+j2G9X/8A44xVTvEwYe8jUK3TEANhUbZ3Avr8UDIbcI8zHowc3ibGD+A==" crossorigin="anonymous"></script>',
        '<script>',
        'var vConsole = new VConsole();',
        'console.log("Hello world");',
        '</script>',
        '<title>Personium App</title>',
        '</head>',
        '<body style="margin: 0px" >',
        '<noscript>You need to enable JavaScript to run this app.</noscript>',
        '<div id="root"></div>',
        '<script type="text/javascript" src="/__/public/linesetup.bundle.js">',
        '</script>',
        '</body>',
        '</html>',
      ].join('\n'),
    ],
  };
}
