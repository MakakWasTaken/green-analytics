import axios from 'axios'
import { linearRegressionThroughLastPoint } from './linearRegressionThroughPoint'

export const getPredictedCarbonIntensity = async (
  countries: string | string[] = 'global',
  month: number = new Date().getMonth(),
  year: number = new Date().getFullYear(),
): Promise<{ [key: string]: any }> => {
  if (countries === 'global') {
    const query = `
  SELECT AVG(emissions_intensity_gco2_per_kwh) from (
    SELECT * from country_overview_yearly
    GROUP BY country_or_region
    ORDER BY latest_year DESC
  )
  `
    const response = await axios.get(
      'https://ember-data-api-scg3n.ondigitalocean.app/ember.json',
      {
        params: {
          sql: query,
        },
      },
    )

    const data = response.data.rows[0]?.[0]

    return { global: data }
  } else {
    const allCountries = Array.isArray(countries)
      ? countries
      : countries.split(',')
    const query = `
  SELECT
    country_code,
    year,
    emissions_intensity_gco2_per_kwh,
    latest_year,
    coal_deadline,
    clean_deadline
  FROM
    country_overview_yearly
  WHERE
    country_code IN ('${allCountries.join("','")}')
  ORDER BY
    latest_year DESC
  `.replace(/[\r\n]/g, '')

    const response = await axios.get(
      'https://ember-data-api-scg3n.ondigitalocean.app/ember.json',
      {
        params: {
          sql: query,
        },
      },
    )

    // Format the data located in response.data.rows and seperate it by country, then get the prediction for each country
    const countrySeperated: {
      [key: string]: {
        date: Date
        value: number
        [key: string]: Date | string | number
      }[]
    } = {}
    for (const row of response.data.rows) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [rowCountry, year, value, latestYear, coalDeadline, cleanDeadline] =
        row

      countrySeperated[rowCountry] = countrySeperated[rowCountry] || []
      countrySeperated[rowCountry].push({
        date: new Date(year, 0, 1),
        value,
        latestYear,
        coalDeadline,
        cleanDeadline,
      })
    }

    const finalEmissionData: { [key: string]: any } = {}
    Object.keys(countrySeperated).forEach((countryKey) => {
      const data = countrySeperated[countryKey]

      const prediction = linearRegressionThroughLastPoint(data, month, year)

      const { latestYear, coalDeadline, cleanDeadline } =
        countrySeperated[countryKey][0]

      if (prediction !== null) {
        finalEmissionData[countryKey] = {
          prediction,
          latestYear,
          coalDeadline,
          cleanDeadline,
        }
      }
    })

    return finalEmissionData
  }
}
