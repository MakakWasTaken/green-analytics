import { Button, CircularProgress, Grid } from '@mui/joy'
import { FC, useEffect, useMemo, useState } from 'react'
import AccountBox from './AccountBox'
import { AccountInput } from './AccountInput'

interface AccountCell<T = any> {
  field: keyof T
  label: string
  disabled?: boolean
}

interface AccountUpdateBoxProps<T = any> {
  label: string
  object: T
  onSave?: (object: T) => PromiseLike<void>
  cells: AccountCell<T>[]
}

const AccountUpdateBox: FC<AccountUpdateBoxProps> = ({
  label,
  object,
  onSave,
  cells,
}) => {
  const [state, setState] = useState(object)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setState(object)
  }, [object])

  const isChanged = useMemo(() => {
    if (!state) return false
    // Used to check if any of the values in the object have changed
    const changedValues = Object.values(state).filter((value, index) => {
      return object && value !== Object.values(object)[index]
    })
    // If any of the values have changed, return true
    return changedValues.length > 0
  }, [state, object])

  if (!state || loading) {
    return <CircularProgress />
  }

  return (
    <AccountBox label={label}>
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
    </AccountBox>
  )
}

export default AccountUpdateBox
