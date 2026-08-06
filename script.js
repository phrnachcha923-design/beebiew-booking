const MAX_BOOKINGS_PER_DAY = 2;
const STORAGE_KEY = "beebiew-bookings-v1";

const form = document.getElementById("bookingForm");
const bookingCards = [...document.querySelectorAll(".booking-card")];
const bookingType = document.getElementById("bookingType");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const availabilityBox = document.getElementById("availabilityBox");
const availabilityText = document.getElementById("availabilityText");
const submitButton = document.getElementById("submitButton");
const toast = document.getElementById("toast");
const successModal = document.getElementById("successModal");
const bookingSummary = document.getElementById("bookingSummary");
const consentError = document.getElementById("consentError");
const todayBooked = document.getElementById("todayBooked");
const todayRemaining = document.getElementById("todayRemaining");

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

dateInput.min = getLocalDateString();

function populateTimes() {
  for (let hour = 9; hour <= 20; hour += 1) {
    ["00", "30"].forEach((minute) => {
      if (hour === 20 && minute === "30") return;
      const value = `${String(hour).padStart(2, "0")}:${minute}`;
      const option = document.createElement("option");
      option.value = value;
      option.textContent = `${value} น.`;
      timeSelect.appendChild(option);
    });
  }
}

function getBookings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function getBookingsForDate(date) {
  return getBookings().filter((booking) => booking.date === date);
}

function updateSummaryCards() {
  const count = getBookingsForDate(getLocalDateString()).length;
  todayBooked.textContent = `${count} คิว`;
  todayRemaining.textContent = `${Math.max(0, MAX_BOOKINGS_PER_DAY - count)} คิว`;
}

function updateAvailability() {
  const selectedDate = dateInput.value;
  availabilityBox.classList.remove("available", "full");

  if (!selectedDate) {
    availabilityText.textContent = "เลือกวันที่เพื่อตรวจสอบคิวว่าง";
    submitButton.disabled = false;
    return;
  }

  const count = getBookingsForDate(selectedDate).length;
  const remaining = Math.max(0, MAX_BOOKINGS_PER_DAY - count);

  if (remaining === 0) {
    availabilityBox.classList.add("full");
    availabilityText.textContent = "❌ วันนี้คิวเต็มแล้ว กรุณาเลือกวันอื่น";
    submitButton.disabled = true;
  } else {
    availabilityBox.classList.add("available");
    availabilityText.textContent = `วันนี้ยังว่าง ${remaining} คิว จากทั้งหมด ${MAX_BOOKINGS_PER_DAY} คิว`;
    submitButton.disabled = false;
  }
}

function syncCards(selectedType) {
  bookingCards.forEach((card) => {
    const selected = card.dataset.type === selectedType;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
}

bookingCards.forEach((card) => {
  card.setAttribute("aria-pressed", "false");
  card.addEventListener("click", () => {
    bookingType.value = card.dataset.type;
    syncCards(card.dataset.type);
    document.getElementById("booking").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

bookingType.addEventListener("change", () => syncCards(bookingType.value));
dateInput.addEventListener("change", updateAvailability);

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function setFieldError(field, message) {
  field.classList.toggle("invalid", Boolean(message));
  const error = field.closest(".field")?.querySelector(".error-message");
  if (error) error.textContent = message;
}

function validateForm() {
  let valid = true;
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const rulesConsent = document.getElementById("rulesConsent");

  [name, phone, dateInput, timeSelect, bookingType].forEach((field) => setFieldError(field, ""));
  consentError.textContent = "";

  if (name.value.trim().length < 2) {
    setFieldError(name, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร");
    valid = false;
  }

  const normalizedPhone = phone.value.replace(/\D/g, "");
  if (!/^0\d{8,9}$/.test(normalizedPhone)) {
    setFieldError(phone, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
    valid = false;
  }

  if (!dateInput.value) {
    setFieldError(dateInput, "กรุณาเลือกวันที่");
    valid = false;
  } else if (dateInput.value < getLocalDateString()) {
    setFieldError(dateInput, "ไม่สามารถเลือกวันที่ย้อนหลังได้");
    valid = false;
  }

  if (!timeSelect.value) {
    setFieldError(timeSelect, "กรุณาเลือกเวลา");
    valid = false;
  }

  if (!bookingType.value) {
    setFieldError(bookingType, "กรุณาเลือกประเภทการจอง");
    valid = false;
  }

  if (!rulesConsent.checked) {
    consentError.textContent = "กรุณายอมรับกฎการจองก่อนส่งคำขอ";
    valid = false;
  }

  return valid;
}

function formatThaiDate(dateString) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function openSuccessModal(booking) {
  bookingSummary.innerHTML = `
    <strong>${escapeHtml(booking.name)}</strong><br>
    ${escapeHtml(booking.type)}<br>
    ${formatThaiDate(booking.date)} เวลา ${escapeHtml(booking.time)} น.<br>
    เบอร์โทร ${escapeHtml(booking.phone)}
  `;
  successModal.classList.add("open");
  successModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  successModal.classList.remove("open");
  successModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && successModal.classList.contains("open")) closeModal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showToast("กรุณาตรวจสอบข้อมูลให้ครบถ้วน", true);
    form.querySelector(".invalid")?.focus();
    return;
  }

  const selectedDate = dateInput.value;
  if (getBookingsForDate(selectedDate).length >= MAX_BOOKINGS_PER_DAY) {
    updateAvailability();
    showToast("วันนี้คิวเต็มแล้ว กรุณาเลือกวันอื่น", true);
    return;
  }

  const booking = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.replace(/\s/g, ""),
    date: selectedDate,
    time: timeSelect.value,
    type: bookingType.value,
    location: document.getElementById("location").value.trim(),
    details: document.getElementById("details").value.trim(),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  updateSummaryCards();
  openSuccessModal(booking);
  form.reset();
  syncCards("");
  updateAvailability();
});

function setupRevealAnimation() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

populateTimes();
updateAvailability();
updateSummaryCards();
setupRevealAnimation();
