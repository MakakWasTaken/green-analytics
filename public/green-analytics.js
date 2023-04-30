/**
 * @typedef {object} Property
 * @property {string} key - The key of the property
 * @property {object} value - The value of the property
 */

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {object} Person
 * @property {string} id - The id of the person
 * @property {string} [name] - The name of the person
 * @property {string} [email] - The email of the person
 * @property {ArrayLike<Property>} [properties] - The properties of the person
 */

/**
 * An event
 * @typedef {object} Event
 * @property {string} name - The name of the event
 * @property {string} type - The type of the event
 * @property {object} [website] - The website of the event
 * @property {string} [website.url] - The url of the website
 */

/**
 * Get the token from the script tag
 *
 * @returns {string} The token that is set on the script tag
 */
const getToken = () => {
  // Extract the token from the script tag
  let token = ''
  const scripts = document.getElementsByTagName('script')
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src.includes('green-analytics.js')) {
      token = scripts[i].getAttribute('data-token')
      break
    }
  }

  if (!token) {
    throw new Error('data-token needs to be set on the script tag')
  }

  return token
}

const getCookie = (name) => {
  for (let cookie of document.cookie.split(';')) {
    cookie = cookie.trim()
    if (cookie.startsWith(name)) {
      return cookie.split('=')[1]
    }
  }
}

/**
 * Helper function to extract browser from user agent
 */
const getBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.match(/chrome|chromium|crios/)) {
    return 'Chrome'
  } else if (userAgent.match(/firefox|fxios/)) {
    return 'Firefox'
  } else if (userAgent.match(/safari/)) {
    return 'Safari'
  } else if (userAgent.match(/opr\//)) {
    return 'Opera'
  } else if (userAgent.match(/edg/)) {
    return 'Edge'
  } else {
    return 'Other'
  }
}

const getOS = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.match(/windows/)) {
    return 'Windows'
  } else if (userAgent.match(/macintosh/)) {
    return 'Mac'
  } else if (userAgent.match(/linux/) || userAgent.match(/x11/)) {
    return 'Linux'
  } else if (userAgent.match(/iphone/)) {
    return 'iOS'
  } else if (userAgent.match(/android/)) {
    return 'Android'
  } else {
    return 'Other'
  }
}

const getMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.match(/mobile/)) {
    return true
  } else {
    return false
  }
}

/**
 * Initialize the analytics framework
 *
 * @returns {Promise<void>} A promise that resolves when the framework is initialized
 */
const initGA = async () => {
  // Check if doNotTrack is enabled, if so cancel the script
  if (navigator.doNotTrack === '1') {
    return
  }

  // Send the pageview event
  const event = {
    name: document.title,
    type: 'pageview',

    website: {
      url: window.location.origin,
    },

    properties: {
      path: window.location.pathname,
      referrer: document.referrer,
    },
  }

  const userProperties = {
    browser: getBrowser(),
    os: getOS(),
    mobile: getMobile(),

    // Get the screen size
    width: window.innerWidth,
    height: window.innerHeight,

    // Get the timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Get the language
    language: navigator.language,

    // Get the user agent
    userAgent: navigator.userAgent,
  }

  await logEvent(event, userProperties)
}

const getSessionId = () => {
  let sessionId
  if (navigator.cookieEnabled) {
    sessionId = getCookie('green-analytics-session-id')
  }
  if (!sessionId) {
    // Check if the person is already set
    sessionId = sessionStorage.getItem('green-analytics-session-id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      if (navigator.cookieEnabled) {
        document.cookie = `green-analytics-session-id=${sessionId}`
      } else {
        sessionStorage.setItem('green-analytics-session-id', sessionId)
      }
    }
  }

  return sessionId
}

/**
 * Set the person that is currently using the website
 *
 * @param {Person} person
 * @returns {Promise<void>} A promise that resolves when the person is set
 */
const setPerson = async (person) => {
  const token = getToken()

  // The only required information is a id
  if (!person.id) {
    throw new Error('person.id is required')
  }

  // Check if the person is already set
  if (sessionStorage.getItem('green-analytics-person-id') === person.id) {
    return
  }

  // Store the person id in the sessionStorage to make identifying easier
  if (navigator.cookieEnabled) {
    document.cookie = `green-analytics-person-id=${person.id}`
  } else {
    sessionStorage.setItem('green-analytics-person-id', person.id)
  }

  const sessionId = getSessionId()

  // Send the person to the server
  await fetch('https://green-analytics.com/api/database/events/setPerson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      // Add the token to the header
      API_KEY: token,
    },
    body: JSON.stringify({ person, sessionId }),
  })
}

/**
 * Log an event
 *
 * @param {Event} event The event that is being logged
 * @param {ArrayLike<Property>} properties The properties of the user using this event
 * @returns {Promise<void>} A promise that resolves when the event is logged
 */
const logEvent = async (event, userProperties) => {
  if (navigator.doNotTrack === '1') {
    return
  }

  const token = getToken()

  const sessionId = getSessionId()
  let personId
  if (navigator.cookieEnabled) {
    personId = getCookie('green-analytics-person-id')
  }
  if (!personId) {
    // If a person id is set sent it with the request
    personId = sessionStorage.getItem('green-analytics-person-id')
  }

  // Send the event to the server
  await fetch('https://green-analytics.com/api/database/events/logEvent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      // Add the token to the header
      API_TOKEN: token,
    },
    body: JSON.stringify({ event, userProperties, sessionId, personId }),
  })
}

// Path: public/green-analytics.js
initGA()
