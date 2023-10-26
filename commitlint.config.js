/**
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:) (\w*)(?:\((\w*)\))?: (.*)/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
}
