import { UserProfile, useUser } from '@auth0/nextjs-auth0/client'
import { Team } from '@models/team'
import axios from 'axios'
import * as React from 'react'
import { FC, useCallback, useEffect } from 'react'

type ContextState = {
  user: UserProfile | null
  accessToken: string | null
  team: Team | null
  signedIn: boolean
  loading: boolean
  logout: () => Promise<void>
  reloadAccessToken: () => Promise<void>
  updateUserData: (user: Partial<UserProfile>) => Promise<void>
}

export const AuthContext = React.createContext<ContextState>({
  user: null,
  accessToken: null,
  team: null,
  signedIn: false,
  loading: true,
  logout: () => Promise.resolve(),
  reloadAccessToken: () => Promise.resolve(),
  updateUserData: () => Promise.resolve(),
})

export const AuthProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const { user: authUser, isLoading } = useUser()
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [team, setTeam] = React.useState<Team | null>(null)
  const [loadingServerUser, setLoadingServerUser] =
    React.useState<boolean>(true)
  const [accessToken, setAccessToken] = React.useState<string | null>(null)

  const updateUserData = async (user: Partial<UserProfile>): Promise<void> => {
    setLoadingServerUser(true)
    if (authUser === null) {
      throw new Error('Not logged in, cannot update user')
    }
    await reloadAccessToken()

    setUser({ ...user } as UserProfile)
    setLoadingServerUser(false)
  }

  const reloadAccessToken = useCallback(async (): Promise<void> => {
    if (authUser) {
      const response = await axios.get('/api/auth/token', {
        withCredentials: true,
      })
      console.log(response.data)
      setAccessToken(response.data.accessToken)
    } else {
      setAccessToken(null)
    }
  }, [authUser])

  const reloadTeam = useCallback(async (): Promise<void> => {
    if (user?.teamId) {
      const response = await axios.get(`/api/team/${user.teamId}`)
      setTeam(response.data)
    }
  }, [user?.teamId])

  const logout = async (): Promise<void> => {
    window.location.href = '/api/auth/logout'
  }

  useEffect(() => {
    reloadTeam()
  }, [reloadTeam, user?.teamId])

  useEffect(() => {
    // Set the state
    if (authUser) {
      updateUserData(authUser)
      // Redirect to plans page if the user does not have a plan
    } else {
      // Reset state if login out
      setUser(null)
    }
  }, [authUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        team,
        signedIn: !!user,
        reloadAccessToken,
        updateUserData,
        loading: isLoading || loadingServerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
