import {
  Box,
  Button,
  DialogContent,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/material'
import { Dashboard, DashboardCell } from '@prisma/client'
import { api } from '@utils/network'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'
import JSONEditor from './JSONEditor'

interface MutateDashboardCellModalProps {
  configurationId: string | undefined
  cellConfig: Omit<DashboardCell, 'id'> | undefined
  handleClose: (newValue?: DashboardCell) => void
  selectedView: (Dashboard & { cells: DashboardCell[] }) | undefined
  updateView: () => void
}

export const MutateDashboardCellModal: FC<MutateDashboardCellModalProps> = ({
  configurationId,
  cellConfig,
  handleClose,
  selectedView,
  updateView,
}) => {
  // States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [config, setConfig] = useState<Omit<DashboardCell, 'id'>>()
  const [errors, setErrors] = useState<string[]>([])

  // Update default value
  useEffect(() => {
    setConfig(cellConfig)
  }, [cellConfig])

  /**
   * Delete the cell configuration
   * @returns void
   */
  const handleDelete = () => {
    if (!config) {
      toast.error('Config is not set, please reload the page')
      return
    }
    if (!selectedView) {
      toast.error('Selected view is not defined')
      return
    }
    if (!configurationId) {
      toast.error('You cannot delete a cell configuration that does not exist')
      return
    }

    toast.promise(
      api.delete<DashboardCell>(`database/dashboard/cells/${configurationId}`),
      {
        loading: 'Deleting cell..',
        error: (err) => err.message || err,
        success: (response) => {
          updateView()
          handleClose(response.data)
          setDeleteDialogOpen(false)

          return 'Succesfully deleted cell'
        },
      },
    )
  }

  const handleSubmit = () => {
    if (!config) {
      toast.error('Config is not set, please reload the page')
      return
    }
    if (!selectedView) {
      toast.error('Selected view is not defined')
      return
    }

    toast.promise(
      api.put<DashboardCell>(
        `database/dashboard/cells/${configurationId}`,
        config,
      ),
      {
        loading: 'Updating cell..',
        error: (err) => err.message || err,
        success: (response) => {
          updateView()
          handleClose(response.data)

          return 'Succesfully updated cell'
        },
      },
    )
  }

  return (
    <>
      <Modal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography color="danger" level="h4">
            Delete Cell
          </Typography>
          <Typography>Are you sure you want to delete this cell?</Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              mt: 2,
            }}
          >
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Modal open={config !== undefined} onClose={() => handleClose()}>
        <ModalDialog
          sx={{
            minWidth: '300px',
            width: '45%',
            maxWidth: 'calc(100vw - 2 * var(--Card-padding))',
          }}
          size="md"
        >
          <ModalClose />
          <Typography level="h4">Create Cell</Typography>
          {config && (
            <DialogContent>
              <JSONEditor
                defaultValue={JSON.stringify(config.content, null, '\t')}
                onChange={(value) => setConfig(JSON.parse(value))}
                onValidationChange={setErrors}
              />
            </DialogContent>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: configurationId ? 'space-between' : undefined,
            }}
          >
            {configurationId && (
              <Button
                color="danger"
                variant="solid"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            )}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button color="neutral" onClick={() => handleClose()}>
                Cancel
              </Button>
              <Button
                disabled={errors.length > 0}
                sx={{ ml: 1 }}
                variant="solid"
                color="success"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  )
}
