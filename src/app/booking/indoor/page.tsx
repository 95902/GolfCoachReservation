"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, Users, CreditCard, Mail, Phone, MessageSquare, User } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"

export default function IndoorBookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    emailConfirmation: true,
    smsReminder: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch schedules when component mounts
  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedule')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoadingSchedules(false)
    }
  }

  // If user is logged in, pre-fill the form
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: session.user.name?.split(' ')[0] || "",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
        email: session.user.email || ""
      }))
    }
  }, [session])

  // Get available time slots based on selected date and schedules
  const getAvailableTimeSlots = () => {
    if (!selectedDate || loadingSchedules) return []

    const dayOfWeek = selectedDate.getDay().toString()
    const availableSlots: string[] = []

    // Check each schedule to find available slots for the selected day
    schedules.forEach(schedule => {
      if (schedule.startDate && schedule.endDate) {
        const startDate = new Date(schedule.startDate)
        const endDate = new Date(schedule.endDate)
        
        // Check if selected date falls within this schedule's date range
        if (selectedDate >= startDate && selectedDate <= endDate) {
          // Find time slots for this day of the week
          schedule.timeSlots.forEach((slot: any) => {
            if (slot.dayOfWeek === dayOfWeek) {
              // Generate all 30-minute slots within the available time range
              const startHour = parseInt(slot.startTime.split(':')[0])
              const startMinute = parseInt(slot.startTime.split(':')[1])
              const endHour = parseInt(slot.endTime.split(':')[0])
              const endMinute = parseInt(slot.endTime.split(':')[1])

              let currentHour = startHour
              let currentMinute = startMinute

              while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
                const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
                availableSlots.push(timeSlot)

                // Add 30 minutes
                currentMinute += 30
                if (currentMinute >= 60) {
                  currentHour += 1
                  currentMinute = 0
                }
              }
            }
          })
        }
      }
    })

    // Remove duplicates and sort
    return [...new Set(availableSlots)].sort()
  }

  const availableTimeSlots = getAvailableTimeSlots()

  // Generate all possible time slots for display (fallback)
  const allTimeSlots: string[] = []
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      allTimeSlots.push(time)
    }
  }

  const handleSlotToggle = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot].sort()
    )
  }

  const calculateDuration = () => {
    return selectedSlots.length * 30 // minutes
  }

  const calculatePrice = () => {
    const duration = calculateDuration()
    if (duration === 30) return 35
    if (duration === 60) return 70
    if (duration === 90) return 100
    if (duration === 120) return 130
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings/indoor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedDate: selectedDate?.toISOString(),
          selectedSlots,
          userId: session?.user?.id // Include user ID if logged in
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Réservation envoyée avec succès! Vous recevrez une confirmation par email.")
        
        // Reset form
        setSelectedDate(undefined)
        setSelectedSlots([])
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
          emailConfirmation: true,
          smsReminder: false
        })

        // If user is logged in, redirect to dashboard
        if (session?.user) {
          router.push('/dashboard')
        }
      } else {
        alert(data.error || "Une erreur est survenue lors de la réservation")
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert("Une erreur est survenue lors de la réservation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Réserver un cours Indoor TrackMan 4
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez vos créneaux horaires et réservez votre séance d'entraînement
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Sélectionnez une date
                </CardTitle>
                <CardDescription>
                  Les disponibilités sont affichées pour le mois en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Créneaux disponibles
                    </h3>
                    {loadingSchedules ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Chargement des disponibilités...</p>
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">Aucun créneau disponible</p>
                        <p className="text-sm text-gray-400">
                          {selectedDate ? "Aucune disponibilité pour cette date" : "Veuillez sélectionner une date"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                        {allTimeSlots.map((slot) => {
                          const isAvailable = availableTimeSlots.includes(slot)
                          return (
                            <Button
                              key={slot}
                              variant={selectedSlots.includes(slot) ? "default" : isAvailable ? "outline" : "ghost"}
                              size="sm"
                              onClick={() => isAvailable && handleSlotToggle(slot)}
                              disabled={!selectedDate || !isAvailable}
                              className={`text-sm ${!isAvailable ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                              {slot}
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Résumé de la réservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedDate.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                {selectedSlots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Créneaux sélectionnés:</span>
                    </div>
                    <div className="space-y-1">
                      {selectedSlots.map((slot) => (
                        <Badge key={slot} variant="secondary" className="text-xs">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {calculateDuration() > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Durée totale:</span>
                      <span className="font-medium">{calculateDuration()} minutes</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600">{calculatePrice()}€</span>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Informations importantes:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Créneaux minimum: 30 minutes</li>
                        <li>• Annulation 24h à l'avance</li>
                        <li>• Équipement fourni sur place</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration Form */}
        {selectedDate && selectedSlots.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Informations de réservation
              </CardTitle>
              <CardDescription>
                Veuillez remplir vos coordonnées pour finaliser la réservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    placeholder="Informations complémentaires, niveau de jeu, etc."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailConfirmation"
                      checked={formData.emailConfirmation}
                      onCheckedChange={(checked) => setFormData({...formData, emailConfirmation: checked as boolean})}
                    />
                    <Label htmlFor="emailConfirmation" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Recevoir un email de confirmation
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsReminder"
                      checked={formData.smsReminder}
                      onCheckedChange={(checked) => setFormData({...formData, smsReminder: checked as boolean})}
                    />
                    <Label htmlFor="smsReminder" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Recevoir un SMS de rappel avant le cours
                    </Label>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirmer la réservation
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setSelectedDate(undefined)
                    setSelectedSlots([])
                  }}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}