import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Phone, Mail, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />
      
      {/* Hero Section with Immersive Banner */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/golf-indoor-banner.jpg"
            alt="Golf Indoor TrackMan 4"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Golf Indoor avec TrackMan 4
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Améliorez votre swing dans un environnement professionnel avec la technologie de pointe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/booking/indoor">
                  Réserver un cours Indoor
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-black">
                <Link href="/booking/accompanied">
                  Réserver un parcours accompagné
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Coach Presentation Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/coach-profile.jpg"
                alt="Coach de golf professionnel"
                className="rounded-lg shadow-lg w-full max-w-md mx-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Votre Coach Professionnel
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Avec plus de 10 ans d'expérience dans l'enseignement du golf, je vous propose des cours 
                personnalisés adaptés à votre niveau. Que vous soyez débutant ou joueur confirmé, la 
                technologie TrackMan 4 vous permettra d'analyser et d'améliorer chaque aspect de votre jeu.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Certifié PGA TrackMan</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">+10 ans d'expérience</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Facilité de pointe à Paris</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nos Services
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                  Cours Indoor TrackMan 4
                </CardTitle>
                <CardDescription>
                  Entraînement individuel avec analyse technologique avancée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Analyse complète du swing</li>
                  <li>• Données précises TrackMan 4</li>
                  <li>• Créneaux de 30min à 2h</li>
                  <li>• Environnement climatisé</li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="/booking/indoor">
                    Réserver maintenant
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-green-600" />
                  Parcours Accompagnés
                </CardTitle>
                <CardDescription>
                  Coaching sur terrain pour une expérience réelle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• Coaching sur parcours</li>
                  <li>• Stratégie de jeu</li>
                  <li>• Gestion mentale</li>
                  <li>• 70€/h (60€/h à partir de la 2ème heure)</li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6">
                  <Link href="/booking/accompanied">
                    Nous contacter
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Prêt à améliorer votre jeu ?
          </h2>
          <p className="text-xl mb-8">
            Contactez-nous pour réserver votre premier cours ou pour plus d'informations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+33 1 23 45 67 89</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>contact@golfindoor.fr</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}