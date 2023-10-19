import { Delete, Edit } from '@mui/icons-material'
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
} from '@mui/joy'
import { SxProps } from '@mui/joy/styles/types'
import {
  CSSProperties,
  HTMLInputTypeAttribute,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'
import { toast } from 'sonner'
import { v4 } from 'uuid'

export interface SimpleGridColumnDefinition {
  width?: CSSProperties['width']

  field: string
  headerName?: string
  hidden?: boolean
  editable?: boolean
  type?: HTMLInputTypeAttribute
  renderCell?: (value: any, id: string) => JSX.Element
}

interface SimpleGridProps<T = any> {
  columns: SimpleGridColumnDefinition[]
  rows: T[]
  onRowEdit?: (row: T) => Promise<void>
  onRowDelete?: (id: string) => Promise<void>
  onRowAdd?: (row: T) => Promise<void>
  idField?: string
  sx?: SxProps
}

export type SimpleGridRef = {
  addRow: (defaultRow?: any) => void
}

const SimpleGrid = forwardRef<SimpleGridRef, SimpleGridProps>(
  (
    { rows, columns, onRowEdit, onRowDelete, onRowAdd, idField = 'id', sx },
    ref,
  ) => {
    // eslint-disable-next-line func-call-spacing
    const [updateObject, setUpdateObject] = useState<null | typeof rows[0]>(
      null,
    )

    // Loading states
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState<string>()

    // Handlers
    const handleRowDelete = async (id: string) => {
      try {
        setDeleting(id)
        if (onRowDelete) {
          await onRowDelete(id)
        }
      } catch (err: any) {
        toast.error(err.message || err)
      } finally {
        setDeleting(undefined)
      }
    }

    const handleRowEdit = async (row: typeof rows[0]) => {
      try {
        setUpdating(true)
        if (onRowEdit) {
          await onRowEdit(row)
        }
        setUpdateObject(null)
      } catch (err: any) {
        toast.error(err.message || err)
      } finally {
        setUpdating(false)
      }
    }

    const handleRowAdd = async (row: typeof rows[0]) => {
      try {
        setUpdating(true)
        if (onRowAdd) {
          await onRowAdd(row)
        }
        setUpdateObject(null)
      } catch (err: any) {
        toast.error(err.message || err)
      } finally {
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
            console.log(defaultRow)
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
                  {columns.map((column, index) => {
                    return !column.hidden && column.editable ? (
                      <FormControl key={column.field} sx={{ mt: 2 }}>
                        <FormLabel>
                          {column.headerName || column.field}
                        </FormLabel>
                        <Input
                          id={column.field}
                          value={updateObject[column.field]}
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
                    ) : null
                  })}
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
        <Sheet>
          <Table
            sx={{
              minHeight: '200px',
              ...sx,
              tableLayout: 'auto',
            }}
          >
            <thead>
              <tr>
                {columns.map((column) => {
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
              {rows.map((row, index) => (
                <tr key={`row-${index}`}>
                  {columns.map((column, index) => {
                    return !column.hidden ? (
                      <td key={column.field}>
                        {column.renderCell
                          ? column.renderCell(row?.[column.field], row[idField])
                          : row[column.field]}
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
                              }}
                              onClick={() => setUpdateObject(row)}
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
