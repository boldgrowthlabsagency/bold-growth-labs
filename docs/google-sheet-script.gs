/**
 * BOLD Growth Labs — website enquiries → this spreadsheet
 * ---------------------------------------------------------------
 * Paste this into Extensions ▸ Apps Script on the sheet that should
 * receive enquiries, then deploy it as a Web App (see the steps in
 * docs/GOOGLE-SHEET-SETUP.md).
 *
 * It does two things per submission:
 *   1. appends a row  — the durable record you can sort and filter
 *   2. emails you     — so you actually notice within a minute
 *
 * Only the site's own server calls this; the URL is held in a Vercel
 * environment variable and never reaches the browser.
 */

/* Where the notification goes. Change this if you move off Gmail. */
var NOTIFY = 'boldgrowthlabs@gmail.com';

/* Column order. Add a field here and it lands in a new column —
   existing rows keep their shape because the header is rewritten. */
var COLUMNS = [
  ['receivedAt', 'Received'],
  ['name',       'Name'],
  ['business',   'Business'],
  ['email',      'Email'],
  ['phone',      'Phone'],
  ['needs',      'Needs'],
  ['details',    'Details'],
  ['source',     'Source'],
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    /* First run on an empty sheet: lay down a header row and freeze it. */
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(function (c) { return c[1]; }));
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(COLUMNS.map(function (c) { return data[c[0]] || ''; }));

    /* Notify. Wrapped separately so a mail failure never costs you the row —
       the record in the sheet is the thing that must not be lost. */
    try {
      MailApp.sendEmail({
        to: NOTIFY,
        subject: 'New enquiry — ' + (data.business || data.name || 'website'),
        replyTo: data.email || NOTIFY,
        body: [
          'Name:     ' + (data.name || '—'),
          'Business: ' + (data.business || '—'),
          'Email:    ' + (data.email || '—'),
          'Phone:    ' + (data.phone || '—'),
          'Needs:    ' + (data.needs || '—'),
          '',
          (data.details || '(no details given)'),
          '',
          '— ' + (data.source || 'website') + ' · ' + (data.receivedAt || ''),
        ].join('\n'),
      });
    } catch (mailErr) {
      console.error('row saved, notification failed: ' + mailErr);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error(err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* Lets you open the deployed URL in a browser to confirm it is alive
   without sending anything to the sheet. */
function doGet() {
  return ContentService
    .createTextOutput('BOLD Growth Labs enquiry endpoint is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Safe to run by hand from the editor — pick `testSubmission` in the Run
 * dropdown and press Run.
 *
 * Running `doPost` directly always fails: it takes its data from the HTTP
 * request as `e`, and running it manually passes nothing, so `e.postData`
 * is undefined. This fakes that argument so you can prove the row and the
 * email both work before you deploy anything.
 */
function testSubmission() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        receivedAt: new Date().toISOString(),
        name: 'Test Submission',
        business: 'BOLD Growth Labs',
        email: 'boldgrowthlabs@gmail.com',
        phone: '—',
        needs: 'Websites, SEO',
        details: 'If you can read this in the sheet, the script works. Delete this row.',
        source: 'manual test',
      }),
    },
  };
  var out = doPost(fake);
  Logger.log('Result: ' + out.getContent());
}
