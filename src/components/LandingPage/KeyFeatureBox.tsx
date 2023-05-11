import { Box, SvgIconProps, Typography } from '@mui/joy'
import { FC, ReactElement, cloneElement, useMemo } from 'react'

interface KeyFeatureBoxProps {
  icon?: ReactElement
  title: string
  description: string
}

const KeyFeatureBox: FC<KeyFeatureBoxProps> = ({
  icon,
  title,
  description,
}) => {
  const iconElement = useMemo(
    () =>
      icon
        ? cloneElement(icon, {
            sx: {
              fontSize: {
                xs: 64,
                md: 100,
                margin: 16,
              },
              color: 'var(--joy-palette-primary-main)',
              alignSelf: 'center',
            },
          } as SvgIconProps)
        : null,
    [icon],
  )

  return (
    <Box
      sx={{
        flex: 1 / 3,
        padding: 3,

        display: 'flex',
        flexDirection: 'column',

        borderRadius: 32,

        backgroundColor: 'var(--joy-palette-background-backdrop)',
      }}
    >
      {iconElement}
      <Typography level="h3">{title}</Typography>
      <Typography sx={{ padding: '25px 0', textAlign: 'justify' }}>
        {description}
      </Typography>
    </Box>
  )
}

export default KeyFeatureBox
