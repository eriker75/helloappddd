# Task: Fix "No Profiles" Flash by Implementing Circular Queue Prefetch in Swipe

## Context

Al realizar más de 5-6 swipes seguidos, la app mostraba brevemente "no hay perfiles disponibles" antes de cargar más perfiles. El comportamiento esperado es que la cola de perfiles funcione como una cola circular, prefetchando nuevos perfiles antes de quedarse vacía, evitando flashes de "no perfiles".

## Plan y Cambios Realizados

- Analicé la lógica de los servicios y el store involucrados en la gestión de la cola de perfiles swipeables.
- Detecté que el servicio solo recargaba perfiles cuando la cola estaba vacía, no cuando estaba baja.
- Implementé un método `appendProfiles` en el store `nearby-swipeable-profiles.store.ts` para permitir agregar perfiles adicionales sin duplicados.
- Modifiqué el servicio `useLoadSwipeableProfiles` en `UserProfileService.ts` para que, cuando la cola tenga ≤2 perfiles, haga prefetch y agregue más perfiles automáticamente.
- Se resolvió un error de tipado en el store.

## Archivos Modificados

- `src/presentation/stores/nearby-swipeable-profiles.store.ts`
- `src/presentation/services/UserProfileService.ts`

## Observaciones

- El umbral de prefetch es configurable (actualmente 2).
- El cambio previene el flash de "no perfiles" y mejora la experiencia de usuario.
- Se recomienda probar el flujo de swipes para validar el comportamiento circular y la ausencia de flashes.
