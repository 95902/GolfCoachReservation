import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Users, MapPin, Calendar, Star, Gift } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Nos Tarifs
          </h1>
          <p className="text-lg text-gray-600">
            Des tarifs transparents et adaptés à tous les niveaux de jeu
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Indoor Lessons Pricing */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 rounded-bl-lg">
              <Badge className="bg-green-600 hover:bg-green-700">Le plus populaire</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Calendar className="w-6 h-6 text-green-600" />
                Cours Indoor TrackMan 4
              </CardTitle>
              <CardDescription>
                Entraînement individuel avec technologie de pointe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">30 minutes</span>
                  </div>
                  <span className="text-xl font-bold">35€</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">1 heure</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">70€</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">1h30</span>
                  </div>
                  <span className="text-xl font-bold">100€</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">2 heures</span>
                  </div>
                  <span className="text-xl font-bold">130€</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Inclus dans le tarif :
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Analyse complète du swing avec TrackMan 4
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Accès aux données de performance en temps réel
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Équipement de golf mis à disposition
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Environnement climatisé et confortable
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Rapport détaillé après la séance
                  </li>
                </ul>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/booking/indoor">
                  Réserver un cours Indoor
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Accompanied Courses Pricing */}
          <Card className="relative overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <MapPin className="w-6 h-6 text-green-600" />
                Parcours Accompagnés
              </CardTitle>
              <CardDescription>
                Coaching sur terrain pour une expérience authentique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Tarif standard</span>
                  </div>
                  <span className="text-xl font-bold">70€/h</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Tarif amical</span>
                    <Badge className="bg-green-600">Dès la 2ème heure</Badge>
                  </div>
                  <span className="text-2xl font-bold text-green-600">60€/h</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Inclus dans le tarif :
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Coaching personnalisé sur parcours
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Analyse de votre jeu en conditions réelles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Conseils stratégiques et techniques
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Gestion mentale et préparation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Flexibilité d'horaire et de parcours
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Informations importantes :</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Les green fees ne sont pas inclus dans le tarif</li>
                  <li>• Tarif dégressif pour les sessions de 2h et plus</li>
                  <li>• Possibilité de coaching en groupe (sur devis)</li>
                </ul>
              </div>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/booking/accompanied">
                  Nous contacter
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Special Offers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Offres Spéciales</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Gift className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Pack Découverte</CardTitle>
                <CardDescription>Idéal pour débuter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">120€</div>
                <p className="text-sm text-gray-600 mb-4">2 heures de cours indoor + 1h parcours accompagné</p>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-green-200">
              <CardHeader>
                <Star className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Pack Performance</CardTitle>
                <CardDescription>Pour progresser rapidement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">350€</div>
                <p className="text-sm text-gray-600 mb-4">5 heures de cours indoor + 2h parcours accompagné</p>
                <Button className="w-full">En savoir plus</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Pack Duo</CardTitle>
                <CardDescription>À deux c'est mieux</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">100€/h</div>
                <p className="text-sm text-gray-600 mb-4">Cours indoor pour 2 personnes</p>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Moyens de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">Paiement sécurisé</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Carte bancaire (CB, Visa, Mastercard)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Virement bancaire
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Chèques vacances acceptés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Paiement sur place possible
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Conditions d'annulation</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Annulation gratuite jusqu'à 24h avant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    50% de remboursement entre 24h et 12h
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Non-remboursable moins de 12h avant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Report possible sous conditions
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}