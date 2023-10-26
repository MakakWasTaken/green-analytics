import { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)? ?(\w*)(?:\((\w*)\))?!?: (.*)/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
}

export default config
