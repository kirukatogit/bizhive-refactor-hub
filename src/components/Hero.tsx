import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import heroImage from "@/assets/hero-inventory.jpg"

const Hero = () => {
  return (
    <section className="min-h-screen pt-16 bg-gradient-hive relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary">🎯 Gestión Inteligente de Inventarios</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Organiza tu{" "}
              <span className="bg-gradient-honey bg-clip-text text-transparent">
                colmena de negocios
              </span>{" "}
              como un experto
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              BizHive te ayuda a gestionar inventarios de múltiples sucursales sin confusiones. 
              Cada negocio en su propio panal, organizados con la eficiencia de una colmena.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Negocios activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime garantizado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Soporte técnico</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-honey">
              <img 
                src={heroImage} 
                alt="BizHive - Gestión de inventarios profesional"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-primary text-secondary p-4 rounded-2xl shadow-hive">
              <div className="text-2xl font-bold">📊</div>
              <div className="text-sm font-medium">Control Total</div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-secondary text-primary p-4 rounded-2xl shadow-honey">
              <div className="text-2xl font-bold">⚡</div>
              <div className="text-sm font-medium text-primary">Tiempo Real</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero