import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-secondary font-bold text-lg">🐝</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">BizHive</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Características
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
            Testimonios
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="hidden md:block" asChild>
            <Link to="/auth">Iniciar Sesión</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/auth">Registrarse</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header