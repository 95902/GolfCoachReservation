import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      selectedDate,
      selectedSlots,
      message,
      emailConfirmation,
      smsReminder,
      userId
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !selectedDate || !selectedSlots || selectedSlots.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate duration and price
    const duration = selectedSlots.length * 30 // minutes
    let price = 0
    if (duration === 30) price = 35
    else if (duration === 60) price = 70
    else if (duration === 90) price = 100
    else if (duration === 120) price = 130

    // Create or find customer
    let customer = await db.customer.findUnique({
      where: { email }
    })

    if (!customer) {
      // If user is logged in, link customer to user
      const customerData: any = {
        firstName,
        lastName,
        email,
        phone
      }

      if (userId) {
        customerData.userId = userId
      }

      customer = await db.customer.create({
        data: customerData
      })
    } else if (userId && !customer.userId) {
      // Link existing customer to user if not already linked
      customer = await db.customer.update({
        where: { id: customer.id },
        data: { userId: userId }
      })
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        customerId: customer.id,
        type: 'INDOOR',
        status: 'PENDING',
        bookingDate: new Date(selectedDate),
        duration,
        price,
        message: message || '',
        emailConfirmation: emailConfirmation ?? true,
        smsReminder: smsReminder ?? false
      }
    })

    // Create time slots
    const timeSlotPromises = selectedSlots.map(async (slot: string) => {
      const [hours, minutes] = slot.split(':').map(Number)
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(hours, minutes, 0, 0)
      
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + 30)

      return db.timeSlot.create({
        data: {
          date: startDateTime,
          startTime: slot,
          endTime: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`,
          isBooked: true,
          bookingId: booking.id
        }
      })
    })

    await Promise.all(timeSlotPromises)

    // TODO: Send confirmation email (would integrate with email service)
    // TODO: Send SMS reminder if requested (would integrate with SMS service)

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully'
    })

  } catch (error) {
    console.error('Error creating indoor booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const targetDate = new Date(date)
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    // Get all time slots for the specified date
    const timeSlots = await db.timeSlot.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({
      timeSlots,
      date: date
    })

  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}