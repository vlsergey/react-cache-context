/* eslint-env node */
/* eslint @typescript-eslint/no-var-requires: 0 */
const imported = require('@vlsergey/js-config').karma;
/* eslint-disable-next-line */
module.exports = function (config) {
  imported(config);
  /* eslint-disable-next-line */
  config.set({
    files: [
      'test/**/*Test.ts*',
    ],
  });
};
