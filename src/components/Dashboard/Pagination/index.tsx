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
      <Button onClick={() => setPage(page - 1)}>Prev</Button>
      {totalPages > maxVisible && page > maxVisible / 2 && (
        <Button onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>
      )}
      {Array.from({ length: totalPages }).map((_, i) => {
        if (i < page - maxVisible / 2) return null
        if (i > page + maxVisible / 2) return null
        return (
          <Button
            key={i}
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
      {totalPages > maxVisible && page < totalPages - maxVisible / 2 && (
        <Button onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>
      )}
      <Button onClick={() => setPage(page + 1)}>Next</Button>
    </Box>
  )
}

export default Pagination
