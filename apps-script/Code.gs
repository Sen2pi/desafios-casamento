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
    } else if (action === 'setup') {
      result = setupFolders();
    } else {
      result = { error: 'Acoes disponiveis: progress, gallery, setup' };
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

    var folder = getOrCreateFolder(challengeId);

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
      folderUrl: folder.getUrl(),
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

function getOrCreateFolder(challengeId) {
  var parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  var folders = parent.getFoldersByName(challengeId);
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = parent.createFolder(challengeId);
  }
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return folder;
}

function setupFolders() {
  var created = [];
  for (var i = 0; i < CHALLENGE_IDS.length; i++) {
    var id = CHALLENGE_IDS[i];
    var folder = getOrCreateFolder(id);
    created.push({ id: id, url: folder.getUrl() });
  }
  return { success: true, folders: created };
}

function getProgress() {
  var result = {};
  for (var i = 0; i < CHALLENGE_IDS.length; i++) {
    var id = CHALLENGE_IDS[i];
    var folder = getOrCreateFolder(id);
    result[id] = countFiles(folder);
  }
  return result;
}

function getGallery(challengeId) {
  if (!challengeId || CHALLENGE_IDS.indexOf(challengeId) === -1) {
    return { error: 'Desafio invalido' };
  }

  var folder = getOrCreateFolder(challengeId);
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

  return { challengeId: challengeId, folderUrl: folder.getUrl(), files: list };
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
