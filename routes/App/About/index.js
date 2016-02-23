import React from 'react'
import {getContent, setContentSchema} from '../../../modules/client/core'

const About = ({location, rootContent}) => {
  const route = location.pathname
  setContentSchema(route, rootContent, {
    heading: 'About heading!!',
    title: 'About title'
  })
  const content = getContent(route, rootContent)

  return (
    <div className="container">
      <h1>{content.heading}</h1>
      <p>{content.title}</p>
    </div>
  )
}

export default About
