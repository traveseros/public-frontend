# Traveseros

Traveseros es una aplicación web desarrollada con Next.js para visualizar y gestionar equipos en una competición o evento de senderismo.

## Características

- Mapa interactivo que muestra la ubicación de los equipos
- Tabla de datos con información detallada de los equipos
- Filtros para rutas y estados de los equipos
- Lista de equipos con actualización en tiempo real

## Tecnologías utilizadas

- [Next.js](https://nextjs.org/) - Framework de React para aplicaciones web
- [React](https://reactjs.org/) - Biblioteca de JavaScript para construir interfaces de usuario
- [Leaflet](https://leafletjs.com/) - Biblioteca de JavaScript para mapas interactivos
- [TanStack Table](https://tanstack.com/table/v8) - Biblioteca para crear tablas de datos avanzadas

## Componentes principales

- `Map`: Visualiza la ubicación de los equipos en un mapa interactivo
- `Table`: Muestra los datos de los equipos en una tabla ordenable y paginada
- `FilterButtons`: Permite filtrar los equipos por ruta y estado
- `TeamList`: Muestra una lista de equipos con información resumida

## Inicio rápido

1. Clona el repositorio:

   ```
   git clone https://github.com/tu-usuario/traveseros.git
   ```

2. Instala las dependencias:

   ```
   cd traveseros
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estructura del proyecto

```
traveseros/
├── components/
│   ├── FilterButtons.tsx
│   ├── Map.tsx
│   ├── Table.tsx
│   └── TeamList.tsx
├── pages/
│   └── index.tsx
├── styles/
│   ├── FilterButtons.module.css
│   ├── Map.module.css
│   ├── Table.module.css
│   └── TeamList.module.css
├── utils/
│   ├── api.ts
│   └── team.ts
└── README.md
```

## Personalización

- Modifica los colores y estilos en los archivos CSS del directorio `styles/`
- Ajusta la lógica de filtrado en `FilterButtons.tsx`
- Personaliza la visualización del mapa en `Map.tsx`
- Modifica la estructura de la tabla en `Table.tsx`
