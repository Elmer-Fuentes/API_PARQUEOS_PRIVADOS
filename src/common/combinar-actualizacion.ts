/** Conserva los valores existentes cuando el DTO omite una propiedad. */
export function combinarActualizacion<T extends object>(
  actual: T,
  cambios: object,
): T {
  const definidos = Object.fromEntries(
    Object.entries(cambios).filter(([, valor]) => valor !== undefined),
  );
  return { ...actual, ...definidos };
}
