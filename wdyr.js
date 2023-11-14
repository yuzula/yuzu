import React from 'react'

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    // Set this to true for the re-render logs to appear
    trackAllPureComponents: false
  })
}
