import { Grid, GridProps, Sheet, Typography, styled } from '@mui/joy'
import { FC, PropsWithChildren } from 'react'

export interface GridBoxProps {
  label: string
  sx?: GridProps['sx']
  xs?: GridProps['xs']
  md?: GridProps['md']
  lg?: GridProps['lg']
}

const Item = styled(Sheet)(({ theme }) => ({
  ...theme.typography.body2,
  margin: theme.spacing(0.5),
  borderRadius: 16,
  padding: theme.spacing(2),
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  color: theme.vars.palette.text.tertiary,
}))

const GridBox: FC<PropsWithChildren<GridBoxProps>> = ({
  label,
  children,
  ...rest
}) => {
  return (
    <Grid
      xs={rest.xs ?? 12} // Full width
      md={rest.md} // Full width
      lg={rest.lg} // Full width
      sx={rest.sx}
      minHeight={{ xs: 'auto', md: 300 }}
    >
      <Item>
        <Typography level="h6" sx={{ marginBottom: 2 }}>
          {label}
        </Typography>
        {children}
      </Item>
    </Grid>
  )
}

export default GridBox
