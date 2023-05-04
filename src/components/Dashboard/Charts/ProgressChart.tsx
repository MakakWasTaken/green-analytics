import { LinearProgress, Typography } from '@mui/joy'
import { poppins } from '@src/styles/font'
import { ArcElement, Chart as ChartJS, defaults } from 'chart.js'
import { FC } from 'react'
import GridBox, { GridBoxProps } from '../Grid/GridBox'

defaults.font.family = poppins.style.fontFamily
defaults.font.weight = '500'

ChartJS.register(ArcElement)

interface ProgressChartProps extends GridBoxProps {
  mainLabel?: string
  subLabel?: string
  value: number
}

const ProgressChart: FC<ProgressChartProps> = ({
  value,
  mainLabel,
  subLabel,
  ...rest
}) => {
  return (
    <GridBox {...rest} sx={{ paddingBottom: 0, ...rest.sx }}>
      {mainLabel && <Typography level="h2">{mainLabel}</Typography>}
      {subLabel && <Typography level="h5">{subLabel}</Typography>}
      <div
        style={{
          position: 'relative',
          height: '50px',
          maxHeight: '100%',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <LinearProgress determinate value={value} />
      </div>
    </GridBox>
  )
}

export default ProgressChart
