import { Box } from '@mui/material'
import { GAAppProps } from '@pages/_app'
import React, { FC, PropsWithChildren } from 'react'
import TableOfContents from './Documentation/TableOfContents'

const MDXContent: FC<Pick<GAAppProps, 'Component' | 'pageProps'>> = ({
  Component,
  pageProps,
}) => {
  return (
    <Box
      sx={{ display: 'flex', width: '100%', justifyContent: 'center', mt: 18 }}
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
      <Box key="markdown-content" sx={{ width: { sm: '100%', md: '50%' } }}>
        <Component {...pageProps} />
      </Box>
      <Box key="page-toc" sx={{ width: { sm: '100%', md: '15%' } }} />
    </Box>
  )
}

export default MDXContent
