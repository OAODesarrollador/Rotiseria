# 🔐 Acceso al Panel de Administración - La Parrilla

## ¿Cómo acceder?

### Paso 1: Ir a la página de login
Abre tu navegador y ve a:
```
http://localhost:3000/admin
```

### Paso 2: Ingresa la contraseña
La contraseña se configura en el archivo `.env.local`:
```
ADMIN_PASSWORD=admin123
```

Por defecto es: **`admin123`**

Si quieres cambiarla, edita `.env.local` y reinicia el servidor.

### Paso 3: Accede al Dashboard
Una vez autenticado, serás redirigido a:
```
http://localhost:3000/admin/dashboard
```

---

## 📋 ¿Qué puedes hacer en el Dashboard?

### ✅ Crear Productos
1. Click en botón **"+ Crear Nuevo Producto"**
2. Completa el formulario:
   - **Nombre** (requerido)
   - **Descripción** (opcional)
   - **Precio** (requerido, en pesos)
   - **Categoría** (requerido: LA PARRILLA, COMBOS, etc.)
   - **URL de Imagen** (opcional)
   - **Orden de Presentación** (opcional)
   - **Disponible** (checkbox)
3. Click en **"Crear"**

### ✏️ Editar Productos
1. Busca el producto en la tabla
2. Click en el botón ✏️ (lápiz)
3. Modifica los datos que necesites
4. Click en **"Actualizar"**

### 🗑️ Eliminar Productos
1. Click en el botón 🗑️ (basura)
2. Confirma la eliminación
3. El producto se elimina inmediatamente

### 🔍 Buscar y Filtrar
- **Búsqueda**: Escribe en el campo "Buscar por nombre..."
- **Filtro por Categoría**: Selecciona una categoría en el dropdown

---

## 📊 Estructura de Datos de Producto

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| ID | Número | Auto | Generado automáticamente |
| Nombre | Texto | ✅ | Máximo 100 caracteres |
| Descripción | Texto | ❌ | Máximo 500 caracteres |
| Precio | Número | ✅ | En pesos (ej: 2500 = $25.00) |
| Categoría | Texto | ✅ | LA PARRILLA, COMBOS, BEBIDAS, etc. |
| Imagen | URL | ❌ | Ruta o URL externa |
| Disponible | Booleano | ❌ | Por defecto: Verdadero |
| Orden | Número | ❌ | Para ordenar presentación (menor = primero) |

---

## 🔗 APIs Disponibles (Si accedes directamente)

### Crear Producto
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Asado Completo",
    "precio": 2500,
    "categoria": "LA PARRILLA"
  }'
```

### Obtener Todos
```bash
curl http://localhost:3000/api/admin/products
```

### Actualizar Producto
```bash
curl -X PATCH http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "precio": 2800,
    "descripcion": "Nuevo precio"
  }'
```

### Eliminar Producto
```bash
curl -X DELETE "http://localhost:3000/api/admin/products?id=1"
```

---

## ⚠️ Notas Importantes

- **Autenticación**: Se usa cookie `admin_token` (automática)
- **BD Local**: Por defecto usa `local.db` en el directorio raíz
- **Validaciones**: Todos los campos se validan en cliente y servidor
- **Cambios en Vivo**: Los productos actualizados aparecen inmediatamente en la tienda
- **Precios**: Se almacenan como enteros (multiplica por 100 si usas decimales)

---

## 🆘 Solución de Problemas

### No me deja entrar al admin
- ✅ Verifica que el servidor esté corriendo: `npm run dev`
- ✅ Confirma la contraseña en `.env.local`
- ✅ Limpia cookies del navegador y vuelve a intentar

### Los cambios no aparecen
- ✅ Recarga la página del admin
- ✅ La tienda se actualiza automáticamente

### El servidor dice "Puerto 3000 en uso"
- ✅ Mata otros procesos: `netstat -ano | findstr :3000`
- ✅ Luego: `taskkill /PID <PID> /F`

---

## 🎯 Ejemplo Completo

1. **Vas a**: `http://localhost:3000/admin`
2. **Ingresas contraseña**: `admin123` (por defecto)
3. **Ves tabla** con productos actuales
4. **Click en "Crear"** → Abre formulario
5. **Rellenas**: 
   - Nombre: "Costilla BBQ"
   - Precio: 1500
   - Categoría: "LA PARRILLA"
6. **Click "Crear"** → Se agrega a BD
7. **Vuelves a tienda** (`http://localhost:3000/`) → ¡Aparece el producto!

---

**¡Listo!** 🎉 Ya puedes gestionar tu base de datos de productos desde el frontend.
