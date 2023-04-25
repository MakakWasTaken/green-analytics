import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from '@mui/joy'
import { Button as MUIButton } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import type {} from '@mui/x-data-grid/themeAugmentation'
import { Website } from '@prisma/client'
import MUIDataGrid from '@src/components/MUIDataGrid'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { AccountPage } from '@src/pages/account'
import { api } from '@src/utils/network'
import { useContext, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import AccountBox from '../AccountBox'

const Websites = () => {
  const { selectedTeam } = useContext(HeaderContext)
  const { data, mutate: updateMembers } = useSWR<Website[]>(
    selectedTeam ? '/database/website/getAll?teamId=' + selectedTeam.id : null,
  )
  const [viewTokenDialog, setViewTokenDialog] = useState<string | null>(null)

  // Add Website
  const [addWebsiteOpen, setAddWebsiteOpen] = useState(false)

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', hideable: true },
    { field: 'name', headerName: 'Name', flex: 0.33 },
    { field: 'url', headerName: 'URL', flex: 0.66 },
    {
      field: 'token',
      headerName: 'Setup',
      renderCell: (props) => (
        <MUIButton onClick={() => setViewTokenDialog(props.value)}>
          View Code
        </MUIButton>
      ),
    },
    { field: 'createdAt', headerName: 'Created', hideable: true },
    { field: 'updatedAt', headerName: 'Updated', hideable: true },
  ]

  return (
    <TabPanel value={AccountPage.Websites}>
      <Modal open={addWebsiteOpen} onClose={() => setAddWebsiteOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Add Website</Typography>
          <form
            onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault()
              const elements = event.currentTarget.elements
              const name = elements[0]
              const url = elements[1]
              if (
                name instanceof HTMLInputElement &&
                url instanceof HTMLInputElement
              ) {
                if (!selectedTeam) {
                  toast.error('Please select a team')
                  return
                }
                const response = await api.post<Website>('/database/website', {
                  name: name.value,
                  url: url.value,
                  teamId: selectedTeam.id,
                })
                updateMembers((prev) =>
                  prev ? [...prev, response.data] : [response.data],
                )
                toast.success('Website added')
              }
              setAddWebsiteOpen(false)
            }}
          >
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input id="name" autoFocus required />
              </FormControl>
              <FormControl>
                <FormLabel>URL</FormLabel>
                <Input id="url" type="url" required />
              </FormControl>
              <Button type="submit">Submit</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
      <Modal
        open={viewTokenDialog !== null}
        onClose={() => setViewTokenDialog(null)}
      >
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Website Setup</Typography>
          <Typography>
            Copy and paste this code into your website header. It should be the
            first thing in the <code>&lt;head&gt;</code> tag.
          </Typography>
          <Tabs>
            <TabList>
              <Tab>HTML</Tab>
              <Tab>JS</Tab>
            </TabList>
            <TabPanel value={0}>
              <SyntaxHighlighter language="html">
                {`<script
  async
  src="https://green-analytics.vercel.app/green-analytics.js"
  data-token="${viewTokenDialog}"
/>`}
              </SyntaxHighlighter>
            </TabPanel>
            <TabPanel value={1}>
              <Typography>Installation</Typography>
              <SyntaxHighlighter language="bash">
                {`yarn add green-analytics-react
# or
npm install green-analytics-react`}
              </SyntaxHighlighter>
              <Typography>Usage</Typography>
              <SyntaxHighlighter language="javascript">
                {`import { initGA, setPerson } from 'green-analytics-react'

// Initializes the analytics script
initGA('${viewTokenDialog}')

// Marks the current session as belonging to a person
setPerson({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
})
`}
              </SyntaxHighlighter>
            </TabPanel>
          </Tabs>
        </ModalDialog>
      </Modal>
      <AccountBox
        label="Websites"
        actionButton={{
          label: 'Add',
          onClick: () => {
            setAddWebsiteOpen(true)
          },
        }}
      >
        <MUIDataGrid
          disableColumnMenu
          autoHeight
          hideFooter
          rows={data ?? []}
          columns={columns}
        />
      </AccountBox>
    </TabPanel>
  )
}

export default Websites
