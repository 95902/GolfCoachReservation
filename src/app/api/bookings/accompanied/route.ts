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
      experience,
      preferredDate,
      duration,
      message,
      numberOfPlayers
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or find customer
    let customer = await db.customer.findUnique({
      where: { email }
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          firstName,
          lastName,
          email,
          phone
        }
      })
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        customerId: customer.id,
        type: 'ACCOMPANIED',
        status: 'PENDING',
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        experienceLevel: experience || null,
        numberOfPlayers: parseInt(numberOfPlayers) || 1,
        message: message || '',
        emailConfirmation: true,
        smsReminder: false
      }
    })

    // TODO: Send notification to coach about new accompanied booking request
    // TODO: Send confirmation email to customer

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Accompanied booking request created successfully'
    })

  } catch (error) {
    console.error('Error creating accompanied booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}