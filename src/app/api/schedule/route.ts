import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('Schedule API called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { weekNumber, startDate, endDate, timeSlots } = body
    
    // Validate input
    if (!weekNumber || !startDate || !endDate) {
      console.log('Missing required fields:', { weekNumber, startDate, endDate })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Creating schedule for week:', weekNumber)
    
    // Simple test - just return success for now
    return NextResponse.json({ 
      message: 'Schedule saved successfully (test mode)',
      weekNumber,
      startDate,
      endDate,
      timeSlots: timeSlots || []
    })
    
  } catch (error) {
    console.error('Error saving schedule:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schedules = await db.weeklySchedule.findMany({
      include: {
        scheduleSlots: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        }
      },
      orderBy: {
        weekNumber: 'asc'
      }
    })
    
    // Format the response to match the expected structure
    const formattedSchedules = schedules.map(schedule => ({
      weekNumber: schedule.weekNumber,
      startDate: schedule.startDate.toISOString().split('T')[0],
      endDate: schedule.endDate.toISOString().split('T')[0],
      timeSlots: schedule.scheduleSlots.map(slot => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek.toString(),
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    }))
    
    // Ensure we have both week 1 and week 2
    const result: Array<{
      weekNumber: number;
      startDate: string;
      endDate: string;
      timeSlots: Array<{
        id: string;
        dayOfWeek: string;
        startTime: string;
        endTime: string;
      }>;
    }> = []
    for (let week = 1; week <= 2; week++) {
      const existing = formattedSchedules.find(s => s.weekNumber === week)
      if (existing) {
        result.push(existing)
      } else {
        result.push({
          weekNumber: week,
          startDate: '',
          endDate: '',
          timeSlots: []
        })
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}