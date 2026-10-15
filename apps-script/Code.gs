var PARENT_FOLDER_ID = '1EYrNLbzeEL0ju429FrIHcPTy9OD6cmH4';

var CHALLENGE_IDS = [
  'refrao', 'infiltrado', 'brinde', 'coreografia',
  'abraco', 'cima', 'oculos', 'danca-lenta', 'beijo', 'cumplice',
  'noivos', 'modelo', 'brinde-mesa', 'sapato', 'espontanea'
];

function doGet(e) {
  var action = e.parameter.action;
  var result;

  if (action === 'progress') {
    result = getProgress();
  } else {
    result = { error: 'Acao desconhecida. Use ?action=progress' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var challengeId = data.challengeId;
    var imageData = data.image;

    if (!challengeId || !imageData) {
      return jsonResponse({ success: false, error: 'Parametros em falta' });
    }

    if (CHALLENGE_IDS.indexOf(challengeId) === -1) {
      return jsonResponse({ success: false, error: 'Desafio invalido' });
    }

    var parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
    var folders = parent.getFoldersByName(challengeId);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = parent.createFolder(challengeId);
    }

    var base64 = imageData;
    if (base64.indexOf(',') !== -1) {
      base64 = base64.split(',')[1];
    }

    var bytes = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(bytes, 'image/jpeg', 'foto_' + Date.now() + '.jpg');
    folder.createFile(blob);

    var count = countFiles(folder);

    return jsonResponse({ success: true, count: count });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function getProgress() {
  var parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  var result = {};

  for (var i = 0; i < CHALLENGE_IDS.length; i++) {
    var id = CHALLENGE_IDS[i];
    var folders = parent.getFoldersByName(id);
    var count = 0;
    if (folders.hasNext()) {
      count = countFiles(folders.next());
    }
    result[id] = count;
  }

  return result;
}

function countFiles(folder) {
  var files = folder.getFiles();
  var count = 0;
  while (files.hasNext()) {
    files.next();
    count++;
  }
  return count;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
