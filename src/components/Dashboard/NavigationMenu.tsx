import { Box, List, ListItemButton } from '@mui/joy'
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
  {
    title: 'Persons',
    href: '/dashboard/persons',
  },
]

const NavigationMenu = () => {
  const router = useRouter()

  return (
    <Box sx={{ minWidth: '200px', marginRight: { xs: 0, md: 4 } }}>
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
