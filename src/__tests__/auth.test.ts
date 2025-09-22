import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { authOptions } from '@/lib/auth/config'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const mockDb = db as jest.Mocked<typeof db>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Admin Login', () => {
    it('should authenticate admin with correct credentials', async () => {
      const credentials = {
        email: 'admin@golfindoor.fr',
        password: 'admin123',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toEqual({
          id: 'admin',
          email: 'admin@golfindoor.fr',
          name: 'Administrateur',
          role: 'ADMIN',
        })
      }
    })

    it('should reject admin with incorrect password', async () => {
      const credentials = {
        email: 'admin@golfindoor.fr',
        password: 'wrongpassword',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toBeNull()
      }
    })
  })

  describe('Coach Login', () => {
    it('should authenticate coach with correct credentials', async () => {
      const credentials = {
        email: 'coach@golfindoor.fr',
        password: 'coach123',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toEqual({
          id: 'coach',
          email: 'coach@golfindoor.fr',
          name: 'Coach',
          role: 'COACH',
        })
      }
    })
  })

  describe('User Login', () => {
    it('should authenticate user with correct credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'USER',
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)

      const credentials = {
        email: 'user@example.com',
        password: 'password123',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toEqual({
          id: 'user123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'USER',
        })
        expect(mockDb.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'user@example.com' },
        })
        expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword')
      }
    })

    it('should reject user with incorrect password', async () => {
      const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'USER',
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)

      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toBeNull()
      }
    })

    it('should reject non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)

      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toBeNull()
      }
    })
  })

  describe('Invalid Credentials', () => {
    it('should reject empty credentials', async () => {
      const credentials = {
        email: '',
        password: '',
      }

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toBeNull()
      }
    })

    it('should reject null credentials', async () => {
      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(null)

        expect(result).toBeNull()
      }
    })
  })
})
