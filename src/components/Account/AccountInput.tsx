import {
  FormControl,
  FormControlProps,
  FormLabel,
  Input,
  InputProps,
} from '@mui/material'
import { FC } from 'react'

export interface AccountInputProps extends InputProps {
  controlProps?: FormControlProps
  flex?: number
  label: string
}

export const AccountInput: FC<AccountInputProps> = ({
  controlProps,
  ...props
}) => {
  return (
    <FormControl
      {...controlProps}
      sx={{
        ...controlProps?.sx,
        flex: props.flex || 0.5,
      }}
    >
      <FormLabel>{props.label}</FormLabel>
      <Input {...props} variant="soft" />
    </FormControl>
  )
}

export default AccountInput
