import { Box, Button, CircularProgress, Grid, Typography } from '@mui/joy'
import { FC, useEffect, useMemo, useState } from 'react'
import { AccountInput } from './AccountInput'

interface AccountCell<T = any> {
  field: keyof T
  label: string
  disabled?: boolean
}

interface AccountBoxProps<T = any> {
  label: string
  object: T
  onSave?: (object: T) => PromiseLike<void>
  cells: AccountCell<T>[]
}

const AccountBox: FC<AccountBoxProps> = ({ label, object, onSave, cells }) => {
  const [state, setState] = useState(object)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setState(object)
  }, [object])

  const isChanged = useMemo(() => {
    if (!state) return false
    // Used to check if any of the values in the object have changed
    const changedValues = Object.values(state).filter((value, index) => {
      return value !== Object.values(object)[index]
    })
    // If any of the values have changed, return true
    return changedValues.length > 0
  }, [state, object])

  if (!state || loading) {
    return <CircularProgress />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '70%' },
          padding: { xs: '1rem', md: '2rem' },
          margin: 1,
          borderRadius: 16,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.5rem' },
            fontWeight: 'bold',
          }}
        >
          {label}
        </Typography>
        <Grid
          container
          sx={{
            columnGap: 2,
            columns: { xs: 1, md: 2 },
          }}
        >
          {cells.map((cell) => (
            <AccountInput
              key={cell.field as string}
              label={cell.label}
              disabled={!onSave || cell.disabled} // Disable if there is no onSave function
              value={state[cell.field]}
              onChange={(event) => {
                setState((prev: any) => ({
                  ...prev,
                  [cell.field]: event.target.value,
                }))
              }}
            />
          ))}
        </Grid>
        {onSave && isChanged && (
          <Button
            sx={{ marginTop: 2 }}
            color="success"
            fullWidth
            onClick={async () => {
              setLoading(true)
              await onSave(state)
              setLoading(false)
            }}
          >
            Save
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default AccountBox
