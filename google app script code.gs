// ==========================================
// VIOLET CHEMISTRY - SECURE BACKEND
// ==========================================

const SHEET_NAME = "Products";
const TRASH_SHEET = "Trash";
const SALES_SHEET = "Sales";

// Change these whenever you want to update credentials
// BETTER SECURITY: Set these in File -> Project Settings -> Script Properties
const SCRIPT_PROP = PropertiesService.getScriptProperties();
const ADMIN_USER = SCRIPT_PROP.getProperty('ADMIN_USER') || "admin";
const ADMIN_PASS = SCRIPT_PROP.getProperty('ADMIN_PASS') || "violet123"; 

// 1. GET REQUESTS
function doGet(e) {
  const action = e.parameter.action;
  const token = e.parameter.token;
  
  // Login doesn't need a token check
  if (action === 'login') {
    const user = e.parameter.user;
    const pass = e.parameter.pass;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      const expiry = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 hours from now
      return jsonResponse({ success: true, token: generateToken(), expiry: expiry });
    }
    return jsonResponse({ success: false, error: "Invalid credentials" });
  }

  // Verify token for all other actions
  if (!verifyToken(token)) {
    return jsonResponse({ error: "Unauthorized", loginRequired: true });
  }
  
  if (action === 'getProducts') return jsonResponse(readData(getOrCreateSheet(SHEET_NAME)));
  if (action === 'getTrash') return jsonResponse(readData(getOrCreateSheet(TRASH_SHEET)));
  if (action === 'getHistory') return jsonResponse(readData(getOrCreateSheet(SALES_SHEET)));
  
  return jsonResponse({ status: "Active" });
}

// 2. POST REQUESTS
function doPost(e) {
  const action = e.parameter.action;
  const token = e.parameter.token;
  
  if (!verifyToken(token)) {
    return jsonResponse({ error: "Unauthorized", loginRequired: true });
  }

  const data = JSON.parse(e.postData.contents);
  const productSheet = getOrCreateSheet(SHEET_NAME);
  const trashSheet = getOrCreateSheet(TRASH_SHEET);
  const salesSheet = getOrCreateSheet(SALES_SHEET);
  
  if (action === 'addProduct') return jsonResponse(createData(productSheet, data));
  if (action === 'updateProduct') return jsonResponse(updateData(productSheet, data));
  if (action === 'deleteProduct') return jsonResponse(moveToTrash(productSheet, trashSheet, data.id));
  if (action === 'restoreProduct') return jsonResponse(restoreFromTrash(productSheet, trashSheet, data.id));
  if (action === 'sellProduct') return jsonResponse(recordSale(productSheet, salesSheet, data));
  if (action === 'deleteSale') return jsonResponse(deleteSale(salesSheet, data.date));
  
  if (action === 'emptyTrash') {
    trashSheet.clearContents();
    trashSheet.appendRow(["id", "name", "quantity", "unit", "price", "total", "keywords", "deletedAt"]);
    return jsonResponse({ success: true });
  }
}

// ==========================================
// SECURITY HELPERS
// ==========================================

function generateToken() {
  // Simple token based on password and current date
  return Utilities.base64Encode(ADMIN_PASS + new Date().getDate());
}

function verifyToken(token) {
  return token === generateToken();
}

// ==========================================
// CORE DATA FUNCTIONS (Same as before but cleaned up)
// ==========================================

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_NAME) sheet.appendRow(["id", "name", "quantity", "unit", "price", "total", "keywords"]);
    else if (name === TRASH_SHEET) sheet.appendRow(["id", "name", "quantity", "unit", "price", "total", "keywords", "deletedAt"]);
    else if (name === SALES_SHEET) sheet.appendRow(["date", "productId", "productName", "quantity", "unit", "price", "total", "customerName", "companyName", "customerPhone", "customerAddress"]);
  }
  return sheet;
}

function readData(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; 
  const headers = values.shift(); 
  return values.map(row => {
    let obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}

function createData(sheet, data) {
  const id = "VC-" + new Date().getTime(); 
  const total = (Number(data.quantity) || 0) * (Number(data.price) || 0);
  sheet.appendRow([id, data.name, data.quantity, data.unit, data.price, total, data.keywords]);
  return { success: true, id: id };
}

function updateData(sheet, data) {
  const rows = sheet.getDataRange().getValues();
  const total = (Number(data.quantity) || 0) * (Number(data.price) || 0);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 2, 1, 6).setValues([[data.name, data.quantity, data.unit, data.price, total, data.keywords]]);
      return { success: true };
    }
  }
  return { success: false };
}

function recordSale(productSheet, salesSheet, data) {
  const rows = productSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.productId) {
      const currentQty = Number(rows[i][2]) || 0;
      const newQty = currentQty - (Number(data.quantity) || 0);
      const price = Number(rows[i][4]) || 0;
      productSheet.getRange(i + 1, 3).setValue(newQty);
      productSheet.getRange(i + 1, 6).setValue(newQty * price);
      break;
    }
  }
  salesSheet.appendRow([data.date, data.productId, data.productName, data.quantity, data.unit, data.price, data.total, data.customerName, data.companyName, data.customerPhone, data.customerAddress]);
  return { success: true };
}

function moveToTrash(sheet, trash, id) {
  const rows = sheet.getDataRange().getValues();
  const salesSheet = getOrCreateSheet(SALES_SHEET);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      const rowData = rows[i];
      salesSheet.appendRow([new Date().toISOString(), id, rowData[1] + " (DELETED)", rowData[2], rowData[3], rowData[4], rowData[5], "SYSTEM", "Inventory Management", "-", "Moved to Trash"]);
      const trashData = [...rowData]; trashData.push(new Date()); trash.appendRow(trashData); 
      sheet.deleteRow(i + 1); return { success: true };
    }
  }
  return { success: false };
}

function restoreFromTrash(sheet, trash, id) {
  const rows = trash.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      const rowData = rows[i]; rowData.pop(); sheet.appendRow(rowData); trash.deleteRow(i + 1); return { success: true };
    }
  }
  return { success: false };
}

function deleteSale(sheet, date) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === date) { sheet.deleteRow(i + 1); return { success: true }; }
  }
  return { success: false };
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}