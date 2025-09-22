import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const body = await request.json()
    const {
      bookingDate,
      duration,
      price,
      preferredDate,
      experienceLevel,
      numberOfPlayers
    } = body

    // Build update data dynamically
    const updateData: any = {}
    
    if (bookingDate !== undefined) {
      updateData.bookingDate = bookingDate ? new Date(bookingDate) : null
    }
    
    if (duration !== undefined) {
      updateData.duration = duration ? parseInt(duration) : null
    }
    
    if (price !== undefined) {
      updateData.price = price ? parseFloat(price) : null
    }
    
    if (preferredDate !== undefined) {
      updateData.preferredDate = preferredDate ? new Date(preferredDate) : null
    }
    
    if (experienceLevel !== undefined) {
      updateData.experienceLevel = experienceLevel || null
    }
    
    if (numberOfPlayers !== undefined) {
      updateData.numberOfPlayers = numberOfPlayers ? parseInt(numberOfPlayers) : null
    }

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    // First, delete associated time slots
    await db.timeSlot.deleteMany({
      where: { bookingId: bookingId }
    })

    // Then delete the booking
    await db.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}