import { useUser } from '@auth0/nextjs-auth0/client'
import MenuIcon from '@mui/icons-material/Menu'
import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Menu from '@mui/joy/Menu'
import MenuItem from '@mui/joy/MenuItem'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import { useRouter } from 'next/router'
import * as React from 'react'
import { FC } from 'react'
import Link from '../Link'

interface Page {
  label: string
  href?: string
  func?: () => void
}

const ResponsiveAppBar: FC = () => {
  const { user } = useUser()

  const pages: Page[] = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
  ]
  const settings: Page[] = user
    ? [
        { label: 'Account', href: '/account' },
        { label: 'Dashboard', href: '/dashboard' },
        {
          label: 'Logout',
          href: '/api/auth/logout',
        },
      ]
    : [{ label: 'Get Started', href: '/dashboard' }]

  const router = useRouter()

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  )

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const onPageClick = (page: Page) => {
    if (page.func) {
      page.func()
    } else if (page.href) {
      router.push(page.href)
    } else {
      throw new Error('Page must have either href or func')
    }
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
    >
      <Link
        level="h6"
        href="/"
        sx={{
          mr: 2,
          display: { xs: 'none', md: 'flex' },
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        Green Analytics
      </Link>

      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="lg"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="nav-menu"
          anchorEl={anchorElNav}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          aria-labelledby="selected-demo-button"
        >
          {pages.map((page) => (
            <MenuItem key={page.label} onClick={() => onPageClick(page)}>
              <Typography textAlign="center">{page.label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Link
        level="h5"
        href="/"
        sx={{
          mr: 2,
          display: { xs: 'flex', md: 'none' },
          flexGrow: 1,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.3rem',
          color: 'inherit',
          textDecoration: 'none',
        }}
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

      <Box sx={{ flexGrow: 0 }}>
        {user ? (
          <>
            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ p: 0, borderRadius: '50vh' }}
              >
                <Avatar alt={user.name || ''} src={user.picture || ''} />
              </IconButton>
            </Tooltip>
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
          <Button
            variant="solid"
            onClick={() => onPageClick(settings[0])}
            sx={{ my: 2, display: 'block' }}
          >
            {settings[0].label}
          </Button>
        )}
      </Box>
    </Box>
  )
}
export default ResponsiveAppBar
