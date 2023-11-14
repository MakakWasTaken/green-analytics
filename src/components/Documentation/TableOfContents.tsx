import { ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
} from '@mui/material'
import { toTitleCase } from '@utils/utils'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export interface Path {
  title: string
  path: string
  subpaths?: Path[]
}

interface ToCLevel {
  name: string
  link?: string
  items?: ToCLevel[]
}

interface CollapseProps {
  open: boolean
}

const Collapse: FC<PropsWithChildren<CollapseProps>> = ({ children, open }) => {
  return open && <Box>{children}</Box>
}

const TableOfContents: FC = () => {
  const router = useRouter()

  // States
  const [toc, setToc] = useState<ToCLevel>()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string>()

  const handleClick = (prefix: string) => {
    setExpanded((prev) => {
      // If it is equal with, pop a level
      if (prev === prefix) {
        const array = prefix.split('.')
        array.pop()
        return array.join('.') ?? undefined
      }
      // If it starts with, set to undefined.
      return prev?.startsWith(prefix) ? undefined : prefix
    })
  }

  useEffect(() => {
    // Refresh the toc using axios.
    ;(async () => {
      try {
        setLoading(true)
        const response = await axios.get<ToCLevel>('/docs-toc.json')
        setToc(response.data)
      } catch (err) {
        if (err instanceof AxiosError) {
          toast.error(err.response?.data?.message || err.message || err)
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const currentPagePrefix = useMemo(() => {
    if (!toc) {
      return undefined
    }
    const deepSearch = (
      level: ToCLevel,
      prefix: string,
    ): string | undefined => {
      if (level.link && router.pathname === level.link) {
        // Remove last character, because it is a faulty dot.
        return prefix.slice(0, -1)
      }
      const items = level.items ?? []
      for (let index = 0; index < items.length; index++) {
        const item = items[index]
        const formattedPrefix =
          prefix !== undefined ? `${prefix}${index + 1}` : `${index + 1}`
        const result = deepSearch(item, `${formattedPrefix}.`)
        if (result !== undefined) {
          return result
        }
      }
      return undefined
    }

    return deepSearch(toc, '')
  }, [toc, router.pathname])

  useEffect(() => {
    // Determine what path should be expanded.
    setExpanded(currentPagePrefix)
  }, [currentPagePrefix])

  const renderListItem = (
    name: string,
    formattedPrefix: string,
    tocLevel: ToCLevel,
  ) => {
    if (tocLevel.items) {
      return (
        <ListItemButton
          sx={{
            m: 0,
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {name}
          {expanded?.startsWith(formattedPrefix) ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItemButton>
      )
    }

    if (tocLevel.link) {
      return (
        <ListItemButton
          component="a"
          sx={{
            m: 0,
            borderRadius: 8,
            backgroundColor: (theme) =>
              formattedPrefix === currentPagePrefix
                ? theme.palette.divider
                : undefined,
          }}
          href={tocLevel.link}
        >
          {name}
        </ListItemButton>
      )
    }

    return <ListItemContent>{name}</ListItemContent>
  }

  const handleToCLevel = (
    tocLevels: ToCLevel[],
    prefix?: string,
  ): JSX.Element | null => {
    return (
      <Box key={prefix ?? 'toc-ground-level'}>
        {tocLevels.map((tocLevel, index) => {
          const formattedPrefix =
            prefix !== undefined ? `${prefix}${index + 1}` : `${index + 1}`
          const name = toTitleCase(tocLevel.name)
          return (
            <>
              <ListItem
                key={`${formattedPrefix}-${name}`}
                sx={{
                  p: 0,
                }}
                onClick={
                  tocLevel.items
                    ? () => handleClick(formattedPrefix)
                    : undefined
                }
              >
                {renderListItem(name, formattedPrefix, tocLevel)}
              </ListItem>

              {tocLevel.items && (
                <Collapse
                  key={`collapse-${formattedPrefix}`}
                  open={expanded?.startsWith(formattedPrefix) ?? false}
                >
                  <Box sx={{ ml: 2 }}>
                    {handleToCLevel(tocLevel.items, `${formattedPrefix}.`)}
                  </Box>
                </Collapse>
              )}
            </>
          )
        })}
      </Box>
    )
  }

  return (
    <List aria-label="Documentation table of contents">
      {loading || !toc?.items ? (
        <CircularProgress />
      ) : (
        handleToCLevel(toc.items)
      )}
    </List>
  )
}

export default TableOfContents
