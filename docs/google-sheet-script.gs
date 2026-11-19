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
  ['commission',   'Open to commission'],
  ['start',        'Can start'],
  ['languages',    'Languages'],
  ['why',          'Why they would be good'],
  ['source',       'Source'],
];

/* Growth audits from /audit — one row per business. The contact and the
   computed "Points at" lead, so the sheet reads as a call list; the raw answers
   follow in form order. Add a field here AND to CHOICES in lib/audit.ts, or it
   is dropped before it reaches Google. */
var AUDIT_TAB = 'Growth audits';
var AUDIT_COLUMNS = [
  ['receivedAt', 'Received'],
  ['business',   'Business'],
  ['name',       'Contact'],
  ['phone',      'Phone'],
  ['email',      'Email'],
  ['website',    'Website'],
  ['pointsAt',   'Points at'],
  ['timing',     'Would act'],
  ['industry',   'Industry'],
  ['revenue',    'Monthly revenue'],
  ['team',       'Team size'],
  ['sources',    'Lead sources'],
  ['volume',     'Leads / month'],
  ['adspend',    'Ad spend / month'],
  ['response',   'Response time'],
  ['tools',      'Tools'],
  ['admin',      'Admin hrs / week'],
  ['bottleneck', 'Bottlenecks'],
  ['goal',       '12-month goal'],
  ['fix',        'Fix one thing'],
  ['source',     'Source'],
];

/* Black Friday bookings from /black-friday. Price and deposit are looked up
   server-side from the plan, so they are what the sale charges, never what a
   browser sent. "Ref code" is this person's own referral code; "Referred by"
   is who sent them — match the two to see who is owed a reward. Add a field
   here AND to BF_FIELDS in lib/blackfriday.ts, or it is dropped. */
var BF_TAB = 'Black Friday bookings';
var BF_COLUMNS = [
  ['receivedAt', 'Received'],
  ['business',   'Business'],
  ['name',       'Contact'],
  ['phone',      'Phone'],
  ['email',      'Email'],
  ['plan',       'Plan'],
  ['price',      'Price'],
  ['deposit',    'Deposit due'],
  ['early',      'Early bird'],
  ['member',     'Member'],
  ['bonuses',    'Bonuses promised'],
  ['holdUntil',  'Hold until'],
  ['website',    'Current site'],
  ['referredBy', 'Referred by'],
  ['refCode',    'Ref code'],
  ['notes',      'Notes'],
  ['source',     'Source'],
  /* added after launch — kept LAST so earlier columns never shift */
  ['fileCount',  'Files'],
  ['files',      'File links'],
];

/* Referrals. Every enquiry or booking that arrived on someone's referral link
   lands here as well as in its own tab, so who is owed a reward is one list,
   not a cross-reference. "Referrer code" matches the referrer's "Ref code" in
   the Black Friday bookings tab. The two tick boxes are yours to tick: the
   reward is owed once the friend's deposit is paid. */
var REFERRAL_TAB = 'Referrals';
var REFERRAL_COLUMNS = [
  ['receivedAt',   'Received'],
  ['referredBy',   'Referred by'],
  ['referrerCode', 'Referrer code'],
  ['name',         'Friend'],
  ['business',     'Business'],
  ['phone',        'Phone'],
  ['email',        'Email'],
  ['via',          'Came in via'],
  ['depositPaid',  'Deposit paid'],
  ['rewardPaid',   'Reward paid'],
];

function logReferral(data, via) {
  if (!data.referredBy) return;
  try {
    var sheet = tabFor(REFERRAL_TAB, REFERRAL_COLUMNS);
    var row = {
      receivedAt: data.receivedAt,
      referredBy: data.referredBy,
      referrerCode: String(data.referredBy).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: data.name,
      business: data.business,
      phone: data.phone,
      email: data.email,
      via: via,
      depositPaid: false,
      rewardPaid: false,
    };
    sheet.appendRow(REFERRAL_COLUMNS.map(function (c) { return row[c[0]] === undefined ? '' : row[c[0]]; }));
    var last = sheet.getLastRow();
    sheet.getRange(last, REFERRAL_COLUMNS.length - 1, 1, 2).insertCheckboxes();
  } catch (refErr) {
    /* the enquiry or booking is already saved; a referral log failure must not undo it */
    console.error('referral log failed: ' + refErr);
  }
}

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
    if (data.form === 'audit') return handleAudit(data);
    if (data.form === 'blackfriday') return handleBlackFriday(data);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    /* First run on an empty sheet: lay down a header row and freeze it. */
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(function (c) { return c[1]; }));
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(COLUMNS.map(function (c) { return data[c[0]] || ''; }));
    logReferral(data, 'Website enquiry');

    /* Notify. Wrapped separately so a mail failure never costs you the row —
       the record in the sheet is the thing that must not be lost. */
    try {
      MailApp.sendEmail({
        to: NOTIFY,
        subject: 'New enquiry — ' + (data.business || data.name || 'website')
          + (data.referredBy ? ' (referred by ' + data.referredBy + ')' : ''),
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
      /* the commission answer leads the subject: a "No" is not worth a call */
      subject: 'Applicant — ' + (data.name || 'unnamed')
        + ' (' + (data.commission === 'No' ? 'NOT open to commission' : 'open to commission')
        + ', ' + (data.phoneExp || '?') + ' on phones)',
      replyTo: data.email || NOTIFY,
      body: [
        (data.name || '—'),
        (data.phone || '—') + (data.email ? '  ·  ' + data.email : ''),
        (data.city ? data.city : ''),
        '',
        'PHONE EXPERIENCE:  ' + (data.phoneExp || '—'),
        'REAL ESTATE:       ' + (data.reExp || '—'),
        'USUALLY FREE:      ' + (data.hours || '—'),
        'OPEN TO COMMISSION:' + ' ' + (data.commission || '—'),
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

function handleAudit(data) {
  var sheet = tabFor(AUDIT_TAB, AUDIT_COLUMNS);
  sheet.appendRow(AUDIT_COLUMNS.map(function (c) { return data[c[0]] || ''; }));

  try {
    MailApp.sendEmail({
      to: NOTIFY,
      /* the subject carries what decides who to call first: how soon they'd act
         and how big they are */
      subject: 'Growth audit — ' + (data.business || 'unnamed')
        + ' (' + (data.timing || '?') + ', ' + (data.revenue || '?') + '/mo)',
      replyTo: data.email || NOTIFY,
      body: [
        (data.business || '—') + '  ·  ' + (data.name || '—'),
        (data.phone || '—') + (data.email ? '  ·  ' + data.email : ''),
        (data.website || 'no website'),
        '',
        'POINTS AT:        ' + (data.pointsAt || '—'),
        'WOULD ACT:        ' + (data.timing || '—'),
        '',
        'INDUSTRY:         ' + (data.industry || '—'),
        'REVENUE / MONTH:  ' + (data.revenue || '—'),
        'TEAM:             ' + (data.team || '—'),
        'LEAD SOURCES:     ' + (data.sources || '—'),
        'LEADS / MONTH:    ' + (data.volume || '—'),
        'AD SPEND / MONTH: ' + (data.adspend || '—'),
        'RESPONSE TIME:    ' + (data.response || '—'),
        'TOOLS:            ' + (data.tools || '—'),
        'ADMIN HRS / WEEK: ' + (data.admin || '—'),
        'BOTTLENECKS:      ' + (data.bottleneck || '—'),
        '12-MONTH GOAL:    ' + (data.goal || '—'),
        '',
        (data.fix ? 'FIX ONE THING: ' + data.fix : ''),
        '',
        '— ' + (data.source || 'direct') + ' · ' + (data.receivedAt || ''),
      ].join('\n'),
    });
  } catch (mailErr) {
    console.error('audit row saved, notification failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleBlackFriday(data) {
  var sheet = tabFor(BF_TAB, BF_COLUMNS);
  /* rewrite the header every time: cheap, and it labels columns added after
     the tab was first created (Files, File links) */
  sheet.getRange(1, 1, 1, BF_COLUMNS.length).setValues([BF_COLUMNS.map(function (c) { return c[1]; })]).setFontWeight('bold');
  sheet.appendRow(BF_COLUMNS.map(function (c) { return data[c[0]] || ''; }));
  logReferral(data, 'Black Friday booking — ' + (data.plan || '') + ' ' + (data.price || ''));

  try {
    MailApp.sendEmail({
      to: NOTIFY,
      /* a booking is a 48-hour clock: the subject says send the deposit link now */
      subject: 'BLACK FRIDAY BOOKING — ' + (data.business || 'unnamed') + ' — '
        + (data.plan || '?') + ' ' + (data.price || '') + ' — send ' + (data.deposit || '') + ' deposit link',
      replyTo: data.email || NOTIFY,
      body: [
        (data.business || '—') + '  ·  ' + (data.name || '—'),
        (data.phone || '—') + (data.email ? '  ·  ' + data.email : ''),
        (data.website || 'no website given'),
        '',
        'PLAN:         ' + (data.plan || '—'),
        'PRICE:        ' + (data.price || '—'),
        'DEPOSIT DUE:  ' + (data.deposit || '—'),
        'EARLY BIRD:   ' + (data.early || 'No'),
        'MEMBER:       ' + (data.member || '—'),
        'HOLD UNTIL:   ' + (data.holdUntil || '—'),
        'BONUSES:      ' + (data.bonuses ? '\n  ' + data.bonuses.split('\n').join('\n  ') : '—'),
        'REFERRED BY:  ' + (data.referredBy || '—'),
        '',
        (data.notes ? 'NOTES: ' + data.notes : ''),
        (data.files ? '\nFILES (' + data.fileCount + '):\n' + data.files + '\n' : ''),
        '',
        'Spot is held until ' + (data.holdUntil || '48 hours') + '. Text the deposit link today.',
        '— ' + (data.source || 'direct') + ' · ' + (data.receivedAt || ''),
      ].join('\n'),
    });
  } catch (mailErr) {
    console.error('black friday row saved, notification failed: ' + mailErr);
  }

  /* The booker's copy — their price, deposit, deadline and every bonus they
     were promised, in writing. Sent from this account, so a reply comes
     straight back to you. */
  try {
    if (data.email) {
      var first = String(data.name || '').split(' ')[0] || 'there';
      MailApp.sendEmail({
        to: data.email,
        name: 'BOLD Growth Labs',
        replyTo: NOTIFY,
        subject: 'Your Black Friday booking — ' + (data.plan || 'website') + ' at ' + (data.price || ''),
        body: [
          'Hi ' + first + ',',
          '',
          'Thanks for booking with BOLD Growth Labs. Here is everything we agreed, in writing.',
          '',
          'BUSINESS:      ' + (data.business || ''),
          'BUILD:         ' + (data.plan || ''),
          'PRICE:         ' + (data.price || '') + ' (Black Friday pricing)',
          'DEPOSIT:       ' + (data.deposit || '') + ' (' + (data.depositPct || '') + '), balance due at launch',
          'PRICE HELD UNTIL: ' + (data.holdUntil || '48 hours from booking'),
          (data.member ? 'MEMBER PRICING: ' + data.member : ''),
          (data.fileCount ? 'FILES RECEIVED: ' + data.fileCount : ''),
          '',
          'INCLUDED AT NO EXTRA COST:',
          (data.bonuses ? '  - ' + data.bonuses.split('\n').join('\n  - ') : '  - (none)'),
          '',
          (data.depositUrl
            ? 'Pay your deposit here to lock it in: ' + data.depositUrl
            : 'We will text you a deposit link shortly. Your price and everything above are locked once the deposit is paid before the hold ends.'),
          '',
          'Know a business owner who needs a better website? Send them your link. They get ' + (data.refGive || '$100') + ' off our regular pricing, and you get ' + (data.refGet || '$100') + ' once their deposit clears:',
          (data.refLink || ''),
          (data.refTiers
            ? '\nAs a BTC member you also earn free services as your referrals book (they add up):\n  - '
              + data.refTiers.split('\n').join('\n  - ')
            : ''),
          '',
          'Questions? Just reply to this email or call 858.315.7718.',
          '',
          '— BOLD Growth Labs',
        ].join('\n'),
      });
    }
  } catch (confirmErr) {
    console.error('black friday confirmation to booker failed: ' + confirmErr);
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
