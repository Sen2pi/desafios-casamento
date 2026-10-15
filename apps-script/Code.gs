var PARENT_FOLDER_ID = '1EYrNLbzeEL0ju429FrIHcPTy9OD6cmH4';

var CHALLENGE_IDS = [
  'refrao', 'infiltrado', 'brinde', 'coreografia',
  'abraco', 'cima', 'oculos', 'danca-lenta', 'beijo', 'cumplice',
  'noivos', 'modelo', 'brinde-mesa', 'sapato', 'espontanea'
];

function doGet(e) {
  var action = e.parameter.action;
  var result;

  try {
    if (action === 'progress') {
      result = getProgress();
    } else if (action === 'gallery') {
      var challengeId = e.parameter.challengeId;
      result = getGallery(challengeId);
    } else {
      result = { error: 'Acao desconhecida. Use ?action=progress ou ?action=gallery&challengeId=ID' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return jsonResponse(result);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var challengeId = data.challengeId;
    var imageData = data.image;

    if (!challengeId || !imageData) {
      return jsonResponse({ success: false, error: 'Parametros em falta (challengeId, image)' });
    }

    if (CHALLENGE_IDS.indexOf(challengeId) === -1) {
      return jsonResponse({ success: false, error: 'Desafio invalido: ' + challengeId });
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
    var file = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var count = countFiles(folder);

    return jsonResponse({
      success: true,
      count: count,
      file: {
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl()
      }
    });
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

function getGallery(challengeId) {
  if (!challengeId || CHALLENGE_IDS.indexOf(challengeId) === -1) {
    return { error: 'Desafio invalido' };
  }

  var parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  var folders = parent.getFoldersByName(challengeId);
  if (!folders.hasNext()) {
    return { challengeId: challengeId, files: [] };
  }

  var folder = folders.next();
  var files = folder.getFiles();
  var list = [];

  while (files.hasNext()) {
    var file = files.next();
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}

    list.push({
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl(),
      thumbnail: 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w400',
      date: file.getDateCreated().toISOString()
    });
  }

  list.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  return { challengeId: challengeId, files: list };
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
