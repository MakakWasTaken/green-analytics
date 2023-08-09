import { Option, Select } from '@mui/joy'
import {
  convertISO2ToName,
  countryISO3Mapping,
} from '@src/utils/countryISOMapping'
import { FC } from 'react'

export interface CountrySelectProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
}

const CountrySelect: FC<CountrySelectProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const allISO3 = Object.keys(countryISO3Mapping)

  const allNames = allISO3.map((iso3) => {
    try {
      const fullName = convertISO2ToName(iso3)

      return {
        code: iso3,
        name: fullName,
      }
    } catch (e) {
      return {
        code: iso3,
        name: iso3,
      }
    }
  })

  return (
    <Select
      value={value}
      onChange={(_, value) => onChange(value)}
      placeholder={placeholder}
    >
      {allNames.map((entry) => (
        <Option key={entry.code} value={entry.code}>
          {entry.name}
        </Option>
      ))}
    </Select>
  )
}

export default CountrySelect
