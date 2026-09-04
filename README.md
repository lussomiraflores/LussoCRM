# ✨ LUSSO Beauty Salón — CRM, Agenda, POS & Nómina

Sistema integral de gestión comercial, agenda de citas, punto de venta (POS) y control de remuneraciones para **LUSSO Beauty Salón** (Calle Berlín 481, Miraflores — Lima, Perú).

---

## 📱 Características Principales

1. **🔒 Seguridad y Control de Roles (Modo Estilista vs. Modo Dueña)**:
   - **Modo Estilista**: Diseñado para el uso diario en el counter y por el personal (Kiara y Cielo), protegiendo métricas de facturación acumulada, balances de caja y nóminas salariales.
   - **Modo Dueña (PIN `2026`)**: Desbloquea ingresos totales, ticket promedio, desglose de métodos de pago, gestión de gastos, nóminas y exportación de respaldos.
   - **Teclado Táctil & Físico**: Optimizado para **Tablets Samsung de 11"** (Galaxy Tab A10+) con botones táctiles grandes (≥ 48px), así como soporte completo para teclados físicos y laptops.

2. **📅 Agenda de Citas & Integración con Google Calendar**:
   - Registro y control visual de citas programadas, atendidas o por confirmar.
   - **Botón `📅 Google Cal`**: Crea eventos directamente en Google Calendar con 1 toque (incluye clienta, especialista, servicio, hora y ubicación en Miraflores).
   - **Sincronización `📥 .ics`**: Exporta todas las citas para importación directa en Google Calendar, Apple Calendar u Outlook.
   - **WhatsApp de Confirmación y Recordatorio**: Genera mensajes oficiales con datos del salón (+51 971 988 386).

3. **👥 Directorio de Clientas & Historial 360°**:
   - Buscador instantáneo por nombre, teléfono, notas generales y fórmulas técnicas.
   - Panel lateral 360° con ficha técnica (tintes, uñas, preferencias) y línea de tiempo completa de atenciones anteriores con opción de re-cobrar en 1 clic.

4. **💳 Punto de Venta (POS) & Inventario de Insumos**:
   - Registro ágil de servicios, medios de pago (Efectivo, Tarjeta, Yape/Plin, Transferencia) y propinas.
   - Emisión de ticket / comprobante de atención para enviar por WhatsApp.
   - Control de stock con alertas de reposición y modal de edición completa de insumos.

5. **📄 Asistencia, Nómina Base 30 Días & Boletas en PDF**:
   - Cálculo legal peruano base 30 días (`Tarifa diaria = Sueldo / 30`).
   - Registro de inasistencias, permisos de medio día, tardanzas, feriados trabajados y propinas en tarjeta 100% íntegras.
   - **Generador de Boleta de Liquidación en PDF**: Formato oficial imprimible en A4 con desglose de haberes, deducciones, neto a pagar y firmas de conformidad.

---

## 📂 Estructura del Repositorio

```text
LUSSO/
│
├── index.html                  # Aplicación web completa (CRM, Agenda, POS y Nómina)
│
├── css/
│   └── styles.css              # Hoja de estilos del sistema (Diseño responsive y @media print)
│
├── js/
│   ├── app.js                  # Inicializador global y manejador de modales
│   ├── crm.js                  # Controlador general: Agenda, POS, Clientas, Google Cal y Nómina
│   ├── data.js                 # Datos semilla iniciales (213 clientas y catálogo 2026)
│   └── storage.js              # Capa de almacenamiento local (LocalStorage) y cálculos contables
│
├── .gitignore                  # Exclusiones de Git (node_modules, logs, temporales)
├── README.md                   # Documentación técnica del proyecto
├── package.json                # Información y metadatos del proyecto
└── vercel.json                 # Configuración para despliegue en la nube
```

---

## 🚀 Despliegue Rápido

### Opción 1: GitHub Pages
1. Sube este repositorio a tu cuenta de GitHub.
2. Ve a **Settings** > **Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Haz clic en **Save** y obtendrás la URL pública lista para abrir en la tablet del salón.

### Opción 2: Vercel / Netlify
1. Conecta tu repositorio de GitHub en [Vercel](https://vercel.com).
2. Haz clic en **Deploy**. El archivo `vercel.json` ya está configurado para publicar la app automáticamente.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 Semántico**: Estructura limpia y accesible.
- **CSS3 Moderno**: Variables CSS, Grid, Flexbox y reglas `@media print` para exportación en PDF.
- **Vanilla JavaScript (ES6+)**: Cero dependencias pesadas, alta velocidad de carga y funcionamiento *Offline-First* mediante `localStorage`.

---

**LUSSO Beauty Salón** • *Miraflores, Lima — 2026*
