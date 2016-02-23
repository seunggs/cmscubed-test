import React from 'react'
import {getContent, setContentSchema} from '../../../../modules/client/core'

const Pro = ({location, rootContent}) => {
  const route = location.pathname
  setContentSchema(route, rootContent, {
    heading: 'Pro heading!!',
    title: 'Pro title'
  })
  const content = getContent(route, rootContent)
  console.log('content: ', content)

  return (
    <div className="container">
      <h1>{content.heading}</h1>
      <p>{content.title}</p>
    </div>
  )
}

export default Pro
