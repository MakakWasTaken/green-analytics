import { insertCookiePolicy } from 'green-analytics-js'
import { useEffect } from 'react'

const CookiesPage = () => {
  useEffect(() => {
    insertCookiePolicy()
  }, [])

  return <div id="green-analytics-cookie-policy" />
}

export default CookiesPage
