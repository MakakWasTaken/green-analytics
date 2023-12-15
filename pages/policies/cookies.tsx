import { insertCookiePolicy } from 'green-analytics-js'
import { NextSeo } from 'next-seo'
import { useEffect } from 'react'

const CookiesPage = () => {
  useEffect(() => {
    insertCookiePolicy()
  }, [])

  return (
    <>
      <NextSeo title="Cookie Policy" />
      <div id="green-analytics-cookie-policy" />
    </>
  )
}

export default CookiesPage
