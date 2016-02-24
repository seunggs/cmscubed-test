import React from 'react'
import {getContent, setContentSchema} from '../../../modules/client/core'

const Home = ({location, rootContent}) => {
  console.log('route: ', location.pathname)
  console.log('rootContent: ', rootContent)
  const route = location.pathname
  setContentSchema(route, rootContent, {
    heading: 'Home heading!!',
    title: 'Home title',
    list: ['List item 1', 'List item 2', 'List item 3']
  })
  const content = getContent(route, rootContent)
  console.log('content: ', content)

  const contentList = content.list.map((item, index) => {
    return <li key={index}>{item}</li>
  })

  return (
    <div className="container">
      <h1>{content.heading}</h1>
      <p>{content.title}</p>
      <ul>{contentList}</ul>
    </div>
  )
}

export default Home
