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

/* The /start questionnaire. Far too wide to share the enquiry sheet, so it
   gets its own tab — created on first submission. Add a field here AND to
   INTAKE_FIELDS in lib/intake.ts, or it is dropped before it reaches Google. */
var INTAKE_TAB = 'New build questionnaire';
var INTAKE_COLUMNS = [
  ['receivedAt',  'Received'],
  ['org',         'Organization'],
  ['orgtype',     'Type'],
  ['name',        'Contact'],
  ['role',        'Role'],
  ['email',       'Email'],
  ['phone',       'Phone'],
  ['what',        'What they do'],
  ['serve',       'Who / where they serve'],
  ['age',         'Years going'],
  ['current',     'Current site'],
  ['goals',       'Goals'],
  ['action',      'Primary action'],
  ['services',    'Services / programs'],
  ['audience',    'Typical visitor'],
  ['questions',   'What people ask'],
  ['barrier',     'What gets in the way'],
  ['logo',        'Logo'],
  ['brand',       'Brand guidelines'],
  ['photos',      'Photography'],
  ['copy',        'Copy'],
  ['domain',      'Domain'],
  ['domainname',  'Domain name'],
  ['likes',       'Sites they like'],
  ['avoid',       'Avoid'],
  ['compliance',  'Compliance'],
  ['pages',       'Pages wanted'],
  ['timeline',    'Timeline'],
  ['notes',       'Notes'],
  ['fileCount',   'Files'],
  ['files',       'File links'],
  ['source',      'Source'],
];

/* Revision requests from /revisions.

   ONE ROW PER REQUEST, not per submission. A client sending eight changes
   should produce eight rows that can be sorted, filtered and ticked off — the
   whole point is a worklist, and eight changes in one cell is a paragraph. The
   submission-level columns repeat across that client's rows, which is exactly
   what makes them filterable. */
var REVISION_TAB = 'Revision requests';
var REVISION_COLUMNS = [
  ['receivedAt', 'Received'],
  ['client',     'Site'],
  ['round',      'Round'],
  ['decision',   'Decision'],
  ['name',       'From'],
  ['email',      'Email'],
  ['n',          '#'],
  ['page',       'Page'],
  ['section',    'Section'],
  ['device',     'Device'],
  ['priority',   'Priority'],
  ['detail',     'Change'],
  ['shot',       'Screenshot'],
  ['notes',      'Other notes'],
  ['assets',     'New files'],
  ['source',     'Source'],
];

/* Appointment center applicants from /apply — one row per person. Column
   order puts what you screen on first, so the sheet can be sorted by
   experience or start date without scrolling sideways. Add a field here AND
   to APPLY_FIELDS in lib/hiring.ts, or it is dropped before it reaches Google. */
var HIRING_TAB = 'Appointment center applicants';
var HIRING_COLUMNS = [
  ['receivedAt',   'Received'],
  ['name',         'Name'],
  ['phone',        'Phone'],
  ['email',        'Email'],
  ['city',         'City'],
  ['phoneExp',     'Phone experience'],
  ['reExp',        'Real estate background'],
  ['hours',        'Usually free'],
  ['start',        'Can start'],
  ['languages',    'Languages'],
  ['why',          'Why they would be good'],
  ['source',       'Source'],
];

/* Finds a tab by name, creating it (with a frozen bold header) if missing. */
function tabFor(name, columns) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(columns.map(function (c) { return c[1]; }));
    sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    /* The questionnaire is a different animal — its own tab, its own columns,
       its own notification. Routed on the `form` field the proxy sets. */
    if (data.form === 'intake') return handleIntake(data);
    if (data.form === 'revisions') return handleRevisions(data);
    if (data.form === 'hiring') return handleHiring(data);

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

function handleIntake(data) {
  var sheet = tabFor(INTAKE_TAB, INTAKE_COLUMNS);
  sheet.appendRow(INTAKE_COLUMNS.map(function (c) { return data[c[0]] || ''; }));

  try {
    MailApp.sendEmail({
      to: NOTIFY,
      subject: 'New build questionnaire — ' + (data.org || 'unnamed'),
      replyTo: data.email || NOTIFY,
      body: [
        (data.org || '—') + ' · ' + (data.orgtype || '—'),
        (data.name || '—') + (data.role ? ', ' + data.role : ''),
        (data.email || '—') + '  ' + (data.phone || ''),
        '',
        'WHAT THEY DO',
        (data.what || '—'),
        '',
        'SERVES:    ' + (data.serve || '—'),
        'GOALS:     ' + (data.goals || '—'),
        'ONE ACTION:' + (data.action || '—'),
        'TIMELINE:  ' + (data.timeline || '—'),
        'RULES:     ' + (data.compliance || '—'),
        '',
        'SERVICES',
        (data.services || '—'),
        '',
        'WHAT PEOPLE ASK',
        (data.questions || '—'),
        '',
        'HAS: logo ' + (data.logo || '?') + ' · photos ' + (data.photos || '?') +
          ' · copy ' + (data.copy || '?') + ' · domain ' + (data.domain || '?'),
        '',
        'FILES (' + (data.fileCount || '0') + ')',
        (data.files || 'none'),
        '',
        '— ' + (data.receivedAt || ''),
      ].join('\n'),
    });
  } catch (mailErr) {
    console.error('intake row saved, notification failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRevisions(data) {
  var sheet = tabFor(REVISION_TAB, REVISION_COLUMNS);
  var rows = data.rows || [];

  /* A decision with no changes is a valid submission — someone approving as-is
     has nothing to list — so write one row carrying the decision either way. */
  if (!rows.length) rows = [{}];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i] || {};
    var merged = {
      receivedAt: data.receivedAt || '',
      client: data.client || '',
      round: data.round || '',
      decision: data.decision || '',
      name: data.name || '',
      email: data.email || '',
      n: (i + 1) + ' of ' + rows.length,
      page: r.page || '',
      section: r.section || '',
      device: r.device || '',
      priority: r.priority || '',
      detail: r.detail || '',
      shot: r.shot || '',
      /* notes and new files belong to the submission, so they sit on the first
         row only — repeating them down every row makes the columns unreadable */
      notes: i === 0 ? (data.notes || '') : '',
      assets: i === 0 ? (data.assets || '') : '',
      source: data.source || '',
    };
    sheet.appendRow(REVISION_COLUMNS.map(function (c) { return merged[c[0]] || ''; }));
  }

  try {
    var lines = [
      (data.client || 'unnamed') + ' — ' + (data.round || ''),
      (data.name || '—') + '  ' + (data.email || ''),
      '',
      'DECISION',
      (data.decision || '—'),
      '',
      (data.count || rows.length) + ' CHANGE(S)',
      '',
    ];
    for (var j = 0; j < rows.length; j++) {
      var q = rows[j] || {};
      if (!q.detail) continue;
      lines.push((j + 1) + '. [' + (q.priority || 'no priority') + '] '
        + (q.page || 'page?') + ' / ' + (q.section || 'section?')
        + (q.device ? ' (' + q.device + ')' : ''));
      lines.push('   ' + q.detail);
      if (q.shot) lines.push('   ' + q.shot.split('\n').join('\n   '));
      lines.push('');
    }
    if (data.assets) {
      lines.push('NEW FILES (' + (data.assetCount || '') + ')');
      lines.push(data.assets);
      lines.push('');
    }
    if (data.notes) { lines.push('OTHER NOTES'); lines.push(data.notes); lines.push(''); }
    lines.push('— ' + (data.receivedAt || ''));

    MailApp.sendEmail({
      to: NOTIFY,
      subject: 'Revisions — ' + (data.client || 'unnamed')
        + ((data.assetCount && data.assetCount !== '0') ? ' + ' + data.assetCount + ' file(s)' : '')
        + ' (' + (data.decision || '') + ')',
      replyTo: data.email || NOTIFY,
      body: lines.join('\n'),
    });
  } catch (mailErr) {
    console.error('revision rows saved, notification failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleHiring(data) {
  var sheet = tabFor(HIRING_TAB, HIRING_COLUMNS);
  sheet.appendRow(HIRING_COLUMNS.map(function (c) { return data[c[0]] || ''; }));

  try {
    MailApp.sendEmail({
      to: NOTIFY,
      /* the subject carries the two answers that decide who to call first */
      subject: 'Applicant — ' + (data.name || 'unnamed')
        + ' (' + (data.phoneExp || '?') + ' on phones, can start ' + (data.start || '?') + ')',
      replyTo: data.email || NOTIFY,
      body: [
        (data.name || '—'),
        (data.phone || '—') + (data.email ? '  ·  ' + data.email : ''),
        (data.city ? data.city : ''),
        '',
        'PHONE EXPERIENCE:  ' + (data.phoneExp || '—'),
        'REAL ESTATE:       ' + (data.reExp || '—'),
        'USUALLY FREE:      ' + (data.hours || '—'),
        'CAN START:         ' + (data.start || '—'),
        'LANGUAGES:         ' + (data.languages || '—'),
        '',
        (data.why ? 'WHY: ' + data.why : ''),
        '',
        '— ' + (data.source || 'direct') + ' · ' + (data.receivedAt || ''),
      ].join('\n'),
    });
  } catch (mailErr) {
    console.error('applicant row saved, notification failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
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
