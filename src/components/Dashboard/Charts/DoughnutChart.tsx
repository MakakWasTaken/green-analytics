import { poppins } from '@src/styles/font'
import { ArcElement, ChartData, Chart as ChartJS, defaults } from 'chart.js'
import { FC } from 'react'
import { Doughnut } from 'react-chartjs-2'
import GridBox, { GridBoxProps } from '../Grid/GridBox'

defaults.font.family = poppins.style.fontFamily
defaults.font.weight = '500'

ChartJS.register(ArcElement)

interface DoughnutChartProps extends GridBoxProps {
  data: ChartData<'doughnut', number[], string>
}

const DoughnutChart: FC<DoughnutChartProps> = ({ data, ...rest }) => {
  return (
    <GridBox {...rest} sx={{ paddingBottom: 0, ...rest.sx }}>
      <div
        style={{
          position: 'relative',
          height: '200px',
          maxHeight: '100%',
          width: '100%',
        }}
      >
        <Doughnut data={data} />
      </div>
    </GridBox>
  )
}

export default DoughnutChart
