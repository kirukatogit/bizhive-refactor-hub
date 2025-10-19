import { Shield, Users, BarChart3, Globe, Zap, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Multitenant Seguro",
      description: "Cada negocio opera en su propio espacio aislado. Sin mezclas, sin confusiones.",
    },
    {
      icon: BarChart3,
      title: "Analytics en Tiempo Real", 
      description: "Dashboards intuitivos que muestran el estado de tu inventario al instante.",
    },
    {
      icon: Globe,
      title: "Múltiples Sucursales",
      description: "Gestiona cadenas completas desde una sola plataforma centralizada.",
    },
    {
      icon: Zap,
      title: "Sincronización Instantánea",
      description: "Cambios reflejados inmediatamente en todas las ubicaciones.",
    },
    {
      icon: Lock,
      title: "Seguridad Empresarial",
      description: "Encriptación de nivel bancario para proteger tus datos comerciales.",
    },
    {
      icon: Shield,
      title: "Respaldos Automáticos",
      description: "Tu información siempre segura con backups automatizados cada hora.",
    },
  ]

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">⚡ Características Principales</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Una{" "}
            <span className="bg-gradient-honey bg-clip-text text-transparent">
              plataforma completa
            </span>{" "}
            para tu éxito
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            BizHive combina la potencia de la tecnología moderna con la simplicidad que tu negocio necesita.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-hive transition-all duration-300 hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-hive rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">¿Listo para revolucionar tu inventario?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Únete a cientos de empresarios que ya confían en BizHive para gestionar sus negocios de manera eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:shadow-hive transition-all duration-300 hover:scale-105">
                Empezar Ahora - Gratis
              </button>
              <button className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-secondary transition-all duration-300">
                Solicitar Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features