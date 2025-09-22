import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      include: {
        customer: true,
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
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}