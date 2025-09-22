import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // First, free up the time slots
    await db.timeSlot.updateMany({
      where: { bookingId: bookingId },
      data: { isBooked: false, bookingId: null }
    })

    // Then update the booking status
    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}