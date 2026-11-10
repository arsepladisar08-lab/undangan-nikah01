/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - BACKEND UNDANGAN PERNIKAHAN JAWA
 * Raden Mas Bagaskara & Roro Sekar Arum
 * =========================================================================
 * 
 * FITUR:
 * 1. Simpan foto ke folder Google Drive otomatis ("Undangan Pernikahan Bagaskara & Sekar").
 * 2. Set izin publik pada file agar foto dapat diakses dan ditampilkan di web undangan.
 * 3. Catat tautan foto dan metadata secara otomatis ke sheet "Photos".
 * 4. Simpan dan ambil daftar tamu undangan personal ke/dari sheet "Guests".
 * 5. Dukungan CORS untuk integrasi frontend React.
 */

// Nama Folder di Google Drive untuk menyimpan foto undangan
var FOLDER_NAME = "Undangan Pernikahan Bagaskara & Sekar";

/**
 * Handle HTTP GET Requests
 * Mengambil data foto yang tersimpan atau daftar tamu
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params ? params.action : "getPhotos";

    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "Google Apps Script Backend Undangan is active!",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getGuests") {
      var guests = getGuestsFromSheet();
      return createJsonResponse({
        status: "success",
        data: guests
      });
    }

    // Default action: getPhotos
    var photos = getPhotosFromSheet();
    return createJsonResponse({
      status: "success",
      data: photos
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Handle HTTP POST Requests
 * Upload foto ke Google Drive atau simpan daftar tamu ke Google Sheet
 */
function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    var action = data.action;

    if (action === "uploadPhoto") {
      var result = handlePhotoUpload(data);
      return createJsonResponse({
        status: "success",
        message: "Foto berhasil diunggah ke Google Drive dan dicatat di Google Sheet!",
        data: result
      });
    }

    if (action === "saveGuests") {
      var guestCount = handleSaveGuests(data.guests);
      return createJsonResponse({
        status: "success",
        message: guestCount + " tamu berhasil disimpan ke Google Sheet!",
        count: guestCount
      });
    }

    if (action === "savePhotoUrl") {
      var saved = recordPhotoInSheet(data.slotKey, data.slotLabel, data.url, data.fileId || "");
      return createJsonResponse({
        status: "success",
        message: "Tautan foto berhasil disimpan ke Google Sheet!",
        data: saved
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Aksi tidak dikenal: " + action
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Upload base64 image data ke Google Drive dan catat ke Sheet "Photos"
 */
function handlePhotoUpload(data) {
  var slotKey = data.slotKey;
  var slotLabel = data.slotLabel || slotKey;
  var fileName = data.fileName || (slotKey + "_" + new Date().getTime() + ".jpg");
  var mimeType = data.mimeType || "image/jpeg";
  var base64Data = data.base64Data;

  if (!base64Data) {
    throw new Error("Data gambar base64 tidak ditemukan.");
  }

  // Bersihkan data URL prefix jika ada (misal data:image/jpeg;base64,...)
  if (base64Data.indexOf(",") > -1) {
    base64Data = base64Data.split(",")[1];
  }

  // Buat blob dari data base64
  var decodedBytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

  // Ambil atau buat folder Google Drive
  var folder = getOrCreateFolder(FOLDER_NAME);

  // Simpan file ke Drive
  var file = folder.createFile(blob);

  // Set permission agar siapa pun yang memiliki tautan dapat melihat gambar
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    Logger.log("Peringatan saat setting sharing: " + err);
  }

  var fileId = file.getId();
  
  // URL akses gambar Google Drive yang kompatibel untuk web
  // Format lh3 direct CDN atau export=view
  var directViewUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  var fallbackUrl = "https://drive.google.com/uc?export=view&id=" + fileId;

  // Catat ke Google Sheet tab "Photos"
  recordPhotoInSheet(slotKey, slotLabel, directViewUrl, fileId, fallbackUrl);

  return {
    slotKey: slotKey,
    slotLabel: slotLabel,
    fileId: fileId,
    url: directViewUrl,
    fallbackUrl: fallbackUrl,
    driveViewUrl: file.getUrl()
  };
}

/**
 * Mencatat atau memperbarui foto di tab "Photos"
 */
function recordPhotoInSheet(slotKey, slotLabel, url, fileId, fallbackUrl) {
  var sheet = getOrCreateSheet("Photos", ["Slot Key", "Label Slot", "Image URL (Direct)", "Drive File ID", "Tanggal Upload", "Fallback URL"]);
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === slotKey) {
      foundRow = i + 1;
      break;
    }
  }

  var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

  if (foundRow > 0) {
    // Perbarui baris yang sudah ada
    sheet.getRange(foundRow, 2).setValue(slotLabel);
    sheet.getRange(foundRow, 3).setValue(url);
    sheet.getRange(foundRow, 4).setValue(fileId || "");
    sheet.getRange(foundRow, 5).setValue(timestamp);
    if (fallbackUrl) {
      sheet.getRange(foundRow, 6).setValue(fallbackUrl);
    }
  } else {
    // Tambahkan baris baru
    sheet.appendRow([slotKey, slotLabel, url, fileId || "", timestamp, fallbackUrl || ""]);
  }

  return {
    slotKey: slotKey,
    slotLabel: slotLabel,
    url: url,
    fileId: fileId,
    timestamp: timestamp
  };
}

/**
 * Mengambil semua foto dari tab "Photos" dalam format JSON Map
 */
function getPhotosFromSheet() {
  var sheet = getOrCreateSheet("Photos", ["Slot Key", "Label Slot", "Image URL (Direct)", "Drive File ID", "Tanggal Upload", "Fallback URL"]);
  var data = sheet.getDataRange().getValues();
  var photos = {};

  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var url = data[i][2];
    if (key && url) {
      photos[key] = url;
    }
  }

  return photos;
}

/**
 * Menyimpan daftar tamu ke tab "Guests"
 */
function handleSaveGuests(guests) {
  if (!guests || !Array.isArray(guests)) {
    return 0;
  }

  var sheet = getOrCreateSheet("Guests", ["ID", "Nama Tamu", "No WhatsApp", "Tautan Undangan", "Catatan", "Terakhir Diperbarui"]);
  
  // Hapus data lama kecuali header
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
  }

  var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  var rows = [];

  for (var i = 0; i < guests.length; i++) {
    var g = guests[i];
    rows.push([
      g.id || ("g_" + (i + 1)),
      g.name || "",
      g.phone || "",
      g.customUrl || "",
      g.notes || "",
      timestamp
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }

  return rows.length;
}

/**
 * Mengambil daftar tamu dari tab "Guests"
 */
function getGuestsFromSheet() {
  var sheet = getOrCreateSheet("Guests", ["ID", "Nama Tamu", "No WhatsApp", "Tautan Undangan", "Catatan", "Terakhir Diperbarui"]);
  var data = sheet.getDataRange().getValues();
  var guests = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][1]) {
      guests.push({
        id: String(data[i][0]),
        name: String(data[i][1]),
        phone: String(data[i][2] || ""),
        customUrl: String(data[i][3] || ""),
        notes: String(data[i][4] || ""),
        updatedAt: String(data[i][5] || "")
      });
    }
  }

  return guests;
}

/**
 * Helper: Ambil atau buat tab Sheet dengan Header yang rapi
 */
function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#2c1e14");
      headerRange.setFontColor("#f6ebcc");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * Helper: Ambil atau buat folder di Google Drive
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Helper: Membuat respons JSON dengan header CORS
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
