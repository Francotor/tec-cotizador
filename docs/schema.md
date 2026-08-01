# Esquema de Google Sheets — TEC Cotizador

Un solo Spreadsheet nuevo (no reutilizar el .xlsm) con 5 pestañas. Fila 1 = encabezados, datos desde fila 2.

## REGISTRO

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | N_COT | número | PK. Solo lo escribe el backend (Folio.js) |
| B | CLIENTE | texto | Razón social, denormalizado |
| C | RUT | texto | `XX.XXX.XXX-X`, FK → CLIENTES |
| D | PROYECTO | texto | |
| E | FECHA_EMISION | fecha | |
| F | VENCIMIENTO | fecha | Emisión + 7 días |
| G | DIRECCION | texto | Denormalizado desde CLIENTES |
| H | ESTADO | texto (enum) | PENDIENTE / APROBADA / RECHAZADA / FACTURADA |
| I | FORMA_PAGO | texto | |
| J | NETO | número | Total Neto (post GG+utilidades, pre-IVA) |
| K | TOTAL | número | Total a pagar (post-IVA) |
| L | GASTOS_GENERALES_PCT | número | % usado en esta cotización (default 10) |
| M | UTILIDADES_PCT | número | % usado en esta cotización (default 7) |
| N | IVA_APLICA | booleano | TRUE = "Con IVA (19%)", FALSE = Exento |
| O | OBSERVACIONES | texto | |
| P | REGISTRADO_POR | texto (enum) | Franco / Felipe / tercera persona |
| Q | FECHA_REGISTRO | timestamp | Auto, generado por backend |

## ITEMS_COTIZACION

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | N_COT | número | FK → REGISTRO.N_COT |
| B | N_ITEM | número | Orden dentro de la cotización |
| C | DESCRIPCION | texto | |
| D | UNIDAD | texto | |
| E | CANTIDAD | número | |
| F | V_UNITARIO | número | |
| G | V_TOTAL | número | = CANTIDAD × V_UNITARIO |

## CLIENTES

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | RUT | texto | PK |
| B | RAZON_SOCIAL | texto | |
| C | DIRECCION | texto | |
| D | CIUDAD_COMUNA | texto | |

## CONTACTOS

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | RUT_CLIENTE | texto | FK → CLIENTES.RUT (1 cliente → N contactos) |
| B | NOMBRE_CONTACTO | texto | |
| C | CORREO | texto | |
| D | TELEFONO | texto | |
| E | CARGO_NOTA | texto | |

## TARIFAS_BASE

| # | Columna | Tipo | Notas |
|---|---|---|---|
| A | SERVICIO_ITEM | texto | |
| B | UNIDAD | texto | hr / día / gl / ml / un |
| C | PRECIO_REF | número | |
| D | ULTIMA_ACTUALIZACION | texto | |
| E | NOTAS | texto | |

## Lógica de cálculo (idéntica al Excel original)

```
Neto parcial      = Σ (CANTIDAD × V_UNITARIO) de los ítems
Monto GG          = Neto parcial × (GASTOS_GENERALES_PCT / 100)
Monto Utilidades  = Neto parcial × (UTILIDADES_PCT / 100)
NETO (Total Neto) = Neto parcial + Monto GG + Monto Utilidades
IVA               = IVA_APLICA ? ROUND(NETO × 0.19, 0) : 0
TOTAL             = NETO + IVA
```

## Folio atómico

`N_COT` nunca se genera en el frontend. `Folio.js` en Apps Script toma `LockService.getScriptLock()`,
lee el máximo `N_COT` actual de `REGISTRO`, suma 1, y escribe la fila completa (REGISTRO + ITEMS_COTIZACION)
antes de liberar el lock. Esto evita que dos personas registrando en el mismo segundo choquen folio.
