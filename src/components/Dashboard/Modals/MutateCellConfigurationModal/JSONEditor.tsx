import Editor, {
  BeforeMount,
  OnMount,
  OnValidate,
  useMonaco,
} from '@monaco-editor/react'
import { Box, Typography, useTheme } from '@mui/material'
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import useEditConfig from './useEditConfig'

interface JSONEditorProps {
  defaultValue?: string
  onChange?: (value: string) => void
  onValidationChange: (errors: string[]) => void
}

interface RefObject extends Monaco.editor.ICodeEditor {
  _domElement?: HTMLElement
}

// Heavily inspired by: https://github.com/sujinleeme/react-json-editor/blob/main/src/components/json-editor/json-editor.tsx
export const JSONEditor: FC<JSONEditorProps> = ({
  defaultValue,
  onChange,
  onValidationChange,
}): JSX.Element => {
  // Configuration
  const { config, loading } = useEditConfig()

  const theme = useTheme()

  const monaco = useMonaco()
  const [errors, setErrors] = useState<string[]>([])

  const [isValidJson, setIsValidJson] = useState<boolean>(true)
  const editorRef = useRef<RefObject | null>(null)

  const handleJsonSchemasUpdate = useCallback(
    (schemaConfig: any = {}) => {
      monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: window.location.href, // id of the first schema
            fileMatch: ['*'], // associate with our model
            schema: schemaConfig,
          },
        ],
      })
    },
    [monaco],
  )

  useEffect(() => {
    // Implies that monaco was updated due to useCallback
    if (config) {
      handleJsonSchemasUpdate(config)
    }
  }, [handleJsonSchemasUpdate, config])

  useEffect(() => {
    onValidationChange(errors)
  }, [onValidationChange, errors])

  const handleEditorWillMount: BeforeMount = () => handleJsonSchemasUpdate()

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor

    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: false })
  }

  const handleEditorValidation: OnValidate = useCallback((markers) => {
    const errorMessage = markers.map(
      ({ startLineNumber, message }) => `line ${startLineNumber}: ${message}`,
    )
    const hasContent = editorRef.current?.getValue()
    const hasError: boolean = errorMessage.length > 0

    setIsValidJson(!!hasContent && !hasError)
    setErrors(errorMessage)
  }, [])

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      value && onChange?.(value)
    },
    [onChange],
  )

  return (
    <Box sx={{ height: '500px', maxHeight: '100%' }}>
      <Editor
        height="100%"
        language="json"
        options={{
          automaticLayout: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
        }}
        defaultValue={defaultValue}
        theme={theme.palette.mode === 'light' ? 'light' : 'vs-dark'}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        onValidate={handleEditorValidation}
      />
      {(!isValidJson || errors.length > 0) && (
        <Box
          sx={{
            minHeight: '70px',
            my: 2,
            p: 1,
            borderRadius: '5px',
            backgroundColor: (theme) => theme.palette.danger.lightChannel,
            color: (theme) => theme.palette.danger.plainColor,
          }}
        >
          <Typography>There are {errors.length} errors.</Typography>
          {errors.map((error) => (
            <Typography>{error}</Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default JSONEditor
