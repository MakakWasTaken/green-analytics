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
}

export const TeamContext = React.createContext<ContextState>({
  allTeams: [],
  selectedTeam: null,
  setSelectedTeam: () => {
    // do nothing
  },
})

export const TeamProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useUser()
  const { data: allTeams } = useSWR<Team[]>(
    user ? '/database/team/getAll' : null,
  )
  const [internalSelectedTeam, setSelectedTeam] = useState<Team | null>(null)
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
    <TeamContext.Provider
      value={{
        allTeams,
        selectedTeam,
        setSelectedTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}
