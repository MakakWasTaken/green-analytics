import Link from '@components/Link'
import { Box } from '@mui/material'
import { titleToMarkdownId } from '@utils/utils'
import React, { FC, useEffect, useMemo, useState } from 'react'

interface PageTableOfContentsProps {
  mainContent: HTMLCollectionOf<Element>
}

const PageTableOfContents: FC<PageTableOfContentsProps> = ({ mainContent }) => {
  const pageToc = useMemo(() => {
    const children = mainContent.item(0)?.children

    if (!children) {
      return undefined
    }

    const result: { name: string; link: string; indent: number }[] = []

    for (let i = 0; i < children.length; i++) {
      const subitem = children.item(i)
      const content = subitem?.textContent

      if (!content) {
        continue
      }
      const link = `#${titleToMarkdownId(content)}`

      switch (subitem?.tagName) {
        case 'H1':
          result.push({ name: content, link, indent: 0 })
          break
        case 'H2':
          result.push({ name: content, link, indent: 2 })
          break
        case 'H3':
          result.push({ name: content, link, indent: 4 })
          break
      }
    }

    return result
  }, [mainContent])

  const renderListItems = (
    items: {
      name: string
      link: string
      indent: number
    }[],
  ) => {
    return (
      <Box>
        {items.map((item) => (
          <Link sx={{ width: '100%', pl: item.indent }} href={item.link}>
            {item.name}
          </Link>
        ))}
      </Box>
    )
  }

  return renderListItems(pageToc ?? [])
}

export default PageTableOfContents
