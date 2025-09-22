import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock NextAuth
jest.mock('next-auth', () => ({
  NextAuth: jest.fn(() => ({
    handlers: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}))

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

import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const mockDb = db as jest.Mocked<typeof db>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('NextAuth.js Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Auth Options', () => {
    it('should have correct configuration structure', () => {
      expect(authOptions).toHaveProperty('providers')
      expect(authOptions).toHaveProperty('session')
      expect(authOptions).toHaveProperty('callbacks')
      expect(authOptions).toHaveProperty('pages')
      expect(authOptions).toHaveProperty('secret')
    })

    it('should have credentials provider configured', () => {
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0]).toHaveProperty('id', 'credentials')
      expect(authOptions.providers[0]).toHaveProperty('name', 'credentials')
    })

    it('should have JWT session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should have sign in page configured', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin')
    })
  })

  describe('Credentials Provider', () => {
    it('should validate admin credentials', async () => {
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

    it('should validate coach credentials', async () => {
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

    it('should validate user credentials from database', async () => {
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

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }

      mockDb.user.findUnique.mockResolvedValue(null)

      const provider = authOptions.providers[0]
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize(credentials)

        expect(result).toBeNull()
      }
    })

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
  })

  describe('JWT Callback', () => {
    it('should add role to token', async () => {
      const token = { sub: 'user123' }
      const user = { id: 'user123', role: 'ADMIN' }

      const result = await authOptions.callbacks?.jwt?.({ token, user })

      expect(result).toEqual({
        sub: 'user123',
        role: 'ADMIN',
      })
    })

    it('should preserve existing token properties', async () => {
      const token = { sub: 'user123', role: 'USER' }
      const user = undefined

      const result = await authOptions.callbacks?.jwt?.({ token, user })

      expect(result).toEqual({
        sub: 'user123',
        role: 'USER',
      })
    })
  })

  describe('Session Callback', () => {
    it('should add user data to session', async () => {
      const session = { user: {} }
      const token = { sub: 'user123', role: 'ADMIN' }

      const result = await authOptions.callbacks?.session?.({ session, token })

      expect(result).toEqual({
        user: {
          id: 'user123',
          role: 'ADMIN',
        },
      })
    })

    it('should handle missing token', async () => {
      const session = { user: {} }
      const token = null

      const result = await authOptions.callbacks?.session?.({ session, token })

      expect(result).toEqual({
        user: {},
      })
    })
  })
})
