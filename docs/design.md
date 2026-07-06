# design.md - CalorieTrack

## 1. Descripción general del diseño

CalorieTrack es una aplicación web para el seguimiento nutricional diario. Su interfaz debe permitir al usuario consultar de forma rápida su consumo de calorías, registrar comidas, revisar recomendaciones, consultar preparaciones y acceder a la configuración de su cuenta.

El diseño debe ser claro, moderno, ordenado y fácil de usar. La aplicación está construida con **Tailwind CSS**, por lo que la línea gráfica debe apoyarse en clases utilitarias, componentes reutilizables y una estructura visual consistente.

---

## 2. Línea gráfica adoptada: Dashboard nutricional moderno

CalorieTrack seguirá una línea gráfica de **dashboard nutricional moderno**, construida con **Tailwind CSS** y basada en una estructura visual limpia, minimalista y reutilizable.

La aplicación tendrá una estética tipo **SaaS Dashboard**, con inspiración en estilos visuales como **shadcn/ui** y **Soft UI**, adaptada a una experiencia de seguimiento nutricional diario.

Esta referencia no implica que el proyecto deba depender obligatoriamente de shadcn/ui, sino que toma como inspiración su estilo visual: componentes limpios, tarjetas bien definidas, bordes redondeados, buen espaciado, estados claros y apariencia profesional.

El objetivo es mantener una interfaz cálida, amigable y funcional, donde el usuario pueda consultar sus métricas de forma rápida y registrar información sin distracciones.

---

## 3. Identidad visual

La identidad visual de CalorieTrack se basa en una paleta cálida, usando tonos **vino/burdeos** como color principal.

Este color se aplica principalmente en:

- Barra lateral.
- Botones principales.
- Estados activos del menú.
- Acciones destacadas.
- Elementos visuales de marca.

La interfaz combina el color principal con fondos claros, tarjetas blancas, bordes redondeados y sombras suaves para generar una experiencia visual limpia, moderna y agradable.

### Características principales

- Estilo moderno y minimalista.
- Apariencia tipo dashboard web.
- Navegación lateral fija.
- Tarjetas para agrupar información.
- Bordes redondeados.
- Sombras suaves.
- Fondos claros.
- Botones con color principal.
- Gradientes sutiles en tarjetas destacadas.
- Iconografía simple y reconocible.
- Diseño enfocado en métricas, seguimiento diario y acciones rápidas.

---

## 4. Referencias visuales

La línea gráfica de CalorieTrack se acerca a una combinación de las siguientes referencias:

### 4.1. SaaS Dashboard

La aplicación utiliza una estructura común en plataformas SaaS:

- Sidebar lateral.
- Área principal de contenido.
- Tarjetas de métricas.
- Secciones administrativas.
- Acciones rápidas.
- Paneles de resumen.

Esta estructura permite que la aplicación sea clara, escalable y fácil de navegar.

### 4.2. shadcn/ui

La inspiración en shadcn/ui se toma por su estilo limpio y moderno:

- Componentes sobrios.
- Tarjetas minimalistas.
- Inputs claros.
- Botones simples.
- Modales y alertas con buena jerarquía.
- Uso adecuado del espacio en blanco.

### 4.3. Soft UI

La inspiración en Soft UI se refleja en:

- Bordes redondeados.
- Sombras suaves.
- Separación visual ligera.
- Superficies claras.
- Sensación visual amigable y menos rígida.

### 4.4. Health / Fitness Dashboard

Como CalorieTrack está orientado al seguimiento nutricional, también toma elementos de dashboards de salud y fitness:

- Métricas principales visibles.
- Progreso diario.
- Barras de avance.
- Desglose por comidas.
- Registro de hábitos.
- Estados vacíos claros para motivar la acción.

---

## 5. Paleta de colores

La paleta de colores debe mantenerse consistente en toda la aplicación.

### 5.1. Colores principales

```js
colors: {
  primary: {
    DEFAULT: "#7f0000",
    dark: "#5c0000",
    hover: "#990000",
    soft: "#b87373"
  },
  background: "#f8fafc",
  surface: "#ffffff",
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    muted: "#94a3b8"
  },
  border: "#e5e7eb",
  success: "#16a34a",
  warning: "#f59e0b",
  error: "#dc2626",
  info: "#2563eb"
}
```

### 5.2. Uso de colores

| Color | Uso recomendado |
|---|---|
| Primario | Sidebar, botones principales, menú activo y acciones destacadas |
| Primario oscuro | Fondo del sidebar y secciones de marca |
| Primario hover | Hover de botones principales |
| Background | Fondo general de las páginas |
| Surface | Tarjetas, paneles, formularios y contenedores |
| Texto principal | Títulos, métricas y datos importantes |
| Texto secundario | Fechas, descripciones y textos complementarios |
| Border | Separadores, inputs, tarjetas y contenedores |
| Success | Confirmaciones y operaciones exitosas |
| Warning | Advertencias o información pendiente |
| Error | Errores, validaciones y acciones críticas |
| Info | Mensajes informativos |

---

## 6. Principios de diseño

### 6.1. Claridad

La información principal debe ser fácil de leer y entender. Las métricas como calorías, proteínas, carbohidratos y grasas deben tener buena jerarquía visual.

### 6.2. Consistencia

Todos los elementos visuales deben mantener la misma línea gráfica. Los botones, tarjetas, barras de progreso, formularios y estados deben verse como parte del mismo sistema.

### 6.3. Simplicidad

La interfaz debe evitar elementos innecesarios. Cada pantalla debe mostrar solo la información necesaria para que el usuario realice una acción o consulte su progreso.

### 6.4. Jerarquía visual

Los elementos más importantes deben destacarse visualmente.

Ejemplos:

- Consumo de calorías del día.
- Meta diaria.
- Progreso nutricional.
- Comidas registradas.
- Acciones principales como agregar comida.

### 6.5. Accesibilidad

La aplicación debe mantener buen contraste, tamaños de texto legibles y estados claros para interacción.

Se debe considerar:

- Contraste adecuado entre texto y fondo.
- Tamaños de fuente cómodos.
- Botones fácilmente identificables.
- Estados visibles para error, éxito, advertencia y carga.
- Navegación clara en escritorio.
- Estados `hover`, `focus`, `disabled` y `loading`.

### 6.6. Escalabilidad

Los componentes deben poder reutilizarse en nuevas pantallas sin rediseñarlos desde cero.

---

## 7. Layout principal

La aplicación se organiza con una estructura de dashboard.

### 7.1. Sidebar

La barra lateral funciona como navegación principal de la aplicación.

Debe contener:

- Logo o nombre de la aplicación.
- Descripción breve.
- Secciones principales.
- Estado activo de la página actual.
- Botón de salida en la parte inferior.

Elementos actuales:

- Panel.
- Comidas.
- Recomendaciones.
- Preparaciones.
- Configuración.
- Salir.

### 7.2. Contenido principal

El área principal debe contener el título de la pantalla, fecha o información contextual y las tarjetas correspondientes.

Ejemplo:

- Título: `Panel de calorías`.
- Fecha actual.
- Tarjeta de consumo diario.
- Tarjeta de desglose por comidas.
- Sección de comidas registradas.

### 7.3. Estructura recomendada

```html
<div class="min-h-screen bg-slate-50">
  <aside class="fixed left-0 top-0 h-screen w-64 bg-primary-dark text-white">
    Sidebar
  </aside>

  <main class="ml-64 px-8 py-6">
    Contenido principal
  </main>
</div>
```

---

## 8. Componentes base

Los componentes visuales deben construirse de forma reutilizable para mantener consistencia.

### Componentes principales

- Button.
- Input.
- Select.
- Textarea.
- Card.
- Table.
- Badge.
- Dialog.
- Alert.
- Dropdown.
- Tabs.
- Tooltip.
- Sidebar.
- ProgressBar.
- EmptyState.
- PageHeader.
- DashboardCard.
- MealCard.

---

## 9. Tarjetas

Las tarjetas son uno de los elementos principales del diseño.

Deben usarse para agrupar información relacionada, como:

- Resumen diario.
- Desglose por comidas.
- Comidas registradas.
- Recomendaciones.
- Preparaciones.
- Configuración del usuario.

### 9.1. Estilo de tarjetas

- Fondo blanco o gradiente sutil.
- Bordes redondeados.
- Sombra suave.
- Espaciado interno amplio.
- Títulos claros.
- Separación visual entre bloques.

### 9.2. Ejemplo de card básica

```html
<div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
  <h2 class="text-lg font-semibold text-slate-900">
    Comidas registradas
  </h2>

  <p class="mt-2 text-sm text-slate-500">
    No hay comidas registradas aún.
  </p>
</div>
```

### 9.3. Ejemplo de card destacada

```html
<div class="rounded-2xl bg-gradient-to-br from-primary to-primary-soft p-6 text-white shadow-md">
  <h2 class="text-lg font-semibold">
    Consumo de hoy
  </h2>

  <div class="mt-4 flex items-end justify-between">
    <p class="text-5xl font-bold">0</p>
    <p class="text-xl opacity-80">/ 2604 kcal</p>
  </div>

  <div class="mt-4 h-3 rounded-full bg-white/20">
    <div class="h-3 rounded-full bg-white" style="width: 0%"></div>
  </div>
</div>
```

---

## 10. Botones

Los botones deben tener una jerarquía clara.

### 10.1. Botón primario

Se usa para acciones principales.

Ejemplos:

- Agregar comida.
- Guardar.
- Confirmar.
- Crear registro.

```html
<button class="rounded-lg bg-primary px-4 py-2 text-white font-medium hover:bg-primary-hover transition">
  Agregar comida
</button>
```

### 10.2. Botón secundario

Se usa para acciones alternativas.

Ejemplos:

- Cancelar.
- Volver.
- Limpiar filtros.

```html
<button class="rounded-lg border border-gray-200 px-4 py-2 text-slate-700 hover:bg-gray-50 transition">
  Cancelar
</button>
```

### 10.3. Botón peligro

Se usa para acciones destructivas o sensibles.

Ejemplos:

- Eliminar comida.
- Cerrar sesión.
- Borrar registro.

```html
<button class="rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition">
  Eliminar
</button>
```

---

## 11. Estados visuales

La aplicación debe manejar estados claros para que el usuario entienda lo que está ocurriendo.

### Estados requeridos

- Estado vacío.
- Estado de carga.
- Estado de error.
- Estado exitoso.
- Estado deshabilitado.
- Estado activo.
- Estado hover.
- Estado focus.

### 11.1. Estado vacío

Cuando no existan registros, se debe mostrar un mensaje claro y una acción principal.

```html
<div class="flex flex-col items-center justify-center py-12 text-center">
  <p class="text-sm text-slate-400">
    No hay comidas registradas aún.
  </p>

  <button class="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-hover transition">
    Agregar tu primera comida
  </button>
</div>
```

### 11.2. Estado de carga

```html
<div class="flex items-center justify-center py-12">
  <p class="text-sm text-slate-500">
    Cargando información...
  </p>
</div>
```

### 11.3. Estado de error

```html
<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
  No fue posible cargar la información. Intenta nuevamente.
</div>
```

### 11.4. Estado exitoso

```html
<div class="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
  La información fue guardada correctamente.
</div>
```

---

## 12. Tipografía

La tipografía debe ser clara, moderna y legible.

### 12.1. Reglas

- Usar títulos con peso `semibold` o `bold`.
- Usar textos secundarios en tonos grises.
- Evitar textos demasiado pequeños.
- Mantener jerarquía entre título, subtítulo, contenido y ayudas.
- Mantener consistencia entre pantallas.

### 12.2. Jerarquía sugerida

| Elemento | Clase sugerida |
|---|---|
| Título principal | `text-3xl font-bold text-slate-900` |
| Título de sección | `text-lg font-semibold text-slate-900` |
| Texto normal | `text-sm text-slate-700` o `text-base text-slate-700` |
| Texto secundario | `text-sm text-slate-500` |
| Texto auxiliar | `text-xs text-slate-400` |
| Métrica grande | `text-4xl font-bold` |
| Métrica destacada | `text-5xl font-bold` |

---

## 13. Espaciado

El espaciado debe ser amplio y consistente.

### 13.1. Reglas

- Separar secciones principales con espacios amplios.
- Mantener padding interno en tarjetas.
- Evitar componentes pegados.
- Usar una escala de espaciado consistente de Tailwind CSS.

### 13.2. Escala sugerida

| Elemento | Clase sugerida |
|---|---|
| Contenedor principal | `px-8 py-6` |
| Tarjetas | `p-6` |
| Separación entre cards | `gap-6` |
| Separación entre secciones | `mt-8` |
| Sidebar | `p-6` |
| Formularios | `space-y-4` |

---

## 14. Iconografía

La iconografía debe ser simple, reconocible y coherente.

Se pueden usar emojis o íconos SVG, pero se debe mantener consistencia visual.

### Iconos actuales

- 📊 Panel.
- 🍽️ Comidas.
- 💡 Recomendaciones.
- 🥣 Preparaciones.
- ⚙️ Configuración.
- 🐰 Identidad de la app.

### Reglas

- No mezclar demasiados estilos de iconos.
- Mantener tamaños consistentes.
- Usar iconos solo cuando ayuden a identificar una acción o sección.
- Evitar exceso de elementos decorativos.

---

## 15. Formularios

Los formularios deben ser claros, ordenados y fáciles de completar.

### 15.1. Reglas

- Cada campo debe tener label.
- Los campos obligatorios deben identificarse claramente.
- Los mensajes de error deben mostrarse cerca del campo.
- Los botones principales deben estar al final del formulario.
- Los inputs deben mantener el mismo estilo en toda la aplicación.

### 15.2. Ejemplo de input

```html
<div class="space-y-1">
  <label class="text-sm font-medium text-slate-700">
    Nombre de la comida
  </label>

  <input
    type="text"
    class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    placeholder="Ej: Arroz con pollo"
  />
</div>
```

---

## 16. Tablas y listados

Las tablas o listados deben ser limpios y fáciles de leer.

### Reglas

- Usar encabezados claros.
- Mantener buen espaciado entre filas.
- Evitar saturar la tabla con demasiada información.
- Usar badges para estados cuando sea necesario.
- Las acciones deben ubicarse en una columna final o en un menú contextual.

### Ejemplo

```html
<div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
  <table class="w-full text-sm">
    <thead class="bg-slate-50 text-slate-500">
      <tr>
        <th class="px-4 py-3 text-left font-medium">Comida</th>
        <th class="px-4 py-3 text-left font-medium">Tipo</th>
        <th class="px-4 py-3 text-right font-medium">Calorías</th>
      </tr>
    </thead>

    <tbody class="divide-y divide-gray-100">
      <tr>
        <td class="px-4 py-3 text-slate-800">Avena con banano</td>
        <td class="px-4 py-3 text-slate-500">Desayuno</td>
        <td class="px-4 py-3 text-right font-medium text-slate-900">320 kcal</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 17. Barras de progreso

Las barras de progreso deben utilizarse para representar avances nutricionales.

Ejemplos:

- Calorías consumidas.
- Proteínas.
- Carbohidratos.
- Grasas.
- Cumplimiento de meta diaria.

### Ejemplo

```html
<div class="space-y-2">
  <div class="flex justify-between text-xs text-slate-500">
    <span>Proteína</span>
    <span>40%</span>
  </div>

  <div class="h-2 rounded-full bg-slate-200">
    <div class="h-2 rounded-full bg-primary" style="width: 40%"></div>
  </div>
</div>
```

---

## 18. Navegación

La navegación debe ser clara y permitir al usuario identificar fácilmente en qué sección se encuentra.

### Reglas

- El menú activo debe destacarse visualmente.
- Las opciones deben tener texto e icono.
- El sidebar debe permanecer fijo en escritorio.
- El botón de salir debe ubicarse al final del sidebar.
- En móvil, la navegación debe adaptarse a un menú compacto.

### Ejemplo de item activo

```html
<a class="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-white font-medium">
  <span>📊</span>
  <span>Panel</span>
</a>
```

---

## 19. Responsive design

La aplicación debe adaptarse correctamente a diferentes tamaños de pantalla.

### 19.1. Escritorio

- Sidebar fijo.
- Contenido principal amplio.
- Cards en columnas.
- Tablas o listados visibles.
- Acciones principales alineadas a la derecha cuando aplique.

### 19.2. Tablet

- Sidebar puede reducirse o convertirse en menú.
- Cards pueden reorganizarse en una o dos columnas.
- El contenido debe mantener buen espaciado.

### 19.3. Móvil

- Navegación compacta.
- Cards en una sola columna.
- Botones de ancho completo cuando sea necesario.
- Formularios simples y verticales.
- Evitar tablas demasiado anchas sin scroll horizontal.

---

## 20. Accesibilidad

La aplicación debe ser accesible y cómoda de usar.

### Reglas mínimas

- Mantener buen contraste entre texto y fondo.
- Usar labels visibles en formularios.
- No depender únicamente del color para comunicar estados.
- Los botones deben tener textos claros.
- Los elementos interactivos deben tener estados `hover` y `focus`.
- Los tamaños de texto deben ser legibles.
- Los mensajes de error deben ser comprensibles.

---

## 21. Reglas de construcción con Tailwind CSS

### 21.1. Reglas generales

- No crear estilos aislados por pantalla.
- Centralizar colores, tamaños, bordes y espaciados como tokens de diseño.
- Usar componentes base para botones, inputs, selects, tablas, cards, badges y modales.
- Mantener una estructura responsive desde el inicio.
- Priorizar accesibilidad en formularios y navegación por teclado.
- No duplicar clases innecesariamente si pueden convertirse en componentes reutilizables.
- Evitar mezclar librerías visuales con estilos contradictorios.
- Mantener una nomenclatura clara para componentes y layouts.

### 21.2. Buenas prácticas

- Usar clases utilitarias de Tailwind CSS.
- Crear componentes reutilizables cuando un patrón se repita.
- Evitar valores mágicos repetidos.
- Mantener una escala de espaciado consistente.
- Definir colores de marca en la configuración de Tailwind.
- No abusar de sombras fuertes.
- Evitar gradientes excesivos.
- Mantener una apariencia limpia y profesional.

---

## 22. Tokens de diseño recomendados

Los tokens de diseño ayudan a mantener consistencia visual.

### 22.1. Border radius

```js
borderRadius: {
  card: "1rem",
  button: "0.5rem",
  input: "0.5rem"
}
```

### 22.2. Shadows

```js
boxShadow: {
  card: "0 4px 12px rgba(15, 23, 42, 0.08)",
  soft: "0 2px 8px rgba(15, 23, 42, 0.06)"
}
```

### 22.3. Spacing

```js
spacing: {
  section: "2rem",
  card: "1.5rem",
  page: "2rem"
}
```

---

## 23. Pantallas principales

### 23.1. Panel

Debe mostrar el resumen diario del usuario.

Elementos principales:

- Título de pantalla.
- Fecha actual.
- Consumo de calorías.
- Meta diaria.
- Progreso general.
- Desglose por comidas.
- Comidas registradas.
- Botón para agregar comida.

### 23.2. Comidas

Debe permitir consultar, agregar, editar o eliminar comidas.

Elementos principales:

- Listado de comidas.
- Filtros por fecha o tipo.
- Formulario de registro.
- Total de calorías.
- Información nutricional.

### 23.3. Recomendaciones

Debe mostrar sugerencias nutricionales de forma clara y ordenada.

Elementos principales:

- Recomendaciones del día.
- Mensajes personalizados.
- Cards informativas.
- Indicadores de progreso.

### 23.4. Preparaciones

Debe mostrar preparaciones o recetas disponibles.

Elementos principales:

- Cards de preparación.
- Nombre.
- Ingredientes principales.
- Calorías aproximadas.
- Acción para ver detalle.

### 23.5. Configuración

Debe permitir modificar datos o preferencias del usuario.

Elementos principales:

- Datos personales.
- Meta calórica.
- Preferencias nutricionales.
- Botones para guardar cambios.

---

## 24. Criterios de aceptación visual

Una pantalla se considera alineada con el diseño si cumple con lo siguiente:

- Usa la paleta definida.
- Mantiene la estructura de dashboard.
- Utiliza tarjetas para agrupar información.
- Respeta el espaciado definido.
- Usa botones consistentes.
- Tiene estados visuales claros.
- Es legible en escritorio.
- No mezcla estilos visuales contradictorios.
- Mantiene una apariencia limpia y profesional.
- Puede adaptarse a tablet y móvil.

---

## 25. Resumen de la línea gráfica

La aplicación adopta una línea gráfica de **dashboard nutricional moderno**, desarrollada con **Tailwind CSS**, inspirada en **shadcn/ui**, **Soft UI** y patrones de **SaaS Dashboard**.

Se caracteriza por una interfaz limpia, tarjetas con bordes redondeados, sombras suaves, navegación lateral fija y una paleta cálida en tonos vino/burdeos.

El diseño está orientado a una experiencia de seguimiento nutricional clara, amigable, profesional y escalable.