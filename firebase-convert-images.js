var https = require('https'),fs = require('fs'),firebase = require('firebase');

/* Set FIREBASE_URL and FIREBASE_SECRET */
// var FIREBASE_URL = 'https://mtsinspect-2pe.firebaseio.com/';
// var FIREBASE_SECRET = 'NithtbbxYuPKNnEDOgoTUNQuKoMCMO9v2GCaKjlE';

//PROD
var FIREBASE_URL = 'https://mtsinspect-2pe.firebaseio.com/';
var FIREBASE_SECRET = 'NithtbbxYuPKNnEDOgoTUNQuKoMCMO9v2GCaKjlE';
var FIREBASE_BUCKET = 'mtsinspect-2pe.appspot.com';
var FIREBASE_PROJECTID = 'mtsinspect-2pe';
var FIREBASE_KEYFILENAME = 'MTSINSPECT-2pe-a40e6a6c213c.json';
var FIREBASE_PROJVIEWERSGROUP = 'project-viewers-573971981122';
var FIREBASE_PROJEDITORSGROUP = 'project-editors-573971981122';
var FIREBASE_PROJOWNERSGROUP = 'project-owners-573971981122';

// DEV
// var FIREBASE_URL = 'https://mtsinspect-2pe-dev.firebaseio.com/';
// var FIREBASE_SECRET = 'UToymrCWsqVlLsO5Pbeio1zbYwsd16i5dK2Bwl9l';
// var FIREBASE_BUCKET = 'mtsinspect-2pe-dev.appspot.com';
// var FIREBASE_PROJECTID = 'mtsinspect-2pe-dev';
// var FIREBASE_KEYFILENAME = 'mtsinspect-2pe-dev-19b805a84bfe.json';
// var FIREBASE_PROJVIEWERSGROUP = 'project-viewers-657556226052';
// var FIREBASE_PROJEDITORSGROUP = 'project-editors-657556226052';
// var FIREBASE_PROJOWNERSGROUP = 'project-owners-657556226052';

// var config = {
//   apiKey: "AIzaSyCVzPaDTUplS4JepK2mMjeWAXh_AM5P7VQ",
//   authDomain: "mtsinspect-2pe-dev.firebaseapp.com",
//   databaseURL: "https://mtsinspect-2pe-dev.firebaseio.com",
//   storageBucket: "mtsinspect-2pe-dev.appspot.com",
// };

// firebase.initializeApp(config);

// var storage = firebase.storage();
// var storageRef = storage.ref();

var gcloud = require('gcloud')({
  projectId: FIREBASE_PROJECTID,
  // Specify a path to a keyfile.
  keyFilename: FIREBASE_KEYFILENAME
});

// NODE RATE LIMITER
// var RateLimiter = require('limiter').RateLimiter;
// Allow 150 requests per hour (the Twitter search limit). Also understands
// 'second', 'minute', 'day', or a number of milliseconds
// var limiter = new RateLimiter(4, 'minute');

var gcs = gcloud.storage();

var backups = gcs.bucket(FIREBASE_BUCKET);



var limit = require("simple-rate-limiter");
var callApi = limit(function(key) {
		console.log('REQUEST:', key.name);
    fetchData(key);
}).to(4).per(15000);

function fetchData(key){

	var url = FIREBASE_URL+'images/'+key.imageid+'.json?format=export&auth='+FIREBASE_SECRET;

	var scoreReq = https.get(url, function (response) {
		var completeResponse = '';
		response.on('data', function (chunk) {
			completeResponse += chunk;
		});
		response.on('end', function() {
			var imageJSON = JSON.parse(completeResponse);

			if (typeof(imageJSON.thumbnails) !== 'undefined' && typeof(imageJSON.thumbnails.w600xh600) !== 'undefined' && typeof(imageJSON.thumbnails.w600xh600.base64) !== 'undefined') {
				key.imagepath = '/';
				key.filename = key.name;
				backupFS(key, imageJSON.thumbnails.w600xh600.base64);
			}
			if (typeof(imageJSON.thumbnails) !== 'undefined' && typeof(imageJSON.thumbnails.w600xh600) !== 'undefined' && typeof(imageJSON.thumbnails.w600xh600.base64) !== 'undefined') {
				key.imagepath = '/thumbnails/';
				key.filename = 'w600xh600.png';
				backupFS(key, imageJSON.thumbnails.w600xh600.base64);
			}
			if (typeof(imageJSON.thumbnails) !== 'undefined' && typeof(imageJSON.thumbnails.w200xh200) !== 'undefined' && typeof(imageJSON.thumbnails.w200xh200.base64) !== 'undefined') {
				key.imagepath = '/thumbnails/';
				key.filename = 'w200xh200.png';
				backupFS(key, imageJSON.thumbnails.w200xh200.base64);
			}


		})
	}).on('error', function (e) {
		console.log('[ERROR] '+new Date()+' problem with request: ' + e.message);
	});

}


function backupFS(key, data) {
	var filename = 'workspace_2/images/'+key.weldid+'/'+key.imageid+key.imagepath+key.filename;
	writeImageToFileFS(filename,data);
}

function writeImageToFileFS(fileName, base64Data){

  try
  {
      var imageTypeRegularExpression      = /\/(.*?)$/;
      var imageBuffer                      = decodeBase64Image(base64Data);
      var imageTypeDetected                = imageBuffer
                                              .type
                                               .match(imageTypeRegularExpression);
      var userUploadedImagePath            = fileName +
                                             '.' +
                                             imageTypeDetected[1];

			var file = backups.file(fileName); // +'.' +imageTypeDetected[1]
			file.acl.add({
			  entity: FIREBASE_PROJVIEWERSGROUP,
			  role: gcs.acl.READER_ROLE
			}, function(err, aclObject) {});
			file.acl.add({
			  entity: FIREBASE_PROJEDITORSGROUP,
			  role: gcs.acl.OWNER_ROLE
			}, function(err, aclObject) {});
			file.acl.add({
			  entity: FIREBASE_PROJOWNERSGROUP,
			  role: gcs.acl.OWNER_ROLE
			}, function(err, aclObject) {});

			file.save(imageBuffer.data, function(err) {
			  if (!err) {
			    console.log('SUCCESS:', fileName);
			  } else {
			  	console.log('ERROR:', err);
			  }
			});


  }
  catch(error)
  {
      console.log('ERROR:', error);
  }

}

// Decoding base-64 image
// Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
function decodeBase64Image(dataString)
{
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var response = {};

  if (matches.length !== 3)
  {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

function init() {
	// var myFirebaseRef = new Firebase(FIREBASE_URL);
	// myFirebaseRef.child("images").once("value", function(snapshot) {
	// 	 snapshot.forEach(function(childSnapshot) {
	//     var key = childSnapshot.key();
	//     var childData = childSnapshot.val();

	//     console.log(key);

	//     //fetchData('images/'+key);
	//   });
	// });

	 // Initialize Firebase


	var url = FIREBASE_URL+'workspace_2/images/.json?auth='+FIREBASE_SECRET;

	var scoreReq = https.get(url, function (response) {
		var completeResponse = '';
		var filename = '';
		response.on('data', function (chunk) {
			completeResponse += chunk;
		});
		response.on('end', function() {
			var images = JSON.parse(completeResponse);
			var getImages=[];
			var imageid, weld;
			for (var weldid in images) {
		    if (images.hasOwnProperty(weldid)) {
		    	weld = images[weldid];

					for (imageid in weld) {
				    if (weld.hasOwnProperty(imageid)) {

				    	getImages.push({weldid:weldid, imageid:imageid, name: weld[imageid].name});

				   		//  	filename = getFileName('images/'+weldid+'/'+imageid+'/image.png');
							// try {
							//     fs.accessSync(filename, fs.F_OK);
							// } catch (e) {
							    // getImages.push({weldid:weldid, imageid:imageid});
							// }

				    }
				  }

		    }
			}

			for (var imgKey in getImages) {
				console.log('GET ' + getImages[imgKey].imageid);
				var imgObj = getImages[imgKey];
				callApi(imgObj);
				// limiter.removeTokens(1, function() {
				// 	console.log('REQUEST:', imgObj.name);
				//   fetchData(imgObj);
				// });

			}


		})
	}).on('error', function (e) {
		console.log('[ERROR] '+new Date()+' problem with request: ' + e.message);
	});


	//fetchData();
	//  1800000  - 30 min
	// 86400000  - 1 day
	// 14400000	 - 4 hours
	//setInterval(fetchData, 1800000);
}

init();