import { Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

const Testimonials = () => {
  const testimonials = [
    {
      name: "María González",
      role: "Dueña de Ferretería El Martillo",
      company: "3 sucursales",
      content: "BizHive transformó completamente cómo manejo mi inventario. Ya no me preocupo por confundir productos entre mis sucursales.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Carlos Mendoza", 
      role: "Gerente de Operaciones",
      company: "Supermercados La Canasta",
      content: "La visibilidad en tiempo real nos ha permitido reducir el desperdicio en un 40%. Los reportes automáticos son increíbles.",
      rating: 5,
      avatar: "👨‍💻"
    },
    {
      name: "Ana Rodríguez",
      role: "Directora Comercial",
      company: "Farmacias Salud Total",
      content: "El soporte 24/7 y la facilidad de uso hacen que BizHive sea indispensable para nuestra cadena de farmacias.",
      rating: 5,
      avatar: "👩‍⚕️"
    },
  ]

  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">💬 Lo que dicen nuestros clientes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Miles de{" "}
            <span className="bg-gradient-honey bg-clip-text text-transparent">
              empresarios satisfechos
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre por qué BizHive es la elección preferida de negocios que buscan crecer de manera organizada.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-hive transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "{testimonial.content}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-primary rounded-2xl p-8 text-secondary">
            <h3 className="text-2xl font-bold mb-4">¿Listo para unirte a esta colmena exitosa?</h3>
            <p className="mb-6 opacity-90 max-w-xl mx-auto">
              Más de 500 negocios ya confían en BizHive para gestionar sus inventarios de manera eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-background transition-colors">
                Comenzar Prueba Gratis
              </button>
              <button className="border-2 border-secondary text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-secondary hover:text-primary transition-all duration-300">
                Hablar con Ventas
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials