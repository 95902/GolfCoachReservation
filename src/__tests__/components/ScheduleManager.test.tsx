import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ScheduleManager from '@/components/ScheduleManager'

// Mock fetch
global.fetch = jest.fn()

// Mock window.alert
global.alert = jest.fn()

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
    return '/admin'
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: {
        user: {
          id: 'admin',
          email: 'admin@golfindoor.fr',
          name: 'Administrateur',
          role: 'ADMIN',
        },
      },
      status: 'authenticated',
    }
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

describe('ScheduleManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          weekNumber: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-07',
          timeSlots: []
        },
        {
          weekNumber: 2,
          startDate: '2024-01-08',
          endDate: '2024-01-14',
          timeSlots: []
        }
      ]
    })
  })

  it('should render without crashing', async () => {
    render(<ScheduleManager />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Gestion des Plannings')).toBeInTheDocument()
    })
  })

  it('should display week selector', async () => {
    render(<ScheduleManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Semaine 1')).toBeInTheDocument()
    })
  })

  it('should have date inputs', async () => {
    render(<ScheduleManager />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Date de début')).toBeInTheDocument()
      expect(screen.getByLabelText('Date de fin')).toBeInTheDocument()
    })
  })

  it('should call API when saving schedule', async () => {
    render(<ScheduleManager />)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Enregistrer le planning')
      fireEvent.click(saveButton)
    })

    // Check if fetch was called
    expect(fetch).toHaveBeenCalledWith('/api/schedule', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }))
  })

  it('should call API when saving schedule', async () => {
    render(<ScheduleManager />)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Enregistrer le planning')
      fireEvent.click(saveButton)
    })

    // Check if fetch was called
    expect(fetch).toHaveBeenCalledWith('/api/schedule', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }))
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<ScheduleManager />)
    
    await waitFor(() => {
      const saveButton = screen.getByText('Enregistrer le planning')
      fireEvent.click(saveButton)
    })

    // Should not crash and should handle error
    await waitFor(() => {
      // Check if error message is displayed or component still renders
      expect(screen.getByText('Gestion des Plannings')).toBeInTheDocument()
    })
  })
})
