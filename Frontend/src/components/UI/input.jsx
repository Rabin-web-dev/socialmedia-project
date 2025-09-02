  import React from 'react'
  
  const input = ({ type = "text", placeholder, value, onChange, name }) => {
    return (
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    )
  }
  
  export default input