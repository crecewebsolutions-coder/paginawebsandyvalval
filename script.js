(() => {
  'use strict';

  /* =========================================================================
     CONFIGURATION — fill these in to turn on live features.
     Nothing below breaks the site if left as-is; each feature just quietly
     stays in its current "manual" mode until configured.
     ========================================================================= */

  // 1) GOOGLE CALENDAR LIVE AVAILABILITY (reservar.html)
  //    See the big comment block above the calendar box in reservar.html for
  //    the full step-by-step setup. Fill both values below once you have them.
  const GOOGLE_CALENDAR_CONFIG = {
    calendarId: '3d1ccf1133166ce9092d6ed8ba631f611ca8e1a1cb4f29a7a0a224734cd30e91@group.calendar.google.com',
    apiKey: 'AIzaSyAU_kpOw5DOPiiSgAKE2grUxxsJZTyn0EM',
  };

  // 1b) GOOGLE APPS SCRIPT — automatically holds the selected slot on Sandy's
  //     real calendar the moment a client submits the booking request
  //     (reservar.html only). Leave blank to keep this feature off.
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwv8LvWF5CN11WvIJ3tjWKEb2pMBGqH809vKBeBTLi4OZ-Ju6z7BD-6jWGJ3RwttFBKEA/exec';

  // 2) EMAILJS — automatic emails to both the client and Sandy on booking
  //    (reservar.html, cotizacion.html, contacto.html forms).
  //    Sign up free at https://www.emailjs.com (no backend/server needed):
  //      1. Add an Email Service (connect Sandy's Gmail) → note the Service ID.
  //      2. Create a Template for "notify Sandy" with variables like
  //         {{from_name}}, {{from_email}}, {{phone}}, {{session}}, {{date}},
  //         {{message}} → note the Template ID.
  //      3. Create a second Template for "confirm to client" (sent TO the
  //         client's own email, using the same variables) → note that
  //         Template ID too.
  //      4. Copy your Public Key from Account → General.
  //    Paste all 4 values below. Until you do, forms keep using the current
  //    mailto: behavior (opens the client's own email app) — that still
  //    works today with zero setup, EmailJS just adds automatic delivery
  //    on top without the client needing to press "send" themselves.
  const EMAILJS_CONFIG = {
    publicKey: '',        // from EmailJS → Account → General
    serviceId: '',         // from EmailJS → Email Services
    templateIdOwner: '',   // template that emails Sandy
    templateIdClient: '',  // template that emails the client a confirmation
  };

  /* ---------------- LANGUAGE TOGGLE (ES default / EN) ---------------- */
  const langNodes = document.querySelectorAll('[data-en]');
  langNodes.forEach(el => { el.dataset.es = el.innerHTML; });

  const phNodes = document.querySelectorAll('[data-en-placeholder]');

  function setLang(lang){
    document.documentElement.lang = lang;
    langNodes.forEach(el => {
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    phNodes.forEach(el => {
      el.placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.esPlaceholder;
    });
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.title = lang === 'en'
      ? 'Sandy ValVal Photography Studio — Women\'s Photography in Phoenix, AZ'
      : 'Sandy ValVal Photography Studio — Fotografía femenina en Phoenix, AZ';
    localStorage.setItem('svv_lang', lang);
    document.dispatchEvent(new Event('svv:langchange'));
  }

  // Delegated click handling: this also covers the cloned mobile lang switch
  // below, since it's added to the DOM after this listener is registered.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn) setLang(btn.dataset.lang);
  });

  const savedLang = localStorage.getItem('svv_lang');
  setLang(savedLang === 'en' ? 'en' : 'es');

  /* ---------------- MOBILE LANGUAGE SWITCH ---------------- */
  // The top bar hides the language switch on phones (no room next to the
  // Reservar button + burger), so we clone it into the full-screen mobile
  // menu instead — otherwise phone visitors would have no way to change
  // language at all.
  (() => {
    const topSwitch = document.querySelector('.nav-actions .lang-switch');
    const panel = document.getElementById('navLinks');
    if (!topSwitch || !panel) return;
    const clone = topSwitch.cloneNode(true);
    clone.classList.remove('lang-switch');
    clone.classList.add('lang-switch-mobile');
    panel.insertBefore(clone, panel.firstChild);
  })();

  /* ---------------- NAV: scroll state + mobile burger ---------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const nowOpen = !navLinks.classList.contains('open');
    burger.classList.toggle('open', nowOpen);
    navLinks.classList.toggle('open', nowOpen);
    document.body.style.overflow = nowOpen ? 'hidden' : '';
    if (!nowOpen){
      document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
    }
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
      document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
    });
  });

  /* ---------------- NAV DROPDOWNS (click-based, reliable on trackpad/touch) ---------------- */
  document.querySelectorAll('.nav-drop').forEach(drop => {
    const btn = drop.querySelector('.nav-drop-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = drop.classList.contains('open');
      document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
      if (!wasOpen) drop.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
  });

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------------- FAQ ACCORDION ---------------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------------- PORTFOLIO FILTER ---------------- */
  const pfButtons = document.querySelectorAll('.pf-btn');
  const pfItems = document.querySelectorAll('.pf-item');
  pfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pfButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      pfItems.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('pf-hidden', !show);
      });
    });
  });

  /* ---------------- GOOGLE CALENDAR: LIVE AVAILABILITY CALENDAR PICKER (reservar.html) ----------------
     Reads GOOGLE_CALENDAR_CONFIG above. If it's not filled in, this whole
     block quietly does nothing and the picker stays hidden.

     HOW THIS WORKS — OPT-IN AVAILABILITY:
     Nothing is bookable by default. Sandy creates an event titled
     "Disponible" (or "Available") on her calendar for the exact date/time
     window she wants to open up — only that exact window appears as a
     pickable slot on the site. A whole-day "Disponible" event (marked
     "All day" in Google Calendar) opens the studio's normal 9am–5pm hours
     for that day instead, split into 1-hour slots. Any other real event
     that overlaps a "Disponible" window blocks just that window, as a
     safety net against accidental double-booking.

     IMPORTANT: this only READS Sandy's calendar. Clicking a day or time
     here never books, writes, or holds anything on the real calendar — it
     only fills in the hidden date/time fields below. Nothing is actually
     sent to Sandy until the client finishes the form and it goes out via
     WhatsApp/email (and the automatic calendar hold fires), same as before. */
  (() => {
    const statusBox = document.getElementById('calAvailabilityStatus');
    const summaryBox = document.getElementById('calSelectionSummary');
    const dateInput = document.getElementById('bookDate');
    const timeSelect = document.getElementById('bookTime');
    const picker = document.getElementById('calPicker');
    const daysGrid = document.getElementById('calDaysGrid');
    const timesRow = document.getElementById('calTimesRow');
    const monthLabel = document.getElementById('calMonthLabel');
    const prevBtn = document.getElementById('calPrevMonth');
    const nextBtn = document.getElementById('calNextMonth');
    if (!statusBox || !dateInput || !picker) return; // not on this page
    if (!GOOGLE_CALENDAR_CONFIG.calendarId || !GOOGLE_CALENDAR_CONFIG.apiKey){
      picker.style.display = 'none';
      return; // not configured yet
    }

    const lang = () => document.documentElement.lang === 'en';
    const AVAILABLE_TITLE_RE = /disponib|available/i; // matches "Disponible", "Disponibilidad", "Available", etc.
    const DEFAULT_DAY_START_HOUR = 9;  // used only for a whole-day "Disponible" event
    const DEFAULT_DAY_END_HOUR = 17;

    // Groups a Date into its Phoenix-local YYYY-MM-DD, regardless of the
    // visitor's own device timezone.
    function ymdInPhoenix(date){
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Phoenix', year:'numeric', month:'2-digit', day:'2-digit' }).format(date);
    }
    function formatTimeInPhoenix(date){
      return new Intl.DateTimeFormat(lang() ? 'en-US' : 'es-MX', { timeZone: 'America/Phoenix', hour:'numeric', minute:'2-digit', hour12:true }).format(date);
    }

    let windowsByDay = {};  // { 'YYYY-MM-DD': [{start:Date, end:Date}, ...] } — open "Disponible" windows
    let blockingRanges = []; // array of {start:Date, end:Date} — every other real event
    let calendarLoaded = false;
    const today = new Date(); today.setHours(0,0,0,0);
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 4, 1); // matches ~120 day fetch window
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = null; // 'YYYY-MM-DD'
    let selectedWindow = null; // {start:Date, end:Date} currently selected

    async function loadAvailability(){
      try {
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(); // next 120 days
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_CONFIG.calendarId)}/events?key=${GOOGLE_CALENDAR_CONFIG.apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Calendar fetch failed');
        const data = await res.json();

        windowsByDay = {};
        blockingRanges = [];

        (data.items || []).forEach(ev => {
          if (!ev.start || !(ev.start.date || ev.start.dateTime)) return;
          const isAvailable = ev.summary && AVAILABLE_TITLE_RE.test(ev.summary);
          const isAllDay = !!ev.start.date; // date-only (no time) = "All day" event

          if (isAvailable){
            if (isAllDay){
              // Whole-day "Disponible" — open the default studio hours that day.
              const dayStr = ev.start.date; // 'YYYY-MM-DD', already a plain date
              const dayStart = new Date(`${dayStr}T${String(DEFAULT_DAY_START_HOUR).padStart(2,'0')}:00:00-07:00`);
              const dayEnd = new Date(`${dayStr}T${String(DEFAULT_DAY_END_HOUR).padStart(2,'0')}:00:00-07:00`);
              // Split into 1-hour windows so slot buttons stay a consistent size.
              for (let h = DEFAULT_DAY_START_HOUR; h < DEFAULT_DAY_END_HOUR; h++){
                const s = new Date(`${dayStr}T${String(h).padStart(2,'0')}:00:00-07:00`);
                const e = new Date(`${dayStr}T${String(h+1).padStart(2,'0')}:00:00-07:00`);
                (windowsByDay[dayStr] ||= []).push({ start: s, end: e });
              }
            } else {
              const start = new Date(ev.start.dateTime);
              const end = new Date(ev.end.dateTime);
              const dayStr = ymdInPhoenix(start);
              (windowsByDay[dayStr] ||= []).push({ start, end });
            }
          } else {
            blockingRanges.push({
              start: new Date(ev.start.date || ev.start.dateTime),
              end: new Date(ev.end.date || ev.end.dateTime),
            });
          }
        });

        calendarLoaded = true;
        statusBox.textContent = lang() ? 'Live calendar connected.' : 'Calendario en vivo conectado.';
        renderMonth();
        if (selectedDate) updateHiddenFields(); // refresh the summary text with real data
      } catch (err){
        console.warn('Google Calendar availability check failed:', err);
        statusBox.textContent = lang()
          ? 'Could not load live availability right now — please check back shortly, or message Sandy directly.'
          : 'No se pudo cargar la disponibilidad en vivo por ahora — intenta de nuevo en un momento, o escríbele directo a Sandy.';
      }
    }

    function windowIsBlocked(w){
      return blockingRanges.some(r => w.start < r.end && w.end > r.start);
    }

    function openWindowsForDay(ymd){
      return (windowsByDay[ymd] || []).filter(w => !windowIsBlocked(w));
    }

    function toYmd(y,m,d){
      return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }

    function renderMonth(){
      const monthNames = lang()
        ? ['January','February','March','April','May','June','July','August','September','October','November','December']
        : ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
      prevBtn.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
      nextBtn.disabled = (viewYear === maxMonth.getFullYear() && viewMonth === maxMonth.getMonth());

      daysGrid.innerHTML = '';
      const firstOfMonth = new Date(viewYear, viewMonth, 1);
      const startOffset = firstOfMonth.getDay(); // 0=Sun
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (let i = 0; i < startOffset; i++){
        const blank = document.createElement('span');
        daysGrid.appendChild(blank);
      }
      for (let d = 1; d <= daysInMonth; d++){
        const cellDate = new Date(viewYear, viewMonth, d);
        const ymd = toYmd(viewYear, viewMonth, d);
        const isPast = cellDate < today;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(d);
        btn.className = 'cal-day';
        const hasOpenWindows = calendarLoaded && openWindowsForDay(ymd).length > 0;
        if (isPast || !hasOpenWindows){
          btn.classList.add('cal-day--off');
          btn.disabled = true;
        } else {
          if (ymd === selectedDate) btn.classList.add('cal-day--selected');
          btn.addEventListener('click', () => selectDay(ymd, btn));
        }
        daysGrid.appendChild(btn);
      }
    }

    function selectDay(ymd, btnEl){
      selectedDate = ymd;
      daysGrid.querySelectorAll('.cal-day').forEach(b => b.classList.remove('cal-day--selected'));
      btnEl.classList.add('cal-day--selected');
      // Auto-pick the first open (non-blocked) window that day as the
      // behind-the-scenes reference time for the calendar hold — the client
      // no longer picks an exact slot; she just types her preferred time
      // below, and Sandy confirms the exact hour manually.
      const windows = (windowsByDay[selectedDate] || []).slice().sort((a,b) => a.start - b.start);
      selectedWindow = windows.find(w => !windowIsBlocked(w)) || null;
      updateHiddenFields();
    }

    function toLocalIsoParts(date){
      // Renders the Date's Phoenix wall-clock time as 'HH:MM' for the
      // hidden date/time fields (which are always interpreted as Phoenix
      // time elsewhere in this file).
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Phoenix', hour:'2-digit', minute:'2-digit', hour12:false }).formatToParts(date);
      const h = parts.find(p => p.type === 'hour').value;
      const m = parts.find(p => p.type === 'minute').value;
      return `${h}:${m}`;
    }

    function updateHiddenFields(){
      dateInput.value = selectedDate || '';
      if (timeSelect) timeSelect.value = selectedWindow ? `${toLocalIsoParts(selectedWindow.start)}-${toLocalIsoParts(selectedWindow.end)}` : '';
      if (summaryBox){
        if (selectedDate){
          const dateObj = new Date(selectedDate + 'T12:00:00');
          const dateStr = dateObj.toLocaleDateString(lang() ? 'en-US' : 'es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
          summaryBox.textContent = (lang() ? 'Selected: ' : 'Seleccionaste: ') + dateStr + (lang() ? ' — write your preferred time below.' : ' — escribe tu hora preferida abajo.');
          summaryBox.style.color = 'var(--gold-light)';
        } else {
          summaryBox.textContent = '';
        }
      }
      dateInput.dispatchEvent(new Event('change'));
    }

    prevBtn.addEventListener('click', () => {
      viewMonth--; if (viewMonth < 0){ viewMonth = 11; viewYear--; }
      renderMonth();
    });
    nextBtn.addEventListener('click', () => {
      viewMonth++; if (viewMonth > 11){ viewMonth = 0; viewYear++; }
      renderMonth();
    });
    document.addEventListener('svv:langchange', () => { renderMonth(); updateHiddenFields(); });

    renderMonth(); // empty grid until real "Disponible" data loads
    loadAvailability();
  })();


  const sessionCards = document.querySelectorAll('.session-card');
  const sessionValue = document.getElementById('sessionValue');
  sessionCards.forEach(card => {
    card.addEventListener('click', () => {
      sessionCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (sessionValue) sessionValue.value = card.dataset.value;
    });
  });

  // Gathers the booking hold details from the form, or returns null (and
  // shows a note) if the date isn't filled in yet.
  function getBookingHold(){
    const dateInput = document.getElementById('bookDate');
    const timeSelect = document.getElementById('bookTime');
    const nameInput = document.getElementById('bookName');
    const emailInput = document.querySelector('#quoteForm input[name="email"]');
    const note = document.getElementById('calendarNote');
    const lang = document.documentElement.lang === 'en';
    const dateVal = dateInput ? dateInput.value : '';
    if (!dateVal){
      if (note) note.textContent = lang
        ? 'Please select a date above first.'
        : 'Primero selecciona una fecha arriba.';
      if (dateInput) dateInput.focus();
      return null;
    }
    const [startTime, endTime] = (timeSelect ? timeSelect.value : '09:00-10:00').split('-');
    const ymd = dateVal.replace(/-/g, '');
    const startStr = `${ymd}T${startTime.replace(':','')}00`;
    const endStr = `${ymd}T${endTime.replace(':','')}00`;
    const sessionName = sessionValue && sessionValue.value ? sessionValue.value : (lang ? 'Photography Session' : 'Sesión de Fotografía');
    const clientName = nameInput && nameInput.value ? nameInput.value : '';
    const clientEmail = emailInput && emailInput.value ? emailInput.value.trim() : '';
    const title = lang
      ? `Photo Session Hold — Sandy ValVal (${sessionName})`
      : `Cita Tentativa — Sandy ValVal (${sessionName})`;
    const details = lang
      ? `Tentative hold for a photography session with Sandy ValVal Photography Studio.\nClient: ${clientName}\nExperience: ${sessionName}\nThis is a reminder only — your appointment is confirmed once your 20% deposit is received.\nWhatsApp: 480-637-8324`
      : `Recordatorio tentativo para una sesión de fotografía con Sandy ValVal Photography Studio.\nClienta: ${clientName}\nExperiencia: ${sessionName}\nEsto es solo un recordatorio — tu cita se confirma al recibir tu depósito del 20%.\nWhatsApp: 480-637-8324`;
    const location = '1825 E Northern Ave Ste 273, Phoenix, AZ 85020';
    return { startStr, endStr, title, details, location, clientEmail, lang, note };
  }

  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  if (addToCalendarBtn){
    addToCalendarBtn.addEventListener('click', () => {
      const hold = getBookingHold();
      if (!hold) return;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(hold.title)}&dates=${hold.startStr}/${hold.endStr}&details=${encodeURIComponent(hold.details)}&location=${encodeURIComponent(hold.location)}${hold.clientEmail ? `&add=${encodeURIComponent(hold.clientEmail)}` : ''}`;
      window.open(url, '_blank', 'noopener');
      if (hold.note) hold.note.textContent = hold.lang
        ? 'Opening Google Calendar in a new tab…'
        : 'Abriendo Google Calendar en una nueva pestaña…';
    });
  }

  // Apple Calendar, Outlook, Yahoo and any other calendar app that reads the
  // standard .ics format. Built entirely client-side — the file downloads
  // with the client's email attached as the attendee, so it lands in
  // whichever calendar is linked to that email account.
  const addToIcsBtn = document.getElementById('addToIcsBtn');
  if (addToIcsBtn){
    addToIcsBtn.addEventListener('click', () => {
      const hold = getBookingHold();
      if (!hold) return;
      const escapeIcs = (s) => String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
      const stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      const uid = `svv-${Date.now()}@sandyvalval`;
      const icsLines = [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sandy ValVal Photography Studio//Booking//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${hold.startStr}`,
        `DTEND:${hold.endStr}`,
        `SUMMARY:${escapeIcs(hold.title)}`,
        `DESCRIPTION:${escapeIcs(hold.details)}`,
        `LOCATION:${escapeIcs(hold.location)}`,
        'ORGANIZER;CN=Sandy ValVal Photography Studio:mailto:sandyvalala@gmail.com',
      ];
      if (hold.clientEmail) icsLines.push(`ATTENDEE;CN=${escapeIcs(hold.clientEmail)}:mailto:${hold.clientEmail}`);
      icsLines.push('END:VEVENT','END:VCALENDAR');
      const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'sandy-valval-cita.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (hold.note) hold.note.textContent = hold.lang
        ? 'Calendar file downloaded — open it to add the hold to Apple Calendar, Outlook or Yahoo.'
        : 'Archivo de calendario descargado — ábrelo para agregar el recordatorio a Apple Calendar, Outlook o Yahoo.';
    });
  }

  /* ---------------- FORMS -> EMAIL (EmailJS if configured, mailto always as backup) ----------------
     Reads EMAILJS_CONFIG above. If it's not filled in, forms keep working
     exactly as they do today (mailto: opens the visitor's own email app).
     Once configured, EmailJS sends automatically in the background AND the
     mailto still fires — so nothing is ever lost even if EmailJS has a
     hiccup (wrong key, offline, etc). Requires this script tag once, added
     near the bottom of <body> on any page with a form:
       <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
     (already added to reservar.html, cotizacion.html and contacto.html below). */
  const emailjsReady = () => typeof window.emailjs !== 'undefined'
    && EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateIdOwner;

  if (emailjsReady()) {
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  function sendViaEmailJs(formEl, fd){
    if (!emailjsReady()) return;
    const params = Object.fromEntries(fd.entries());
    // Email to Sandy with the full booking/quote/contact details.
    window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateIdOwner, params)
      .catch(err => console.warn('EmailJS (owner notify) failed — mailto still sent as backup:', err));
    // Confirmation email to the client herself, only if she gave an email
    // and a "confirm to client" template was set up.
    if (params.email && EMAILJS_CONFIG.templateIdClient){
      window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateIdClient, params)
        .catch(err => console.warn('EmailJS (client confirm) failed:', err));
    }
  }

  /* ---------------- GOOGLE APPS SCRIPT: AUTO-HOLD ON SUBMIT (reservar.html) ----------------
     Fires once, right when the client submits the booking request, so the
     picked slot gets held on Sandy's real calendar immediately — before she
     even sees the request. Fire-and-forget: if this fails for any reason
     (script not deployed, offline, etc.) the rest of the booking flow
     (mailto / WhatsApp / EmailJS) still goes through exactly as before. */
  function sendCalendarHold(fd){
    if (!GOOGLE_APPS_SCRIPT_URL) return;
    const dateVal = fd.get('date');
    const timeVal = fd.get('time');
    if (!dateVal || !timeVal) return; // no date/time picked — nothing to hold
    const [startTime, endTime] = timeVal.split('-');
    // Phoenix (Arizona) never observes daylight saving — always UTC-7.
    const startIso = `${dateVal}T${startTime}:00-07:00`;
    const endIso = `${dateVal}T${endTime}:00-07:00`;
    const payload = {
      startIso, endIso,
      name: fd.get('name') || '',
      email: fd.get('email') || '',
      phone: fd.get('phone') || '',
      session: fd.get('session') || '',
      budget: fd.get('budget') || '',
      message: fd.get('message') || '',
    };
    fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script's CORS response is unreliable — fire-and-forget
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight
      body: JSON.stringify(payload),
    }).catch(err => console.warn('Calendar auto-hold failed (booking still sent normally):', err));
  }

  /* ---------------- FORMS -> FORMSPREE (with mailto as a safety-net fallback) ----------------
     Every submission is POSTed straight to Formspree, so it reaches Sandy's
     inbox reliably — no dependency on the visitor's device having an email
     app set up (which was the problem with mailto-only before). If the
     Formspree request ever fails (offline, ad-blocker, etc.), mailto still
     kicks in automatically as a backup so nothing gets silently lost. */
  const FORMSPREE_URL = 'https://formspree.io/f/xyeypnqa';

  function showFormSuccess(formEl, lang){
    const msg = document.createElement('p');
    msg.className = 'qf-note';
    msg.style.cssText = 'margin-top:14px; color:var(--gold-light); font-weight:600;';
    msg.textContent = lang
      ? 'Thank you! Your request was sent — Sandy will get back to you soon.'
      : '¡Gracias! Tu solicitud fue enviada — Sandy te contactará pronto.';
    formEl.appendChild(msg);
  }

  function wireMailtoForm(formEl, subjectEs, subjectEn, holdCalendar){
    if (!formEl) return;
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      const lang = document.documentElement.lang === 'en';
      sendViaEmailJs(formEl, fd);
      if (holdCalendar) sendCalendarHold(fd);

      // Build a separate copy for the email — "time" is only an internal
      // reference value used to place the calendar hold, and would confuse
      // Sandy in the email (it's not what the client actually chose; she
      // only wrote her approximate preferred time). Exclude it here.
      const emailFd = new FormData();
      for (const [key, val] of fd.entries()){
        if (key === 'time') continue;
        emailFd.append(key, val);
      }
      emailFd.append('_subject', lang ? subjectEn : subjectEs);

      fetch(FORMSPREE_URL, {
        method: 'POST',
        body: emailFd,
        headers: { 'Accept': 'application/json' },
      }).then(res => {
        if (res.ok){
          showFormSuccess(formEl, lang);
          formEl.reset();
        } else {
          throw new Error('Formspree responded with an error');
        }
      }).catch(err => {
        console.warn('Formspree submission failed, falling back to mailto:', err);
        const lines = [];
        for (const [key, val] of emailFd.entries()){
          if (!val || key === '_subject') continue;
          lines.push(`${key}: ${val}`);
        }
        const subject = encodeURIComponent(lang ? subjectEn : subjectEs);
        const body = encodeURIComponent(lines.join('\n'));
        window.location.href = `mailto:sandyvalala@gmail.com?subject=${subject}&body=${body}`;
      });
    });
  }
  wireMailtoForm(document.getElementById('quoteForm'), 'Solicitud de Reserva', 'Booking Request', true);
  wireMailtoForm(document.getElementById('customQuoteForm'), 'Cotización Personalizada', 'Custom Quote Request');
  wireMailtoForm(document.getElementById('contactForm'), 'Mensaje de Contacto', 'Contact Message');

  /* ---------------- ZELLE RECEIPT -> WHATSAPP (reservar.html) ----------------
     Builds the WhatsApp message right before the client taps the button, so
     it always includes her name, the date/time she picked, and which
     experience she chose — that way Sandy can match the screenshot she
     receives to the right booking, instead of getting a blank "here's my
     receipt" message with no context. */
  (() => {
    const receiptBtn = document.getElementById('receiptWhatsappBtn');
    if (!receiptBtn) return; // not on this page
    receiptBtn.addEventListener('click', (e) => {
      const lang = document.documentElement.lang === 'en';
      const nameInput = document.getElementById('bookName');
      const dateInput = document.getElementById('bookDate');
      const timeEstimateInput = document.getElementById('bookTimeEstimate');
      const clientName = nameInput && nameInput.value ? nameInput.value.trim() : '';
      const sessionName = sessionValue && sessionValue.value ? sessionValue.value : '';
      const dateVal = dateInput ? dateInput.value : '';
      const timeEstimate = timeEstimateInput && timeEstimateInput.value ? timeEstimateInput.value.trim() : '';

      let dateStr = '';
      if (dateVal){
        const dateObj = new Date(dateVal + 'T12:00:00');
        dateStr = dateObj.toLocaleDateString(lang ? 'en-US' : 'es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
      }

      const lines = lang
        ? [`Hi Sandy, I already sent my Zelle deposit — attaching my receipt here 📎`,
           clientName ? `Name: ${clientName}` : '',
           sessionName ? `Experience: ${sessionName}` : '',
           dateStr ? `Date: ${dateStr}` : '',
           timeEstimate ? `Preferred time: ${timeEstimate}` : '']
        : [`Hola Sandy, ya envié mi depósito por Zelle. Adjunto mi comprobante aquí 📎`,
           clientName ? `Nombre: ${clientName}` : '',
           sessionName ? `Experiencia: ${sessionName}` : '',
           dateStr ? `Fecha: ${dateStr}` : '',
           timeEstimate ? `Hora preferida: ${timeEstimate}` : ''];

      const message = lines.filter(Boolean).join('\n');
      receiptBtn.href = `https://wa.me/14806378324?text=${encodeURIComponent(message)}`;
      // href is updated in place before the browser follows the link, so no
      // preventDefault needed — the click continues normally to WhatsApp.
    });
  })();

  /* ---------------- SMOOTH ANCHOR OFFSET FOR FIXED NAV ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

})();
