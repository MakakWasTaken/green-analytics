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

const init = () => {
  // Check if doNotTrack is enabled, if so cancel the script
  if (navigator.doNotTrack === '1') {
    return
  }

  const scripts = document.getElementsByTagName('script')

  // Get all scripts that are not green-analytics.js
  const otherScripts = []
  for (let i = 0; i < scripts.length; i++) {
    if (!scripts[i].src.includes('green-analytics.js')) {
      otherScripts.push(scripts[i].src)
    }
  }

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

// Intercept all fetches
const { fetch: originalFetch } = window

window.fetch = async (...args) => {
  const [resource, config] = args
  // request interceptor here
  const response = await originalFetch(resource, config)

  // Log the request if it is not a request to the green-analytics server
  if (!resource.includes('green-analytics.com')) {
    const event = {
      name: resource,
      type: 'request',
      website: {
        url: window.location.origin,
      },
      properties: {
        method: config.method,
        status: response.status,
        url: resource,

        // size: Add the size of the response
        // duration: Add the duration of the request
      },
    }

    // Might need to consider batching the requests (To decrease emissions)
    logEvent(event)
  }

  return response
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
  sessionStorage.setItem('green-analytics-person-id', person.id)

  let sessionId = sessionStorage.getItem('green-analytics-session-id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('green-analytics-session-id', sessionId)
  }

  // Send the person to the server
  fetch('https://green-analytics.com/api/database/events/setPerson', {
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

  let sessionId = sessionStorage.getItem('green-analytics-session-id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('green-analytics-session-id', sessionId)
  }

  // Send the event to the server
  fetch('https://green-analytics.com/api/database/events/logEvent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      // Add the token to the header
      API_KEY: token,
    },
    body: JSON.stringify({ event, sessionId }),
  })
}

// Path: public/green-analytics.js
init()
