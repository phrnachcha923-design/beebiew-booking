const STORAGE_KEY = "beebiew_bookings_v1";
const MAX_BOOKINGS_PER_DAY = 2;

const form = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const bookingList = document.getElementById("bookingList");
const availability = document.getElementById("availability");
const submitButton = form.querySelector('button[type="submit"]');
const clearAllButton = document.getElementById("clearAll");
const successModal = document.getElementById("successModal");
const modalText = document.getElementById("modalText");

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function todayLocalISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
}

function buildTimeOptions() {
  for (let hour = 9; hour <= 20; hour += 1) {
    const value = `${String(hour).padStart(2, "0")}:00`;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${value} น.`;
    timeSelect.appendChild(option);
  }
}

function formatThaiDate(dateString) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

function bookingsForDate(date) {
  return getBookings().filter((booking) => booking.date === date);
}

function updateAvailability() {
  const selectedDate = dateInput.value;

  if (!selectedDate) {
    availability.textContent = "กรุณาเลือกวันที่เพื่อดูจำนวนคิวว่าง";
    availability.classList.remove("full");
    submitButton.disabled = false;
    return;
  }

  const count = bookingsForDate(selectedDate).length;
  const remaining = Math.max(0, MAX_BOOKINGS_PER_DAY - count);

  if (remaining === 0) {
    availability.textContent = `วันที่ ${formatThaiDate(selectedDate)} มีผู้จองครบ 2 คิวแล้ว`;
    availability.classList.add("full");
    submitButton.disabled = true;
  } else {
    availability.textContent = `วันที่ ${formatThaiDate(selectedDate)} เหลือ ${remaining} คิว`;
    availability.classList.remove("full");
    submitButton.disabled = false;
  }
}

function setFieldError(field, message) {
  const wrapper = field.closest(".field");
  const error = wrapper.querySelector(".error");
  wrapper.classList.toggle("invalid", Boolean(message));
  error.textContent = message || "";
}

function validateForm() {
  let valid = true;
  const name = form.name.value.trim();
  const phone = form.phone.value.replace(/\D/g, "");
  const date = form.date.value;
  const time = form.time.value;
  const type = form.type.value;

  setFieldError(form.name, "");
  setFieldError(form.phone, "");
  setFieldError(form.date, "");
  setFieldError(form.time, "");
  setFieldError(form.type, "");

  if (name.length < 2) {
    setFieldError(form.name, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร");
    valid = false;
  }

  if (!/^0\d{8,9}$/.test(phone)) {
    setFieldError(form.phone, "กรุณากรอกเบอร์โทรให้ถูกต้อง");
    valid = false;
  }

  if (!date) {
    setFieldError(form.date, "กรุณาเลือกวันที่");
    valid = false;
  } else if (date < todayLocalISO()) {
    setFieldError(form.date, "ไม่สามารถเลือกวันที่ย้อนหลังได้");
    valid = false;
  } else if (bookingsForDate(date).length >= MAX_BOOKINGS_PER_DAY) {
    setFieldError(form.date, "วันที่เลือกมีผู้จองครบ 2 คิวแล้ว");
    valid = false;
  }

  if (!time) {
    setFieldError(form.time, "กรุณาเลือกเวลา");
    valid = false;
  }

  if (!type) {
    setFieldError(form.type, "กรุณาเลือกประเภทการนัด");
    valid = false;
  }

  return valid;
}

function renderBookings() {
  const bookings = getBookings().sort((a, b) => {
    return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  });

  if (!bookings.length) {
    bookingList.innerHTML = '<div class="empty-state">ยังไม่มีรายการจองในอุปกรณ์นี้</div>';
    clearAllButton.hidden = true;
    return;
  }

  clearAllButton.hidden = false;
  bookingList.innerHTML = bookings.map((booking) => `
    <article class="booking-item">
      <div>
        <h3>${escapeHtml(booking.name)} · ${escapeHtml(booking.type)}</h3>
        <p class="booking-meta">
          ${formatThaiDate(booking.date)} เวลา ${escapeHtml(booking.time)} น.<br>
          โทร ${escapeHtml(booking.phone)}
          ${booking.details ? `<br>${escapeHtml(booking.details)}` : ""}
        </p>
      </div>
      <button class="delete-button" type="button" data-delete-id="${booking.id}">ลบรายการ</button>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openModal(message) {
  modalText.textContent = message;
  successModal.classList.add("show");
  successModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  successModal.classList.remove("show");
  successModal.setAttribute("aria-hidden", "true");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const booking = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: form.name.value.trim(),
    phone: form.phone.value.replace(/\D/g, ""),
    date: form.date.value,
    time: form.time.value,
    type: form.type.value,
    details: form.details.value.trim(),
    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  openModal(`นัดวันที่ ${formatThaiDate(booking.date)} เวลา ${booking.time} น. เรียบร้อยแล้ว`);
  form.reset();
  dateInput.min = todayLocalISO();
  updateAvailability();
  renderBookings();
});

dateInput.addEventListener("change", updateAvailability);

bookingList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;

  const id = button.dataset.deleteId;
  const bookings = getBookings().filter((booking) => booking.id !== id);
  saveBookings(bookings);
  renderBookings();
  updateAvailability();
});

clearAllButton.addEventListener("click", () => {
  if (confirm("ต้องการล้างรายการจองทั้งหมดในอุปกรณ์นี้หรือไม่?")) {
    localStorage.removeItem(STORAGE_KEY);
    renderBookings();
    updateAvailability();
  }
});

successModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

document.getElementById("year").textContent = new Date().getFullYear();
dateInput.min = todayLocalISO();
buildTimeOptions();
renderBookings();
updateAvailability();
