import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Find customer by user ID
    const customer = await db.customer.findFirst({
      where: { userId: userId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get all bookings for this customer
    const bookings = await db.booking.findMany({
      where: { customerId: customer.id },
      include: {
        timeSlots: {
          orderBy: {
            startTime: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      bookings: bookings.map(booking => ({
        ...booking,
        bookingDate: booking.bookingDate?.toISOString(),
        preferredDate: booking.preferredDate?.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        timeSlots: booking.timeSlots.map(slot => ({
          ...slot,
          date: slot.date.toISOString()
        }))
      }))
    })

  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}