'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import SwaggerUI dynamically to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement de la documentation API...</p>
      </div>
    </div>
  )
}) as any

export default function ApiDocs() {
  const [swaggerSpec, setSwaggerSpec] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load the Swagger spec from the API
    fetch('/api/swagger')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        setSwaggerSpec(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error loading Swagger spec:', error)
        setError(error.message)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la documentation API...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur de chargement</div>
          <p className="text-gray-600">Impossible de charger la documentation API</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!swaggerSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Aucune spécification API trouvée</div>
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
