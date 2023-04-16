import { CircularProgress, TabPanel } from '@mui/joy'
import { DataGrid } from '@mui/x-data-grid'
import { Website } from '@prisma/client'
import { TeamContext } from '@src/contexts/TeamContext'
import { AccountPage } from '@src/pages/account'
import { useContext } from 'react'
import useSWR from 'swr'
import AccountBox from '../AccountBox'

const Websites = () => {
  const { selectedTeam } = useContext(TeamContext)
  const { data } = useSWR<Website[]>(
    selectedTeam ? '/database/website/getAll?teamId=' + selectedTeam.id : null,
  )

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'url', headerName: 'URL', width: 130, editable: true },
    { field: 'createdAt', headerName: 'Created At', width: 130 },
    { field: 'updatedAt', headerName: 'Updated At', width: 130 },
  ]

  return (
    <TabPanel value={AccountPage.Websites}>
      <AccountBox label="Websites">
        {!data ? (
          <CircularProgress />
        ) : (
          <DataGrid columns={columns} rows={data}></DataGrid>
        )}
      </AccountBox>
    </TabPanel>
  )
}

export default Websites
