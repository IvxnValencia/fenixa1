# FENIXA

Arma tu PC con confianza: catálogo de componentes y portátiles con fichas técnicas verificadas, comparaciones, presupuesto en vivo y «Mi build».

**Página:** https://ivxnvalencia.github.io/fenixa1/

## Estructura

```
fenixa1/
├── index.html          Página principal
├── css/                Estilos (catálogo, builds, comparaciones, diseño general)
├── js/
│   ├── catalogo/       Catálogo de componentes y sus ampliaciones
│   ├── fichas/         Fichas técnicas verificadas por modelo y su esquema
│   ├── mercado/        Ofertas observadas, revisión de precios y fotos
│   ├── portatiles/     Catálogo, detalle y comparación de portátiles
│   ├── builds/         Mi build, planificador, propuestas y presupuesto
│   └── interfaz/       Navegación, comparador, radar y recuperación de arranque
└── assets/             Fotos de productos e imágenes
```

El orden en que se cargan los scripts está definido en `index.html`, y los datos se cargan antes que la lógica que los usa.

## Datos

- Cada ficha registra su fuente, la fecha de consulta y el alcance de cada campo. Si un dato no está publicado por el fabricante, queda como pendiente; no se inventa.
- Los precios son observaciones con fecha y vencen. Para comprar, hay que confirmar precio y stock en la tienda.
- Las fichas con un conflicto de identidad (título, foto o número de parte que no coinciden) muestran una advertencia.

## Publicación

GitHub Pages publica la rama `main` desde la raíz. El desarrollo y las pruebas se hacen en una carpeta de trabajo aparte, y un script copia los archivos a estas carpetas antes de cada commit.
