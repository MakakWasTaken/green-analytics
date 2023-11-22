import { Box, useTheme } from '@mui/material'
import { GAAppProps } from '@pages/_app'
import { NextSeo } from 'next-seo'
import { MetaTag } from 'next-seo/lib/types'
import React, { FC, useEffect, useMemo, useState } from 'react'
import PageTableOfContents from './Documentation/PageTableOfContents'
import TableOfContents from './Documentation/TableOfContents'

const MDXContent: FC<Pick<GAAppProps, 'Component' | 'pageProps'>> = ({
  Component,
  pageProps,
}) => {
  const theme = useTheme()
  const meta = pageProps.meta as { [key: string]: string } | undefined

  const [markdownContent, setMarkdownContent] =
    useState<HTMLCollectionOf<Element>>()

  useEffect(() => {
    setMarkdownContent(document.getElementsByClassName('markdown-content'))
  }, [])

  const additionalMetaTags = useMemo(() => {
    if (!meta) {
      return []
    }

    const additionalTags: MetaTag[] = []

    if (meta.keywords) {
      additionalTags.push({
        name: 'keywords',
        content: meta.keywords,
      })
    }
    if (meta.author) {
      additionalTags.push({
        name: 'author',
        content: meta.author,
      })
    }

    return additionalTags
  }, [meta])

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
      <NextSeo
        title={meta?.title ?? ''}
        description={meta?.excerpt}
        additionalMetaTags={additionalMetaTags}
      />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          mt: 18,
        }}
      >
        <Box
          key="docs-toc"
          sx={{
            width: { xs: '100%', md: '25%', lg: '15%' },
            paddingInline: { sm: 0, md: 2 },
          }}
        >
          <TableOfContents />
        </Box>
        <Box
          className="markdown-content"
          key="markdown-content"
          sx={{ width: { xs: '100%', md: '50%' }, paddingInline: 4 }}
        >
          <Component {...pageProps} />
        </Box>
        <Box
          key="page-toc"
          sx={{ width: { xs: '100%', md: '25%', lg: '15%' } }}
        >
          {markdownContent && (
            <PageTableOfContents mainContent={markdownContent} />
          )}
        </Box>
      </Box>
    </>
  )
}

export default MDXContent
