function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ "status": "success", "message": "Google Script is running!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const SHEET_NAME = 'Form Data';
    const FOLDER_ID = '1RvoBmKT7LgyS1RoVtDUZBRiuGyEjsNZs';

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Timestamp', 'State', 'Designation', 'HQ', 'User', 'Password',
        'Date', 'Place From', 'Place To', 'Distance in Km', 'Night Allowance', 'File URL'
      ]);
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);

    const data = JSON.parse(e.postData.contents);

    const fields = [
      'state', 'designation', 'hq', 'user', 'password',
      'month', 'PlaceFrom', 'PlaceTo', 'DistanceinKm', 'NightAllowance'
    ];

    const values = fields.map(field => data[field] || '');

    let fileUrl = '';
    if (data.file && data.file.content && data.file.name && data.file.type) {
      try {
        // Extract base64 content from data URL
        const base64Data = data.file.content.split(',')[1]; // After 'base64,'
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.file.type, data.file.name);
        const file = folder.createFile(blob);
        fileUrl = file.getUrl();
      } catch (err) {
        Logger.log("Error processing file: " + err.message);
        fileUrl = '';
      }
    }

    const timestamp = new Date();
    sheet.appendRow([timestamp, ...values, fileUrl]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data submitted successfully!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'failed', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
