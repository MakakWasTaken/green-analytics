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

const init = () => {
  // Check if doNotTrack is enabled, if so cancel the script
  if (navigator.doNotTrack === '1') {
    return
  }

  const scripts = document.getElementsByTagName('script')

  // Get all scripts that are not green-analytics.js
  let otherScripts = []
  for (let i = 0; i < scripts.length; i++) {
    if (
      scripts[i].src.startsWith('http') &&
      !scripts[i].src.includes('green-analytics.js')
    ) {
      const url = new URL(scripts[i].src)
      otherScripts.push(url.origin)
    }
  }

  // Remove duplicates from otherScripts
  otherScripts = otherScripts.filter(
    (value, index, self) => self.indexOf(value) === index,
  )

  // Send the pageview event
  const event = {
    name: document.title,
    type: 'pageview',

    website: {
      url: window.location.origin,
    },
    properties: {
      referrer: document.referrer,
      // Add available information about the person agent
      language: navigator.language,
      personAgent: navigator.personAgent,

      urls: otherScripts,
    },
  }

  logEvent(event)
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

const setPerson = (person) => {
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
  fetch('/api/database/events/setPerson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      // Add the token to the header
      API_KEY: token,
    },
    body: JSON.stringify({ person, sessionId }),
  })
}

const logEvent = (event) => {
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
  fetch('/api/database/events/logEvent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      // Add the token to the header
      API_TOKEN: token,
    },
    body: JSON.stringify({ event, sessionId, personId }),
  })
}

// Path: public/green-analytics.js
init()
