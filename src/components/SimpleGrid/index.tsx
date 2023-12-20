import { Delete, Edit } from '@mui/icons-material'
import { Checkbox, Option, Select } from '@mui/joy'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Table,
  Typography,
} from '@mui/material'
import { SxProps } from '@mui/material/styles/types'
import {
  CSSProperties,
  Dispatch,
  FC,
  HTMLInputTypeAttribute,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'
import { toast } from 'sonner'
import { v4 } from 'uuid'

interface RenderCellParams<T = any> {
  id: string
  row: T
  column: Omit<SimpleGridColumnDefinition, 'renderCell'>
}

export interface DefaultSimpleGridColumnDefinition<T = any> {
  width?: CSSProperties['width']

  field: string
  headerName?: string
  hidden?: boolean
  valueGetter?: (row: T) => any
  editable?: boolean | ((row: T) => boolean)
  type?: HTMLInputTypeAttribute
  renderCell?: (value: any, params: RenderCellParams<T>) => JSX.Element
}

export interface SingleSelectSimpleGridColumnDefinition<T = any>
  extends Omit<DefaultSimpleGridColumnDefinition<T>, 'type'> {
  type: 'singleSelect'
  valueOptions: { label: string; value: string }[]
}

export type SimpleGridColumnDefinition<T = any> =
  | DefaultSimpleGridColumnDefinition<T>
  | SingleSelectSimpleGridColumnDefinition<T>

interface SimpleGridProps<T = any> {
  columns: SimpleGridColumnDefinition[]
  rows: T[]
  onRowEdit?: (row: T) => Promise<
    | {
        ok: boolean
        message: string
      }
    | undefined
  >
  onRowDelete?: (id: string) => Promise<
    | {
        ok: boolean
        message: string
      }
    | undefined
  >
  onRowAdd?: (row: T) => Promise<
    | {
        ok: boolean
        message: string
      }
    | undefined
  >
  idField?: string
  sx?: SxProps
  additionalActions?: (row: T) => JSX.Element[]
}

interface ColumnEditInputProps<T = any> {
  column: SimpleGridColumnDefinition
  updateObject: T
  setUpdateObject: Dispatch<SetStateAction<T>>
  index: number
}

const ColumnEditInput: FC<ColumnEditInputProps> = ({
  column,
  updateObject,
  setUpdateObject,
  index,
}: ColumnEditInputProps) => {
  // If the column is not editable (either false or the function validates to false)
  if (
    !column.editable ||
    (typeof column.editable === 'function' && !column.editable(updateObject))
  ) {
    return null
  }

  const value = (updateObject as any)[column.field]

  if (column.type === 'singleSelect') {
    const singleSelectColumn = column as SingleSelectSimpleGridColumnDefinition
    // Custom rendering for singleSelect
    return (
      <Select
        id={column.field}
        value={value}
        onChange={(_e, newValue) => {
          setUpdateObject({
            ...updateObject,
            [column.field]: newValue,
          })
        }}
        autoFocus={index === 0}
        placeholder={column.headerName || column.field}
      >
        {singleSelectColumn.valueOptions.map((valueOption) => (
          <Option key={valueOption.value} value={valueOption.value}>
            {valueOption.label ?? valueOption.value}
          </Option>
        ))}
      </Select>
    )
  }
  if (column.type === 'checkbox') {
    return (
      <Checkbox
        sx={{ mt: 2 }}
        label={column.headerName || column.field}
        id={column.field}
        checked={value}
        onChange={(e) => {
          setUpdateObject({
            ...updateObject,
            [column.field]: e.target.checked,
          })
        }}
      />
    )
  }
  if (column.type === 'url') {
    // If the type is URL, validate that the value is correct
    const url_regex =
      /(?:https?:\/\/)?(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/g
    return (
      <FormControl key={`${column.field}-control`} sx={{ mt: 2 }}>
        <FormLabel>{column.headerName || column.field}</FormLabel>
        <Input
          id={column.field}
          value={value}
          error={value !== '' && !url_regex.test(value)}
          onChange={(e) => {
            setUpdateObject({
              ...updateObject,
              [column.field]: e.target.value,
            })
          }}
          type={column.type}
          autoFocus={index === 0}
        />
      </FormControl>
    )
  }

  return (
    <FormControl key={`${column.field}-control`} sx={{ mt: 2 }}>
      <FormLabel>{column.headerName || column.field}</FormLabel>
      <Input
        id={column.field}
        value={value}
        onChange={(e) => {
          setUpdateObject({
            ...updateObject,
            [column.field]: e.target.value,
          })
        }}
        type={column.type}
        autoFocus={index === 0}
      />
    </FormControl>
  )
}

export type SimpleGridRef = {
  addRow: (defaultRow?: any) => void
}

const SimpleGrid = forwardRef<SimpleGridRef, SimpleGridProps>(
  (
    {
      rows,
      columns,
      onRowEdit,
      onRowDelete,
      onRowAdd,
      idField = 'id',
      sx,
      additionalActions,
    },
    ref,
  ) => {
    const [updateObject, setUpdateObject] = useState<null | typeof rows[0]>(
      null,
    )

    // Loading states
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState<string>()

    // Handlers
    const handleRowDelete = async (id: string) => {
      if (onRowDelete) {
        setDeleting(id)
        toast.promise(onRowDelete(id), {
          loading: 'Deleting..',
          error: (err) => err.message ?? err,
          success: (response) =>  response?.message ?? 'Succesfully deleted row',
          finally: () => {
            setDeleting(undefined)
          }
        })
      }
    }

    const handleRowEdit = async (row: typeof rows[0]) => {
      if (onRowEdit) {
        setUpdating(true)
        toast.promise(onRowEdit(row), {
          loading: 'Updating..',
          error: (err) => err.message ?? err,
          success: (response) =>  {  
            setUpdateObject(null)

            return response?.message ?? 'Succesfully updated row'
          },
          finally: () => {
            setUpdating(false)
          }
        })
      } else {
        setUpdateObject(null)
        setUpdating(false)
      }
    }

    const handleRowAdd = async (row: typeof rows[0]) => {
      if (onRowAdd) {
        setUpdating(true)
        toast.promise(onRowAdd(row), {
          loading: 'Creating..',
          error: (err) => err.message ?? err,
          success: (response) =>  {  
            setUpdateObject(null)

            return response?.message ?? 'Succesfully created row'
          },
          finally: () => {
            setUpdating(false)
          }
        })
      } else {
        setUpdateObject(null)
        setUpdating(false)
      }
    }

    // To pass the addRow function to the parent component
    useImperativeHandle(
      ref,
      () => ({
        addRow: (defaultRow?: any) => {
          // Loop through columns with editable and set default value
          const row: any = { [idField]: v4(), ...defaultRow }
          if (!defaultRow) {
            for (const column of columns) {
              if (column.editable) {
                row[column.field] = ''
              }
            }
          }

          // Set the new row as the updateObject to show the creation modal
          setUpdateObject(row)
        },
      }),
      [columns, idField],
    )

    const defaultRenderCell :FC= (value: any, params: RenderCellParams) => {
      if (params.column.type === 'singleSelect') {
        const singleSelectColumn = params.column as SingleSelectSimpleGridColumnDefinition
        const valueOption = singleSelectColumn.valueOptions.find((valueOption) => valueOption.value === value) 
        if (valueOption) {
          // Render the valueOption's label instead of the value
          return <Typography>{valueOption.label}</Typography>
        }
      }

      return <Typography>{value}</Typography>
    }

    return (
      <>
        {(onRowAdd || onRowEdit) && (
          <Modal
            open={updateObject !== null}
            onClose={() => setUpdateObject(null)}
          >
            <ModalDialog>
              <ModalClose onClick={() => setUpdateObject(null)} />
              <Typography>Edit Row</Typography>
              {updateObject && (
                <>
                  {columns.map((column, index) => <ColumnEditInput key={column.field} index={index} updateObject={updateObject} setUpdateObject={setUpdateObject} column={column}/>)}
                  <Button
                    loading={updating}
                    sx={{ marginTop: 2 }}
                    fullWidth
                    onClick={() => {
                      if (
                        !rows.find(
                          (row) => row[idField] === updateObject[idField],
                        )
                      ) {
                        handleRowAdd(updateObject)
                      } else {
                        handleRowEdit(updateObject)
                      }
                    }}
                  >
                    Save
                  </Button>
                </>
              )}
            </ModalDialog>
          </Modal>
        )}
        <Sheet sx={{
          width: '100%',
        }}>
          <Table
            sx={{
              width: '100%',
              padding: 1,
              minHeight: '200px',
              ...sx,
              tableLayout: 'auto',
            }}
          >
            <thead>
              <tr key="header">
                {columns.map((column, index) => {
                  return !column.hidden ? (
                    <th
                      style={{
                        width: column.width,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      key={column.field}
                    >
                      {column.headerName || column.field}
                    </th>
                  ) : null
                })}
                {
                  // If there is an onRowEdit callback, add an empty column for the edit button
                  // It also requires atleast 1 column to be editable
                  onRowDelete ||
                  (onRowEdit && columns.some((column) => column.editable)) ? (
                    <th key="actions">Actions</th>
                  ) : null
                }
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => {
                    // Display every column that is not hidden.
                    return !column.hidden ? (
                      <td key={column.field}>
                        {column.renderCell
                          ? column.renderCell(
                            column.valueGetter
                              ? column.valueGetter(row)
                              : row?.[column.field], {id: row[idField], row, column})
                          : defaultRenderCell(column.valueGetter
                            ? column.valueGetter(row)
                            : row[column.field], {id: row[idField], row, column})}
                      </td>
                    ) : null
                  })}
                  {
                    // If there is an onRowEdit callback, add an empty column for the edit button
                    // It also requires atleast 1 column to be editable
                    onRowDelete ||
                    (onRowEdit && columns.some((column) => column.editable)) ? (
                      <td key="actions">
                        {onRowEdit &&
                          columns.some((column) => column.editable) && (
                            <Button
                              loading={
                                updateObject?.[idField] === row[idField] &&
                                updating
                              }
                              sx={{
                                backgroundColor: 'transparent',
                                padding: 1,
                                color: (theme) => theme.palette.text.primary,
                              }}
                              onClick={() => {
                                // Calculate start value
                                const startValue = row
                                for (const column of columns) {
                                  if (column.valueGetter) {
                                    startValue[column.field] = column.valueGetter(row)
                                  }
                                }
                                setUpdateObject(
                                startValue
                                  )
                              }}
                            >
                              <Edit />
                            </Button>
                          )}
                        {onRowDelete && (
                          <Button
                            loading={deleting === row[idField]}
                            sx={{
                              backgroundColor: 'transparent',
                              color: 'red',
                              padding: 1,
                            }}
                            onClick={() => handleRowDelete(row[idField])}
                          >
                            <Delete />
                          </Button>
                        )}
                        {additionalActions?.(row).map((action) => action)}
                      </td>
                    ) : null
                  }
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </>
    )
  },
)

export default SimpleGrid
