/**
 * duracionJwtEnMinutos
 * ---------------------------------------------------------------------------
 * Autor: Elmer Fuentes
 *
 * Definición:
 * Convierte el valor de una variable de entorno (por ejemplo `JWT_LOGIN_MINUTES`
 * o `JWT_SESSION_MINUTES`) en una duración expresada en MINUTOS, para poder
 * calcular la fecha de expiración de un accessToken o un refreshToken.
 *
 * Formatos aceptados en `valor`:
 *  - Un número solo (sin sufijo)  => se interpreta en MINUTOS.  Ej: "30"  -> 30 min
 *  - Un número con sufijo "s"     => SEGUNDOS.                  Ej: "15s" -> 0.25 min
 *  - Un número con sufijo "m"     => MINUTOS.                   Ej: "30m" -> 30 min
 *  - Un número con sufijo "h"     => HORAS.                     Ej: "8h"  -> 480 min
 *
 * En este proyecto se usa así:
 *  - JWT_LOGIN_MINUTES   -> duración del refreshToken (payload.tipo = "login").
 *                            Debe configurarse en "168h" (7 días).
 *  - JWT_SESSION_MINUTES -> duración del accessToken (payload.tipo = "session").
 *                            Debe configurarse en "15s" (15 segundos).
 *
 * @param nombre                  Nombre de la variable de entorno (solo para el mensaje de error).
 * @param valor                   Valor crudo leído de `process.env` (puede ser undefined).
 * @param minutosPredeterminados  Valor por defecto, en minutos, si `valor` no viene definido.
 * @returns                       Duración en minutos (puede ser fraccionaria, ej. 0.25 = 15s).
 * @throws Error                  Si el formato no es válido o el resultado es <= 0.
 */
export function duracionJwtEnMinutos(
  nombre: string,
  valor: string | undefined,
  minutosPredeterminados: number,
): number {
  const texto = (valor ?? String(minutosPredeterminados)).trim();
  const partes = /^(\d+(?:\.\d+)?|\.\d+)\s*([smh])?$/i.exec(texto);
  const cantidad = partes ? Number(partes[1]) : NaN;
  const unidad = partes?.[2]?.toLowerCase();
  // Los valores sin sufijo mantienen el contrato original: minutos.
  const segundos = cantidad * (unidad === 's' ? 1 : unidad === 'h' ? 3600 : 60);

  if (
    !Number.isSafeInteger(segundos) ||
    segundos < 1 ||
    Date.now() + segundos * 1000 > 8_640_000_000_000_000
  ) {
    throw new Error(
      `${nombre}: duración inválida. Use minutos sin sufijo o una duración como 15s, 30m u 8h, en segundos completos y mayor que cero.`,
    );
  }

  return segundos / 60;
}
