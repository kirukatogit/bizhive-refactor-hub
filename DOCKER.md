# Guía de Docker para BizHive

Este documento explica cómo construir y ejecutar el proyecto BizHive usando Docker.

## Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 1.29 o superior)

## Construcción de la Imagen

Para construir la imagen Docker del proyecto:

```bash
docker build -t bizhive-app .
```

## Ejecución con Docker Run

Para ejecutar el contenedor directamente:

```bash
docker run -d -p 8080:80 --name bizhive-container bizhive-app
```

La aplicación estará disponible en `http://localhost:8080`

## Ejecución con Docker Compose

Docker Compose simplifica el proceso de construcción y ejecución:

### Iniciar la aplicación

```bash
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Detener la aplicación

```bash
docker-compose down
```

### Reconstruir y reiniciar

```bash
docker-compose up -d --build
```

## Exportar e Importar la Imagen

### Exportar la imagen a un archivo

```bash
docker save bizhive-app:latest -o bizhive-app.tar
```

### Importar la imagen en otro PC

```bash
docker load -i bizhive-app.tar
```

Luego puedes ejecutar el contenedor con:

```bash
docker run -d -p 8080:80 --name bizhive-container bizhive-app:latest
```

## Estructura de Archivos Docker

- **Dockerfile**: Configuración de construcción de la imagen (multi-stage build con Node.js y Nginx)
- **docker-compose.yml**: Orquestación de servicios
- **nginx.conf**: Configuración del servidor web Nginx
- **.dockerignore**: Archivos excluidos de la imagen Docker

## Notas Importantes

1. La aplicación se construye en modo producción
2. Se usa Nginx Alpine para servir los archivos estáticos (imagen ligera)
3. El puerto interno del contenedor es 80, mapeado al puerto 8080 del host
4. La imagen incluye health checks y compresión gzip
5. Los archivos estáticos se cachean por 1 año para mejor rendimiento
6. El routing de React se maneja correctamente con `try_files`

## Solución de Problemas

### La aplicación no inicia

```bash
docker logs bizhive-container
```

### Reconstruir desde cero

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Limpiar imágenes antiguas

```bash
docker system prune -a
```

## Variables de Entorno

Si necesitas configurar variables de entorno, puedes crear un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_ANON_KEY=tu_key_aqui
```

Y modificar el `docker-compose.yml` para incluirlas:

```yaml
environment:
  - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
  - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```
