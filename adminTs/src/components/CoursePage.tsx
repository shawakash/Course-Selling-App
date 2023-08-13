import React from 'react'
import { useParams } from 'react-router-dom'

const CoursePage: React.FC = () => {
    const {slug} = useParams();
  return (
    <div>CoursePage: {slug}</div>
  )
}

export default CoursePage