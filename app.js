'use strict';
// Galería automática: sin controles visibles ni interrupción al pasar el mouse.
document.querySelectorAll('.work-carousel').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('.work-slide')];
  const status = carousel.querySelector('.work-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelectorAll('a, button').forEach(el => { el.tabIndex = active ? 0 : -1; });
    });
    status.textContent = slides[current].querySelector('h3').textContent;
  }
  setInterval(() => {
    // No ocultar un enlace mientras alguien lo está usando con teclado.
    if (!document.hidden && !carousel.contains(document.activeElement)) show(current + 1);
  }, carousel.classList.contains('flyer-carousel') ? 7000 : 5000);
  // La rotación permanece activa; el CSS evita animación con movimiento reducido.
  carousel.classList.toggle('reduce-motion', motion.matches);
  motion.addEventListener('change', () => carousel.classList.toggle('reduce-motion', motion.matches));
});
// Número de Paraguay en formato internacional para WhatsApp.
const CONFIG = { whatsapp: '595994479833' };
const services = [
  { id: 'fade', name: 'Corte fade', price: 50000 },
  { id: 'corte', name: 'Corte clásico', price: 40000 },
  { id: 'barba', name: 'Arreglo de barba + productos', price: 30000 },
  { id: 'diseno', name: 'Corte con diseño', price: 50000 },
  { id: 'color', name: 'Color global + corte de regalo', price: 200000 },
  { id: 'mechas', name: 'Mechas platinadas + corte de regalo', price: 150000 },
  { id: 'cejas', name: 'Diseño de cejas + henna', price: 20000 },
  { id: 'combo', name: 'Promo: corte + barba', price: 50000, promo: true }
];
const money = value => `Gs. ${new Intl.NumberFormat('es-PY').format(value)}`;
const serviceSelect = document.querySelector('#service');
serviceSelect.innerHTML = '<option value="">Elegí tu servicio</option>' + services.map(s => `<option value="${s.id}">${s.name} · ${money(s.price)}</option>`).join('');
document.querySelector('#price-menu').innerHTML = services.filter(s => !s.promo).map(s => `<a class="price-row" href="#reservar" data-service="${s.id}"><span>${s.name}</span><strong>${money(s.price)}</strong><span class="price-arrow" aria-hidden="true">↗</span></a>`).join('');
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { serviceSelect.value = link.dataset.service; document.querySelector('#booking-result').hidden = true; }));
const now = new Date();
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Asuncion', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
document.querySelector('#date').min = localDate;
document.querySelectorAll('[data-whatsapp]').forEach(button => button.addEventListener('click', () => {
  if (!/^\d{8,15}$/.test(CONFIG.whatsapp)) {
    const status = document.querySelector('#contact-status');
    status.textContent = 'Para habilitar las consultas falta configurar el número real de WhatsApp del profesional.';
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(button.dataset.whatsapp)}`, '_blank', 'noopener,noreferrer');
}));
const form = document.querySelector('#booking-form');
const timeInput = document.querySelector('#time');
const result = document.querySelector('#booking-result');
const hours = Array.from({ length: 23 }, (_, i) => {
  const minutes = 600 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
timeInput.innerHTML = '<option value="">Elegí una hora</option>' + hours.map(hour => `<option value="${hour}">${hour}</option>`).join('');
const depositNotice = document.querySelector('#deposit-notice');
timeInput.addEventListener('change', () => {
  depositNotice.hidden = !timeInput.value;
});
form.addEventListener('reset', () => { depositNotice.hidden = true; });
form.addEventListener('input', () => { result.hidden = true; });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const service = services.find(s => s.id === data.get('service'));
  const name = String(data.get('name')).trim();
  const phone = String(data.get('phone')).trim();
  result.hidden = false;
  if (!name || phone.replace(/\D/g, '').length < 8 || data.get('date') < localDate || !hours.includes(data.get('time')) || !service) {
    result.textContent = 'Revisá el nombre, teléfono, fecha y hora elegida.';
    return;
  }
  const [year, month, day] = data.get('date').split('-');
  const message = `Hola, quiero solicitar un turno en El Cartel.\nNombre: ${name}\nTeléfono: ${phone}\nServicio: ${service.name}\nPrecio publicado: ${money(service.price)}\nFecha preferida: ${day}/${month}/${year}\nHora preferida: ${data.get('time')}\n¿Me confirmás disponibilidad?`;
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  result.textContent = 'Revisá y enviá el mensaje por WhatsApp. El profesional confirmará el horario.';
  const link = document.createElement('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.textContent = 'Abrir solicitud en WhatsApp ↗'; result.append(link);
  window.open(url, '_blank', 'noopener,noreferrer');
});
