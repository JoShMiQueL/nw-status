# 🎯 Event Configuration Guide

Esta guía explica cómo configurar el sistema de eventos en `config.json` para personalizar qué cambios generan notificaciones.

**Nota:** Toda la configuración de eventos se hace en el archivo `config.json`, NO en `.env`.

## 🎨 Nueva Estructura: Eventos por Servidor

Cada servidor tiene su propia configuración de eventos independiente. Esto te permite:
- ✅ Monitorear diferentes eventos en diferentes servidores
- ✅ Configurar thresholds específicos por servidor
- ✅ Habilitar/deshabilitar servidores individualmente
- ✅ Añadir descripciones para documentar tu configuración

## 📋 Tipos de Eventos Disponibles

### Eventos Simples (Sin Opciones)

Estos eventos se activan cuando cambia un estado binario (abierto/cerrado, online/offline):

| Tipo | Descripción | Ejemplo de Uso |
|------|-------------|----------------|
| `transfer_to_change` | Transferencias **hacia** el servidor | Notificar cuando se abren las transferencias a Nysa |
| `transfer_from_change` | Transferencias **desde** el servidor | Notificar cuando se cierran las transferencias desde Valhalla |
| `server_status_change` | Estado del servidor (online/offline) | Notificar cuando el servidor se cae |
| `character_creation_change` | Creación de personajes | Notificar cuando se abre la creación de personajes |

### Eventos con Threshold (Con Opciones)

Estos eventos requieren configurar un umbral numérico:

| Tipo | Descripción | Opciones Requeridas |
|------|-------------|---------------------|
| `queue_change` | Cola del servidor cruza un umbral | `threshold` (número), `direction` (opcional) |
| `population_change` | Población cruza un umbral | `threshold` (número), `direction` (opcional) |

#### Direcciones de Threshold

- `"above"`: Solo notifica cuando el valor **sube** por encima del umbral
- `"below"`: Solo notifica cuando el valor **baja** por debajo del umbral
- `"both"`: Notifica en ambas direcciones (por defecto)

## 🔧 Estructura de Configuración

### Formato Básico en config.json

```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "description": "Servidor principal",
      "events": {
        "triggers": [
          {
            "type": "nombre_del_evento",
            "enabled": true,
            "description": "Descripción opcional"
          }
        ]
      }
    }
  ]
}
```

### Campos del Servidor

- **`name`** (requerido): Nombre del servidor (debe coincidir exactamente con nwdb.info)
- **`enabled`** (opcional): `true` o `false`, por defecto `true`. Si es `false`, el servidor no se monitorea
- **`description`** (opcional): Descripción para documentar la configuración
- **`events`** (requerido): Objeto con la configuración de eventos para este servidor

### Campos de los Triggers

- **`type`** (requerido): Tipo de evento a monitorear
- **`enabled`** (opcional): `true` o `false`, por defecto `true`
- **`description`** (opcional): Descripción del trigger

### Ejemplo con Threshold

```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "events": {
        "triggers": [
          {
            "type": "queue_change",
            "enabled": true,
            "options": {
              "threshold": 300,
              "direction": "both"
            },
            "description": "Notificar cuando la cola cruza 300"
          }
        ]
      }
    }
  ]
}
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: Solo Transferencias (Configuración Mínima)

**Caso de uso**: Solo quiero saber cuando se abren las transferencias a mi servidor.

Edita `config.json`:

```json
{
  "servers": ["Nysa"],
  "checkInterval": 300000,
  "events": {
    "triggers": [
      {
        "type": "transfer_to_change",
        "enabled": true
      }
    ]
  }
}
```

---

### Ejemplo 2: Transferencias + Estado del Servidor

**Caso de uso**: Quiero saber cuando se abren transferencias Y cuando el servidor se cae.

```json
{
  "servers": ["Nysa"],
  "events": {
    "triggers": [
      {
        "type": "transfer_to_change",
        "enabled": true
      },
      {
        "type": "server_status_change",
        "enabled": true
      }
    ]
  }
}
```

---

### Ejemplo 3: Monitorear Cola con Threshold

**Caso de uso**: Quiero que me avise cuando la cola supera 300 jugadores o baja de 300.

```json
{
  "servers": ["Nysa"],
  "events": {
    "triggers": [
      {
        "type": "queue_change",
        "enabled": true,
        "options": {
          "threshold": 300,
          "direction": "both"
        }
      }
    ]
  }
}
```

---

### Ejemplo 4: Solo Avisar Cuando la Cola Sube

**Caso de uso**: Solo quiero notificación cuando la cola **supera** 500, no cuando baja.

```json
{
  "servers": ["Nysa"],
  "events": {
    "triggers": [
      {
        "type": "queue_change",
        "enabled": true,
        "options": {
          "threshold": 500,
          "direction": "above"
        }
      }
    ]
  }
}
```

---

### Ejemplo 5: Múltiples Servidores con Diferentes Eventos

**Caso de uso**: Monitorear Nysa con eventos completos, Valhalla solo transferencias, y El Dorado deshabilitado.

```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "description": "Servidor principal - monitoreo completo",
      "events": {
        "triggers": [
          {
            "type": "transfer_to_change",
            "enabled": true
          },
          {
            "type": "server_status_change",
            "enabled": true
          },
          {
            "type": "queue_change",
            "enabled": true,
            "options": {
              "threshold": 300,
              "direction": "both"
            }
          }
        ]
      }
    },
    {
      "name": "Valhalla",
      "enabled": true,
      "description": "Servidor secundario - solo transferencias",
      "events": {
        "triggers": [
          {
            "type": "transfer_to_change",
            "enabled": true
          }
        ]
      }
    },
    {
      "name": "El Dorado",
      "enabled": false,
      "description": "Temporalmente deshabilitado",
      "events": {
        "triggers": []
      }
    }
  ]
}
```

---

### Ejemplo 6: Thresholds Diferentes por Servidor

**Caso de uso**: 
- Nysa: Cola > 500 (servidor muy poblado)
- Valhalla: Cola > 100 (servidor menos poblado)

```json
{
  "servers": [
    {
      "name": "Nysa",
      "enabled": true,
      "description": "Servidor muy poblado - threshold alto",
      "events": {
        "triggers": [
          {
            "type": "queue_change",
            "enabled": true,
            "options": {
              "threshold": 500,
              "direction": "both"
            },
            "description": "Threshold alto para servidor poblado"
          }
        ]
      }
    },
    {
      "name": "Valhalla",
      "enabled": true,
      "description": "Servidor menos poblado - threshold bajo",
      "events": {
        "triggers": [
          {
            "type": "queue_change",
            "enabled": true,
            "options": {
              "threshold": 100,
              "direction": "both"
            },
            "description": "Threshold bajo para detectar cambios tempranos"
          }
        ]
      }
    }
  ]
}
```

---

### Ejemplo 7: Todos los Eventos Posibles

**Caso de uso**: Monitorear absolutamente todo.

```json
{
  "servers": ["Nysa"],
  "events": {
    "triggers": [
      {
        "type": "transfer_to_change",
        "enabled": true
      },
      {
        "type": "transfer_from_change",
        "enabled": true
      },
      {
        "type": "server_status_change",
        "enabled": true
      },
      {
        "type": "character_creation_change",
        "enabled": true
      },
      {
        "type": "queue_change",
        "enabled": true,
        "options": {
          "threshold": 100,
          "direction": "both"
        }
      }
    ]
  }
}
```

## 🛠️ Método Recomendado

Usa el archivo `config.json` directamente. Tiene ventajas:

- ✅ **JSON Schema incluido**: Autocomplete en VS Code
- ✅ **Fácil de editar**: Formato legible con comentarios via `description`
- ✅ **Validación automática**: El schema detecta errores
- ✅ **Sin minificación**: No necesitas comprimir el JSON

### Activar Autocomplete en VS Code

El archivo `config.example.json` ya incluye la referencia al schema:

```json
{
  "$schema": "./config.schema.json",
  ...
}
```

Copia esto a tu `config.json` para obtener autocomplete y validación.

## ⚠️ Notas Importantes

1. **Configuración por defecto**: Si `config.json` no existe o es inválido, se usará:
   - Un servidor: `Nysa` habilitado
   - Eventos: `transfer_to_change` y `server_status_change` habilitados

2. **Validación**: Si el JSON es inválido, verás un warning en consola y se usará la configuración por defecto.

3. **Nombres de servidores**: Deben coincidir exactamente con los nombres en nwdb.info (case-sensitive).

4. **Servidores deshabilitados**: Si `enabled: false`, el servidor no se monitorea en absoluto (ahorra recursos).

5. **Eventos por servidor**: Cada servidor tiene su propia lista de triggers independiente. No hay triggers globales.

4. **Thresholds de población**: Los valores son:
   - Low = 1
   - Medium = 2
   - High = 3
   - Full = 4

5. **Primera ejecución**: En el primer check no se envían notificaciones de cambios (no hay estado previo para comparar).

## 🔍 Debugging

Para verificar que tu configuración es correcta, revisa los logs al iniciar:

```
🚀 New World Server Status Monitor
===================================
📡 Monitoring servers: Nysa, Valhalla
⏱️  Check interval: 300s
===================================
```

Si ves un warning sobre configuración inválida:
```
⚠️  Invalid EVENTS configuration, using defaults: [error details]
```

Verifica:
1. El JSON está bien formado (sin comas extra, comillas correctas)
2. Los tipos de evento son válidos
3. Los eventos con threshold tienen el campo `options` con `threshold`
