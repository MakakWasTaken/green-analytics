const emojiPlugin = require('commitlint-plugin-gitmoji')

/**
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [emojiPlugin],
}
