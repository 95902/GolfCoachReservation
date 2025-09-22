'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
  const [swaggerSpec, setSwaggerSpec] = useState(null)

  useEffect(() => {
    // Load the Swagger spec from the API
    fetch('/api/swagger')
      .then(response => response.json())
      .then(data => setSwaggerSpec(data))
      .catch(error => console.error('Error loading Swagger spec:', error))
  }, [])

  if (!swaggerSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la documentation API...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Documentation API - Golf Coach Reservation</h1>
        <p className="text-blue-100">Documentation interactive de l'API REST</p>
      </div>
      <div className="p-4">
        <SwaggerUI 
          spec={swaggerSpec} 
          docExpansion="list"
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
        />
      </div>
    </div>
  )
}
