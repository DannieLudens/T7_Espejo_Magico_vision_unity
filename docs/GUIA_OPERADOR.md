# Guía del operador — Espejo Mágico

Controles ocultos para el guía del kiosco: sirven para destrabar a un visitante, forzar un paso
o ajustar el kiosco sin salir de la experiencia. El visitante no los ve; se usan con el teclado
y el mouse conectados al equipo (o con el navegador en la versión web).

## Flujo normal

```
Espejo (reposo) → Tutorial de la pinza → Standby → Menú de presentadores
  → Intro → Experiencia (videos + puntos de control con objeto) → Outro
  → Pantalla final → Fotomatón (filtro) → Foto con QR → Espejo
```

- El kiosco **arranca en el Espejo** y **vuelve solo al Espejo** cuando la visita termina
  ("← Volver" del fotomatón, "↩ Volver al inicio", el regreso automático de la pantalla
  final a los 30 s y el fin del tiempo del QR).
- **Inactividad:** si en Standby, el Menú, un punto de control de la Experiencia o el
  Fotomatón no hay mano, mouse ni tecla durante **30 s**, el kiosco vuelve al Espejo.
- **Espejo:** los bombillos del marco se encienden mientras el visitante juega con la mano;
  al completarse (≈5 s) pasa al Tutorial. Una pinza en el Espejo salta directo al Tutorial.

## Teclas

| Tecla | Dónde | Qué hace |
|---|---|---|
| `M` | Cualquier pantalla | Ir al **Espejo** (reinicia la visita). |
| `N` | Cualquier pantalla | Ir al **Menú de presentadores** (salta Espejo, Tutorial y Standby). |
| `Esc` | Espejo, Tutorial, Menú | Volver a **Standby**. |
| `Esc` | Experiencia, Outro, Final, Fotomatón, Foto | Volver al **Menú**. |
| `` ` `` (tilde invertida) | Cualquier pantalla | **Modo operador:** muestra el botón oculto del Espejo en Standby (esquina inferior derecha). El cursor del sistema siempre está visible. |
| `V` | Cualquier pantalla | Abre/cierra el **panel de audio** (volumen general, voz, música y video; silenciar; guardar). |
| `C` | Cualquier pantalla | Activa/desactiva los **subtítulos**. En el Espejo además abre el **panel del agua** (amortiguación, fuerza, radio, distorsión y tinte). |
| `G` | Menú | Abre/cierra el **panel del destello** de las tarjetas de presentadores. |
| `D` | Cualquier pantalla | Muestra/oculta los **puntos de la mano** detectados (diagnóstico del tracking). |

> En teclados en español la tilde invertida está junto al `+` y puede requerir pulsar la
> tecla y luego espacio; ambas formas funcionan.

## Clics con el mouse (forzar acciones)

| Dónde | Clic en | Qué hace |
|---|---|---|
| Standby | Esquina inferior derecha (botón oculto 🪞; visible en modo operador) | Abre el **Espejo**. |
| Tutorial, Intro, Outro | Cualquier parte de la pantalla | **Salta** la narración y sigue al siguiente paso. |
| Menú | Una **tarjeta de presentador** | La elige, igual que con la pinza. |
| Experiencia — punto de control | La **tarjeta del objeto / cámara** que pide mostrar el objeto | **Da por detectado el objeto** y continúa. Úsalo si el visitante no tiene el objeto a la mano o la cámara no lo reconoce. |
| Experiencia | Un **punto de la barra de progreso** | Salta a ese capítulo (el punto del capítulo activo confirma el objeto). El primero y el último van al inicio y al final. |
| Experiencia | **← Volver** | Regresa al Menú para elegir otro presentador. |
| Pantalla final | **💄 Prueba el maquillaje** / **↩ Volver al inicio** | Igual que con la mano. |
| Fotomatón | **📷** / **← Volver** | Toma la foto / termina la visita y vuelve al Espejo. |
| Foto con QR | **📸 Tomar otra** / **↩ Volver al inicio** | Repite la foto / vuelve al Espejo. |

Con la mano, los botones de la Experiencia también se activan dejando el dedo encima
**1.5 s** (sin necesidad de pinza).

## Situaciones frecuentes

| Situación | Qué hacer |
|---|---|
| El visitante no logra hacer la pinza | `N` para ir al Menú y clic en la tarjeta del presentador que quiera. |
| No tiene el objeto o la cámara no lo detecta | Clic sobre la tarjeta del objeto en el punto de control. |
| Se fue a mitad de la visita | No hace falta nada: a los 30 s sin interacción vuelve al Espejo (o pulsa `M`). |
| El audio está muy alto o bajo | `V`, ajusta el canal y pulsa **Guardar** (queda guardado en el equipo). |
| La mano no se detecta bien | `D` para ver los puntos; revisa luz y distancia (≈1–2 m de la cámara). |
| Hay que reiniciar la experiencia | `M` (Espejo) o recarga la página en la versión web (`F5`). |
