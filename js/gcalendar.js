/**
 * Lusso Beauty Salón - Google Calendar API Integration Module
 * Handles automated synchronization of appointments between Lusso CRM and Google Calendar.
 * 100% Free standard Google Cloud Calendar API quota.
 */

(function () {
  const GCAL_STORAGE_KEY = 'lusso_gcalendar_config_v1';

  class LussoGoogleCalendar {
    constructor() {
      this.config = this.loadConfig();
      this.isSyncing = false;
    }

    loadConfig() {
      try {
        const saved = localStorage.getItem(GCAL_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error loading GCal config:', e);
      }
      return {
        apiKey: '',
        calendarId: '',
        clientId: '',
        autoSync: true,
        lastSync: null,
        status: 'unconfigured'
      };
    }

    saveConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      try {
        localStorage.setItem(GCAL_STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Error saving GCal config:', e);
      }
      this.updateUIStatus();
    }

    isConfigured() {
      return Boolean(this.config.calendarId && (this.config.apiKey || this.config.clientId));
    }

    createCalendarEventUrl(appointment) {
      if (!appointment) return 'https://calendar.google.com';

      const title = encodeURIComponent(`💅 ${appointment.service || 'Servicio'} - ${appointment.clientName || 'Clienta'} (${appointment.specialist || 'Lusso'})`);
      const details = encodeURIComponent(
        `✨ Cita en Lusso Beauty Salón\n` +
        `Clienta: ${appointment.clientName}\n` +
        `Teléfono: ${appointment.clientPhone || 'N/A'}\n` +
        `Especialista: ${appointment.specialist}\n` +
        `Servicio: ${appointment.service}\n` +
        `Notas: ${appointment.notes || 'Ninguna'}\n\n` +
        `📍 Calle Berlín 481, Miraflores, Lima\n` +
        `📞 WhatsApp: +51 971 988 386`
      );
      const location = encodeURIComponent('Calle Berlín 481, Miraflores, Lima');

      const dateStr = appointment.date || new Date().toISOString().split('T')[0];
      let startHour = 11;
      let startMin = 0;

      if (appointment.time) {
        const match = appointment.time.match(/(\d+):?(\d+)?/);
        if (match) {
          startHour = parseInt(match[1], 10);
          startMin = match[2] ? parseInt(match[2], 10) : 0;
          if (/pm/i.test(appointment.time) && startHour < 12) startHour += 12;
        }
      }

      const start = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const startIso = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endIso = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    }

    async testConnection(apiKey, calendarId) {
      const key = (apiKey || this.config.apiKey || '').trim();
      const calId = encodeURIComponent((calendarId || this.config.calendarId || '').trim());

      if (!key || !calId) {
        return { success: false, message: 'Por favor ingresa tanto la Clave de API como el ID de Calendario (correo de Gmail).' };
      }

      const now = new Date();
      const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${key}&timeMin=${encodeURIComponent(timeMin)}&maxResults=10&singleEvents=true&orderBy=startTime`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.items) {
          this.saveConfig({
            apiKey: key,
            calendarId: decodeURIComponent(calId),
            status: 'connected',
            lastSync: new Date().toISOString()
          });
          return {
            success: true,
            message: `¡Conexión exitosa con Google Calendar! Se encontraron ${data.items.length} eventos recientes en el calendario.`,
            count: data.items.length
          };
        } else {
          const errorMsg = data.error?.message || 'Verifica que el ID de calendario y la clave de API sean válidos.';
          this.saveConfig({ status: 'error' });
          return { success: false, message: `Error de Google API: ${errorMsg}` };
        }
      } catch (err) {
        return { success: false, message: `No se pudo conectar a Google Calendar: ${err.message}` };
      }
    }

    async syncFromGoogle() {
      if (!this.isConfigured()) {
        return { success: false, message: 'Google Calendar no está configurado aún.' };
      }

      const key = this.config.apiKey;
      const calId = encodeURIComponent(this.config.calendarId.trim());
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${key}&timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=100`;

      this.isSyncing = true;
      this.updateUIStatus();

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.items) {
          this.isSyncing = false;
          this.updateUIStatus();
          return { success: false, message: data.error?.message || 'Error al obtener eventos.' };
        }

        let importedCount = 0;
        const currentAppointments = window.lussoDB ? window.lussoDB.getAppointments() : [];

        data.items.forEach(ev => {
          if (!ev.summary) return;

          const startDateTime = ev.start?.dateTime || ev.start?.date;
          if (!startDateTime) return;

          const datePart = startDateTime.substring(0, 10);
          let timePart = '11:00';
          if (startDateTime.includes('T')) {
            timePart = startDateTime.split('T')[1].substring(0, 5);
          }

          const summary = ev.summary;
          let specialist = 'Kiara';
          if (summary.toLowerCase().includes('cielo')) specialist = 'Cielo';

          let clientName = summary.replace(/💅|💇‍♀️|✨|corte|manicure|pedicure|balayage|mechas/gi, '').trim();
          if (clientName.startsWith('-')) clientName = clientName.substring(1).trim();
          if (!clientName) clientName = 'Clienta Google Calendar';

          const exists = currentAppointments.some(a => a.date === datePart && (a.clientName === clientName || a.id === `gcal-${ev.id}`));

          if (!exists && window.lussoDB) {
            window.lussoDB.saveAppointment({
              id: `gcal-${ev.id}`,
              date: datePart,
              time: timePart,
              clientName: clientName,
              service: summary,
              specialist: specialist,
              status: 'confirmed',
              notes: ev.description || 'Importada desde Google Calendar'
            });
            importedCount++;
          }
        });

        this.isSyncing = false;
        this.saveConfig({ lastSync: new Date().toISOString(), status: 'connected' });

        if (window.lussoCRM) {
          window.lussoCRM.refreshAppointments();
        }

        return {
          success: true,
          message: `Sincronización completada. ${importedCount} nuevas citas importadas desde Google Calendar.`,
          importedCount
        };
      } catch (err) {
        this.isSyncing = false;
        this.updateUIStatus();
        return { success: false, message: `Error en sincronización: ${err.message}` };
      }
    }

    updateUIStatus() {
      const badge = document.getElementById('gcal-sync-badge');
      const text = document.getElementById('gcal-sync-status-text');
      if (!badge || !text) return;

      if (this.isSyncing) {
        badge.className = 'badge-syncing';
        text.textContent = '🔄 Sincronizando con Google Calendar...';
      } else if (this.config.status === 'connected') {
        badge.className = 'badge-connected';
        text.textContent = `🟢 Conectado: ${this.config.calendarId}`;
      } else if (this.config.status === 'error') {
        badge.className = 'badge-error';
        text.textContent = '⚠️ Error en conexión Google Calendar';
      } else {
        badge.className = 'badge-unconfigured';
        text.textContent = '⚪ Google Calendar no configurado';
      }
    }
  }

  window.lussoGCalendar = new LussoGoogleCalendar();
})();
