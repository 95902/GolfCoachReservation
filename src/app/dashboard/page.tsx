"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, MapPin, Mail, Phone, User, LogOut, Eye, XCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  type: 'INDOOR' | 'ACCOMPANIED'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  bookingDate?: string
  duration?: number
  price?: number
  preferredDate?: string
  experienceLevel?: string
  numberOfPlayers?: number
  message?: string
  emailConfirmation: boolean
  smsReminder: boolean
  createdAt: string
  timeSlots?: Array<{
    id: string
    startTime: string
    endTime: string
    date: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchUserBookings()
    }
  }, [status, router])

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(`/api/bookings/user/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      })

      if (response.ok) {
        await fetchUserBookings()
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">En attente</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-green-600">Confirmé</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Annulé</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-600">Terminé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'INDOOR':
        return <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />Indoor</Badge>
      case 'ACCOMPANIED':
        return <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />Accompagné</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-600">
              Golf Indoor TrackMan 4
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm text-gray-600">
                  {session?.user?.name}
                </span>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Mon Espace</h1>
          <p className="text-gray-600">Gérez vos réservations et vos informations personnelles</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Nouvelle réservation
              </CardTitle>
              <CardDescription>
                Réservez un cours indoor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/booking/indoor">
                  Réserver Indoor
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Parcours accompagné
              </CardTitle>
              <CardDescription>
                Réservez un coaching sur terrain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/booking/accompanied">
                  Nous contacter
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Mon profil
              </CardTitle>
              <CardDescription>
                {session?.user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Modifier mon profil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Mes réservations ({bookings.length})</CardTitle>
            <CardDescription>
              Historique de toutes vos réservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {getTypeBadge(booking.type)}
                      </TableCell>
                      <TableCell>
                        {booking.bookingDate ? (
                          new Date(booking.bookingDate).toLocaleDateString('fr-FR')
                        ) : booking.preferredDate ? (
                          <span className="text-sm text-gray-500">
                            {new Date(booking.preferredDate).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">À définir</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.duration ? `${booking.duration} min` : booking.numberOfPlayers ? `${booking.numberOfPlayers} joueurs` : '-'}
                      </TableCell>
                      <TableCell>
                        {booking.price ? `${booking.price}€` : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de la réservation</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                                      <p>{selectedBooking.type}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Statut</Label>
                                      <p>{getStatusBadge(selectedBooking.status)}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedBooking.bookingDate && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Date de réservation</Label>
                                      <p>{new Date(selectedBooking.bookingDate).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                  )}
                                  
                                  {selectedBooking.preferredDate && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Date souhaitée</Label>
                                      <p>{new Date(selectedBooking.preferredDate).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                  )}
                                  
                                  {selectedBooking.duration && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Durée</Label>
                                      <p>{selectedBooking.duration} minutes</p>
                                    </div>
                                  )}
                                  
                                  {selectedBooking.price && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Prix</Label>
                                      <p>{selectedBooking.price}€</p>
                                    </div>
                                  )}
                                  
                                  {selectedBooking.message && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Message</Label>
                                      <p className="mt-1">{selectedBooking.message}</p>
                                    </div>
                                  )}
                                  
                                  {selectedBooking.timeSlots && selectedBooking.timeSlots.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-500">Créneaux horaires</Label>
                                      <div className="mt-1 space-y-1">
                                        {selectedBooking.timeSlots.map((slot) => (
                                          <Badge key={slot.id} variant="outline">
                                            {slot.startTime} - {slot.endTime}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => cancelBooking(booking.id)}>
                                    Confirmer l'annulation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Vous n'avez aucune réservation pour le moment.
                <br />
                <Link href="/booking/indoor" className="text-green-600 hover:text-green-500">
                  Réservez votre premier cours
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}