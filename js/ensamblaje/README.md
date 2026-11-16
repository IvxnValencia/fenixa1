# Guía de ensamblaje 3D

Visor 3D interactivo de la sección `#ensamblaje`. Se construye por fases; este
documento describe lo que existe hoy y cómo ampliarlo.

## Estado por fases

| Fase | Estado |
|---|---|
| 2 · Motor 3D | **Hecha**: visor, cámara, selección, inspección, vista separada, interior. |
| 3 · Ensamblaje (arrastre, encaje, validación) | **Hecha**: modo práctica con 7 piezas (CPU, disipador, 2 RAM, M.2, GPU, fuente). La placa ya está en el gabinete; montar la placa en el gabinete y los cables queda pendiente. |
| 4 · Integración con Mi build | **Hecha**: perfil de la build, revisión previa, ruta generada, escena 3D con solo las piezas de la build y checklist enlazado con la práctica. |
| 5 · Demostración en bucle | **Hecha**: modalidad B ("Ver demostración") con secuencias por pieza, pausa, reinicio, velocidad 0,5× y cambio de modalidad sin perder el progreso. |
| 6 · Tips y checklist | **Hecha**: zona "Paso actual" con anterior/siguiente, tips en cinco categorías según la build, y avance guardado por build. |
| 7 · Optimización y pruebas | **Hecha**: mallas fusionadas (−52 % de llamadas de dibujo), prueba integral automatizada e informe abajo. |

## Pruebas y rendimiento (Fase 7)

Ejecutar con el servidor local (`py -m http.server 8123`) y abrir cada página:

| Página | Qué cubre | Resultado |
|---|---|---|
| `tests/assembly-validation.html` | Encaje: posición, giro, volteo, zona, ocupación, ranura recomendada, dependencias, compatibilidad, AIO y disipador de serie | 32/32 |
| `tests/assembly-route.html` | Perfil de build y ruta con builds AMD, Intel, incompatibles, SO-DIMM, externas, SATA, sin GPU, sin gabinete y vacías | 26/26 |
| `tests/assembly-progress.html` | Tips por categoría y persistencia (corrupción, límite de builds, almacenamiento bloqueado) | 24/24 |
| `tests/assembly-smoke.html` | **Prueba integral** en iframe: build vacía y real, ruta, práctica, demostración, cambio de modalidad, persistencia tras recargar, cambio de build, ciclos de carga, reposo, responsividad a 375/768/1024/1440/1920 px y consola | 26/26 |

La prueba integral guarda y restaura Mi build, el avance y la modalidad del
navegador donde se ejecuta. Para que mida bien, la pestaña debe estar visible.

Medidas (local, RTX 4050 vía ANGLE/D3D11, visor de 1152 × 697 px, ratio de píxeles 1,25):

| Medida | Antes | Después |
|---|---|---|
| Llamadas de dibujo | 114 | 55 |
| Tiempo de render por fotograma | 1,99 ms | 1,24 ms |
| Triángulos | 3.906 | 3.906 |
| Fotogramas en reposo (1,5 s) | 0 | 0 |
| Descarga al abrir la guía | 345 KB (Three.js 136 KB comprimido; módulos propios sin comprimir en local) | igual |
| Resto de secciones | No descargan Three.js ni la guía | igual |
| Heap JS en 15 ciclos de entrada y salida | — | 18,6–23,9 MB, sin crecimiento sostenido |
| Contextos WebGL tras 6 ciclos | — | 1 |

No se ha medido en un equipo de gama media real: el objetivo de rendimiento se
infiere del margen (1,24 ms por fotograma en una GPU dedicada de portátil) y de
la resolución adaptable. Conviene probarlo en un portátil con gráficos integrados.

## Tips, paso actual y avance (Fase 6)

| Archivo | Responsabilidad |
|---|---|
| `tips.js` | Tips por paso en cinco categorías: Precaución, Error común, Tip, Buena práctica y Dato técnico. Se adaptan a la build (socket LGA o AM4, DDR5, EXPO/XMP, conector de 16 pines, refrigeración de aire, líquida o de serie, alturas y longitudes frente al gabinete). Si falta un dato, el tip no aparece. |
| `progress-store.js` | Guarda en `localStorage` (`fenixa-assembly-progress-v1`), por firma de build, los pasos hechos, el paso abierto y las piezas instaladas en la práctica. Recuerda como máximo 8 builds, valida los datos al leerlos y funciona en memoria si el almacenamiento falla. La modalidad se guarda aparte (`fenixa-assembly-mode-v1`). |

Zona "Paso actual" (`#assemblyStepPanel`): número de paso, instrucciones,
origen de los datos y modalidad. Las precauciones y los errores comunes se ven
siempre; el resto de tips se despliega a demanda. Incluye Anterior, "Hecho,
siguiente paso" y Siguiente. Volver a un paso anterior no desmarca nada.

Reglas de sincronización con la práctica:
- instalar todas las piezas de un paso lo marca como hecho;
- desinstalar una de ellas lo desmarca;
- "Empezar de cero" en la práctica no borra los pasos marcados a mano, que
  pueden estar hechos en el PC real;
- "Reiniciar guía" lo borra todo.

Animaciones y visibilidad: el motor pausa el dibujo cuando el visor no está en
pantalla. Las interpolaciones que cambian estado (encaje, desinstalación,
cámara) son *esenciales* y se completan al instante si el visor no se ve; la
demostración en bucle queda en pausa.

Pruebas: `tests/assembly-progress.html` (24 casos de tips y persistencia).

## Integración con Mi build (Fase 4)

Flujo: `assembly-viewer-loader.js` → `guide.js` → `build-profile.js` + `route.js` → `3d/viewer.js`.

| Archivo | Responsabilidad |
|---|---|
| `build-profile.js` | **Perfil de montaje** (módulo puro). Para cada dato indica su origen: `ficha` (verificado en `FENIXA_SPECS`), `texto` (deducido del nombre) o `generico` (sin dato). Detecta incompatibilidades (socket, DDR, SO-DIMM, M.2 sin ranura, CPU sin gráficos ni GPU, fuente SFX/ATX, fondo de la fuente, sockets del disipador, vatios recomendados) y piezas que faltan. Reutiliza `FENIXA_FIT` para formato placa–gabinete y espacio de GPU y disipador. |
| `route.js` | **Generador de rutas** (módulo puro). Crea solo los pasos que la build justifica y en el orden real: torre de aire antes de meter la placa en el gabinete, refrigeración líquida después, SSD M.2 o unidad SATA según el formato, sin paso de GPU si no hay gráfica. También genera `sceneSpec()` para el visor. |
| `guide.js` | Lee Mi build, dibuja la revisión previa y el checklist, crea el visor y se regenera con `fenixa-build-changed`. Al instalar piezas en la práctica, marca los pasos correspondientes. |

Escena según la build: formato de placa (ATX, micro-ATX, Mini-ITX; E-ATX usa el
contorno ATX y lo avisa), número de ranuras DIMM y ranuras recomendadas según
los módulos, altura publicada de la torre de aire, longitud publicada de la GPU
y radiador AIO del tamaño de la ficha. Los nombres son los de tus piezas, pero
los modelos siguen siendo genéricos. Si falta la placa o el gabinete, se
muestran como referencia marcada "No está en tu build".

Pruebas: `tests/assembly-route.html` (26 casos de perfil y ruta).

## Asistencia visual en bucle (Fase 5)

`3d/demo.js` anima un **fantasma**: una copia visual de la pieza que comparte
geometrías y usa materiales tintados. La pieza real se oculta mientras dura la
demostración y vuelve tal cual al detenerla. La demostración nunca cambia el
estado de montaje ni marca pasos: el usuario debe hacerlo después, en el
simulador o en su PC.

Etapas: sujetar (puntos cian), orientar (marca dorada sobre la zona), acercar,
insertar, presionar (solo M.2), fijar (tornillos o palanca, en amarillo) y
listo. Después vuelve al inicio y se repite. Las secuencias siguen el
procedimiento físico correcto:
- el CPU baja en vertical y se suelta, sin presionar ni deslizar;
- la RAM se presiona por ambos extremos;
- el M.2 entra inclinado unos 25° y luego se baja;
- la gráfica entra en vertical;
- la fuente se desliza en su bahía;
- los disipadores se aprietan de forma alterna.

Controles: Pausar o Reproducir (tecla Espacio), Reiniciar y Velocidad 1× / 0,5×.
Con `prefers-reduced-motion`, la demostración empieza en pausa.

La modalidad se elige en el panel del visor o en el paso del checklist
("Hazlo tú" / "Ver demostración") y se conserva al regenerar el visor.
Durante la demostración no se puede arrastrar.

## Carga y tecnología

- **Three.js 0.170.0** con versión fija, declarado en el *import map* de `index.html`.
  Se sirve desde jsDelivr **solo cuando se abre `#ensamblaje`**; el resto de
  FENIXA no descarga nada nuevo. Para no depender del CDN, se pueden copiar
  `build/three.module.min.js` y `examples/jsm/` a `js/vendor/three/` y cambiar
  las dos rutas del import map.
- `assembly-viewer-loader.js` es un script clásico, como el resto del proyecto:
  comprueba WebGL y la compatibilidad con import maps, importa el visor con
  `import()` y lo libera al salir de la ruta. Sin WebGL, la guía conserva la
  ilustración y el checklist.
- No hay sistema de build. Para probar en local:
  `py -m http.server 8123` y abrir `http://127.0.0.1:8123/#ensamblaje`.

## Módulos (`3d/`)

| Archivo | Responsabilidad |
|---|---|
| `engine.js` | Renderizador, cámara, OrbitControls, luces, render bajo demanda, pausa si no es visible, resolución adaptable y liberación de recursos. |
| `kit.js` | Geometrías unitarias y materiales compartidos, variantes de resaltado y ayudantes de instanciación. |
| `generic-models.js` | Modelos genéricos procedurales, sus metadatos (`MODEL_DEFINITIONS`) y las distribuciones de placa por formato. |
| `pc-scene.js` | Composición del PC: piezas como grupos seleccionables, montadas en los puntos de montaje de la placa; desplazamientos de la vista separada. |
| `selection.js` | Selección por rayos con piezas superpuestas y aspecto según el estado. |
| `labels.js` | Etiquetas HTML proyectadas, sin solapamientos (modo inspección). |
| `animation.js` | Interpolaciones, vuelo de cámara y encuadre; respeta `prefers-reduced-motion`. |
| `part-info.js` | Fichas genéricas por tipo de pieza: función, ubicación, instalación, precauciones y errores. |
| `model-registry.js` | Busca modelos GLB específicos en `assets/models/manifest.json` y carga `GLTFLoader` bajo demanda. **Todavía no está conectado al visor ni se ha probado con un GLB real.** |
| `mounting.js` | **Encaje y validación** (módulo puro, sin Three.js): reglas por pieza (tolerancias, giros válidos, volteo, dependencias, mensajes) y `validate()`. |
| `assembly.js` | **Interacción de montaje**: zona de espera, "tomar" la pieza, arrastre en un plano paralelo a la placa, giro y volteo, zonas de montaje, huella proyectada, encaje animado y desinstalación. |
| `viewer.js` | Interfaz del visor y orquestación. Expone `select`, `inspect`, `setExploded`, `setInterior`, `setPractice`, `resetView` y `dispose`, y avisa de los cambios de montaje con `onAssemblyChange`. |

## Modo práctica (Fase 3)

1. Al elegir una pieza, esta sale de la zona de espera y se coloca junto a su
   zona de montaje, sin orientarla, y la cámara se acerca.
2. El usuario la arrastra sobre un plano paralelo a la placa, a la altura justa
   para librar ranuras y seguros. Una huella sobre la placa marca dónde caería:
   verde si es válida, ámbar si está cerca o mal orientada, roja si hay un error.
3. Para orientarla hay botones y teclas: Q/E giran 15°, R gira 90° y F voltea.
   El punto dorado de la pieza debe coincidir con el de la zona.
4. Al soltarla, `validate()` comprueba, en este orden: dependencias, zona y
   compatibilidad, ocupación y ranura recomendada, posición dentro de la
   tolerancia, volteo y giro dentro de la tolerancia. Solo si todo es correcto
   se anima el encaje: ajuste de posición y giro, y después la inserción.
5. Si falla, la pieza no se instala, parpadea en rojo y el panel explica qué
   corregir. Desinstalar respeta las dependencias (no se puede quitar el CPU
   con el disipador encima).

Accesibilidad: con Mayús + flechas la pieza se mueve 5 mm (1 mm si se añade Alt) e
Intro intenta instalarla, así que todo el flujo se puede completar sin ratón.

Pruebas: `tests/assembly-validation.html` (32 casos de `validate()`). Abrir con el
servidor local.

Limitaciones actuales:
- El avance de la práctica vive en memoria y se pierde al salir de `#ensamblaje`;
  la persistencia por build llega con las fases 4 y 6.
- La compatibilidad pieza–ubicación (socket, DDR4/DDR5) tiene el gancho
  `ctx.compatible` en `validate()`, pero se conectará con datos reales en la Fase 4.
- Los módulos ES internos no llevan versión en la URL: al publicar cambios, el
  navegador podría usar copias en caché de algunos archivos de `3d/` (en GitHub
  Pages, durante unos 10 minutos). Se comprobó en local: tras editar un módulo
  hizo falta forzar la recarga.

Unidades de escena: **milímetros**. Ejes del gabinete: frente hacia +Z, ventana
hacia −X, arriba +Y. Ejes de la placa: X hacia el frente desde el borde de E/S,
Y hacia arriba, Z hacia fuera de la cara de componentes.

## Fidelidad de los modelos

Todos los modelos actuales son **genéricos** y el visor lo indica siempre.
Sus contornos siguen estándares públicos (ATX, micro-ATX, Mini-ITX, DIMM, M.2
2280, fuente ATX, ventilador de 120 mm). La distribución interna de la placa
(socket, ranuras, conectores) es **ilustrativa**; la guía remite al manual para
las posiciones reales.

## Esquema de `assets/models/manifest.json`

```json
{
  "version": 1,
  "models": [
    {
      "id": "msi-pro-b650m-a-wifi",
      "productId": "motherboard-msi-pro-b650m-a-wifi",
      "type": "board",
      "generic": false,
      "name": "MSI PRO B650M-A WIFI",
      "file": "board/msi-pro-b650m-a-wifi.glb",
      "source": "URL del modelo o del fabricante, licencia y fecha",
      "dimensions": { "width": 244, "height": 244, "unit": "mm" },
      "dimensionSource": "URL de la ficha del fabricante",
      "origin": "Esquina inferior trasera del PCB, cara de componentes",
      "orientation": "X frente, Y arriba, Z fuera de la cara de componentes",
      "mountPoints": { "socket": { "accepts": "cpu", "at": [100, 160, 4.3] } },
      "interactionZones": [],
      "labels": [{ "text": "Socket", "at": [100, 190, 5] }],
      "animations": []
    }
  ]
}
```

Reglas:

- `productId` debe coincidir con el `id` del catálogo (`FENIXA_CATALOG`).
- No se añaden modelos sin `source`. Las medidas y los puntos de montaje deben
  salir de documentación del fabricante; si no existen, se usa el genérico.
- Un modelo genérico nunca se presenta como reproducción exacta.
