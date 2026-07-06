# Guía de Diseño

## Identidad del producto

La aplicación se presenta como **CalorieTrack**, una herramienta de seguimiento nutricional diario. El diseño debe sentirse claro, práctico y confiable: prioriza lectura rápida de calorías, macros, comidas registradas, recomendaciones y estados de progreso. Evita composiciones tipo landing page en las vistas internas; cada pantalla debe funcionar como una herramienta de uso frecuente.

El producto está orientado a que cada persona pueda construir y sostener sus hábitos alimenticios dentro de la app. La evolución natural del sistema apunta también a registrar otros hábitos y métricas de entrenamiento, como pesos y cargas que se usan en el gimnasio, para acompañar el progreso de forma más completa.

## Vistas Del Proyecto

Las rutas actuales del proyecto son:

- `login`: acceso de usuarios.
- `register`: creación de cuenta.
- `dashboard`: resumen principal del estado nutricional.
- `meals`: módulo de comidas, con historial y alta de comidas.
- `recommendations`: recomendaciones nutricionales.
- `food-preparations`: preparaciones o recetas.
- `configuration`: configuración de la cuenta y preferencias.

La vista raíz redirige a `login`, y las vistas autenticadas viven dentro de `MainLayout`. El diseño debe respetar esa separación: pantallas públicas simples y de acceso, pantallas internas densas, funcionales y centradas en seguimiento.

## Paleta y tema visual

Los colores base están definidos en `src/styles.css` con Tailwind:

- `primary`: morado principal para navegación, botones, progreso y énfasis.
- `secondary`: violeta claro para badges, icon containers y estados suaves.
- `accent`: cian para apoyos visuales y barras secundarias.
- `gray`: estructura neutral para fondos, bordes, texto y superficies.

Usa `bg-gray-50` para fondos de página, `bg-white` para superficies principales y `border-gray-200` para separar contenido. Reserva `red` para errores y `yellow` para excesos o advertencias nutricionales.

## Layout y estructura

Las pantallas principales usan el patrón:

```html
<div class="min-h-full bg-gray-50">
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
    <!-- contenido -->
  </div>
</div>
```

El layout global vive en `src/app/layouts/main-layout`: sidebar fija en desktop, top bar móvil y contenido con scroll propio. Mantén grids responsivos con una columna en mobile y layouts de dos o tres columnas en `lg`/`xl`.

## Componentes UI

Las tarjetas usan `rounded-lg`, borde sutil, fondo blanco y `shadow-sm`. Ejemplo:

```html
<section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
</section>
```

Los botones primarios deben usar `bg-primary-500`, `text-primary-contrast`, hover en `primary-600`, altura mínima cómoda (`min-h-10` o `min-h-11`) y `focus-visible:ring`. Los controles segmentados usan `bg-gray-100 p-1`, opciones activas en blanco con sombra ligera y texto `primary-700`.

Usa badges redondeados para conteos, periodos y estados: `rounded-full px-3 py-1 text-xs/text-sm font-semibold`.

## Formularios

Los formularios deben tener labels visibles, campos de al menos `min-h-11`, bordes suaves y foco con `focus:border-primary-400 focus:ring-2 focus:ring-primary-100`. Los errores se muestran cerca del campo con texto rojo y mensajes breves. Mantén placeholders concretos, por ejemplo `Ej: Desayuno con café`.

## Estados de pantalla

Cada flujo con datos remotos debe contemplar:

- Carga: `app-loading-spinner` y mensaje corto.
- Vacío: contenedor con borde dashed, explicación breve y acción primaria.
- Error: bloque `bg-red-50 border-red-100 text-red-700` con opción de reintentar cuando aplique.
- Éxito o resumen: tarjetas limpias con datos destacados y jerarquía visual clara.

## Datos nutricionales

Los números importantes deben ser grandes y fáciles de escanear: calorías, metas, restantes y excesos. Usa barras de progreso para porcentajes y etiquetas compactas para macros. Las unidades (`kcal`, `g`) deben aparecer cerca del número, sin saturar la vista.

## Accesibilidad y responsive

Incluye `aria-label` en botones iconográficos, `role="progressbar"` en barras de progreso y `role="radiogroup"`/`role="radio"` en controles segmentados. Verifica que todo funcione en mobile: sin textos cortados, cards demasiado anchas ni botones difíciles de tocar.

## Checklist para nuevas pantallas

- Usa el contenedor estándar `max-w-7xl` con padding responsivo.
- Mantén jerarquía: eyebrow pequeño, título fuerte, subtítulo opcional.
- Reutiliza colores del tema antes de introducir nuevos.
- Diseña estados de carga, vacío y error desde el inicio.
- Prioriza acciones claras y visibles sobre textos explicativos largos.
