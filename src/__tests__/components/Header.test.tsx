import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '@/components/Header'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

describe('Header Component', () => {
  it('should render without crashing', () => {
    render(<Header />)
    
    // Check if the component renders
    expect(screen.getByRole('banner')).toBeDefined()
  })

  it('should display the logo', () => {
    render(<Header />)
    
    // Check if logo is present (assuming it has alt text or is an image)
    const logo = screen.getByAltText('Golf Indoor') || screen.getByText('Golf Indoor')
    expect(logo).toBeDefined()
  })

  it('should have navigation links', () => {
    render(<Header />)
    
    // Check for common navigation elements
    const nav = screen.getByRole('navigation')
    expect(nav).toBeDefined()
  })

  it('should show sign in button when not authenticated', () => {
    render(<Header />)
    
    // Look for sign in button or link
    const signInButton = screen.queryByText(/sign in|connexion/i)
    expect(signInButton).toBeDefined()
  })
})
