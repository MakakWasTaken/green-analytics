interface DataPoint {
  value: number
  date: Date
}

export const linearRegressionThroughLastPoint = (
  data: DataPoint[],
  month: number,
  year: number,
): number | null => {
  if (data.length < 2) {
    return null
  }

  const lastIndex = data.length - 1
  const lastPoint = data[lastIndex]

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let i = 0; i < lastIndex; i++) {
    const point = data[i]
    const x = point.date.getTime() - lastPoint.date.getTime()
    const y = point.value - lastPoint.value
    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  }

  const n = lastIndex
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = lastPoint.value - slope * lastPoint.date.getTime()

  const predictionDate = new Date(year, month - 1, 1)
  const predictionX = predictionDate.getTime()
  const predictionY = slope * predictionX + intercept

  return predictionY
}
