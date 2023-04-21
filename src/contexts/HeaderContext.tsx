import { useUser } from '@auth0/nextjs-auth0/client'
import { Team, TeamRole, User, Website } from '@prisma/client'
import * as React from 'react'
import { FC, useEffect, useState } from 'react'
import useSWR from 'swr'

type ContextState = {
  allTeams: Team[] | undefined // Will be undefined if not logged in
  selectedTeam:
    | (Team & {
        users: User[]
        roles: TeamRole[]
        websites: Website[]
      })
    | null
    | undefined
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>>
  selectedWebsite: Website | null
  setSelectedWebsite: React.Dispatch<React.SetStateAction<Website | null>>
}

export const HeaderContext = React.createContext<ContextState>({
  allTeams: [],
  selectedTeam: null,
  setSelectedTeam: () => {
    // do nothing
  },
  selectedWebsite: null,
  setSelectedWebsite: () => {
    // do nothing
  },
})

export const HeaderProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useUser()
  const { data: allTeams } = useSWR<Team[]>(
    user ? '/database/team/getAll' : null,
  )
  const [internalSelectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const { data: selectedTeam } = useSWR<
    // eslint-disable-next-line func-call-spacing
    | (Team & {
        users: User[]
        roles: TeamRole[]
        websites: Website[]
      })
    | null
  >(
    internalSelectedTeam
      ? `/database/team/${internalSelectedTeam.id}/info`
      : null,
  )

  useEffect(() => {
    if (allTeams && allTeams.length > 0) {
      setSelectedTeam(allTeams[0] || null)
    }
  }, [allTeams])

  return (
    <HeaderContext.Provider
      value={{
        allTeams,
        selectedTeam,
        setSelectedTeam,
        selectedWebsite,
        setSelectedWebsite,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}
