"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Calendar, Clock, Users, MessageSquare } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"

export default function AccompaniedBookingPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    preferredDate: "",
    duration: "",
    message: "",
    numberOfPlayers: "1"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log("Contact form submitted:", formData)
    alert("Merci pour votre demande! Nous vous contacterons dans les plus brefs délais pour confirmer votre réservation.")
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      experience: "",
      preferredDate: "",
      duration: "",
      message: "",
      numberOfPlayers: "1"
    })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Réserver un parcours accompagné
          </h1>
          <p className="text-lg text-gray-600">
            Profitez d'un coaching personnalisé sur un vrai parcours de golf
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Formulaire de contact
                </CardTitle>
                <CardDescription>
                  Remplissez ce formulaire et nous vous contacterons pour organiser votre parcours accompagné
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

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="experience">Niveau de jeu</Label>
                      <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Votre niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                          <SelectItem value="professional">Professionnel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="numberOfPlayers">Nombre de joueurs</Label>
                      <Select value={formData.numberOfPlayers} onValueChange={(value) => setFormData({...formData, numberOfPlayers: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 joueur</SelectItem>
                          <SelectItem value="2">2 joueurs</SelectItem>
                          <SelectItem value="3">3 joueurs</SelectItem>
                          <SelectItem value="4">4 joueurs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Durée souhaitée</Label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Durée" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 heure</SelectItem>
                          <SelectItem value="2">2 heures</SelectItem>
                          <SelectItem value="3">3 heures</SelectItem>
                          <SelectItem value="4">4 heures (9 trous)</SelectItem>
                          <SelectItem value="custom">Sur mesure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredDate">Date souhaitée (optionnel)</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez vos objectifs, vos disponibilités, ou toute autre information utile..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Parcours Accompagnés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Coaching personnalisé</h4>
                    <p className="text-sm text-gray-600">Accompagnement individuel ou en petit groupe</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Sur terrain réel</h4>
                    <p className="text-sm text-gray-600">Apprentissage dans des conditions réelles de jeu</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Flexibilité</h4>
                    <p className="text-sm text-gray-600">Horaires adaptés à vos disponibilités</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarifs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Tarif standard</span>
                  <span className="font-semibold">70€/h</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span>Tarif amical (dès la 2ème heure)</span>
                  <span className="font-semibold">60€/h</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <p>• Tarif dégressif pour les longues sessions</p>
                  <p>• Équipement non inclus</p>
                  <p>• Green fees non inclus</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact direct</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">contact@golfindoor.fr</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <p>Disponible du lundi au samedi</p>
                  <p>9h00 - 18h00</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}