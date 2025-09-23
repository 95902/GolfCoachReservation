import { describe, it, expect } from '@jest/globals'

describe.skip('/api/health', () => {
  it('should return 200 and success message', async () => {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Good!' })
  })
})
