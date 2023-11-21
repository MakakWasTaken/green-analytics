import {
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  TextField,
  Typography,
} from '@mui/material'
import { api } from '@utils/network'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

interface CreateDashboardViewModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  refreshViews: () => void
}

const CreateDashboardViewModal: FC<CreateDashboardViewModalProps> = ({
  open,
  setOpen,
  refreshViews,
}) => {
  const [dashboardViewName, setDashboardViewName] = useState<string>('')

  const handleClose = () => {
    setOpen(false)
    setDashboardViewName('')
  }

  const handleSubmit = async () => {
    toast.promise(
      api.post('database/dashboard/views', {
        name: dashboardViewName,
      }),
      {
        loading: 'Creating dashboard view..',
        error: (err) => err.message || err,
        success: (response) => {
          handleClose()
          refreshViews()
          return response.data.message
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        size="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <ModalClose />
        <Typography level="h4">Create Dashboard</Typography>

        <Input
          value={dashboardViewName}
          placeholder="Name"
          fullWidth
          onChange={(e) => setDashboardViewName(e.target.value)}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            mt: 2,
          }}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}

export default CreateDashboardViewModal
