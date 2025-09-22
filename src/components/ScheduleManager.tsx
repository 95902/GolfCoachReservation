"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  dayOfWeek: string
}

interface WeekSchedule {
  weekNumber: number
  startDate: string
  endDate: string
  timeSlots: TimeSlot[]
}

export default function ScheduleManager() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [weekSchedules, setWeekSchedules] = useState<WeekSchedule[]>([
    {
      weekNumber: 1,
      startDate: "",
      endDate: "",
      timeSlots: []
    },
    {
      weekNumber: 2,
      startDate: "",
      endDate: "",
      timeSlots: []
    }
  ])

  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  })

  const daysOfWeek = [
    { value: "1", label: "Lundi" },
    { value: "2", label: "Mardi" },
    { value: "3", label: "Mercredi" },
    { value: "4", label: "Jeudi" },
    { value: "5", label: "Vendredi" },
    { value: "6", label: "Samedi" },
    { value: "0", label: "Dimanche" }
  ]

  const timeOptions: string[] = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeOptions.push(time)
    }
  }

  const addTimeSlot = () => {
    if (!newTimeSlot.dayOfWeek || !newTimeSlot.startTime || !newTimeSlot.endTime) {
      alert("Veuillez remplir tous les champs")
      return
    }

    if (newTimeSlot.startTime >= newTimeSlot.endTime) {
      alert("L'heure de début doit être avant l'heure de fin")
      return
    }

    const schedule = weekSchedules.find(s => s.weekNumber === selectedWeek)
    if (schedule) {
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        dayOfWeek: newTimeSlot.dayOfWeek,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime
      }

      setWeekSchedules(prev => prev.map(s => 
        s.weekNumber === selectedWeek 
          ? { ...s, timeSlots: [...s.timeSlots, newSlot] }
          : s
      ))

      setNewTimeSlot({ dayOfWeek: "", startTime: "", endTime: "" })
    }
  }

  const removeTimeSlot = (slotId: string) => {
    setWeekSchedules(prev => prev.map(s => 
      s.weekNumber === selectedWeek 
        ? { ...s, timeSlots: s.timeSlots.filter(slot => slot.id !== slotId) }
        : s
    ))
  }

  const updateWeekDates = (field: 'startDate' | 'endDate', value: string) => {
    setWeekSchedules(prev => prev.map(s => 
      s.weekNumber === selectedWeek 
        ? { ...s, [field]: value }
        : s
    ))
  }

  const saveSchedule = async () => {
    const schedule = weekSchedules.find(s => s.weekNumber === selectedWeek)
    if (!schedule) return

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
      })

      if (response.ok) {
        alert("Planning enregistré avec succès!")
      } else {
        alert("Erreur lors de l'enregistrement du planning")
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert("Erreur lors de l'enregistrement du planning")
    }
  }

  const currentSchedule = weekSchedules.find(s => s.weekNumber === selectedWeek)

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestion des Plannings
          </CardTitle>
          <CardDescription>
            Configurez les disponibilités pour chaque semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Label>Semaine :</Label>
            <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semaine 1</SelectItem>
                <SelectItem value="2">Semaine 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Week Date Range */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={currentSchedule?.startDate || ""}
                onChange={(e) => updateWeekDates('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={currentSchedule?.endDate || ""}
                onChange={(e) => updateWeekDates('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Time Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter une plage horaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Jour</Label>
              <Select value={newTimeSlot.dayOfWeek} onValueChange={(value) => setNewTimeSlot({...newTimeSlot, dayOfWeek: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Jour" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Heure de début</Label>
              <Select value={newTimeSlot.startTime} onValueChange={(value) => setNewTimeSlot({...newTimeSlot, startTime: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Début" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Heure de fin</Label>
              <Select value={newTimeSlot.endTime} onValueChange={(value) => setNewTimeSlot({...newTimeSlot, endTime: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Fin" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addTimeSlot} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Plages horaires - Semaine {selectedWeek}
          </CardTitle>
          <CardDescription>
            {currentSchedule?.startDate && currentSchedule?.endDate 
              ? `Du ${new Date(currentSchedule.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentSchedule.endDate).toLocaleDateString('fr-FR')}`
              : "Dates non définies"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSchedule?.timeSlots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune plage horaire définie pour cette semaine
            </p>
          ) : (
            <div className="space-y-3">
              {currentSchedule?.timeSlots.map((slot) => {
                const dayLabel = daysOfWeek.find(d => d.value === slot.dayOfWeek)?.label || slot.dayOfWeek
                return (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{dayLabel}</Badge>
                      <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button onClick={saveSchedule} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Enregistrer le planning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}