/**
 * GOOGLE APPS SCRIPT — WEDDING INVITATION BACKEND
 * Deploy as Web App: Execute as owner; access: Anyone.
 *
 * Public actions: ping, getPhotos, getAudio, getRsvp, saveRsvp.
 * Authenticated actions: getGuests, uploadPhoto, saveGuests, deleteGuest,
 * savePhotoUrl, saveAudio, changeAdminPin, adminLogout.
 *
 * IMPORTANT: Run setupAdminPin() once from the bound Apps Script editor before
 * deploying. This stores a salted SHA-256 PIN hash in Script Properties.
 */

var FOLDER_NAME = "Undangan Pernikahan Bagaskara & Sekar";
var ADMIN_SESSION_TTL_SECONDS = 21600; // 6 hours
var ADMIN_LOGIN_MAX_FAILURES = 5;
var ADMIN_LOGIN_COOLDOWN_SECONDS = 900;
var ALLOWED_PHOTO_SLOTS = [
  "heroArch", "groomPhoto", "bridePhoto", "story1", "story2", "story3",
  "gallery1", "gallery2", "gallery3", "gallery4", "gallery5", "gallery6"
];
var ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action || "getPhotos";

    if (action === "ping") {
      return json_({ status: "success", message: "Backend aktif", timestamp: new Date().toISOString() });
    }
    if (action === "getPhotos") {
      return json_({ status: "success", data: getPhotos_() });
    }
    if (action === "getAudio") {
      return json_({ status: "success", data: getAudio_() });
    }
    if (action === "getRsvp") {
      // The invitation intentionally displays approved RSVP wishes publicly.
      return json_({ status: "success", data: getRsvp_() });
    }
    return json_({ status: "error", message: "Aksi tidak dikenal." });
  } catch (err) {
    Logger.log("doGet error: " + err);
    return json_({ status: "error", message: safeError_(err) });
  }
}

function doPost(e) {
  try {
    var data = (e && e.postData && e.postData.contents)
      ? JSON.parse(e.postData.contents)
      : ((e && e.parameter) || {});
    var action = String(data.action || "");

    if (action === "adminLogin") {
      return json_(createAdminSession_(String(data.pin || ""), String(data.clientId || "")));
    }
    if (action === "saveRsvp") {
      return json_({ status: "success", data: saveRsvp_(data.rsvp || {}) });
    }

    requireAdmin_(data.token);

    if (action === "getGuests") {
      return json_({ status: "success", data: getGuests_() });
    }
    if (action === "adminLogout") {
      revokeAdminSession_(data.token);
      return json_({ status: "success" });
    }
    if (action === "changeAdminPin") {
      setAdminPin_(String(data.newPin || ""));
      revokeAdminSession_(data.token);
      return json_({ status: "success", message: "PIN diperbarui. Silakan masuk kembali." });
    }
    if (action === "uploadPhoto") {
      return json_({ status: "success", data: uploadPhoto_(data) });
    }
    if (action === "saveGuests") {
      return json_({ status: "success", count: saveGuests_(data.guests || []) });
    }
    if (action === "deleteGuest") {
      deleteGuest_(String(data.guestId || ""));
      return json_({ status: "success" });
    }
    if (action === "savePhotoUrl") {
      return json_({ status: "success", data: savePhotoUrl_(data) });
    }
    if (action === "saveAudio") {
      return json_({ status: "success", data: saveAudio_(data.config || {}) });
    }
    return json_({ status: "error", message: "Aksi tidak dikenal." });
  } catch (err) {
    Logger.log("doPost error: " + err);
    return json_({ status: "error", message: safeError_(err) });
  }
}

/**
 * Run manually from the Apps Script editor (spreadsheet-bound script).
 * No default PIN is created. Choose a unique PIN/passphrase of at least 10 chars.
 */
function setupAdminPin() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    "Aktifkan keamanan admin",
    "Masukkan PIN/passphrase baru (minimal 10 karakter). PIN tidak akan disimpan sebagai teks.",
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;
  setAdminPin_(result.getResponseText());
  ui.alert("Keamanan admin aktif. Deploy ulang Web App agar kode terbaru digunakan.");
}

function setAdminPin_(pin) {
  if (!pin || pin.length < 10 || pin.length > 128) {
    throw new Error("PIN/passphrase harus terdiri dari 10–128 karakter.");
  }
  var salt = Utilities.getUuid() + Utilities.getUuid();
  var hash = sha256Hex_(salt + ":" + pin);
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty("ADMIN_PIN_SALT", salt);
  properties.setProperty("ADMIN_PIN_HASH", hash);
}

function createAdminSession_(pin, clientId) {
  var cache = CacheService.getScriptCache();
  // Apps Script Web App events do not expose a dependable client IP.
  // Scope the cooldown to a browser-generated identifier rather than locking out every owner.
  var safeClientId = String(clientId || "anonymous").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "anonymous";
  var attemptKey = "admin_login_" + sha256Hex_(safeClientId);
  var failuresKey = attemptKey + "_failures";
  var cooldownKey = attemptKey + "_cooldown";
  if (cache.get(cooldownKey)) {
    return { status: "error", message: "Terlalu banyak percobaan dari browser ini. Coba kembali setelah 15 menit." };
  }
  var props = PropertiesService.getScriptProperties();
  var salt = props.getProperty("ADMIN_PIN_SALT");
  var expected = props.getProperty("ADMIN_PIN_HASH");
  if (!salt || !expected) {
    return { status: "error", message: "Keamanan admin belum disiapkan. Jalankan setupAdminPin() di Apps Script." };
  }

  var actual = sha256Hex_(salt + ":" + pin);
  if (!constantTimeEqual_(actual, expected)) {
    var failures = Number(cache.get(failuresKey) || 0) + 1;
    cache.put(failuresKey, String(failures), ADMIN_LOGIN_COOLDOWN_SECONDS);
    if (failures >= ADMIN_LOGIN_MAX_FAILURES) {
      cache.put(cooldownKey, "1", ADMIN_LOGIN_COOLDOWN_SECONDS);
    }
    return { status: "error", message: "PIN/passphrase tidak sesuai." };
  }

  cache.remove(failuresKey);
  cache.remove(cooldownKey);
  var token = Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "");
  cache.put(sessionCacheKey_(token), "1", ADMIN_SESSION_TTL_SECONDS);
  return { status: "success", token: token, expiresIn: ADMIN_SESSION_TTL_SECONDS };
}

function requireAdmin_(token) {
  if (!token || typeof token !== "string" || token.length < 32 ||
      CacheService.getScriptCache().get(sessionCacheKey_(token)) !== "1") {
    throw new Error("Sesi admin tidak valid atau telah kedaluwarsa. Silakan login kembali.");
  }
}

function revokeAdminSession_(token) {
  if (token) CacheService.getScriptCache().remove(sessionCacheKey_(token));
}

function sessionCacheKey_(token) {
  return "admin_session_" + sha256Hex_(token);
}

function sha256Hex_(value) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(byte) {
    var positive = (byte + 256) % 256;
    return ("0" + positive.toString(16)).slice(-2);
  }).join("");
}

function constantTimeEqual_(a, b) {
  a = String(a || "");
  b = String(b || "");
  var diff = a.length ^ b.length;
  var length = Math.max(a.length, b.length);
  for (var i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function uploadPhoto_(data) {
  var slotKey = String(data.slotKey || "");
  var mimeType = String(data.mimeType || "").toLowerCase();
  var base64Data = String(data.base64Data || "");
  if (ALLOWED_PHOTO_SLOTS.indexOf(slotKey) === -1) throw new Error("Slot foto tidak dikenal.");
  if (ALLOWED_IMAGE_TYPES.indexOf(mimeType) === -1) throw new Error("Format foto harus JPG, PNG, atau WebP.");
  if (!base64Data || base64Data.length > 7 * 1024 * 1024) throw new Error("Ukuran foto melebihi batas 5 MB.");
  if (base64Data.indexOf(",") > -1) base64Data = base64Data.split(",").pop();

  var bytes = Utilities.base64Decode(base64Data);
  if (bytes.length > 5 * 1024 * 1024) throw new Error("Ukuran foto maksimal 5 MB.");
  if (!hasValidImageSignature_(bytes, mimeType)) throw new Error("Isi file tidak sesuai dengan format gambar.");

  var extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";
  var safeName = slotKey + "_" + new Date().getTime() + "." + extension;
  var blob = Utilities.newBlob(bytes, mimeType, safeName);
  var folder = getOrCreateFolder_(FOLDER_NAME);
  var file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingError) {
    file.setTrashed(true);
    throw new Error("Google Drive tidak mengizinkan berbagi file publik. Periksa kebijakan Drive.");
  }

  var fileId = file.getId();
  var url = "https://lh3.googleusercontent.com/d/" + fileId;
  savePhotoRecord_(slotKey, String(data.slotLabel || slotKey).slice(0, 100), url, fileId,
    "https://drive.google.com/uc?export=view&id=" + fileId);
  return { slotKey: slotKey, url: url, fileId: fileId, driveViewUrl: file.getUrl() };
}

function hasValidImageSignature_(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes.length > 3 && bytes[0] === -1 && bytes[1] === -40 && bytes[2] === -1;
  if (mimeType === "image/png") {
    var sig = [ -119, 80, 78, 71, 13, 10, 26, 10 ];
    return bytes.length >= 8 && sig.every(function(v, i) { return bytes[i] === v; });
  }
  if (mimeType === "image/webp") {
    return bytes.length > 12 &&
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
      String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP";
  }
  return false;
}

function getPhotos_() {
  var sheet = getOrCreateSheet_("Photos", ["Slot Key", "Label Slot", "Image URL (Direct)", "Drive File ID", "Tanggal Upload", "Fallback URL"]);
  var data = sheet.getDataRange().getValues();
  var photos = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][2]) photos[String(data[i][0])] = String(data[i][2]);
  }
  return photos;
}

function savePhotoUrl_(data) {
  var slotKey = String(data.slotKey || "");
  var url = String(data.url || "");
  if (ALLOWED_PHOTO_SLOTS.indexOf(slotKey) === -1) throw new Error("Slot foto tidak dikenal.");
  if (!/^https:\/\/[^\s]+$/i.test(url)) throw new Error("URL foto harus menggunakan HTTPS.");
  return savePhotoRecord_(slotKey, String(data.slotLabel || slotKey).slice(0, 100), url, String(data.fileId || ""), "");
}

function savePhotoRecord_(slotKey, slotLabel, url, fileId, fallbackUrl) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Server sedang sibuk. Coba kembali.");
  try {
    var sheet = getOrCreateSheet_("Photos", ["Slot Key", "Label Slot", "Image URL (Direct)", "Drive File ID", "Tanggal Upload", "Fallback URL"]);
    var rows = sheet.getDataRange().getValues();
    var target = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === slotKey) { target = i + 1; break; }
    }
    var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var row = [slotKey, textCell_(slotLabel, 100), url, fileId, now, fallbackUrl || ""];
    if (target > 0) sheet.getRange(target, 1, 1, 6).setValues([row]);
    else sheet.appendRow(row);
    return { slotKey: slotKey, url: url, fileId: fileId, timestamp: now };
  } finally {
    lock.releaseLock();
  }
}

function saveGuests_(guests) {
  if (!Array.isArray(guests) || guests.length > 2000) throw new Error("Daftar tamu tidak valid (maksimal 2.000).");
  var prepared = guests.map(function(g) {
    if (!g || typeof g !== "object") throw new Error("Data tamu tidak valid.");
    var id = String(g.id || "").trim();
    var name = String(g.name || "").trim();
    if (!id || id.length > 100 || !name || name.length > 160) throw new Error("ID atau nama tamu tidak valid.");
    return [
      textCell_(id, 100),
      textCell_(name, 160),
      textCell_(g.phone || "", 30),
      textCell_(g.customUrl || "", 1000),
      textCell_(g.notes || "", 500),
      Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss")
    ];
  });

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Server sedang sibuk. Coba kembali.");
  try {
    var sheet = getOrCreateSheet_("Guests", ["ID", "Nama Tamu", "No WhatsApp", "Tautan Undangan", "Catatan", "Terakhir Diperbarui"]);
    var existing = sheet.getDataRange().getValues();
    var rowById = {};
    for (var i = 1; i < existing.length; i++) rowById[String(existing[i][0])] = i + 1;
    prepared.forEach(function(row) {
      var targetRow = rowById[String(row[0]).replace(/^'/, "")];
      if (targetRow) sheet.getRange(targetRow, 1, 1, 6).setValues([row]);
      else sheet.appendRow(row);
    });
    return prepared.length;
  } finally {
    lock.releaseLock();
  }
}

function deleteGuest_(guestId) {
  if (!guestId || guestId.length > 100) throw new Error("ID tamu tidak valid.");
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Server sedang sibuk. Coba kembali.");
  try {
    var sheet = getOrCreateSheet_("Guests", ["ID", "Nama Tamu", "No WhatsApp", "Tautan Undangan", "Catatan", "Terakhir Diperbarui"]);
    var values = sheet.getDataRange().getValues();
    for (var i = values.length - 1; i >= 1; i--) {
      if (String(values[i][0]).replace(/^'/, "") === guestId) sheet.deleteRow(i + 1);
    }
  } finally {
    lock.releaseLock();
  }
}

function getGuests_() {
  var sheet = getOrCreateSheet_("Guests", ["ID", "Nama Tamu", "No WhatsApp", "Tautan Undangan", "Catatan", "Terakhir Diperbarui"]);
  var data = sheet.getDataRange().getValues();
  var guests = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][1]) guests.push({
      id: String(data[i][0]), name: String(data[i][1]), phone: String(data[i][2] || ""),
      customUrl: String(data[i][3] || ""), notes: String(data[i][4] || ""),
      updatedAt: String(data[i][5] || "")
    });
  }
  return guests;
}

function saveAudio_(config) {
  var mode = config.mode === "youtube" ? "youtube" : "gamelan";
  var youtubeId = String(config.youtubeId || "");
  if (mode === "youtube" && !/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) throw new Error("ID video YouTube tidak valid.");
  var volume = Number(config.volume);
  var startSeconds = Number(config.startSeconds);
  if (!isFinite(volume) || volume < 0 || volume > 100) throw new Error("Volume tidak valid.");
  if (!isFinite(startSeconds) || startSeconds < 0 || startSeconds > 3600) throw new Error("Waktu mulai tidak valid.");
  var safe = {
    mode: mode, youtubeId: youtubeId,
    youtubeUrl: youtubeId ? "https://www.youtube.com/watch?v=" + youtubeId : "",
    title: textCell_(config.title || "", 120),
    volume: volume, startSeconds: Math.floor(startSeconds), loop: config.loop !== false
  };
  var sheet = getOrCreateSheet_("Audio", ["Mode", "YouTube ID", "YouTube URL", "Judul", "Volume", "Mulai Detik", "Loop", "Diperbarui"]);
  var row = [safe.mode, safe.youtubeId, safe.youtubeUrl, safe.title, safe.volume, safe.startSeconds, safe.loop, new Date()];
  if (sheet.getLastRow() < 2) sheet.appendRow(row);
  else sheet.getRange(2, 1, 1, row.length).setValues([row]);
  return safe;
}

function getAudio_() {
  var sheet = getOrCreateSheet_("Audio", ["Mode", "YouTube ID", "YouTube URL", "Judul", "Volume", "Mulai Detik", "Loop", "Diperbarui"]);
  if (sheet.getLastRow() < 2) return {
    mode: "gamelan", youtubeId: "", youtubeUrl: "",
    title: "Gamelan Slendro Ambience", volume: 75, startSeconds: 0, loop: true
  };
  var row = sheet.getRange(2, 1, 1, 8).getValues()[0];
  return {
    mode: row[0] === "youtube" ? "youtube" : "gamelan",
    youtubeId: String(row[1] || ""), youtubeUrl: String(row[2] || ""),
    title: String(row[3] || "Gamelan Slendro Ambience"),
    volume: Number(row[4]) || 75, startSeconds: Number(row[5]) || 0, loop: row[6] !== false
  };
}

function saveRsvp_(rsvp) {
  var name = String(rsvp.name || "").trim();
  var message = String(rsvp.message || "").trim();
  var attendance = String(rsvp.attendance || "");
  var guestCount = String(rsvp.guestCount || "1 Person");
  if (!name || name.length > 120) throw new Error("Nama wajib diisi (maksimal 120 karakter).");
  if (!message || message.length > 1000) throw new Error("Ucapan wajib diisi (maksimal 1.000 karakter).");
  if (["InshaAllah Attending", "Regretfully Unable"].indexOf(attendance) === -1) throw new Error("Pilihan kehadiran tidak valid.");
  if (["1 Person", "2 Persons"].indexOf(guestCount) === -1) throw new Error("Jumlah tamu tidak valid.");

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Server sedang sibuk. Kirim kembali beberapa saat lagi.");
  try {
    var sheet = getOrCreateSheet_("RSVP", ["ID", "Nama Tamu", "Kehadiran", "Jumlah Tamu (Pax)", "Doa & Ucapan", "Waktu Respon"]);
    var now = new Date();
    var saved = {
      id: "rsvp_" + now.getTime() + "_" + Utilities.getUuid().slice(0, 8),
      name: name, attendance: attendance, guestCount: guestCount,
      message: message, timestamp: Utilities.formatDate(now, "Asia/Jakarta", "dd MMM yyyy, HH:mm") + " WIB"
    };
    sheet.appendRow([
      saved.id, textCell_(saved.name, 120), saved.attendance, saved.guestCount,
      textCell_(saved.message, 1000), now
    ]);
    return saved;
  } finally {
    lock.releaseLock();
  }
}

function getRsvp_() {
  var sheet = getOrCreateSheet_("RSVP", ["ID", "Nama Tamu", "Kehadiran", "Jumlah Tamu (Pax)", "Doa & Ucapan", "Waktu Respon"]);
  var data = sheet.getDataRange().getValues();
  var rsvps = [];
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1]) rsvps.push({
      id: String(data[i][0]), name: String(data[i][1]), attendance: String(data[i][2]),
      guestCount: String(data[i][3]), message: String(data[i][4]),
      timestamp: Utilities.formatDate(new Date(data[i][5]), "Asia/Jakarta", "dd MMM yyyy, HH:mm") + " WIB"
    });
  }
  return rsvps;
}

function textCell_(value, maxLength) {
  var text = String(value == null ? "" : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#2c1e14");
    headerRange.setFontColor("#f6ebcc");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateFolder_(name) {
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeError_(err) {
  var message = String(err && err.message ? err.message : err);
  if (message.indexOf("Sesi admin") === 0 ||
      message.indexOf("PIN") >= 0 ||
      message.indexOf("Keamanan admin") === 0 ||
      message.indexOf("Terlalu banyak") === 0 ||
      message.indexOf("Server sedang sibuk") === 0 ||
      message.indexOf("Ukuran foto") === 0 ||
      message.indexOf("Format foto") === 0 ||
      message.indexOf("Nama wajib") === 0 ||
      message.indexOf("Ucapan wajib") === 0 ||
      message.indexOf("Pilihan kehadiran") === 0 ||
      message.indexOf("Jumlah tamu") === 0) return message;
  return "Permintaan tidak dapat diproses. Periksa konfigurasi backend atau coba kembali.";
}
