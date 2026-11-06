/**
 * Calendar utilities to generate Google Calendar links or save events.
 */
export function createGoogleCalendarUrl(): string {
  const title = encodeURIComponent("The Wedding of Bagaskara & Sekar");
  // Saturday, Dec 12, 2026 08:00 WIB (01:00 UTC) to 21:30 WIB (14:30 UTC)
  const dates = "20261212T010000Z/20261212T143000Z";
  const details = encodeURIComponent(
    "Walimatul 'Ursy & Pawiwahan Agung Raden Mas Bagaskara Adi Nugraha & Roro Sekar Arum Kusumawardhani.\nVenue: Pendopo Agung & Kasultanan Ballroom Royal Ambarrukmo Yogyakarta."
  );
  const location = encodeURIComponent(
    "Royal Ambarrukmo Yogyakarta, Jl. Laksda Adisucipto No. 81, Ambarukmo, Caturtunggal, Sleman, D.I. Yogyakarta 55281"
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(): void {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bagaskara Sekar Wedding//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "SUMMARY:The Wedding of Bagaskara & Sekar",
    "DESCRIPTION:Walimatul 'Ursy & Pawiwahan Agung Raden Mas Bagaskara Adi Nugraha & Roro Sekar Arum Kusumawardhani.",
    "LOCATION:Royal Ambarrukmo Yogyakarta, Jl. Laksda Adisucipto No. 81, Sleman, D.I. Yogyakarta",
    "DTSTART:20261212T010000Z",
    "DTEND:20261212T143000Z",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", "Wedding-Bagaskara-Sekar.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
