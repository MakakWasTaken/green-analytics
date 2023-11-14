import { Box, BoxProps, useTheme } from '@mui/material'
import { GAAppProps } from '@pages/_app'
import React, {
  Children,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PageTableOfContents from './Documentation/PageTableOfContents'
import TableOfContents, { Path } from './Documentation/TableOfContents'

const MDXContent: FC<Pick<GAAppProps, 'Component' | 'pageProps'>> = ({
  Component,
  pageProps,
}) => {
  const theme = useTheme()

  const [markdownContent, setMarkdownContent] =
    useState<HTMLCollectionOf<Element>>()

  useEffect(() => {
    setMarkdownContent(document.getElementsByClassName('markdown-content'))
  }, [])

  return (
    <>
      {theme.palette.mode === 'dark' ? (
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/github-dark.min.css"
        />
      ) : (
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/github.min.css"
        />
      )}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          mt: 18,
        }}
      >
        <Box
          key="docs-toc"
          sx={{
            width: { sm: '100%', md: '15%' },
            paddingInline: { sm: 0, md: 2 },
          }}
        >
          <TableOfContents />
        </Box>
        <Box
          className="markdown-content"
          key="markdown-content"
          sx={{ width: { sm: '100%', md: '50%' } }}
        >
          <Component {...pageProps} />
        </Box>
        <Box key="page-toc" sx={{ width: { sm: '100%', md: '15%' } }}>
          {markdownContent && (
            <PageTableOfContents mainContent={markdownContent} />
          )}
        </Box>
      </Box>
    </>
  )
}

export default MDXContent
