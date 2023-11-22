import { useUser } from '@auth0/nextjs-auth0/client'
import { HeaderContext } from '@contexts/HeaderContext'
import { GitHub } from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu'
import { Modal, ModalDialog } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { Team, TeamInvite } from '@prisma/client'
import { api } from '@utils/network'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FC, useContext, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import Logo from '../../../public/logo192.png'
import Link from '../Link'

interface Page {
  label: string
  href?: string
  func?: () => void
}

export const Header: FC = () => {
  const { user } = useUser()

  const { reloadTeams } = useContext(HeaderContext)

  const { data: invitations, mutate: setInvitations } = useSWR<
    (TeamInvite & { team: Team })[]
  >(user ? 'database/team/invitations' : null)

  const pages: Page[] = [
    { label: 'Features', href: '/features' },
    { label: 'Calculate', href: '/calculate' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Documentation', href: '/docs' },
  ]
  const settings: Page[] = user
    ? [
        { label: 'Settings', href: '/settings' },
        { label: 'Dashboard', href: '/dashboard' },
        {
          label: 'Logout',
          href: '/api/auth/logout',
        },
      ]
    : [{ label: 'Get Started', href: '/dashboard' }]

  const router = useRouter()

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav((prev) => (prev ? null : event.currentTarget))
  }
  const handleToggleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser((prev) => (prev ? null : event.currentTarget))
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const onPageClick = (page: Page) => {
    handleCloseNavMenu()
    handleCloseUserMenu()
    if (page.func) {
      page.func()
    } else if (page.href) {
      router.push(page.href)
    } else {
      throw new Error('Page must have either href or func')
    }
  }

  const acceptInvite = (invite: TeamInvite & { team: Team }) => {
    toast.promise(
      api.post('database/team/invitations/accept', {
        id: invite.id,
      }),
      {
        loading: 'Accepting invite..',
        error: (err) => err.message || err,
        success: (response) => {
          reloadTeams()

          // Remove the invitation from the array.
          setInvitations((prev) =>
            prev?.filter((invitation) => invitation.id !== invite.id),
          )

          return response.data.message
        },
      },
    )
  }

  const declineInvite = (invite: TeamInvite & { team: Team }) => {
    toast.promise(
      api.post('database/team/invitations/decline', {
        id: invite.id,
      }),
      {
        loading: 'Declining invite..',
        error: (err) => err.message || err,
        success: (response) => {
          reloadTeams()

          // Remove the invitation from the array.
          setInvitations((prev) =>
            prev?.filter((invitation) => invitation.id !== invite.id),
          )

          return response.data.message
        },
      },
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(0,0,0,0.05)',
        color: (theme) => theme.palette.text.primary,
        display: 'flex',
        flexDirection: 'row',
        padding: '0 1rem',
        alignItems: 'center',
      }}
      id="menu-appbar"
    >
      {/* INVITATION MODAL */}
      {invitations && invitations.length > 0 && (
        <Modal open={invitations.length > 0}>
          <ModalDialog>
            <Typography level="h4">
              Invitation to {invitations[0].team?.name}
            </Typography>
            <Typography level="body-md">
              You have been invited to join the team {invitations[0].team?.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Button
                color="danger"
                onClick={() => declineInvite(invitations[0])}
              >
                Decline
              </Button>
              <Button
                color="success"
                onClick={() => acceptInvite(invitations[0])}
              >
                Accept
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}
      <Link
        level="h4"
        href="/"
        sx={{
          mr: 2,
          display: { xs: 'none', md: 'flex' },
          fontWeight: 700,
          letterSpacing: '.3rem',
          textDecoration: 'none',
        }}
        color="primary"
      >
        <Image
          src={Logo}
          alt="Green Analytics Logo"
          style={{ marginRight: 8 }}
          width={40}
          height={40}
        />
        Green Analytics
      </Link>

      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="lg"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          id="pages-menu"
        >
          <MenuIcon aria-labelledby="pages-menu" />
        </IconButton>
        <Menu
          id="nav-menu"
          anchorEl={anchorElNav}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          aria-labelledby="pages-menu"
        >
          {pages.map((page) => (
            <MenuItem key={page.label} onClick={() => onPageClick(page)}>
              <Typography textAlign="center">{page.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Link
        level="h4"
        href="/"
        sx={{
          mr: 2,
          display: { xs: 'flex', md: 'none' },
          flexGrow: 1,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          textDecoration: 'none',
        }}
        color="primary"
      >
        Green Analytics
      </Link>
      <Box
        sx={{
          flexGrow: 1,
          display: { xs: 'none', md: 'flex' },
          gap: 1,
          justifyContent: 'flex-end',
          marginRight: 1,
        }}
      >
        {pages.map((page) => (
          <Button
            key={page.label}
            variant="plain"
            onClick={() => onPageClick(page)}
            sx={{ my: 2, display: 'block' }}
          >
            {page.label}
          </Button>
        ))}
      </Box>

      <IconButton
        variant="plain"
        sx={{
          margin: 1,
        }}
        aria-label="GitHub repository"
        onClick={() =>
          window.open('https://github.com/MakakWasTaken/green-analytics')
        }
      >
        <GitHub />
      </IconButton>
      {user ? (
        <>
          <IconButton
            onClick={handleToggleUserMenu}
            sx={{ width: '40px', height: '40px', p: 0, borderRadius: '50vh' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={40}
              height={40}
              style={{ borderRadius: '50vh' }}
              alt={user.name || ''}
              src={user.picture || ''}
            />
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem
                key={setting.label}
                onClick={() => onPageClick(setting)}
              >
                <Typography textAlign="center">{setting.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <>
          <Button
            variant="solid"
            onClick={() => onPageClick(settings[0])}
            sx={{ my: 2, display: 'block' }}
          >
            {settings[0].label}
          </Button>
        </>
      )}
    </Box>
  )
}
export default Header
