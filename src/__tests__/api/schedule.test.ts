import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('/api/schedule', () => {
  beforeEach(() => {
    // Reset any mocks or state
  })

  afterEach(() => {
    // Cleanup
  })

  it('should return 401 for unauthenticated requests', async () => {
    const response = await fetch('http://localhost:3000/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        timeSlots: []
      })
    })

    expect(response.status).toBe(401)
  })

  it('should return 200 for GET requests (even without auth for now)', async () => {
    const response = await fetch('http://localhost:3000/api/schedule')
    
    expect(response.status).toBe(200)
  })
})
