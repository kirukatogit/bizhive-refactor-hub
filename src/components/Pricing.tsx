import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Pricing = () => {
  const plans = [
    {
      name: "Colmena Starter",
      price: "Gratis",
      period: "por siempre",
      description: "Perfect para negocios pequeños que inician",
      features: [
        "1 negocio/sucursal",
        "Hasta 100 productos",
        "Dashboard básico",
        "Soporte por email",
        "Respaldos semanales",
      ],
      popular: false,
    },
    {
      name: "Colmena Pro",
      price: "$29",
      period: "por mes",
      description: "Ideal para cadenas medianas en crecimiento",
      features: [
        "Hasta 5 negocios/sucursales", 
        "Productos ilimitados",
        "Analytics avanzados",
        "Soporte prioritario 24/7",
        "Respaldos diarios",
        "API personalizada",
        "Reportes automáticos",
      ],
      popular: true,
    },
    {
      name: "Colmena Enterprise",
      price: "$99",
      period: "por mes",
      description: "Para grandes empresas que necesitan el máximo",
      features: [
        "Negocios/sucursales ilimitados",
        "Todo de Pro incluido", 
        "Integración con ERP",
        "Gerente de cuenta dedicado",
        "Respaldos en tiempo real",
        "Auditoría de seguridad",
        "Personalización completa",
        "Onboarding gratuito",
      ],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-beeswax/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">💰 Precios Transparentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Elige el plan perfecto{" "}
            <span className="bg-gradient-honey bg-clip-text text-transparent">
              para tu colmena
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sin costos ocultos, sin sorpresas. Paga solo por lo que necesitas y escala cuando quieras.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative hover:shadow-honey transition-all duration-300 hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-primary shadow-honey scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-secondary px-4 py-1 rounded-full text-sm font-semibold">
                    🔥 Más Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <Button 
                    variant={plan.popular ? "hero" : "outline"} 
                    className="w-full"
                    size="lg"
                  >
                    {plan.price === "Gratis" ? "Empezar Gratis" : "Empezar Prueba"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Necesitas algo más personalizado? 
          </p>
          <Button variant="ghost" className="text-primary hover:text-primary">
            Contactar Ventas →
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Pricing