/**
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserOpts: {
    headerPattern: /^(:\w*:) (\w*)(?:\((\w*)\))?: (.*)/,
    headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
  },
}
