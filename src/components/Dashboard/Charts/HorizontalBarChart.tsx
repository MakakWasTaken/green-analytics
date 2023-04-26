import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { FC } from 'react'
import { Bar } from 'react-chartjs-2'
import GridBox, { GridBoxProps } from '../Grid/GridBox'

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface HorizontalBarChartProps extends GridBoxProps {
  data: ChartData<'bar', number[], string>
}

const HorizontalBarChart: FC<HorizontalBarChartProps> = ({ data, ...rest }) => {
  return (
    <GridBox {...rest}>
      <div
        style={{
          position: 'relative',
          maxHeight: '90%', // There is an issue with overflowing labels in chart.js
          width: '100%',
        }}
      >
        <Bar
          options={{
            indexAxis: 'y',
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

export default HorizontalBarChart
