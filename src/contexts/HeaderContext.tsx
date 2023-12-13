import { useUser } from '@auth0/nextjs-auth0/client'
import { Team, TeamRole, TeamSubscription, User, Website } from '@prisma/client'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { FC, useEffect, useState } from 'react'
import useSWR, { KeyedMutator } from 'swr'

type ContextState = {
  allTeams: Team[] | undefined // Will be undefined if not logged in
  selectedTeam:
    | (Team & {
        users: User[]
        roles: TeamRole[]
        websites: Website[]
        subscription?: TeamSubscription
      })
    | null
    | undefined
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>>
  selectedWebsite: Website | null
  setSelectedWebsite: React.Dispatch<React.SetStateAction<Website | null>>
  reloadTeams: KeyedMutator<Team[]>
  loadingTeams: boolean
}

export const HeaderContext = React.createContext<ContextState>({
  allTeams: [],
  selectedTeam: null,
  setSelectedTeam: () => {},
  selectedWebsite: null,
  setSelectedWebsite: () => {},
  reloadTeams: async (d) => {
    return undefined
  },
  loadingTeams: false,
})

export const HeaderProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useUser()
  const {
    data: allTeams,
    mutate: reloadTeams,
    isLoading: loadingTeams,
  } = useSWR<Team[]>(user ? 'team' : null)
  const [internalSelectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const { data: selectedTeam } = useSWR<
    | (Team & {
        users: User[]
        roles: TeamRole[]
        websites: Website[]
        subscription?: TeamSubscription
      })
    | null
  >(internalSelectedTeam ? `team/${internalSelectedTeam.id}/info` : null)

  const queryTeamId = useSearchParams().get('teamid')

  useEffect(() => {
    if (internalSelectedTeam) {
      localStorage.setItem('selectedTeamId', internalSelectedTeam.id)
      setSelectedWebsite(null)
    }
  }, [internalSelectedTeam])

  useEffect(() => {
    if (selectedWebsite) {
      localStorage.setItem('selectedWebsiteId', selectedWebsite.id)
    }
  }, [selectedWebsite])

  /**
   * Used to get the previous team id from local storage (Persist the selected team)
   */
  useEffect(() => {
    if (allTeams && allTeams.length > 0) {
      // If the id is provided in the teamid query param use that instead.
      if (queryTeamId) {
        const previouslySelectedTeam = allTeams.find(
          (team) => team.id === queryTeamId,
        )
        if (previouslySelectedTeam) {
          setSelectedTeam(previouslySelectedTeam)
          return
        }
      } else {
        const previouslySelectedTeamId = localStorage.getItem('selectedTeamId')
        if (previouslySelectedTeamId) {
          const previouslySelectedTeam = allTeams.find(
            (team) => team.id === previouslySelectedTeamId,
          )
          if (previouslySelectedTeam) {
            setSelectedTeam(previouslySelectedTeam)
            return
          }
        }
      }
      localStorage.setItem('selectedTeamId', allTeams[0].id)
      setSelectedTeam(allTeams[0] || null)
    }
  }, [allTeams, queryTeamId])

  /**
   * Used to get the previous website id from local storage (Persist the selected website)
   */
  useEffect(() => {
    if (selectedTeam && selectedTeam.websites.length > 0) {
      const previouslySelectedWebsiteId =
        localStorage.getItem('selectedWebsiteId')
      if (previouslySelectedWebsiteId) {
        const previouslySelectedWebsite = selectedTeam.websites.find(
          (website) => website.id === previouslySelectedWebsiteId,
        )
        if (previouslySelectedWebsite) {
          setSelectedWebsite(previouslySelectedWebsite)
          return
        }
      }
      setSelectedWebsite(selectedTeam.websites[0] || null)
    }
  }, [selectedTeam])

  return (
    <HeaderContext.Provider
      value={{
        allTeams,
        selectedTeam,
        setSelectedTeam,
        selectedWebsite,
        setSelectedWebsite,
        reloadTeams,
        loadingTeams,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}
