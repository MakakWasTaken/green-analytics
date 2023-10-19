import { Code, Refresh } from '@mui/icons-material'
import {
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from '@mui/joy'
import { Website } from '@prisma/client'
import SimpleGrid, {
  SimpleGridColumnDefinition,
  SimpleGridRef,
} from '@src/components/SimpleGrid'
import { HeaderContext } from '@src/contexts/HeaderContext'
import { SettingsTab } from '@src/pages/settings'
import { api } from '@src/utils/network'
import { useContext, useRef, useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash'
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript'
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml'
import { toast } from 'sonner'
import useSWR from 'swr'
import AccountBox from '../AccountBox'

SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('bash', bash)

const Websites = () => {
  const { selectedTeam } = useContext(HeaderContext)
  const { data, mutate: setData } = useSWR<Website[]>(
    selectedTeam ? `/database/website/getAll?teamId=${selectedTeam.id}` : null,
  )
  const [viewTokenDialog, setViewTokenDialog] = useState<string | null>(null)
  const simpleGridRef = useRef<SimpleGridRef>(null)

  const deleteWebsite = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this item? This cannot be undone.',
      )
    ) {
      toast.promise(api.delete(`/database/website/${id}`), {
        loading: 'Deleting website...',
        error: (err) => err.message || err,
        success: (response) =>
          response.data.message || 'Successfully deleted website',
      })
    }
  }

  const rescanWebsite = (id: string) => async () => {
    toast.promise(api.post(`/database/website/${id}/scan`), {
      loading: 'Scanning website...',
      error: (err) => err.message || err,
      success: (response) =>
        response.data.message || 'Successfully scanned website',
    })
  }

  const columns: SimpleGridColumnDefinition[] = [
    { field: 'name', headerName: 'Name', editable: true },
    { field: 'url', headerName: 'URL', type: 'url', editable: true },
    {
      field: 'token',
      headerName: 'Setup',
      renderCell: (value: string) => (
        <Button onClick={() => setViewTokenDialog(value)}>
          <Code />
        </Button>
      ),
    },
    {
      field: 'rescan',
      headerName: 'Rescan',
      renderCell: (value: string, id) => (
        <Button onClick={rescanWebsite(id)}>
          <Refresh />
        </Button>
      ),
    },
  ]

  const fixURL = (url: string): string => {
    // Get match from regex
    const regex = /^(?:\w+?:\/\/)?([A-z0-9.\-:]+).*/g

    const urlMatch = regex.exec(url)

    if (!urlMatch || !urlMatch[1]) {
      throw new Error('Invalid URL')
    }

    return urlMatch[1]
  }

  return (
    <TabPanel value={SettingsTab.Websites}>
      <Modal
        open={viewTokenDialog !== null}
        onClose={() => setViewTokenDialog(null)}
      >
        <ModalDialog
          size="lg"
          sx={{ overflowY: 'scroll', width: { xs: '100%', md: '500px' } }}
        >
          <ModalClose />
          <Typography level="h4">Website Setup</Typography>
          <Tabs>
            <TabList>
              <Tab>HTML</Tab>
              <Tab>JavaScript</Tab>
            </TabList>
            <TabPanel value={0}>
              <Typography>
                Copy and paste this code into your website's{' '}
                <code>&lt;head&gt;</code> element. It should be the first thing
                in the <code>&lt;head&gt;</code> tag.
              </Typography>
              <SyntaxHighlighter language="xml">
                {`<script
  async
  src="https://green-analytics.com/green-analytics.js"
  data-token="${viewTokenDialog}"
><script/>`}
              </SyntaxHighlighter>
            </TabPanel>
            <TabPanel value={1}>
              <Typography>Installation</Typography>
              <SyntaxHighlighter language="bash">
                {`yarn add green-analytics-js
# or
npm install green-analytics-js`}
              </SyntaxHighlighter>
              <Typography>Usage</Typography>
              <SyntaxHighlighter language="javascript">
                {`import { initGA, setPerson } from 'green-analytics-js'

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
            console.log('Adding row', simpleGridRef)
            if (!simpleGridRef.current) {
              toast.error('Reference to grid not found')
              return
            }
            simpleGridRef.current?.addRow()
          },
        }}
      >
        <SimpleGrid
          ref={simpleGridRef}
          rows={data ?? []}
          columns={columns}
          onRowDelete={deleteWebsite}
          onRowAdd={async (newRow: Website) => {
            // For this grid we only allow editing the URL
            newRow.url = fixURL(newRow.url)

            toast.promise(
              api.post<Website>('/database/website', {
                name: newRow.name,
                url: newRow.url,
                teamId: selectedTeam?.id,
              }),
              {
                loading: 'Adding website..',
                error: (err) => err.message || err,
                success: (response) => {
                  setData((prev) =>
                    prev ? [...prev, response.data] : [response.data],
                  )
                  return 'Website added'
                },
              },
            )
          }}
          onRowEdit={async (newRow: Website) => {
            // For this grid we only allow editing the URL
            newRow.url = fixURL(newRow.url)
            toast.promise(
              api.put<Website>(`/database/website/${newRow.id}`, {
                name: newRow.name,
                url: newRow.url,
                teamId: selectedTeam?.id,
              }),
              {
                loading: 'Updating website..',
                error: (err) => err.message || err,
                success: (response) => {
                  const data = response.data
                  setData((prev) =>
                    prev
                      ? prev.map((item) => (item.id === data.id ? data : item))
                      : [data],
                  )

                  return 'Website updated'
                },
              },
            )
          }}
        />
      </AccountBox>
    </TabPanel>
  )
}

export default Websites
