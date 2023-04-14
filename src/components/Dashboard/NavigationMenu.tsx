import { Box, List, ListItemButton, useColorScheme } from '@mui/joy'
import { useRouter } from 'next/router'

interface Page {
  title: string
  href: string
}

const pages: Page[] = [
  {
    title: 'Overview',
    href: '/dashboard',
  },
  {
    title: 'Event Types',
    href: '/dashboard/event-types',
  },
]

const NavigationMenu = () => {
  const router = useRouter()

  const { mode, systemMode } = useColorScheme()
  console.log(mode) // "system"
  console.log(systemMode)

  return (
    <Box sx={{ width: '200px' }}>
      {/* Navigation Menu */}
      <List
        orientation="vertical"
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 22,
          padding: 0,
        }}
      >
        {pages.map((page) => (
          <ListItemButton
            key={page.title}
            sx={{
              backgroundColor: (theme) =>
                router.pathname === page.href ? theme.palette.divider : null,
              color: (theme) =>
                router.pathname === page.href
                  ? theme.palette.text.primary
                  : null,
              borderRadius: '50vh',
            }}
            onClick={() => router.push(page.href)}
          >
            {page.title}
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

export default NavigationMenu
