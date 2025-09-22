"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ScheduleManager from "@/components/ScheduleManager"

interface Booking {
  id: string
  type: 'INDOOR' | 'ACCOMPANIED'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  date: string
  timeSlots: string[]
  duration: number
  price: number
  user: {
    name: string
    email: string
    phone: string
  }
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session.user?.role !== "ADMIN" && session.user?.role !== "COACH") {
      router.push("/")
      return
    }

    fetchBookings()
  }, [status, session, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/admin')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBookings()
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "secondary",
      CONFIRMED: "default",
      CANCELLED: "destructive"
    } as const

    const labels = {
      PENDING: "En attente",
      CONFIRMED: "Confirmé",
      CANCELLED: "Annulé"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-green-600">
                Administration
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Bienvenue, {session?.user?.name}
              </span>
              <Badge variant="outline">
                {session?.user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Réservations
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Plannings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total</p>
                        <p className="text-2xl font-bold">{bookings.length}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">En attente</p>
                        <p className="text-2xl font-bold">
                          {bookings.filter(b => b.status === 'PENDING').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Confirmés</p>
                        <p className="text-2xl font-bold">
                          {bookings.filter(b => b.status === 'CONFIRMED').length}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Annulés</p>
                        <p className="text-2xl font-bold">
                          {bookings.filter(b => b.status === 'CANCELLED').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bookings List */}
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les réservations</CardTitle>
                  <CardDescription>
                    Gérez toutes les réservations du système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucune réservation trouvée
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                {getStatusBadge(booking.status)}
                                <Badge variant="outline">
                                  {booking.type === 'INDOOR' ? 'Indoor' : 'Accompagné'}
                                </Badge>
                              </div>
                              <div>
                                <h3 className="font-medium">{booking.user.name}</h3>
                                <p className="text-sm text-gray-600">{booking.user.email}</p>
                                <p className="text-sm text-gray-600">{booking.user.phone}</p>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <p className="font-medium">{booking.price}€</p>
                              <p className="text-sm text-gray-600">{booking.duration} minutes</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              {new Date(booking.date).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-gray-600">
                              {booking.timeSlots.join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t">
                            {booking.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                >
                                  Confirmer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                >
                                  Annuler
                                </Button>
                              </>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                              >
                                Annuler
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBooking(booking.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}