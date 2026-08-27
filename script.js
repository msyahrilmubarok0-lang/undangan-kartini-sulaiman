const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyO3fj4UoyF0t2d5iJgYAZRPZvJtRCsaKGqb6-xfZzXBFOM7LqWHPuzIzvdE7BYbop77Q/exec";

const cover = document.getElementById("cover");
const main = document.getElementById("main");
const openBtn = document.getElementById("openInvitation");
const video = document.getElementById("weddingVideo");
const soundToggle = document.getElementById("soundToggle");
const playPause = document.getElementById("playPause");
const muteBtn = document.getElementById("muteBtn");
const progressBar = document.getElementById("progressBar");

// ===============================
// NAMA TAMU DARI LINK
// ===============================

const params = new URLSearchParams(window.location.search);
const guest = params.get("to");

if (guest) {
  document.getElementById("guestGreeting").innerHTML =
    `Kepada Yth.<strong>${safe(guest)}</strong>`;
}

// ===============================
// BUKA UNDANGAN + VIDEO + AUDIO
// ===============================

openBtn.addEventListener("click", async () => {
  cover.style.opacity = "0";
  cover.style.transform = "scale(1.02)";

  setTimeout(() => {
    cover.style.display = "none";
    main.classList.remove("is-hidden");
    window.scrollTo(0, 0);
  }, 700);

  try {
    video.muted = false;
    await video.play();
  } catch (error) {
    console.log("Autoplay dengan suara diblokir browser.");
  }

  setAudioUI();
});

// ===============================
// AUDIO
// ===============================

function setAudioUI() {
  const icon = video.muted ? "🔇" : "🔊";

  soundToggle.textContent = icon;
  muteBtn.textContent = icon;

  soundToggle.setAttribute(
    "aria-label",
    video.muted ? "Nyalakan suara video" : "Matikan suara video"
  );
}

function toggleMute() {
  video.muted = !video.muted;
  setAudioUI();
}

soundToggle.addEventListener("click", toggleMute);
muteBtn.addEventListener("click", toggleMute);

// ===============================
// VIDEO CONTROL
// ===============================

playPause.addEventListener("click", async () => {
  if (video.paused) {
    await video.play();
  } else {
    video.pause();
  }
});

video.addEventListener("play", () => {
  playPause.textContent = "❚❚";
});

video.addEventListener("pause", () => {
  playPause.textContent = "▶";
});

video.addEventListener("ended", () => {
  playPause.textContent = "▶";
  video.currentTime = 0;
});

video.addEventListener("timeupdate", () => {
  if (video.duration) {
    progressBar.style.width =
      (video.currentTime / video.duration) * 100 + "%";
  }
});

// ===============================
// COUNTDOWN
// ===============================

const target = new Date(
  "2026-09-03T09:00:00+07:00"
).getTime();

function countdown() {
  const remaining = Math.max(0, target - Date.now());

  document.getElementById("d").textContent =
    Math.floor(remaining / 86400000);

  document.getElementById("h").textContent =
    Math.floor((remaining % 86400000) / 3600000);

  document.getElementById("m").textContent =
    Math.floor((remaining % 3600000) / 60000);

  document.getElementById("s").textContent =
    Math.floor((remaining % 60000) / 1000);
}

countdown();
setInterval(countdown, 1000);

// ===============================
// ANIMASI SECTION
// ===============================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 }
);

document
  .querySelectorAll(".section-reveal")
  .forEach((section) => observer.observe(section));

// ===============================
// KIRIM DATA KE GOOGLE SHEETS
// ===============================

async function sendToGoogleSheets(data) {
  const body = new URLSearchParams();

  Object.keys(data).forEach((key) => {
    body.append(key, data[key]);
  });

  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: body.toString()
  });
}

// ===============================
// RSVP
// ===============================

document
  .getElementById("rsvpForm")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("rsvpName").value.trim();
    const attendance =
      document.getElementById("rsvpAttendance").value;
    const guests =
      document.getElementById("rsvpGuests").value;

    const status = document.getElementById("rsvpStatus");

    if (!name || !attendance) {
      status.textContent = "Mohon lengkapi data terlebih dahulu.";
      return;
    }

    const button = event.target.querySelector("button");

    button.disabled = true;
    button.textContent = "Mengirim...";

    try {

      await sendToGoogleSheets({
        nama: name,
        kehadiran: attendance,
        jumlah: guests,
        ucapan: "",
        jenis: "RSVP"
      });

      status.textContent =
        "✓ Terima kasih. Konfirmasi kehadiran Anda telah diterima.";

      event.target.reset();

    } catch (error) {

      console.error(error);

      status.textContent =
        "Maaf, terjadi kesalahan. Silakan coba lagi.";

    }

    button.disabled = false;
    button.textContent = "Kirim Konfirmasi";
  });

// ===============================
// UCAPAN & DOA
// ===============================

const wishList = document.getElementById("wishList");

function renderWishes() {

  const wishes =
    JSON.parse(localStorage.getItem("ks_wishes") || "[]");

  wishList.innerHTML = wishes
    .map(
      (wish) => `
        <article class="wish">
          <b>${safe(wish.name)}</b>
          <p>${safe(wish.text)}</p>
        </article>
      `
    )
    .join("");
}

document
  .getElementById("wishForm")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
      document.getElementById("wishName").value.trim();

    const text =
      document.getElementById("wishText").value.trim();

    if (!name || !text) {
      return;
    }

    const button = event.target.querySelector("button");

    button.disabled = true;
    button.textContent = "Mengirim...";

    try {

      // Simpan lokal supaya ucapan langsung terlihat
      const wishes =
        JSON.parse(localStorage.getItem("ks_wishes") || "[]");

      wishes.unshift({
        name: name,
        text: text
      });

      localStorage.setItem(
        "ks_wishes",
        JSON.stringify(wishes)
      );

      // Kirim ke Google Sheets
      await sendToGoogleSheets({
        nama: name,
        kehadiran: "",
        jumlah: "",
        ucapan: text,
        jenis: "UCAPAN"
      });

      event.target.reset();

      renderWishes();

    } catch (error) {

      console.error(error);

      alert(
        "Ucapan gagal dikirim. Silakan coba lagi."
      );

    }

    button.disabled = false;
    button.textContent = "Kirim Ucapan";
  });

renderWishes();

// ===============================
// KEAMANAN NAMA TAMU
// ===============================

function safe(text) {

  return String(text).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );
}
