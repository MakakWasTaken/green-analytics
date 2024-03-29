import { poppins } from '@src/styles/font'
import {
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  defaults,
} from 'chart.js'
import { FC } from 'react'
import { Line } from 'react-chartjs-2'
import GridBox, { GridBoxProps } from '../Grid/GridBox'

defaults.font.family = poppins.style.fontFamily
defaults.font.weight = 500

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface LineChartProps extends GridBoxProps {
  data: ChartData<'line', number[], string>
}

const LineChart: FC<LineChartProps> = ({ data, ...rest }) => {
  return (
    <GridBox {...rest}>
      <div
        style={{
          position: 'relative',
          minHeight: '200px',
          width: '100%',
        }}
      >
        <Line
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: data.datasets.length > 1, // Only show label if more than 1, otherwise it will be shown in the title
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  maxTicksLimit: 7,
                },
              },
              y: {
                ticks: {
                  maxTicksLimit: 4,
                },
                min: 0,
                border: {
                  display: false,
                },
              },
            },
          }}
          data={data}
        />
      </div>
    </GridBox>
  )
}

export default LineChart
