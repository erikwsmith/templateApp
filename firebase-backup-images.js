var https = require('https'),fs = require('fs');

/* Set FIREBASE_URL and FIREBASE_SECRET */
var FIREBASE_URL = 'https://mtsinspect-2pe.firebaseio.com/';
var FIREBASE_SECRET = 'NithtbbxYuPKNnEDOgoTUNQuKoMCMO9v2GCaKjlE';
// var FIREBASE_URL = 'https://mtsinspect-2pe-dev.firebaseio.com/';
// var FIREBASE_SECRET = 'UToymrCWsqVlLsO5Pbeio1zbYwsd16i5dK2Bwl9l';

function fetchData(key){

	var url = FIREBASE_URL+key+'/.json?format=export&auth='+FIREBASE_SECRET;

	var scoreReq = https.get(url, function (response) {
		var completeResponse = '';
		response.on('data', function (chunk) {
			completeResponse += chunk;
		});
		response.on('end', function() {
			backup(key, completeResponse);
		})
	}).on('error', function (e) {
		console.log('[ERROR] '+new Date()+' problem with request: ' + e.message);
	});

}

function backup(key, data) {
	var filename = getFileName(key);
	writeToFile(filename,data);
}

function getFileName(key){
        return __dirname+'/backup/'+key+'.json';
}

function writeToFile(filename,data){
	fs.writeFile(filename, data, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("[SUCCESS] "+new Date()+" JSON saved to " + filename);
		}
	});
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

	var url = FIREBASE_URL+'/images/.json?shallow=true&auth='+FIREBASE_SECRET;

	var scoreReq = https.get(url, function (response) {
		var completeResponse = '';
		var filename = '';
		response.on('data', function (chunk) {
			completeResponse += chunk;
		});
		response.on('end', function() {
			var images = JSON.parse(completeResponse);
			var getImages=[];
			for (var key in images) {
		    if (images.hasOwnProperty(key)) {
		    	filename = getFileName('images/'+key);
		   //  	fs.access(filename, fs.F_OK, function(err, filename) {
					//     if (!err) {
					//         console.log('IGNORE ' + err);
					//     } else {
					//         console.log('GET ==============' + err);
					//     }
					// });

					try {
					    fs.accessSync(filename, fs.F_OK);
					    //console.log('IGNORE ' + key);
					} catch (e) {
					    getImages.push(key);
					}

		      //fetchData('images/'+key);
		    }
			}

			for (var imgKey in getImages) {
				console.log('GET ' + getImages[imgKey]);
				fetchData('images/' + getImages[imgKey]);
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