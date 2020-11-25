// If you want to enable logging, specify true.
const debugEnabled = true;

/*global _p*/
// Output logs to Event
exports.console = (function() {
  const console = console || {};

  console.log = function(str) {
    if (!debugEnabled) return;

    const appCell = _p.as('serviceSubject').cell();
    appCell.event.post({
      Type: 'console.log',
      Object: str,
      Info: 'infoData',
    });
  };
  return console;
})();
