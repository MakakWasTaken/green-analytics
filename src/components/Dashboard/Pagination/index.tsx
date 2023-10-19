import { Box, BoxProps, Button } from '@mui/joy'
import { FC } from 'react'

interface PaginationProps {
  page: number
  onPageChange: (page: number) => void
  totalPages?: number
  maxVisible?: number
}

const Pagination: FC<BoxProps & PaginationProps> = ({
  page,
  onPageChange,
  totalPages = 1,
  maxVisible = 5,

  ...boxProps
}) => {
  const setPage = (page: number) => {
    if (page < 0 || page >= totalPages) return
    onPageChange(page)
  }

  return (
    <Box
      {...boxProps}
      sx={{
        ...boxProps.sx,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* {page !== 0 && <Button onClick={() => setPage(page - 1)}>Prev</Button>} */}
      {Array.from({ length: totalPages }).map((_, i) => {
        if (i === 0 && page > Math.ceil(maxVisible / 2)) {
          return (
            <Button key={'first'} onClick={() => setPage(i)}>
              {1}
            </Button>
          )
        }
        if (
          i === totalPages - 1 &&
          page < totalPages - Math.ceil(maxVisible / 2)
        ) {
          return (
            <Button key={'latest'} onClick={() => setPage(i)}>
              {totalPages}
            </Button>
          )
        }
        if (i < Math.ceil(page - maxVisible / 2)) return null
        if (i > Math.ceil(page + maxVisible / 2)) return null
        const minShown = page > Math.ceil(maxVisible / 2)
        const maxShown = page < totalPages - Math.ceil(maxVisible / 2)
        if (minShown && i === Math.ceil(page - maxVisible / 2)) {
          return null
        }
        if (maxShown && i === Math.ceil(page + maxVisible / 2)) {
          return null
        }
        return (
          <Button
            key={`page-${i}`}
            onClick={() => setPage(i)}
            sx={{
              backgroundColor:
                page === i ? 'var(--joy-palette-primary-900)' : null,
              color: page === i ? 'primary.contrastText' : null,
            }}
          >
            {i + 1}
          </Button>
        )
      })}
      {/* {page !== totalPages - 1 && (
        <Button onClick={() => setPage(page + 1)}>Next</Button>
      )} */}
    </Box>
  )
}

export default Pagination
