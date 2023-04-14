import { ChartData, Chart as ChartJS, RadialLinearScale } from 'chart.js'
import { FC } from 'react'
import { Radar } from 'react-chartjs-2'
import GridBox, { GridBoxProps } from '../Grid/GridBox'

ChartJS.register(RadialLinearScale)

interface RadarChartProps extends GridBoxProps {
  data: ChartData<'radar', number[], string>
}

const RadarChart: FC<RadarChartProps> = ({ data, ...rest }) => {
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
        <Radar
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: data.datasets.length > 1, // Only show label if more than 1, otherwise it will be shown in the title
              },
            },
          }}
          data={data}
        />
      </div>
    </GridBox>
  )
}

export default RadarChart
