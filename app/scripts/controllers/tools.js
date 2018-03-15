'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */

angular.module('mts.fieldbook')
  .controller('WeldsCrossCheckCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, WORKSPACE, localStorageService) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10



      $scope.local = {};
      $scope.local.welds = (localStorageService.get('weldsCheck')) ? localStorageService.get('weldsCheck') : [];
      $scope.local.complete = false;
      $scope.local.weldsloaded = false;

      var weldsRefFiltered =  Ref.child(WORKSPACE).child('welds').orderByChild('weldno');
      var welds = $firebaseArray(weldsRefFiltered);
      // welds.$loaded().then(function(){
      //
      //   $scope.local.weldsloaded = true;
      // });


      // $scope.temperatures = $firebaseArray(Ref.child(WORKSPACE).child('verifications/temperatures'));
      // // display any errors
      // $scope.temperatures.$loaded().catch(alert);

      $scope.orderByField = 'weldno';
      $scope.reverseSort = true;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.readReport = function (workbook) {
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];

        $scope.local.welds = [];

        var weldno, weldid, welddate, station, inspected;
        for (var i=14; i<900; i++) {
          // IN BOUND
          weldno = '';
          welddate = '';
          station = '';
          weldid = '';
          if (typeof(worksheet['I' + i]) !== 'undefined') {
            weldno = worksheet['I' + i].v;
          }
          if (typeof(worksheet['N' + i]) !== 'undefined') {
            welddate = worksheet['N' + i].v;
            if (welddate !== '' && !isNaN(welddate)) {
              welddate = moment((parseInt(welddate) - (25567 + 1))*86400*1000).format('L');
            }
          }
          if (typeof(worksheet['G' + i]) !== 'undefined') {
            station = worksheet['G' + i].v;
          }

          if (weldno !== '' && weldno !== '!') {
            inspected = false;
            angular.forEach(welds, function(weld){
              if (weld.weldno === weldno) {
                weldid = weld.$id;
                inspected = true;
                return;
              }
            });



            $scope.local.welds.push({
              'welddate' : welddate,
              'station' : station,
              'weldno' : weldno,
              'weldid' : weldid,
              'inspected' : inspected
            });
          }

        }

        $timeout(function(){
          $scope.local.complete = true;
        }, 300);


        localStorageService.set('weldsCheck', $scope.local.welds);

      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }


      $scope.authorizedOr = function(roles){
        var isAuthorised = false;
        if ($rootScope.user && $rootScope.user.roles) {
          for (var i=0; i < roles.length; i++){
            if ($rootScope.user.roles.split(',').indexOf(roles[i]) !== -1) {
              isAuthorised = true;
            }
          }
        }
        return isAuthorised;
      }

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }
  })
  .controller('MasterLineListCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10
var mtsLogo = 'data:image/png;base64,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'
      var allActiveTracts = [];

      var tractsRefFiltered =  Ref.child('tracts').orderByChild('sequence');
      var tracts = Ref.child('tracts').orderByChild('sequence');

      //get property tracts
          var propertiesobj = $firebaseArray(Ref.child('tracts'));
          propertiesobj.$loaded()
            .catch(alert)
            .then(function() {
              propertiesobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};
                  });
                });

      //get civil permits
          var civilpermitsobj = $firebaseArray(Ref.child('civilpermits'));
          civilpermitsobj.$loaded()
            .catch(alert)
            .then(function() {
              civilpermitsobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};
                  });
                });

      //get environmental permits
        var utilitypermitsobj = $firebaseArray(Ref.child('utilitypermits'));
        utilitypermitsobj.$loaded()
          .catch(alert)
          .then(function() {
            utilitypermitsobj.forEach(function(i){
            if (i.inactive!==true){
            allActiveTracts.push(i)};
                            });
                          });

      //get environmental permits
          var environmentalpermitsobj = $firebaseArray(Ref.child('environmentalpermits'));
          environmentalpermitsobj.$loaded()
            .catch(alert)
            .then(function() {
              environmentalpermitsobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};
                  });
                });


      $scope.tracts = allActiveTracts;

      $scope.currentPage = 0;
      $scope.pageSize = 100;
      $scope.numberOfPages=function(){
           return Math.ceil($scope.tracts.length/$scope.pageSize);
       };


      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }

      // $scope.exportData = function() {
      //   var mystyle = {
      //     sheetid: 'Line List Export',
      //     headers: true,
      //     caption: {
      //       title:'Line List Export',
      //       style:'font-size: 20px; color:blue;'
      //     },
      //     columns: [
      //       {columnid:'sequence', title: 'Order', width:100},
      //       {columnid:'tract', title: 'Tract Number', width:200},
      //       {columnid:'type', title: 'Type', width:600},
      //       {columnid:'parcelid', title: 'Parcel ID', width:200},
      //       {columnid:'owner', title: 'Owner', width:100},
      //       {columnid:'rowagent', title: 'ROW Agent', width:100},
      //       {columnid:'titlecomplete', title: 'Title Complete', width:100},
      //       {columnid:'surveypermission', title: 'Survey Granted', width:100},
      //       {columnid:'surveydenied', title: 'Survey Denied', width:100},
      //       {columnid:'acquireddate', title: 'Acquired', width:100},
      //       {columnid:'section', title: 'SEC', width:100},
      //       {columnid:'township', title: 'TWP', width:100},
      //       {columnid:'range', title: 'RNG', width:100},
      //       {columnid:'county', title: 'County', width:100},
      //       {columnid:'acres', title: 'Acres', width:100},
      //       {columnid:'permitagent', title: 'Permit Agent', width:100},
      //       {columnid:'permitsubmitted', title: 'Submitted', width:100},
      //       {columnid:'permitapproved', title: 'Approved', width:100},
      //       {columnid:'permitexpires', title: 'Expires', width:100}
      //
      //       ]
      //   };
      //
      //   var data = $filter('orderBy')($scope.tracts, $scope.orderByField, $scope.reverseSort);
      //   alasql('SELECT sequence as [Order], tract as [Tract Number], type as [Type], parcelid as [Parcel ID], owner as [Owner], rowagent as [ROW Agent], titlecomplete as [Title Complete], surveypermission as [Survey Granted], surveydenied as [Survey Denied], acquireddate as [Acquired],section as [SEC], township as [TWP], range as [RNG], county as [County], acres as [Acres], permitagent as [Permit Agent], permitsubmitted as [Submitted], permitapproved as [Approved], permitexpires as [Expires]'
      //      +  'INTO XLSX("ProjectLineList.xlsx",?) FROM ?',[mystyle,data]);
      //    }

function formatTractList(){
  		var printableRisks = [];
      var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Type', style: 'tableHeader'}, {text: 'Parcel ID', style: 'tableHeader'},{text: 'Owner', style: 'tableHeader'},{text: 'ROW Agent', style: 'tableHeader'},{text: 'Title Complete', style: 'tableHeader'},{text: 'Survey Granted', style: 'tableHeader'},{text: 'Survey Denied', style: 'tableHeader'},{text: 'Acquired', style: 'tableHeader'},{text: 'County', style: 'tableHeader'},{text: 'Acres', style: 'tableHeader'},{text: 'Permit Agent', style: 'tableHeader'},{text: 'Submitted', style: 'tableHeader'},{text: 'Approved', style: 'tableHeader'}]];
      var printArray = [];

      var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('sequence'));
      tractsObj.$loaded()
        .catch(alert)
        .then(function() {
          tractsObj.forEach(function(i){
            if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
            if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
            if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
            if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
            if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
            if(i.rowagent === null || typeof(i.rowagent)==='undefined'){i.rowagent = ''};
            if(i.acquireddate !== null && typeof(i.acquireddate)!=='undefined'&&i.acquireddate!==''){var acquired = i.acquireddate}else{acquired = ''};
            if(i.titlecomplete === null || typeof(i.titlecomplete)==='undefined'){i.titlecomplete = ''};
            if(i.surveypermission === null || typeof(i.surveypermission)==='undefined'){i.surveypermission = ''};
            if(i.surveydenied === null || typeof(i.surveydenied)==='undefined'){i.surveydenied = ''};
            // if(i.section === null || typeof(i.section)==='undefined'){i.section = ''};
            // if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
            // if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
            if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
            if(i.acres === null || typeof(i.acres)==='undefined'){i.acres = ''};
            if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
            if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
            if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
            if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};

            if (i.inactive!==true){

            exampletable
            .push([i.sequence, i.tract, i.type, i.parcelid, i.owner, i.rowagent, i.titlecomplete, i.surveypermission, i.surveydenied, acquired, i.county, i.acres, "","",""]);
              };
            });

              });
              var utilityObj = $firebaseArray(Ref.child('utilitypermits').orderByChild('sequence'));
              utilityObj.$loaded()
                .catch(alert)
                .then(function() {
                  utilityObj.forEach(function(i){
                    if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
                    if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
                    if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
                    if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
                    if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
                    if(i.rowagent === null || typeof(i.rowagent)==='undefined'){i.rowagent = ''};
                    if(i.titlecomplete === null || typeof(i.titlecomplete)==='undefined'){i.titlecomplete = ''};
                    if(i.surveypermission === null || typeof(i.surveypermission)==='undefined'){i.surveypermission = ''};
                    if(i.surveydenied === null || typeof(i.surveydenied)==='undefined'){i.surveydenied = ''};
                    if(i.acquireddate !== null && typeof(i.acquireddate)!=='undefined'&&i.acquireddate!==''){var acquired = i.acquireddate}else{acquired = ''};

                    // if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
                    // if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
                    if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
                    if(i.acres === null || typeof(i.acres)==='undefined'){i.acres = ''};
                    if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
                    if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
                    if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
                    if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};
                    if (i.inactive!==true){

                    exampletable.push([i.sequence,i.tract,i.type,i.parcelid,i.owner,"","","","","",i.county,"",i.permitagent, i.permitsubmitted, i.permitapproved]);
                  };
                });
                exampletable.sort(function(a,b){return a[0]-b[0]})

  });
  var environmentalObj = $firebaseArray(Ref.child('environmentalpermits').orderByChild('sequence'));
  environmentalObj.$loaded()
    .catch(alert)
    .then(function() {
      environmentalObj.forEach(function(i){
        if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
        if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
        if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
        if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
        if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
        if(i.rowagent === null || typeof(i.rowagent)==='undefined'){i.rowagent = ''};
        if(i.titlecomplete === null || typeof(i.titlecomplete)==='undefined'){i.titlecomplete = ''};
        if(i.surveypermission === null || typeof(i.surveypermission)==='undefined'){i.surveypermission = ''};
        if(i.surveydenied === null || typeof(i.surveydenied)==='undefined'){i.surveydenied = ''};
        if(i.acquireddate !== null && typeof(i.acquireddate)!=='undefined'&&i.acquireddate!==''){var acquired = i.acquireddate}else{acquired = ''};
        // if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
        // if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
        if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
        if(i.acres === null || typeof(i.acres)==='undefined'){i.acres = ''};
        if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
        if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
        if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
        if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};
        if (i.inactive!==true){

        exampletable.push([i.sequence,i.tract,i.type,i.parcelid,i.owner,"","","","","",i.county,"",i.permitagent, i.permitsubmitted, i.permitapproved]);
      };
    });
    exampletable.sort(function(a,b){return a[0]-b[0]})

});
              var civilObj = $firebaseArray(Ref.child('civilpermits').orderByChild('sequence'));
              civilObj.$loaded()
                .catch(alert)
                .then(function() {
                  civilObj.forEach(function(i){
                    if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
                    if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
                    if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
                    if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
                    if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
                    if(i.rowagent === null || typeof(i.rowagent)==='undefined'){i.rowagent = ''};
                    if(i.titlecomplete === null || typeof(i.titlecomplete)==='undefined'){i.titlecomplete = ''};
                    if(i.surveypermission === null || typeof(i.surveypermission)==='undefined'){i.surveypermission = ''};
                    if(i.surveydenied === null || typeof(i.surveydenied)==='undefined'){i.surveydenied = ''};
                    // if(i.section === null || typeof(i.section)==='undefined'){i.section = ''};
                    // if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
                    // if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
                    if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
                    if(i.acres === null || typeof(i.acres)==='undefined'){i.acres = ''};
                    if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
                    if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
                    if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
                    if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};
                    if (i.inactive!==true){

                    exampletable.push([i.sequence,i.tract,i.type,i.parcelid,i.owner,"","","","","",i.county,"",i.permitagent, i.permitsubmitted, i.permitapproved]);

                  };

                });
                exampletable.sort(function(a,b){return a[0]-b[0]})

	});

  	  return exampletable;

  	};

    var example = formatTractList();

    $scope.example = formatTractList();

    $scope.exportData=(function() {
      var excelArray = example;
      excelArray.splice(0,1);
    var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FMasterLineList.xlsx?alt=media&token=90e07d01-cf39-4ad9-b337-6b3dc01ea57d";
    var req = new XMLHttpRequest();
    req.open("GET", file, true);
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200){
            XlsxPopulate.fromDataAsync(req.response)
                .then(function (workbook) {


    workbook.sheet(0).cell("A4").value(
      example

    );
    var dataRange = (3 + excelArray.length).toString();
    workbook.sheet(0).range("A3:O3").style("border","medium");
    workbook.sheet(0).range("A4:O"+dataRange).style("border",true);


    workbook.outputAsync()
        .then(function (blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // If IE, you must uses a different method.
                window.navigator.msSaveOrOpenBlob(blob, "Master Line List.xlsx");
            } else {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = "Master Line List.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        });
                });
        }
    };

    req.send();

              });
  //And then, in the docdefinition, I did this:
  var oo = {content: [example]};

var docDefinition = dd;

var currentdate =  new Date().toLocaleDateString();
var dd = {
  header: function(currentPage, pageCount) {
    if (currentPage !== 1){
      return {text:'States Edge - Master Line List' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
    }},
 footer: function(currentPage, pageCount) {
   return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
	content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

		{text: 'States Edge - Master Line List', style: 'header', alignment: 'center'},
		{table: {
                  widths: ['auto','auto','auto',50,'auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
									body: example,
                  headerRows: 1,
						},
  layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
    },
  },

	],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

	styles: {
		header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 20]
		},
		subheader: {
			fontSize: 16,
			bold: true,
			margin: [0, 10, 0, 5]
		},
		tableExample: {
			margin: [0, 5, 0, 15]
		},
		tableHeader: {
			bold: true,
			fontSize: 13,
			color: 'white',
      fillColor: 'blue',
      alignment: 'center'
		}
	},
	defaultStyle: {
		// alignment: 'justify'
	},
  images: {
    logo:mtsLogo
  }

}

$scope.printPDF = function(){
    pdfMake.createPdf(dd).download('Master Line List.pdf');
}


  })
  .controller('PropertiesReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10
var mtsLogo = 'data:image/png;base64,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'
      // $scope.local = {};
      // $scope.local.welds = (localStorageService.get('weldsCheck')) ? localStorageService.get('weldsCheck') : [];
      // $scope.local.complete = false;
      // $scope.local.weldsloaded = false;

      var allActiveTracts = [];

      var tractsRefFiltered =  Ref.child('tracts').orderByChild('sequence');
      var tracts = Ref.child('tracts').orderByChild('sequence');

      //get property tracts
          var propertiesobj = $firebaseArray(Ref.child('tracts'));
          propertiesobj.$loaded()
            .catch(alert)
            .then(function() {
              propertiesobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};
                  });
                });

      $scope.tracts = allActiveTracts;

      $scope.currentPage = 0;
      $scope.pageSize = 100;
      $scope.numberOfPages=function(){
     return Math.ceil($scope.tracts.length/$scope.pageSize);
 };


      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }

      // $scope.exportData = function() {
      //   var mystyle = {
      //     sheetid: 'Line List Export',
      //     headers: true,
      //     caption: {
      //       title:'Line List Export',
      //       style:'font-size: 20px; color:blue;'
      //     },
      //     columns: [
      //       {columnid:'sequence', title: 'Order No.', width:100},
      //       {columnid:'tract', title: 'Tract Number', width:200},
      //       {columnid:'type', title: 'Type', width:600},
      //       {columnid:'parcelid', title: 'Parcel ID', width:200},
      //       {columnid:'owner', title: 'Owner', width:100},
      //       {columnid:'rowagent', title: 'ROW Agent', width:100},
      //       {columnid:'titlecomplete', title: 'Title Complete', width:100},
      //       {columnid:'surveypermission', title: 'Survey Granted', width:100},
      //       {columnid:'surveydenied', title: 'Survey Denied', width:100},
      //       {columnid:'acquireddate', title: 'Survey Denied', width:100},
      //       {columnid:'section', title: 'SEC', width:100},
      //       {columnid:'township', title: 'TWP', width:100},
      //       {columnid:'range', title: 'RNG', width:100},
      //       {columnid:'county', title: 'County', width:100},
      //       {columnid:'acres', title: 'Acres', width:100},
      //
      //
      //       ]
      //   };
      //
      //   var data = $filter('orderBy')($scope.tracts, $scope.orderByField, $scope.reverseSort);
      //   alasql('SELECT sequence as [Order No.], tract as [Tract Number], type as [Type], parcelid as [Parcel ID], owner as [Owner], rowagent as [ROW Agent], titlecomplete as [Title Complete], surveypermission as [Survey Granted], surveydenied as [Survey Denied], acquireddate as [Acquired], section as [SEC], township as [TWP], range as [RNG], county as [County],acres as [Acres]'
      //      +  'INTO XLSX("PropertiesList.xlsx",?) FROM ?',[mystyle,data]);
      //    }


    //   $scope.authorizedOr = function(roles){
    //     var isAuthorised = false;
    //     if ($rootScope.user && $rootScope.user.roles) {
    //       for (var i=0; i < roles.length; i++){
    //         if ($rootScope.user.roles.split(',').indexOf(roles[i]) !== -1) {
    //           isAuthorised = true;
    //         }
    //       }
    //     }
    //     return isAuthorised;
    //   }
    //
    // function alert(msg) {
    //   $scope.err = msg;
    //   $timeout(function() {
    //     $scope.err = null;
    //   }, 5000);
    // }



//pdfMake code goes here

// var docDefinition = {
//    content: [
//      // if you don't need styles, you can use a simple string to define a paragraph
//      'This is a standard paragraph, using default style',
//
//      // using a { text: '...' } object lets you set styling properties
//      { text: 'This paragraph will have a bigger font', fontSize: 15 },
//
//      // if you set pass an array instead of a string, you'll be able
//      // to style any fragment individually
//      {
//        text: [
//          'This paragraph is defined as an array of elements to make it possible to ',
//          { text: 'restyle part of it and make it bigger ', fontSize: 15 },
//          'than the rest.'
//        ]
//      }
//    ]
//  };

var areaImpact = [
{
   "riskID":"f0bf6fa1-0a6b-e6e3-9ec08bd67751",
   "description":"Matt's printing testMatt's printing testMatt's printing test",
   "type":"Safety",
   "consequences":{
      "items":[
         "Matt's printing test",
         "Matt's printing again"
      ]
   },
   "safeguards":{
      "items":[
         "Matt's printing test",
         "Matt's printing test agin!!!"
      ]
   },
   "actions":{
      "items":[
         "Matt's awesome printing test"
      ]
   }
},
{
   "riskID":"ffd23fa1-0a6b-e6e3-9ec08bd67751",
   "description":"Here's another test",
   "type":"Safety",
   "consequences":{
      "items":[
         "Matt's printing test",
         "Matt's printing again"
      ]
   },
   "safeguards":{
      "items":[
         "Matt's printing test",
         "Matt's printing test agin!!!"
      ]
   },
   "actions":{
      "items":[
         "Matt's awesome printing test"
      ]
   }
}
]
// function formatRiskList(){
// 		var printableRisks = [];
//
// 		areaImpact.forEach(function(risk){
//
// 			printableRisks.push({text:'Description', style:'subheader'});
// 			printableRisks.push({text:risk.description});
// 			printableRisks.push({text:'Consequences', style:'subheader'});
// 			printableRisks.push({ul: risk.consequences.items});
// 			printableRisks.push({text:'Safegaurds', style:'subheader'});
// 			printableRisks.push({ul: risk.safeguards.items});
// 			printableRisks.push({text:'Actions', style:'subheader'});
// 			printableRisks.push({ul: risk.actions.items});
//
// 		});
//
// 	  return printableRisks;
//
// 	}
//
//   //And then, in the docdefinition, I did this:
//   var oo = {content: [formatRiskList()]};

function formatTractList(){
  		var printableRisks = [];
      var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Type', style: 'tableHeader'}, {text: 'Parcel ID', style: 'tableHeader'},{text: 'Owner', style: 'tableHeader'},{text: 'ROW Agent', style: 'tableHeader'},{text: 'Title Complete', style: 'tableHeader'},{text: 'Survey Granted', style: 'tableHeader'},{text: 'Survey Denied', style: 'tableHeader'},{text: 'Acquired', style: 'tableHeader'},{text: 'SEC', style: 'tableHeader'},{text: 'TWP', style: 'tableHeader'},{text: 'RNG', style: 'tableHeader'},{text: 'County', style: 'tableHeader'},{text: 'Acres', style: 'tableHeader'}]];
      var printArray = [];

      var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('sequence'));
      tractsObj.$loaded()
        .catch(alert)
        .then(function() {
          tractsObj.forEach(function(i){
            if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
            if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
            if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
            if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
            if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
            if(i.rowagent === null || typeof(i.rowagent)==='undefined'){i.rowagent = ''};
            if(i.titlecomplete === null || typeof(i.titlecomplete)==='undefined'){i.titlecomplete = ''};
            if(i.surveypermission === null || typeof(i.surveypermission)==='undefined'){i.surveypermission = ''};
            if(i.surveydenied === null || typeof(i.surveydenied)==='undefined'){i.surveydenied = ''};
            if(i.acquireddate !== null && typeof(i.acquireddate)!=='undefined'&&i.acquireddate!==''){var acquired = i.acquireddate}else{acquired=''};
            if(i.section === null || typeof(i.section)==='undefined'){i.section = ''};
            if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
            if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
            if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
            if(i.acres !== null && typeof(i.acres)!='undefined'&&i.acres!==''){var acres=i.acres}else{acres = ''};
            if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
            if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
            if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
            if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};

            if (i.inactive!==true){

            exampletable
            .push([i.sequence, i.tract, i.type, i.parcelid, i.owner, i.rowagent, i.titlecomplete, i.surveypermission, i.surveydenied, acquired,i.section, i.township, i.range, i.county, acres]);
              };
            });



	});

  	  return exampletable;
  	}
    var example = formatTractList();

    $scope.example = formatTractList();

    $scope.exportData=(function() {
      var excelArray = example;
      excelArray.splice(0,1);
    var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FPropertiesReport.xlsx?alt=media&token=cbb3fb75-082c-47a6-b655-d7d8d2fc996a";
    var req = new XMLHttpRequest();
    req.open("GET", file, true);
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200){
            XlsxPopulate.fromDataAsync(req.response)
                .then(function (workbook) {


    workbook.sheet(0).cell("A4").value(
      example

    );
    var dataRange = (3 + excelArray.length).toString();
    workbook.sheet(0).range("A3:O3").style("border","medium");
    workbook.sheet(0).range("A4:O"+dataRange).style("border",true);


    workbook.outputAsync()
        .then(function (blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // If IE, you must uses a different method.
                window.navigator.msSaveOrOpenBlob(blob, "Properties Report.xlsx");
            } else {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = "Properties Report.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        });
                });
        }
    };

    req.send();

              });




  //And then, in the docdefinition, I did this:
  var oo = {content: [example]};

var docDefinition = dd;

var currentdate =  new Date().toLocaleDateString();
var dd = {
  header: function(currentPage, pageCount) {
  if (currentPage !== 1){
    return {text:'States Edge - Properties Report' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
  }},
footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
	content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

		{text: 'States Edge - Properties Report', style: 'header', alignment: 'center'},
		{table: {
                  widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','*'],
									body: example,
                  headerRows: 1,
						},
  layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
    },
  },






	],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

	styles: {
		header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 20]
		},
		subheader: {
			fontSize: 16,
			bold: true,
			margin: [0, 10, 0, 5]
		},
		tableExample: {
			margin: [0, 5, 0, 15]
		},
		tableHeader: {
			bold: true,
			fontSize: 13,
			color: 'white',
      fillColor: 'blue',
      alignment: 'center'
		}
	},
	defaultStyle: {
		// alignment: 'justify'
	},
  images: {
    logo:mtsLogo

  }

}

$scope.printPDF = function(){
    pdfMake.createPdf(dd).download('Property Tracts Report.pdf');
}


  })
  .controller('LandOwnersReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
var mtsLogo = 'data:image/png;base64,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'
      //JOIN function
          function extend(base) {
                          var parts = Array.prototype.slice.call(arguments, 1);
                          parts.forEach(function (p) {
                              if (p && typeof (p) === 'object') {
                                  for (var k in p) {
                                      if (p.hasOwnProperty(k)) {
                                          base[k] = p[k];
                                      }
                                  }
                              }
                          });
                          return base;
                      };
      //end JOIN function

      var allActiveTracts = [];
      var ownersArray = [];
      var personArray = [];
      var activeOwnersArray = [];
      var landownersArray = [];


          //get property tracts
          var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('inactive').startAt(null).endAt(false));
          tractsObj.$loaded()
            .catch(alert)
            .then(function() {
              tractsObj.forEach(function(i){
                i.tractkey=i.$id;
                if(i.landowners){
                var landownersObj = $firebaseArray(Ref.child('tracts').child(i.$id).child('landowners').orderByChild('ownerid'));
};
                landownersObj.$loaded()
                .catch(alert)
                .then(function(){
                if (i.landowners){
                  // personArray.push(i);

                    landownersObj.forEach(function(h){
                      if(h.inactive!==true && h.ownername){
                      Ref.child('tracts').child(i.$id).child('landowners').child(h.ownername).on('value', function(tractSnap){
                      var tractRecords = extend({}, tractSnap.val());
                      Ref.child('landowners').child(tractSnap.key).on('value',function(ownerSnap){
                        h.sequence = i.sequence;
                        h.tract = i.tract;
                        h.rowagent = i.rowagent;
                        h.county = i.county;
                        h.owner = i.owner;
                        h.tractkey = i.$id;
                        h.ownerkey = h.$id;
                      personArray.push(extend({}, h,ownerSnap.val()) );

                          });
                      });
$scope.tracts = personArray;
$scope.currentPage = 0;
$scope.pageSize = 100;
$scope.numberOfPages=function(){
     return Math.ceil($scope.tracts.length/$scope.pageSize);
 };
                    };
                  });
                } else{
                  personArray.push(i);
                  $scope.tracts = personArray;
                  $scope.currentPage = 0;
                  $scope.pageSize = 100;
                  $scope.numberOfPages=function(){
                       return Math.ceil($scope.tracts.length/$scope.pageSize);
                   };

                };
                  });
                    });







                $scope.orderByField = 'sequence';


      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }
setTimeout(function(){
var firstArray = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Owner ID', style: 'tableHeader'},{text: 'Land Owner', style: 'tableHeader'},{text: 'Assessed To', style: 'tableHeader'},{text: 'Phone 1', style: 'tableHeader'},{text: 'Phone 2', style: 'tableHeader'},{text: 'ROW Agent', style: 'tableHeader'},{text: 'County', style: 'tableHeader'}]];
var secondArray=[];
        personArray.forEach(function(h){

            if(h.sequence!==null&&typeof(h.sequence)!=='undefined'){var sequence=h.sequence}else{sequence=''};
            if(h.tract!==null&&typeof(h.tract)!=='undefined'){var tract = h.tract}else{tract=''};
            if(h.owner!==null&&typeof(h.owner)!=='undefined'){var assessedto = h.owner}else{assessedto=''};
            if(h.rowagent!==null&&typeof(h.rowagent)!=='undefined'){var rowagent = h.rowagent}else{rowagent=''};
            if(h.county!==null&&typeof(h.county)!=='undefined'){var county = h.county}else{county=''};
            if(h.name!==null&&typeof(h.name)!=='undefined'){var landowner = h.name}else{landowner=''};
            if(h.ownerid!==null&&typeof(h.ownerid)!=='undefined'){var ownerid = h.ownerid}else{ownerid=''};
            if(h.phone1!==null&&typeof(h.phone1)!=='undefined'){var phone1 = h.phone1}else{phone1=''};
            if(h.phone2!==null&&typeof(h.phone2)!=='undefined'){var phone2 = h.phone2}else{phone2=''};

          secondArray.push([sequence,tract,ownerid,landowner,assessedto,phone1,phone2,rowagent,county]);
          function sortByOwnerID (a,b){
            if(a[2]<b[2]){return -1};
            if(a[2]>b[2]){return 1};
            if(a[2]==b[2]){return 0};
          }
          secondArray.sort(sortByOwnerID);
          secondArray.sort(function(a,b){
            return a[0]-b[0];
          })
landownersArray=firstArray.concat(secondArray);
});
var docDefinition = dd;

var currentdate =  new Date().toLocaleDateString();
var dd = {
  header: function(currentPage, pageCount) {
  if (currentPage !== 1){
    return {text:'States Edge - Land Owners Report' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
  }},
footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
  content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

    {text: 'States Edge - Land Owners Report', style: 'header', alignment: 'center'},
    {width:'auto',
    table: {
                  widths: ['*',75,75,200,200,100,100,125,'*'],
                  body: landownersArray,
                  headerRows: 1,
            },
    layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  },

    },

  },

  ],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 20]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    tableExample: {
      margin: [0, 5, 0, 15]
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'white',
      fillColor: 'blue',
      alignment: 'center'
    }
  },
  // defaultStyle: {
  //   alignment: 'center'
  // },
  images: {
    logo:mtsLogo

  }

}

$scope.printPDF = function(){
      pdfMake.createPdf(dd).download('Land Owners Report.pdf');
};

$scope.exportData=(function() {
  var excelArray = landownersArray;
  excelArray.splice(0,1);

    var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FLandOwnersReport.xlsx?alt=media&token=32cffaaa-3d0c-47c9-a213-fc3f8a11bd4d";
    var req = new XMLHttpRequest();
    req.open("GET", file, true);
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200){
            XlsxPopulate.fromDataAsync(req.response)
                .then(function (workbook) {


    workbook.sheet(0).cell("A4").value(
      excelArray

    );
    var dataRange = (3 + landownersArray.length).toString();
    workbook.sheet(0).range("A3:I4").style("border","medium");
    workbook.sheet(0).range("A4:I"+dataRange).style("border",true);


    workbook.outputAsync()
        .then(function (blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // If IE, you must uses a different method.
                window.navigator.msSaveOrOpenBlob(blob, "Land Owners Report.xlsx");
            } else {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = "Land Owners Report.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        });
                });
        }
    };

    req.send();

              });




},3000)


  });

  })
  .controller('PermitsReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10
var mtsLogo = 'data:image/png;base64,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'
      var allActiveTracts = [];

      var tractsRefFiltered =  Ref.child('tracts').orderByChild('sequence');
      var tracts = Ref.child('tracts').orderByChild('sequence');

      //get civil permits
          var civilpermitsobj = $firebaseArray(Ref.child('civilpermits'));
          civilpermitsobj.$loaded()
            .catch(alert)
            .then(function() {
              civilpermitsobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};
                  });
                });

      //get environmental permits
        var utilitypermitsobj = $firebaseArray(Ref.child('utilitypermits'));
        utilitypermitsobj.$loaded()
          .catch(alert)
          .then(function() {
            utilitypermitsobj.forEach(function(i){
            if (i.inactive!==true){
            allActiveTracts.push(i)};
                            });
                          });

      //get environmental permits
          var environmentalpermitsobj = $firebaseArray(Ref.child('environmentalpermits'));
          environmentalpermitsobj.$loaded()
            .catch(alert)
            .then(function() {
              environmentalpermitsobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};
                  });
                });


      $scope.tracts = allActiveTracts;



        $scope.currentPage = 0;
        $scope.pageSize = 100;
        $scope.numberOfPages=function(){
             return Math.ceil($scope.tracts.length/$scope.pageSize);
         };


      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }


  function formatTractList(){
      var printableRisks = [];
      var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Type', style: 'tableHeader'}, {text: 'Owner', style: 'tableHeader'},{text: 'SEC', style: 'tableHeader'},{text: 'TWP', style: 'tableHeader'},{text: 'RNG', style: 'tableHeader'},{text: 'County', style: 'tableHeader'},{text: 'Permit Agent', style: 'tableHeader'},{text: 'Submitted', style: 'tableHeader'},{text: 'Approved', style: 'tableHeader'},{text: 'Expires', style: 'tableHeader'}]];
      var printArray = [];


              var utilityObj = $firebaseArray(Ref.child('utilitypermits').orderByChild('sequence'));
              utilityObj.$loaded()
                .catch(alert)
                .then(function() {
                  utilityObj.forEach(function(i){
                    if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
                    if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
                    if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
                    if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
                    if(i.section === null || typeof(i.section)==='undefined'){i.section = ''};
                    if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
                    if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
                    if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
                    if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
                    if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
                    if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
                    if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};
                    if (i.inactive!==true){

                    exampletable.push([i.sequence,i.tract,i.type,i.owner,i.section,i.township,i.range,i.county,i.permitagent, i.permitsubmitted, i.permitapproved, i.permitexpires]);
                  };
                });
                exampletable.sort(function(a,b){return a[0]-b[0]})

  });
  var environmentalObj = $firebaseArray(Ref.child('environmentalpermits').orderByChild('sequence'));
  environmentalObj.$loaded()
    .catch(alert)
    .then(function() {
      environmentalObj.forEach(function(i){
        if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
        if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
        if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
        if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
        if(i.section === null || typeof(i.section)==='undefined'){i.section = ''};
        if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
        if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
        if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
        if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
        if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
        if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
        if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};
        if (i.inactive!==true){

          exampletable.push([i.sequence,i.tract,i.type,i.owner,i.section,i.township,i.range,i.county,i.permitagent, i.permitsubmitted, i.permitapproved, i.permitexpires]);
      };
    });
    exampletable.sort(function(a,b){return a[0]-b[0]})

  });
              var civilObj = $firebaseArray(Ref.child('civilpermits').orderByChild('sequence'));
              civilObj.$loaded()
                .catch(alert)
                .then(function() {
                  civilObj.forEach(function(i){
                    if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
                    if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
                    if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
                    if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
                    if(i.section === null || typeof(i.section)==='undefined'){i.section = ''};
                    if(i.township === null || typeof(i.township)==='undefined'){i.township = ''};
                    if(i.range === null || typeof(i.range)==='undefined'){i.range = ''};
                    if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
                    if(i.permitagent === null || typeof(i.permitagent)==='undefined'){i.permitagent = ''};
                    if(i.permitsubmitted === null || typeof(i.permitsubmitted)==='undefined'){i.permitsubmitted = ''};
                    if(i.permitapproved === null || typeof(i.permitapproved)==='undefined'){i.permitapproved = ''};
                    if(i.permitexpires === null || typeof(i.permitexpires)==='undefined'){i.permitexpires = ''};
                    if (i.inactive!==true){

                      exampletable.push([i.sequence,i.tract,i.type,i.owner,i.section,i.township,i.range,i.county,i.permitagent, i.permitsubmitted, i.permitapproved, i.permitexpires]);

                  };

                });
                exampletable.sort(function(a,b){return a[0]-b[0]})

  });

      return exampletable;

    }

    var example = formatTractList();

    $scope.example = formatTractList();

    $scope.exportData=(function() {
      var excelArray = example;
      excelArray.splice(0,1);
    var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FPermitTrackerReport.xlsx?alt=media&token=74ddc317-7a51-40ae-96d1-40c07b75bfe3";
    var req = new XMLHttpRequest();
    req.open("GET", file, true);
    req.responseType = "arraybuffer";
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200){
            XlsxPopulate.fromDataAsync(req.response)
                .then(function (workbook) {


    workbook.sheet(0).cell("A4").value(
      example

    );
    var dataRange = (3 + excelArray.length).toString();
    workbook.sheet(0).range("A3:L3").style("border","medium");
    workbook.sheet(0).range("A4:L"+dataRange).style("border",true);


    workbook.outputAsync()
        .then(function (blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // If IE, you must uses a different method.
                window.navigator.msSaveOrOpenBlob(blob, "Permit Tracker.xlsx");
            } else {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = "Permit Tracker.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        });
                });
        }
    };

    req.send();

              });

  var docDefinition = dd;

  var currentdate =  new Date().toLocaleDateString();
  var dd = {
    header: function(currentPage, pageCount) {
  if (currentPage !== 1){
    return {text:'States Edge - Permits Tracker' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
  }},
footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
  content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

    {text: 'States Edge - Permits Tracker', style: 'header', alignment: 'center'},
    {table: {
                  widths: ['auto','auto','auto', 300 ,'auto','auto','auto','auto','auto',100,100,100],
                  body: example,
                  headerRows: 1,
            },
  layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
    },
  },

  ],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 20]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    tableExample: {
      margin: [0, 5, 0, 15]
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'white',
      fillColor: 'blue',
      alignment: 'center'
    }
  },
  defaultStyle: {
    // alignment: 'justify'
  },
  images: {
    logo: mtsLogo

  }

  }

  $scope.printPDF = function(){
    pdfMake.createPdf(dd).download('Permit Tracker Report.pdf');
  }


  })
  .controller('TitleProgressReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10
var mtsLogo = 'data:image/png;base64,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'
      // $scope.local = {};
      // $scope.local.welds = (localStorageService.get('weldsCheck')) ? localStorageService.get('weldsCheck') : [];
      // $scope.local.complete = false;
      // $scope.local.weldsloaded = false;

      var allActiveTracts = [];
      var excelArray = [];

      var tractsRefFiltered =  Ref.child('tracts').orderByChild('sequence');
      var tracts = Ref.child('tracts').orderByChild('sequence');

      //get property tracts
          var propertiesobj = $firebaseArray(Ref.child('tracts'));
          propertiesobj.$loaded()
            .catch(alert)
            .then(function() {
              propertiesobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i)};

                  if(i.sequence !== null && typeof(i.sequence)!=='undefined'&&i.sequence!==''){var sequence=i.sequence}else{sequence=''};
                  if(i.tract !== null && typeof(i.tract)!=='undefined'&&i.tract!==''){var tract = i.tract}else{tract=''};
                  if(i.type !== null && typeof(i.type)!=='undefined'&&i.type!==''){var type = i.type}else{type = ''};
                  if(i.parcelid !== null && typeof(i.parcelid)!=='undefined'&&i.parcelid!==''){var parcelid = i.parcelid}else{parcelid = ''};
                  if(i.owner !== null && typeof(i.owner)!=='undefined'&&i.owner!==''){var owner = i.owner}else{owner = ''};
                  if(i.titlecomplete !== null && typeof(i.titlecomplete)!=='undefined'&&i.titlecomplete!==''){var titlecomplete = i.titlecomplete}else{titlecomplete = ''};
                  if(i.titleagent !== null && typeof(i.titleagent)!=='undefined'&&i.titleagent!==''){var titleagent = i.titleagent}else{titleagent = ''};
                  if(i.titleapprovedby !== null && typeof(i.titleapprovedby)!=='undefined'&&i.titleapprovedby!==''){var titleapprovedby = i.titleapprovedby}else{titleapprovedby = ''};
                  if(i.county !== null && typeof(i.county)!=='undefined'&&i.county!==''){var county = i.county}else{county = ''};

                excelArray.push([sequence,tract,type,parcelid,owner,titlecomplete,titleagent,titleapprovedby,county]);
});
            $scope.exportData=(function() {
                var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FTitleProgress.xlsx?alt=media&token=4d03418d-d578-4480-a7e1-840033049fee";
                var req = new XMLHttpRequest();
                req.open("GET", file, true);
                req.responseType = "arraybuffer";
                req.onreadystatechange = function () {
                    if (req.readyState === 4 && req.status === 200){
                        XlsxPopulate.fromDataAsync(req.response)
                            .then(function (workbook) {


                workbook.sheet(0).cell("A4").value(
                  excelArray

                );
                var dataRange = (3 + excelArray.length).toString();
                workbook.sheet(0).range("A3:I4").style("border","medium");
                workbook.sheet(0).range("A4:I"+dataRange).style("border",true);


                workbook.outputAsync()
                    .then(function (blob) {
                        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                            // If IE, you must uses a different method.
                            window.navigator.msSaveOrOpenBlob(blob, "Title Search Report.xlsx");
                        } else {
                            var url = window.URL.createObjectURL(blob);
                            var a = document.createElement("a");
                            document.body.appendChild(a);
                            a.href = url;
                            a.download = "Title Search Report.xlsx";
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }
                    });
                            });
                    }
                };

                req.send();

                          });




                });

      $scope.tracts = allActiveTracts;

  $scope.currentPage = 0;
  $scope.pageSize = 100;
  $scope.numberOfPages=function(){
       return Math.ceil($scope.tracts.length/$scope.pageSize);
   };

      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }

      // $scope.exportData = function() {
      //   var mystyle = {
      //     sheetid: 'Title Search Progress',
      //     headers: true,
      //     caption: {
      //       title:'Title Search Progress',
      //       style:'font-size: 20px; color:blue;'
      //     },
      //
      //     columns: [
      //       {columnid:'sequence', title: 'Order', width:100},
      //       {columnid:'tract', title: 'Tract Number', width:200},
      //       {columnid:'type', title: 'Type', width:600},
      //       {columnid:'parcelid', title: 'Parcel ID', width:200},
      //       {columnid:'owner', title: 'Owner', width:100},
      //       {columnid:'titlecomplete', title: 'Title Complete', width:100},
      //       {columnid:'titleagent', title: 'Title Agent', width:100},
      //       {columnid:'titleapprovedby', title: 'Approved By', width:100},
      //       {columnid:'county', title: 'County', width:100},
      //       {columnid:'titlecomments', title: 'Comments', width:100},
      //     ]
      //
      //   };
      //
      //   var data = $filter('orderBy')($scope.tracts, $scope.orderByField, $scope.reverseSort);
      //   alasql('SELECT sequence as [Order], tract as [Tract Number], type as [Type], parcelid as [Parcel ID], owner as [Owner], titlecomplete as [Title Complete], titleagent as [Title Agent], titleapprovedby as [Approved By], county as [County], titlecomments as [Comments]' +  'INTO XLSX("TitleSearchProgress.xlsx",?) FROM ?',[mystyle,data]);
      //    }

function formatTractList(){
      var printableRisks = [];
      var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Type', style: 'tableHeader'}, {text: 'Parcel ID', style: 'tableHeader'},{text: 'Owner', style: 'tableHeader'},{text: 'Title Complete', style: 'tableHeader'},{text: 'Title Agent', style: 'tableHeader'},{text: 'Approved By', style: 'tableHeader'},{text: 'County', style: 'tableHeader'}]];
      var printArray = [];

      var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('sequence'));
      tractsObj.$loaded()
        .catch(alert)
        .then(function() {
          tractsObj.forEach(function(i){
            if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
            if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
            if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
            if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
            if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
            if(i.titlecomplete === null || typeof(i.titlecomplete)==='undefined'){i.titlecomplete = ''};
            if(i.titleagent === null || typeof(i.titleagent)==='undefined'){i.titleagent = ''};
            if(i.titleapprovedby === null || typeof(i.titleapprovedby)==='undefined'){i.titleapprovedby = ''};
            if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
            if(i.titlecomments === null || typeof(i.titlecomments)==='undefined'){i.titlecomments = ''};

            if (i.inactive!==true){

            exampletable
            .push([i.sequence, i.tract, i.type, i.parcelid, i.owner, i.titlecomplete, i.titleagent, i.titleapprovedby, i.county]);
              };
            });

  });
      return exampletable;

    }
    var example = formatTractList();

    $scope.example = formatTractList();

  //And then, in the docdefinition, I did this:
  var oo = {content: [example]};

var docDefinition = dd;

var currentdate =  new Date().toLocaleDateString();
var dd = {
  header: function(currentPage, pageCount) {
    if (currentPage !== 1){
      return {text:'States Edge - Title Search Progress Report' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
    }},
 footer: function(currentPage, pageCount) {
   return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
  content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

    {text: 'States Edge - Title Search Progress Report', style: 'header', alignment: 'center'},
    {table: {
                  widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto'],
                  body: example,
                  headerRows: 1,
            },
  layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
    },
  },

  ],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 20]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    tableExample: {
      margin: [0, 5, 0, 15]
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'white',
      fillColor: 'blue',
      alignment: 'center'
    }
  },
  defaultStyle: {
    // alignment: 'justify'
  },
  images: {
    logo:mtsLogo

  }

}

$scope.printPDF = function(){
    pdfMake.createPdf(dd).download('Title Search Progress Report.pdf');
}


  })


  .controller('SurveyPermissionsReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $firebaseObject,$timeout, ROW, localStorageService) {
      // synchronize a read-only, synchronized array of messages, limit to most recent 10
var mtsLogo = 'data:image/png;base64,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'
      // $scope.local = {};
      // $scope.local.welds = (localStorageService.get('weldsCheck')) ? localStorageService.get('weldsCheck') : [];
      // $scope.local.complete = false;
      // $scope.local.weldsloaded = false;

      var allActiveTracts = [];

      var tractsRefFiltered =  Ref.child('tracts').orderByChild('sequence');
      var tracts = Ref.child('tracts').orderByChild('sequence');

      //get property tracts
          var propertiesobj = $firebaseArray(Ref.child('tracts'));
          propertiesobj.$loaded()
            .catch(alert)
            .then(function() {
              propertiesobj.forEach(function(i){
                if (i.inactive!==true){

                  if(i.ownercontacted!==null&&typeof(i.ownercontacted)!=='undefined'&&i.ownercontacted!==""){
                  var ownercontactedObj = $firebaseObject(Ref.child('tracts').child(i.$id).child('landowners').child(i.ownercontacted));
                    ownercontactedObj.$loaded().catch(alert).then(function(){

                      i.ownercontactedname = ownercontactedObj.ownername;
                    })
};

                  allActiveTracts.push(i)
                };
                  });
                });
      $scope.tracts = allActiveTracts;

        $scope.currentPage = 0;
        $scope.pageSize = 100;
        $scope.numberOfPages=function(){
             return Math.ceil($scope.tracts.length/$scope.pageSize);
         };

      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }

      // $scope.exportData = function() {
        // var mystyle = {
        //   sheetid: 'Survey Permission Progress',
        //   headers: true,
        //   caption: {
        //     title:'Survey Permission Progress',
        //     style:'font-size: 20px; color:blue;'
        //   },
        //   columns: [
        //     {columnid:'sequence', title: 'Order', width:100},
        //     {columnid:'tract', title: 'Tract Number', width:200},
        //     {columnid:'owner', title: 'Owner', width:100},
        //     {columnid:'rowagent', title: 'ROW Agent', width:100},
        //     // {columnid:'ownercontacted', title: 'Contacted', width:100},
        //     {columnid:'surveypermission', title: 'Survey Granted', width:100},
        //     {columnid:'surveydenied', title: 'Survey Denied', width:100},
        //     {columnid:'specialconditions', title: 'Special Conditions', width:100},
        //     {columnid:'surveypermissiontype', title: 'Method', width:100},
        //     {columnid:'surveypermissionapprovedby', title: 'Approved By', width:100},
        //     {columnid:'county', title: 'County', width:100},
        //
        //     ]
        // };
        //
        // var data = $filter('orderBy')($scope.tracts, $scope.orderByField, $scope.reverseSort);
        // alasql('SELECT sequence as [Order], tract as [Tract Number], type as [Type], owner as [Owner], rowagent as [ROW Agent], surveypermission as [Survey Granted], surveydenied as [Survey Denied], specialconditions as [Special Conditions], surveypermissiontype as [Method], surveypermissionapprovedby as [Approved By], county as [County]' +  'INTO XLSX("SurveyPermissionsReport.xlsx",?) FROM ?',[mystyle,data]);
         // }

           var excelArray = [];
           var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('sequence'));
           tractsObj.$loaded()
             .catch(alert)
             .then(function() {
               tractsObj.forEach(function(i){

                 if(i.sequence !== null && typeof(i.sequence)!=='undefined'){var sequence=i.sequence}else{sequence = ''};
                 if(i.tract !== null && typeof(i.tract)!=='undefined'){var tract=i.tract}else{tract = ''};
                 if(i.type !== null && typeof(i.type)!=='undefined'){var type=i.type}else{type = ''};
                 if(i.owner !== null && typeof(i.owner)!=='undefined'){var owner = i.owner}else{owner = ''};
                 if(i.rowagent !== null && typeof(i.rowagent)!=='undefined'){var rowagent=i.rowagent}else{rowagent = ''};
                 if(i.surveypermission !== null && typeof(i.surveypermission)!=='undefined'){var surveypermission = i.surveypermission}else{surveypermission = ''};
                 if(i.surveydenied !== null && typeof(i.surveydenied)!=='undefined'){var surveydenied = i.surveydenied}else{surveydenied = ''};
                 if(i.specialconditions !== null && typeof(i.specialconditions)!=='undefined'){var specialconditions = i.specialconditions}else{specialconditions = ''};
                 if(i.surveypermissiontype!== null && typeof(i.surveypermissiontype)!=='undefined'){var surveypermissiontype = i.surveypermissiontype}else{surveypermissiontype = ''};
                 if(i.county !== null && typeof(i.county)!=='undefined'){var county = i.county}else{county = ''};
                 if(i.surveypermissionapprovedby !== null && typeof(i.surveypermissionapprovedby)!=='undefined'){var surveypermissionapprovedby=i.surveypermissionapprovedby.toUpperCase()}else{surveypermissionapprovedby = ''};

excelArray.push([sequence,tract,type,owner,rowagent,surveypermission,surveydenied,specialconditions,surveypermissiontype,surveypermissionapprovedby,county]);

});

$scope.exportData=(function() {
var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FSurveyPermissions.xlsx?alt=media&token=f9bb61b1-bd84-4040-8bfe-fa01b406eb88";
var req = new XMLHttpRequest();
req.open("GET", file, true);
req.responseType = "arraybuffer";
req.onreadystatechange = function () {
    if (req.readyState === 4 && req.status === 200){
        XlsxPopulate.fromDataAsync(req.response)
            .then(function (workbook) {


workbook.sheet(0).cell("A4").value(
  excelArray

);
var dataRange = (3 + excelArray.length).toString();
workbook.sheet(0).range("A3:K4").style("border","medium");
workbook.sheet(0).range("A4:K"+dataRange).style("border",true);


workbook.outputAsync()
    .then(function (blob) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // If IE, you must uses a different method.
            window.navigator.msSaveOrOpenBlob(blob, "Survey Permission Report.xlsx");
        } else {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = "Survey Permission Report.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    });
            });
    }
};

req.send();

          });

        });

  function formatTractList(){
      var printableRisks = [];
      var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Type', style: 'tableHeader'},{text: 'Owner', style: 'tableHeader'},{text: 'ROW Agent', style: 'tableHeader'},{text: 'Granted', style: 'tableHeader'},{text: 'Denied', style: 'tableHeader'},{text: 'Conditional', style: 'tableHeader'},{text: 'Method', style: 'tableHeader'},{text: 'Approved By', style: 'tableHeader'},{text: 'County', style: 'tableHeader'}]];
      var printArray = [];

      var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('sequence'));
      tractsObj.$loaded()
        .catch(alert)
        .then(function() {
          tractsObj.forEach(function(i){

            if(i.sequence !== null && typeof(i.sequence)!=='undefined'){var sequence=i.sequence}else{sequence = ''};
            if(i.tract !== null && typeof(i.tract)!=='undefined'){var tract=i.tract}else{tract = ''};
            if(i.type !== null && typeof(i.type)!=='undefined'){var type=i.type}else{type = ''};
            if(i.owner !== null && typeof(i.owner)!=='undefined'){var owner = i.owner}else{owner = ''};
            if(i.rowagent !== null && typeof(i.rowagent)!=='undefined'){var rowagent=i.rowagent}else{rowagent = ''};
            if(i.surveypermission !== null && typeof(i.surveypermission)!=='undefined'){var surveypermission = i.surveypermission}else{surveypermission = ''};
            if(i.surveydenied !== null && typeof(i.surveydenied)!=='undefined'){var surveydenied = i.surveydenied}else{surveydenied = ''};
            if(i.specialconditions !== null && typeof(i.specialconditions)!=='undefined'){var specialconditions = i.specialconditions}else{specialconditions = ''};
            if(i.surveypermissiontype!== null && typeof(i.surveypermissiontype)!=='undefined'){var surveypermissiontype = i.surveypermissiontype}else{surveypermissiontype = ''};
            if(i.county !== null && typeof(i.county)!=='undefined'){var county = i.county}else{county = ''};
            if(i.surveypermissionapprovedby !== null && typeof(i.surveypermissionapprovedby)!=='undefined'){var surveypermissionapprovedby=i.surveypermissionapprovedby.toUpperCase()}else{surveypermissionapprovedby = ''};
            if(i.ownercontacted!==null&&typeof(i.ownercontacted)!=='undefined'){
            // var ownercontactedObj = $firebaseObject(Ref.child('tracts').child(i.$id).child('landowners').child(i.ownercontacted));
            //   ownercontactedObj.$loaded().catch(alert).then(function(){
            //
            //     if(ownercontactedObj.ownername!==null&&typeof(ownercontactedObj.ownername)!=='undefined'){var ownercontactedname=ownercontactedObj.ownername}else{ownercontactedname=''};
            //
            //     if (i.inactive!==true){
            //
            //
            //     exampletable
            //     .push([sequence,tract,owner,rowagent,surveypermission,surveydenied,specialconditions,surveypermissiontype,surveypermissionapprovedby,county]);
            //     exampletable.sort(function(a,b){return a[0]-b[0]})
            //
            //       };
            //
            //   })
            // }else{
              if (i.inactive!==true){


              exampletable
              .push([sequence,tract,type,owner,rowagent,surveypermission,surveydenied,specialconditions,surveypermissiontype,surveypermissionapprovedby,county]);

              exampletable.sort(function(a,b){return a[0]-b[0]})

                };
            };


            });



  });


      return exampletable;

    }


    var example = formatTractList();





    $scope.example = formatTractList();

  //And then, in the docdefinition, I did this:
  var oo = {content: [example]};

  var docDefinition = dd;

  var currentdate =  new Date().toLocaleDateString();
  var dd = {
    header: function(currentPage, pageCount) {
  if (currentPage !== 1){
    return {text:'States Edge - Survey Permission Progress Report' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
  }},
footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
  content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

    {text: 'States Edge - Survey Permission Progress Report', style: 'header', alignment: 'center'},
    {table: {
                  widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','*'],
                  body: example,
                  headerRows: 1,
            },
  layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
    },
  },

  ],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 20]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    tableExample: {
      margin: [0, 5, 0, 15]
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'white',
      fillColor: 'blue',
      alignment: 'center'
    }
  },
  defaultStyle: {
    // alignment: 'justify'
  },
  images: {
    logo:mtsLogo

  }

  }

  $scope.printPDF = function(){
    pdfMake.createPdf(dd).download('Survey Permissions Progress Report.pdf');
  }


  })

  .filter('startFrom', function() {
      return function(input, start) {
          start = +start; //parse to int
          return input.slice(start);
      }
  })
  .controller('AcquisitionReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
var mtsLogo = 'data:image/png;base64,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'
      var allActiveTracts = [];
      var excelArray=[];

      var tractsRefFiltered =  Ref.child('tracts').orderByChild('sequence');
      var tracts = Ref.child('tracts').orderByChild('sequence');

      //get property tracts
          var propertiesobj = $firebaseArray(Ref.child('tracts'));
          propertiesobj.$loaded()
            .catch(alert)
            .then(function() {
              propertiesobj.forEach(function(i){
                if (i.inactive!==true){
                  allActiveTracts.push(i);

                  if(i.sequence !== null && typeof(i.sequence)!=='undefined'&&i.sequence!==''){var sequence=i.sequence}else{sequence=''};
                  if(i.tract !== null && typeof(i.tract)!=='undefined'&&i.tract!==''){var tract = i.tract}else{tract=''};
                  if(i.type !== null && typeof(i.type)!=='undefined'&&i.type!==''){var type = i.type}else{type = ''};
                  if(i.parcelid !== null && typeof(i.parcelid)!=='undefined'&&i.parcelid!==''){var parcelid = i.parcelid}else{parcelid = ''};
                  if(i.owner !== null && typeof(i.owner)!=='undefined'&&i.owner!==''){var owner = i.owner}else{owner = ''};
                  if(i.acquireddate !== null && typeof(i.acquireddate)!=='undefined'&&i.acquireddate!==''){var acquireddate = i.acquireddate}else{acquireddate = ''};
                  if(i.acquisitionagent !== null && typeof(i.acquisitionagent)!=='undefined'&&i.acquisitionagent!==''){var acquisitionagent = i.acquisitionagent}else{acquisitionagent = ''};
                  if(i.acquisitionapprovedby !== null && typeof(i.acquisitionapprovedby)!=='undefined'&&i.acquisitionapprovedby!==''){var acquisitionapprovedby = i.acquisitionapprovedby}else{acquisitionapprovedby = ''};
                  if(i.county !== null && typeof(i.county)!=='undefined'&&i.county!==''){var county = i.county}else{county = ''};

                excelArray.push([sequence,tract,type,parcelid,owner,acquireddate,acquisitionagent,acquisitionapprovedby,county]);
                };
                });
                $scope.exportData=(function() {
                var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FAcquisitionProgress.xlsx?alt=media&token=b9d2b9b1-ab86-405d-ac66-a5aa1d505416";
                var req = new XMLHttpRequest();
                req.open("GET", file, true);
                req.responseType = "arraybuffer";
                req.onreadystatechange = function () {
                    if (req.readyState === 4 && req.status === 200){
                        XlsxPopulate.fromDataAsync(req.response)
                            .then(function (workbook) {


                workbook.sheet(0).cell("A4").value(
                  excelArray

                );
                var dataRange = (3 + excelArray.length).toString();
                workbook.sheet(0).range("A3:I4").style("border","medium");
                workbook.sheet(0).range("A4:I"+dataRange).style("border",true);


                workbook.outputAsync()
                    .then(function (blob) {
                        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                            // If IE, you must uses a different method.
                            window.navigator.msSaveOrOpenBlob(blob, "Acquisition Progress.xlsx");
                        } else {
                            var url = window.URL.createObjectURL(blob);
                            var a = document.createElement("a");
                            document.body.appendChild(a);
                            a.href = url;
                            a.download = "Acquisition Progress.xlsx";
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }
                    });
                            });
                    }
                };

                req.send();

});

                });

      $scope.tracts = allActiveTracts;


  $scope.currentPage = 0;
  $scope.pageSize = 100;
  $scope.numberOfPages=function(){
       return Math.ceil($scope.tracts.length/$scope.pageSize);
   };

      $scope.tractcategory = function(tractcategory){
        return tractcategory
      };


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }


  function formatTractList(){
      var printableRisks = [];
      var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Type', style: 'tableHeader'}, {text: 'Parcel ID', style: 'tableHeader'},{text: 'Owner', style: 'tableHeader'},{text: 'Acquired Date', style: 'tableHeader'},{text: 'Approved By', style: 'tableHeader'},{text: 'County', style: 'tableHeader'}]];
      var printArray = [];

      var tractsObj = $firebaseArray(Ref.child('tracts').orderByChild('sequence'));
      tractsObj.$loaded()
        .catch(alert)
        .then(function() {
          tractsObj.forEach(function(i){
            if(i.sequence === null || typeof(i.sequence)==='undefined'){i.sequence = ''};
            if(i.tract === null || typeof(i.tract)==='undefined'){i.tract = ''};
            if(i.type === null || typeof(i.type)==='undefined'){i.type = ''};
            if(i.parcelid === null || typeof(i.parcelid)==='undefined'){i.parcelid = ''};
            if(i.owner === null || typeof(i.owner)==='undefined'){i.owner = ''};
            if(i.acquireddate === null || typeof(i.acquireddate)==='undefined'){i.acquireddate = ''};
            if(i.acquisitionapprovedby === null || typeof(i.acquisitionapprovedby)==='undefined'){i.acquisitionapprovedby = ''};
            if(i.county === null || typeof(i.county)==='undefined'){i.county = ''};
            if(i.acquisitioncomments === null || typeof(i.acquisitioncomments)==='undefined'){i.acquisitioncomments = ''};

            if (i.inactive!==true){

            exampletable
            .push([i.sequence, i.tract, i.type, i.parcelid, i.owner, i.acquireddate, i.acquisitionapprovedby, i.county]);
              };
            });



  });

      return exampletable;
    }
    var example = formatTractList();

    $scope.example = formatTractList();

  //And then, in the docdefinition, I did this:
  var docDefinition = dd;
  var currentdate =  new Date().toLocaleDateString();
  var dd = {
    header: function(currentPage, pageCount) {
  if (currentPage !== 1){
    return {text:'States Edge - Acquisition Progress Report' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
  }},
footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
  content: [
    {table: {
      widths:['50%','50%'],
      body:[
      [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
    ]
            }
    },

    {text: 'States Edge - Acquisition Progress Report', style: 'header', alignment: 'center'},
    {table: {
                  widths: ['auto','auto','auto','auto','auto','auto','auto','auto'],
                  body: example,
                  headerRows: 1,
            },
  layout: {
    fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
    },
  },

  ],
  pageOrientation: 'landscape',
  pageSize: 'A3',
  pageMargins: [30,30,30,40],

  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 20]
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    tableExample: {
      margin: [0, 5, 0, 15]
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'white',
      fillColor: 'blue',
      alignment: 'center'
    }
  },
  defaultStyle: {
    // alignment: 'justify'
  },
  images: {
    logo:mtsLogo

  }

  }

  $scope.printPDF = function(){
    pdfMake.createPdf(dd).download('Acquisition Progress Report.pdf');
  }


  })

.controller('CostReportCtrl',
    function ($scope, $rootScope, $location, $filter, Ref, $firebaseArray, $timeout, ROW, localStorageService) {
var mtsLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAeFElEQVR42uxdCVRV1RreDa9eL2ftKDIEgYE4MAqiBBwsc2rQ0gZf9Wy9eqXFeg0O2fAysnqv0kytVb1VtqxXLbJlaqMaIIYKhIpKKDIoAopMMiPDef9/PQdOl8tw7/7P5d5z77/W574s791n7///zh7//W/mFKc4xSlOcUrPct111/kMGTLEk1lZhg8fHjtixAgX5hSHlmuACNOAhK8KgrAT0kpIJUDZ0KFDxzMrCTz3Xfm5EnwuhvRbwDIoWxj895XMKbqXq8Dwv4DRm5EE3aBs2LBh45jGAs9ZY/L5nQStgXQpc4p+BbrGOQaD945zQEp/ppFAOd5UntULKYvg65cxp+hTwMifdRi8d5yFrnMsIxYg2RvKM/pIypuYU3Qpf8Zu0EwylAIp/RiRyGNWycwybGRO0Z+Ace9CA1tAiBLoYn0Jnr8K87MAZfDzK5hT9CVArATzydA5AwaM4Rgzvoj5cGA6c4p+BMg0AIzagMblJKWPBc9eib/nfPYnzCn6EWih7jcYl58YZyD1NqObXibQPLcasruaOUUfAgbdJhAQQ0YF5JcNaT6kpYAq+Nwko15eZD8FaQ7BszoAk6s7mVPsX4aAGBbCCUjRnwCCf8mcYv8ChlwkEBDCBlAP1bmWOcW+BQj5IwEZbAIwFr6POcV+ZeDAgSOAkC0CARlsAVCX7UwDGTx48FDmlA75Cyh7Myj7JKSvUCxCwz70IMjnacivQCAggi0B9JQOdVsI1fwTj44GDBggQF5xgDRAK+AFh983x205UPJRE0rPQEIBRps5gfGE3641bBESGN+WIa+LPjdo0KBhZqjoWiQz/O4HJKGJPH/EXoU5ogAZ7wAF1Pai9DZId0H6MPgpDu6BiNfDdz42KJnA2PYE1CEgvgf9XAn/PxO++zmgrg95ngIEMEcSUNByJJuZym+C33wN6TzDInFnt7NOD8s6Aj8xKwErcAgkv/BhsgPwOQvyq3OYdU/0BSRQfhVgi+GNJzCmniAv1ucS5NMOthKZ3gUq+z+BQPFOaA8gZAzTuxgcVAmUZUWUAbKg3HsBiYAk+XMaIBP+7zDgGHzG7xwEpAN+xe/J39+D3wOcBrQTlMea8GZ6F6jk4wSK0gplQJp9SCSZbOcJ8lSjDnAE8k4GpABsdlkKXx48g8T0LlDRWQKBwojQDN1SBrZm8DmvG8O0jhw58rSLi0umu4f7Hm9v70RfX9/EcePGpUyYMCE1ICBgf1BQUHpAYMCBiRMnpo4fP36vn59fEn7Pw9Mj2cXVJQ1+j2usDT28BClyq1pFUCcS4FiUOYLgMVOBQGGWQl4ETpNJUN1lmWmUkOPp6ZmMhAufHP57dEx0kxgrSryIFqPbIiIi8oG0+7y8vRKB4Ic6SNr5/Iuqsl0QCOrLgQPMEQRapIEEyrKEiEVyV1xq9H8lHh4ee6Cl23dT1E0XRALy9RVA9oshISGHkKCjRo06bty94/gTu3iBoP4W6CuBOYpYuWtCg6YarXuWQSuYFBoamgWkaBcJyEWBiCkRhT5jfBKxizeuA45trbzwv4Y5ioBiDxEorLc3/DAgUz1Ih24yHbtMbJlEAgJpidBJoVk4ZjXq1gvlGX6bQKCjXpZ8/skcRQwhQwiU1g0RTwDS1Ts82CVPjph8UiQgirUBw4hyHx+fRPWMX3ZEOSAQ6KsHzGOOIqDQ9QQKM7V1lgxoVSYIQMTkyMjIEpGAGP2NqOio+jFjxiAxK9ROKBS7Mt20kKHMUQQq/KxAoDSVYX5VtyCubq6pMB4rEgmIYGuIioqqwSUlqGejamaOfzcJBLpUgH4CzFEEFDhfIFAaoEzddcFk4ETIpJBDIoHhbR34wrm6uu5T6SIPcIxAp4hGh/KNBAfaCIG/VUxDQirjRJyd2sNkhRq4XIVxiNStJaCN97gvcyC5HF3xORe2E5W/Yf0ux14nLFSAiU+1m5tbqnpsCWkFJynjmSMIVPQdDkWdVy/leHl5JcEOSLNIYFQ9ALYtU0AvtcpGAExMsjl7ogeZngUquJjjjc2D9JT8d83EgIn7RQIj6g3QW+TCWDpfOToL2M+z1w96j2J6FAyYhN0txyJ3pTxxKZw8eXK+SGA8vQK3QGHCk6bszwOSeCJ16M4NDSYxblCpcgvXw9IhbZDHi1m4UCwSGE3viBFjWtFJRPVSJ3L0Tr/pKbbQFei9YqEy9ivnZeCNPwCLw40igbEcCbiYTkTKDUwPAhV5zdKWUSEjzCB/hSWdFpHAQI4I9M/EvXwCUs5n9ipy1Ih7UBEWVPwgdtMKGdGXUCQwjCNj7Nix6u47yUJCXsBwLriODH6tHoZgBTYgl+NFP3BMchJgLhTySfj733juFz4nyzsGTRxv4UlAtdxN73e2jHRAT3fF8wmwl2BzAhubs5D+Joc8fB/SF+QAX9PxepUhIEwDuVo+sH9a41g5Zbh+hp/Ro5rKW1vknyAUTJsmbr333gUfvvzKy+t27Ni2MTv76KcVFeUJjY31O9rbW39qbm76sabmwo78/Lyv9+5N+fz999/b9MQTiz+97fbbtkIehwE20crD2q3SZTdbww1QJu73jFKwFRQICtZLoS9Celhe2smH2XSlSGAACwlYdcv0W75YuXLFW9nZx96TpPb9gBaAZCHqKyvLkzZt+uSzhQvvSxDFmH5btkKHZHQ+kfVebrhBjMB+fcBURiTX4E0EBAXqjZDJclqNntMigfLNJGFLbGzMttdee3V1Y2PDl0CiBiSTFmhvbyvfvXvnlnvuvQdbz2qRoPxmurI1whKa4ohxjNpTqBv7/sIoBD2HBYIC9VLYVDltDwwMPCASKN0M1M2aPWvjyZO5bwFZSiUCwpkDIP/x+NXxX0E5rOouN2XqlDPYQnZMcgjs2Bsodn2uxHGjQFCYnu6BUc7YoJ+fSKDsPqL+9jtvX1taWvwuEKNWIiAXD1pamkvWrF1jVWIGBwdnqJaD0gQCe2oa35Lq9gKT6JztZcq7MEesNqOGCcrRo1mrgAg1EgGZKNHQUF+0ZMnib2AIYRVXOtUkp8zQYhLYtSd7c90hidN5gaAgPRRwj/y5bsqUKZqPG8HIRatXxz8Dhj8sEZBHS+TkZO+ZOfPWDJGg3r2cF2/Gs+gdnvcEdu3F5mt5CPlfgaAQ3RTsrLLe6OvnmyQSKLcXfFdcXPQ6GLtNIiCMNdDa2lITF/fkVniRND2qGx4eno2OL1p33fgM6HWDuWJPG7yRCQpjonB75a76qMY7Ma3z5t35CqwV7pIISNIf2P7d9u+hHucJdNGXrrtQw3ibbzHGvwa5gKAgxjgijx/b8O0UCRTaTRfdsHTp00vAqGckAmL0J2DB/dC0m6dpNqyB8XsdRvFQ9rsJbGyMArJrTXB2RFAgdeuYhSkehBcJlNkNGSvXr1/3GBizUiIghC2grOxcLizYa/YCY6As2T411BMcyHMGoxKYGblTBZJXjVHqI2+KLBMJFGkCFQlbEv6h5eJ2f6G2tqZ4xswZWQQ6MrmLgwvmGrSSnzNqgQI+QVAwrGi2fB5GqzXH+g0b1v0dt+skAgLYImAP/fTN02/W5GBbUHCQEvWjAWx1TuC3eYVWZ7wvh8z3EbWONbBXXSESKNB4+2/58mexZSyXCAxvyygqOpUTOy22VCTQmzGglTxM1Uqi5w/TSjC2IzpBcBQuU8vWce7cO1aAsQolAoPbAzIzf0uHepOfuoQArGmKXwGgpt/3r3vpuuMt9ABXFl9bpkZOJY+3ExMb8w0YabtEYGh7wttr3v5BJNCf8VgSPK5yOfe5G+G3Y5gV5Gq8C9oSbx7FA1wkUJqxv2JJyZkXJAID2yHa5i+YnyIS6FENf39/ZRctz8LWcSWzlqDXhplHE+qUEMUhoSEHRQKFqREfv2oRGOYigXHtEtXVVWdhPEk6JgcXNQw4YOiuLXDkPWL14w3m+Egqpw6hGygQCZRl1FVvBqOkSASGtWd89NEHu0QCfaqBcTXVPgdm4BtmTYHx4I2WzK4h8Cb1ZKY6J+dYnERgUHsHOP22zp4zmzTyG/Rmh5XJDaTN5ty0hsefmbUECPmY8vAJI12kL6/3k7Z7+pvE917+LTs8/dvx8+4bA5t2+gVLVEjzDSrOn3lXS8Gc+ZIlKJy3UKr5aTc3GSjQXFAoFT28BMtlMbKjZtTvJNCrgl1+we0/ePlfRNv97Dmurjsbb/UcK9092uMPpMS7Fpm1BCP0Kw9+aPT1Uo53gF3j7KrXpbamJm5SWYoL276Tjk+M4K5Hf+IjD99+m9Rcpt7n/Jur/RMSUXDbAmilCrjJZQ7aGhuk0ude5i67LaCDkJ3Yzawh0BSPxQfqjZAAQyt14dsd3ETrC5qO50r5M+Zyl9lWYIKQdbi7x7QWvJFer4RUULL8JamtoZ6bdN2h6qst0nH/MO5y2hJkQhqPI/2Y1oJOlnonJCL/1rnQip3gJp8abbW1UnHcMu6y2SJMERLPZDGtBccG6ofeP9qDuzK2CmzFqr5I4CYiovHIUSlPnM1dJlvFRo8bTRHyTaa1GMeudgPEuXpJz7nd0AWr3L0rMX1nbGDJmuBwScH6wHBuBVgTxXFLpdaaGovJWPnJZinHL4S7HNZCwvhQtFMnAsNaVrrd0Ia2fNHthjpjOy8DBI10sa5zxaBBg4aZeeirUTk4BM4U59QLrnOio7mVZm3kxcySGrOOmHdIq6pKKno0jvvZ1sbzYVOMF8lxly1PCahv7q4NBqxllAKZPqBcwdFXqAKuGw4n2TshAYZWruLjzX0iY31GpnQycjr/M/sBJghpuIzKEh9J+Te1wIenuHdv5C3C3RzhUQzOnrohpIyiR56UWisrTW/htbVK5Rs/lHLGBHE/p79gipCXbg/r9NqykBMHLd3BuQrI+BJnnEdDBdzd3VP0RkjEyam3SPVpGX8Mh3L+vHT6gUe58+5vmCIkXGivOFqkc3qQtwG33gNn78F9bRVj0N+RwHU9WYnXo0dCAgytYPmGDwytYt3eVCk3TOTP0wZggpAGt8GOm2j5z9lgPqUYjbe3EMybBIKHydgHMIQS1i0hZeTPmCfl+ARy52MrMEXI8IhwZVJTScANNX6GPH2MnSUWaXAO1/BGTZgwIVXvhNQbLhGy673dHffe0F8g34hDRINTL/zxIEGGJi9SxzQkJCTTSUj7wiVCdr33RnVKoEIg4IgJzgQiIR8XCDIzgVOYhk4KPeIkpH1BJmQXKDdjaBUG2jADh8zjBILMjKEccQifHP67k5D2he4IqUSrg+61UCDgiAnOROKs+hmBIDMTKMMU7iXMdRLSvtBDC3mecqZtYjNFREI+JRBkZgJn5RbyuJOQ9oUeWshKmZD5BPwwHYMc/lkiEGRmDOW+mUlhk445CWlf6KGFrO2wLQFHjIE3hGEL+YhAkJkJ5MvnsHW3dah39NBCXpQJqUkQW+BiCB5JiNXonpJjmOI1H05C2hdkQnYNaNpp23oCfnTZakaPMmVh3AdXzAWCjI3OYuMeqC73svWMDkJ2vdfm0tIPAT9UOA9ceai7fez7cI+R4CFKDHG88FG/e9k6xSVCdg2Mj/akvNUN8voYtqyH9xZybzB6YyjbQ7zePnCrfZItE7Jo0eJ+P1qARyVKV/yLOx8qmCJkQEDAPiUcNwERfweORZt73DUMfpjJ4+0jXzFs02PIsv+8Yzh8VfLs89x5WYKCWXdLTSdypYaMTO68qGCCkIaejuAuG9yzfhHdG5mFcgXedYgevxYQMkMOMGXTC+NAyD9EkDgRMJU7z75HzHhDiZhh84TEno4zqu4usniReCYCMtti7tahnLbgbVH2QEjExaIz0qn5D3Ln2xNyJ8VItUl7lGfaBSHh/vKD6rmBGTgHve1fmRYCreVs5eCWGuIoV2mOi3sX/L+9aw+u4qzin4/ago5T//B2Ikk0FobKq5WQUBLtsCEgIrRiEIQiYxv6sLa02tqUkRkROlNalAHUqgHbYgGRl1CVUiqkIeFdoLwKKQTyuCE0kOZxCclNbrP+zp1vM9tr7mv37M29u/fM/GbvwGb3+8757fc83zn3paS20vWxu0bV/mxMrqrh6dE5ppXGhUBCErp9XerV5S9bcgwBY1byLKf3xC0h/3hXNtlJD7Klh2z5g5Q0d6CdJ6Wkqmm9N0oXKPmWsFK0LAoSKGiaaQX0JUDI0Ae1vj3R9DsIFd8YRcdhKWwePTuuCWkES9MG9bbQ/TdhteBFa+0UuSIUIQm+1hbT0SYoCkb72XPaM21JyCCRK34urBa85BdOIqSG5i3b1Irhd0f9/PoFiynKGT3DiYQcK6wWeokTCUnwVlWrVVNnRfTcDzLvUVt39QRDdSQhb4UIq4VeQovmTiQkoburU21YuiLkoa6a2Q+pXVeu0P2OJSQ4cl7ESiixu1MJqaHtwGE6m/3J5w1GZIviV7WJi6MJCRSLWAm67Ze0F09N8Fl24+o1hgipxe5xP/qU/zmV46ZQhDPjMcYvXjJdl74EZtmBLeQMESvBCyfoX56fMoCWf4JiWkraVbo+NmTE2Xl356pcKMrOOd60YXOpZ/c7qhFcL9tHXbDZ7AcUwYK2HxlC9p2hchnGqz/+ydF5DHrV8Pio0c3fT0n1SRs2BLPvFOCrrtv0ZOy2KuFmMOkfZZqIErmvvV9hSFehx5w5synZZqvKEMMxkVFbW1NBCesVBp1qoCAP0oan6RoFTopYC0hWEQUhtXu9yJF9VWFQlg51DQ31RSqDURMZBdMK2FP2IVDY+0byHVKiLBFLkeH51ChxWvpHcidPUvPylJdhlP0qg2ETERs3bnhLYdBjoP+jLs5nU7T2tmz/urcYQOTla8D7Z6/0/qmCs8XHCoPS9HjkkbkPwziNKoOBEwk1NdXvo/5NCoMO9UhLT9tr0JlCw1XiirBaUMA1Bgt4QwvBMWLEiAMKg9ICQn00lZTsnqsyGDlR0Nnp9Uz87sSTCoP+9KCIx3TOSt+zGcTrwkpBM5zP4UWOsckphUFx/wdFebe5+aPnVQZjJwB8hYUPsufKJmTcnlHSkwXW/FGFCcIi6ccQsaBBtpSUtf6IwqC8XlrKnR0d7X9hMHhc47n5z21XGPQVJMpZq7TXIQZCXqJVGcEtIOMShsLpW8kzCoMCe8U4ZW13t2+zymD4eMTKlcstISMhIyOjpOcYM4O9JX4nOAUPvJM8vxkKRrgGeORYkn1dUkNeft4rGGOtVxkIEE8AGbegfuyTQkJubm4d9WDSU+cIg621RsjnDwLAJJ/2n7FmKFhgKwnUInN9u8KgzCDY3tbmWakyECEO4Js/v2gLg06CIjU1dZ+0zzEXg50DA9iCS58VwnxXbUW4vht4rtuipO6BY8qyqqqLC2DQLgZS9Al8vq6mwsIH3lAY9BEMmVmZ72mtGVDBYOPeSFlk9nBXmv/EIUNhgqUNATrGjBlTqTAoNQTcy1YsexTGrVYZCBJLXL5cdwxLO5ZMAHVhUjp0iZFKXQz2DbH0d7uZseNWhkKEC7dCJ9reg1K6FQblhoDv3nsnL06gyY5v0+ZN1EVfY6h7SGg5aIAr/qCkDLYNgXVmuus/MBSgV+hCA3us2lIM0oUfWbdh3ZMweCUDaSxB/ZX6IwUFU3coDPUNh6ysrFO6CesBF4Ndw9j8AWFUcITx6/5jrwwFCbelCHizR2efUxiUHAE+zp+QX1xXV7sEBGhWGUjEAawK1Cxc+Ou/o3wtDHUMC0woPbSV27NFyGDPcLlpKGqF2UnNJhdDYcLggNznvoiF2ZgYQ7aWnkmTJq6orDz/AghxVWUglRFgIf/CosWL1qFM1QpDvQzMqmuBFgY7hiPkfCHMe4eP9KeDYChQiIJ+REqRPpMHYzCeDCRm+/jvjF+1bdvW34Age4BulYFoYdBRealyx7yn5q1FGa4oDPWIBoPvGKyFRunE1XQAqUhs7E8nxyFWT24IMgBBeyyWgsKQ8+z06dNePHTo4EsgzS6gjYF8Ghrr6y//e+nSF18bPz6/HO+K6YenYWTmyKM0buzxdWSwXwT2/ZXgEjB7mNWtpObYqf0eNmxYmcKgfJOow47PumeffWbJ7t3/Xd7S0rQGpCqPsHt3d3Z27Dlx4vj64lXFq2fOnEFjQ+u2SyMEZcWgmXSPvhnsFmFQ0i8ITsEDHwR+j4f/E9fDQJ0VEx7dLo6XvmSFwQjMcI/NG7snP3/chin3TXllxozpq2bNnrVq5v0z/zptWsFrk7436R/YS38T93yAFrCL4X1sgFsZBQBz61L/eV0MNtOlnLssl/K2EleAIgz57qcGTcRIPgOXtAFANjAVBXgceIFiusg829UGKtati0HY5g+az2AMpwNHRxpo0qgFgQKaDBJvBzlLUAQT/J6O3zkgXDrLtqDVQs20kW0oGmgDh+XvFqSnY3dCdRKIjPCuqpD6rDERlnm7SHQhTyGg3Ui0Vd0mvwct5TGFwThOA3XTum3By0RIo7kr/VkS7CBo3h824YRxRCMo4lyzH32wM2SO61pdsqNqg910lz+pkZ0EFVtvkJReKOSANnDGFuM7CoOx7A7qUXTjxEqT2RN+KWwo/SnuuIkZXM96WXp6+l7yUFEYDGdH0AF/3Qz6RBT5rfsm6GhfCSqXYmIMoxIpAZ92BCInJ6dWYTCgXYC96RtpaWllAbmCOsz4GZjee453wRLBCFS01YSSjuJ6Tf5uHj58OHvEhkQEOaZg8nJBG/MBJSbXFS/4kxo5QSh4PoPbWs/+K1qFcjhlNCoMhk00YOjSNWjQICKfVzeTPu4ynwhzsHCKUJoRl/mdAR9QotstanBaa0nhTjB0Oaf3mvLntGbYeYlJ1Il4EVrddzEoTeKMbvGdvM+PwVCx8qvsE1DALkzsSnWRjK9x+zNynhKMe0Flf+RiUFrAzg51Wze01pNi09ht0kMOtQMHDaReoTlg4nLNxaBHPWgrWDhFaF3LxaC03saWAbn4vOlfSy9Fat0ahYEQfQUQsZnGiQHEO2OlHyOlFBROEb/XEIPSQuC0fs2TWswBqQP2jxqVWHvi9CHJSBL6VYlK+uhi4A64TDhFaJOeQWFhQcGSgMOfMN5trvPkLU0OBwoDabhBa4mYnO3HWPhdfblpnAyUW+HyF0R3W4RThGNZIkrlnpeHya7rW00Y/eiQIUNKyQFBYSCTUdA5IgpRKM+4eAJ2qA5zhjWJJpuvcIr4t7IYlGZAyS3yIPypwP8j9yzqHsmBw+rWE2uH1zMzM4/hqMYeyrJKk7JAzxq5pOV2MdTbIBqEQ+TzDMoyDfJ+kTPzk0G6QTcln6dD9EOHDi2Ds8JxjOncke6hw1vcR8TOys46TeujNDumFpDyhwd5XyWVhznqmClQCEZhd8Fywh0uBmVxgrxigP1AKXBOW98LAQ8RlvwMqWUFzgDniGxAtXxedwQfRLl8Z62LoR7ccMRujT/HDYOyrATttQMniCwSNIa7CHQY2E1yy8lVGVBC40FcP3QxlDMGsCz6bdwIDDKXQVF9BjkOraGuVZL2KJGMrjIE8ilcibyN/paW4Z19BdTrIWF3QUUXuRiUlURMsEjYXehIJCpaZUJJ14HX8fVOxvW3QDuD4u2CBrTKTwLflCG4q030BOVID/dl4QShikbhDKD59+0ACWcFBlDHv30F9/yJlk4YDJqQoL1tYEEvh/E/hX+7B/f8GWiM4nlr8Lc3C4fJ51DxVWGUcxD3PAECuyKI1JaBe1f7Jx4MRk4Q0Dj1+QhPA96Ej3cK7t9ATijBPnzc87RwskARc4A2/a4KrgtxHWiw9XXR3wOJMpONGtLd7qfUWxg9L0/pAXHdCfh0jinfEknxO+wOxZe5FGuUowWf3EzBMRmzR8QDvDR2pq5YMAl9wHRMOdbphB0rNPZkIEK8IPEjRzhdqGtiIEJcwD+pS0piC4YDX7TJ0tAN9pB2SekbId8+BkL0KVCHjSIp9hAY84cuBlJIYrxFz5MTpidomQTXIjqWIcMRFlLXSmdSmB2RC0RSbCP9mBJAvY1n3RLlWusbLvMfQav/vUmxj8Cwa02SYg8R2+AGwL/oGXGbCD0psReKlmEmppDJnM9Eyv+YmF1PFkmxndxEW21GAvGTl7swL7RQ/6aRdBpUdpEU+wkMXBwlIfYxL7UQKXdGScjVIin2FMx886Igw0FawxT8cguevSvScqAM40VSbCuUjL4+kiy1bFmngpPy7QgI+SFluhBJsa+glcwiT2h5Ttvb23nkWyHCeulHqVN6W+KRE6BnYpnfJSnxIUSKXBBgHoUuJiLAr/JLInbSn5Z0pINxIa53JlvEpCQljuR/0axw1btHqq0AAAAASUVORK5CYII='

var tractsObj = $firebaseArray(Ref.child('tracts'));
tractsObj.$loaded()
.catch(alert)
.then(function(){

$scope.numberOfTracts=tractsObj.length;
var paymentsObj=[];

var dollarsArray=[];
var sumArray=[];
var finalsumArray = [];
var overallRowCostArray=[];
var overallTemporaryWorkspaceArray=[];
var overallATWSArray=[];
var overallAccessArray=[];
var overallDamagesArray=[];
var overallOtherCostArray=[];
var overallGrandTotalArray=[];

//loop through all tracts
tractsObj.forEach(function(t){
  var landownersArray=[];
  var tractPaymentsArray=[];
  var checksArray = [];
  var paymentCategoriesArray=[];

if(t.landowners){
landownersArray.push(t.landowners)
};
if(t.tenants){
  landownersArray.push(t.tenants);
}

landownersArray.forEach(function(o){

var arr = Object.keys(o).map(function (key) { return o[key]; });
arr.forEach(function(x){
if(x.payments){
  checksArray.push(x.payments)
};
})
});

checksArray.forEach(function(c){
  var arr = Object.keys(c).map(function (key) { return c[key]; });
  arr.forEach(function(z){
paymentCategoriesArray.push(z)
  })

});
var rowArray = [];
var temporaryworkspaceArray = [];
var additionalworkspaceArray = [];
var accessArray = [];
var damagesArray = [];
var otherArray = [];
var totalArray = [];
var grandTotalArray=[];
//get sum of each payment category array
function getSum(total, num) {
return total + num;};
paymentCategoriesArray.forEach(function(p){
  //create arrays for each payment category

  if(p.rowcost!==null&&typeof(p.rowcost)!=='undefined'&&p.rowcost!==''){rowArray.push(p.rowcost);grandTotalArray.push(p.rowcost)}else{rowArray.push(0);grandTotalArray.push(0)};
  if(p.temporaryworkspacecost!==null&&typeof(p.temporaryworkspacecost)!=='undefined'&&p.temporaryworkspacecost!==''){temporaryworkspaceArray.push(p.temporaryworkspacecost);grandTotalArray.push(p.temporaryworkspacecost)}else{temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
  if(p.additionalworkspacecost!==null&&typeof(p.additionalworkspacecost)!=='undefined'&&p.additionalworkspacecost!==''){additionalworkspaceArray.push(p.additionalworkspacecost);grandTotalArray.push(p.additionalworkspacecost)}else{additionalworkspaceArray.push(0);grandTotalArray.push(0)};
  if(p.accesscost!==null&&typeof(p.accesscost)!=='undefined'&&p.accesscost!==''){accessArray.push(p.accesscost);grandTotalArray.push(p.accesscost)}else{accessArray.push(0);grandTotalArray.push(0)};
  if(p.damagescost!==null&&typeof(p.damagescost)!=='undefined'&&p.damagescost!==''){damagesArray.push(p.damagescost);grandTotalArray.push(p.damagescost)}else{damagesArray.push(0);grandTotalArray.push(0)};
  if(p.othercost!==null&&typeof(p.othercost)!=='undefined'&&p.othercost!==''){otherArray.push(p.othercost);grandTotalArray.push(p.othercost)}else{otherArray.push(0);grandTotalArray.push(0)};

  if(rowArray.length>0){var totalRowCost=rowArray.reduce(getSum).toFixed(2)};
  t.rowcost=totalRowCost;
  if(temporaryworkspaceArray.length>0){var totalTemporaryWorkspaceCost=temporaryworkspaceArray.reduce(getSum).toFixed(2)};
  t.temporaryworkspacecost=totalTemporaryWorkspaceCost;
  if(additionalworkspaceArray.length>0){var totalATWSCost=additionalworkspaceArray.reduce(getSum).toFixed(2)};
  t.additionalworkspacecost=totalATWSCost;
  if(accessArray.length>0){var totalAccessCost=accessArray.reduce(getSum).toFixed(2)};
  t.accesscost=totalAccessCost;
  if(damagesArray.length>0){var totalDamagesCost=damagesArray.reduce(getSum).toFixed(2)};
  t.damagescost=totalDamagesCost;
  if(otherArray.length>0){var totalOtherCost=otherArray.reduce(getSum).toFixed(2)};
  t.othercost=totalOtherCost;
  if(grandTotalArray.length>0){var grandtotal=grandTotalArray.reduce(getSum).toFixed(2)};
  t.grandtotal=grandtotal;


  })


dollarsArray.push(t);

//get grand totals for each category


var overallCostsArray=[];



checksArray.forEach(function(g){
  var arr = Object.keys(g).map(function (key) { return g[key]; });
  arr.forEach(function(f){
  overallCostsArray.push(f)
  })
})
    overallCostsArray.forEach(function(i){
    if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){overallRowCostArray.push(i.rowcost);overallGrandTotalArray.push(i.rowcost)} else {overallRowCostArray.push(0);overallGrandTotalArray.push(0)};
    if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){overallTemporaryWorkspaceArray.push(i.temporaryworkspacecost); overallGrandTotalArray.push(i.temporaryworkspacecost)} else {overallTemporaryWorkspaceArray.push(0);overallGrandTotalArray.push(0)};
    if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){overallATWSArray.push(i.additionalworkspacecost); overallGrandTotalArray.push(i.additionalworkspacecost)} else {overallATWSArray.push(0);overallGrandTotalArray.push(0)};
    if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){overallAccessArray.push(i.accesscost); overallGrandTotalArray.push(i.accesscost)} else {overallAccessArray.push(0);overallGrandTotalArray.push(0)};
    if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){overallDamagesArray.push(i.damagescost); overallGrandTotalArray.push(i.damagescost)} else {overallDamagesArray.push(0);overallGrandTotalArray.push(0)};
    if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){overallOtherCostArray.push(i.othercost); overallGrandTotalArray.push(i.othercost)} else {overallOtherCostArray.push(0);overallGrandTotalArray.push(0)};

              });
              function getSum(total, num) {
                  return total + num;
              };

              $scope.overallTemporaryWorkspaceArray = overallTemporaryWorkspaceArray.reduce(getSum).toFixed(2);
              $scope.overallATWSArray = overallATWSArray.reduce(getSum).toFixed(2);
              $scope.overallAccessArray = overallAccessArray.reduce(getSum).toFixed(2);
              $scope.overallDamagesArray = overallDamagesArray.reduce(getSum).toFixed(2);
              $scope.overallOtherCostArray = overallOtherCostArray.reduce(getSum).toFixed(2);
              $scope.overallGrandTotalArray = overallGrandTotalArray.reduce(getSum).toFixed(2);
              $scope.overallRowCostArray = overallRowCostArray.reduce(getSum).toFixed(2);



})//ends tractsObj loop
function getSum(total, num) {
return total + num;};
$scope.payments=dollarsArray;

$scope.currentPage = 0;
 $scope.pageSize = 100;
 $scope.numberOfPages=function(){
      return Math.ceil($scope.payments.length/$scope.pageSize);
  };

function formatTractList(){
    var printableRisks = [];
    var exampletable = [[{text: 'Order', style: 'tableHeader'}, {text: 'Tract', style: 'tableHeader'}, {text: 'Owner', style: 'tableHeader'}, {text: 'Right of Way', style: 'tableHeader'}, {text: 'Temporary Workspace', style: 'tableHeader'},{text: 'ATWS', style: 'tableHeader'},{text: 'Access', style: 'tableHeader'},{text: 'Damages', style: 'tableHeader'},{text: 'Other', style: 'tableHeader'},{text: 'Total Cost', style: 'tableHeader'}]];


dollarsArray.forEach(function(i){

if(i.sequence!==null&&typeof(i.sequence)!=='undefined'&&i.sequence!==''){var sequence=Number(i.sequence)}else{sequence=''};
if(i.tract!==null&&typeof(i.tract)!=='undefined'&&i.tract!==''){var tract=i.tract}else{tract=''};
if(i.owner!==null&&typeof(i.owner)!=='undefined'&&i.owner!==''){var owner=i.owner}else{owner=''};
if(i.rowcost!==null&&typeof(i.rowcost)!=='undefined'&&i.rowcost!==''){var rowcost='$'+i.rowcost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{rowcost=''};
if(i.temporaryworkspacecost!==null&&typeof(i.temporaryworkspacecost)!=='undefined'&&i.temporaryworkspacecost!==''){var temporaryworkspacecost='$'+i.temporaryworkspacecost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{temporaryworkspacecost=''};
if(i.additionalworkspacecost!==null&&typeof(i.additionalworkspacecost)!=='undefined'&&i.additionalworkspacecost!==''){var additionalworkspacecost='$'+i.additionalworkspacecost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{additionalworkspacecost=''};
if(i.accesscost!==null&&typeof(i.accesscost)!=='undefined'&&i.accesscost!==''){var accesscost='$'+i.accesscost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{accesscost=''};
if(i.damagescost!==null&&typeof(i.damagescost)!=='undefined'&&i.damagescost!==''){var damagescost='$'+i.damagescost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{damagescost=''};
if(i.othercost!==null&&typeof(i.othercost)!=='undefined'&&i.othercost!==''){var othercost='$'+i.othercost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{othercost=''};
if(i.grandtotal!==null&&typeof(i.grandtotal)!=='undefined'&&i.grandtotal!==''){var grandtotal='$'+i.grandtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}else{grandtotal=''};


exampletable
.push([sequence,tract,owner,rowcost,temporaryworkspacecost,additionalworkspacecost,accesscost,damagescost,othercost,grandtotal]);


});

exampletable.sort(function(a,b){return a[0]-b[0]});


return exampletable

};

var example = formatTractList();

$scope.example = formatTractList();

var docDefinition = dd;

var currentdate =  new Date().toLocaleDateString();

var rowtotal ='$'+$scope.overallRowCostArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var tempworkspacetotal='$'+$scope.overallTemporaryWorkspaceArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var atwstotal ='$'+$scope.overallATWSArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var accesstotal= '$'+$scope.overallAccessArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var damagestotal='$'+$scope.overallDamagesArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var othertotal='$'+$scope.overallOtherCostArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
var overalltotal='$'+$scope.overallGrandTotalArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

var dd = {
  header: function(currentPage, pageCount) {
  if (currentPage !== 1){
    return {text:'States Edge - Cost Analysis Report' ,alignment:'center' , bold: true, fontSize: 14,margin:[0,5,0,0]}
  }},
footer: function(currentPage, pageCount) {
 return {text:('Page ' + currentPage.toString() + ' of ' + pageCount),alignment: 'center', bold: true }},
content: [
  {table: {
    widths:['50%','50%'],
    body:[
    [{image:'logo',width:50,border:[false,false,false,false]},{text: currentdate, alignment:'right',margin:[0,20,5,0],border:[false,false,false,false]}]
  ]
          }
  },

  {text: 'States Edge - Cost Analysis Report', style: 'header', alignment: 'center'},
  {table: {
                widths: [50,40,275,100,100,100,100,100,100,'*'],
                body: example,
                headerRows: 1,
          },
layout: {
  fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null;  }
  },
},
{table: {
              widths: [50,40,275,100,100,100,100,100,100,'*'],
              body: [[{text:'TOTALS',bold:true},{text:$scope.numberOfTracts,bold:true},'',{text:rowtotal,bold:true},{text:tempworkspacetotal,bold:true},{text:atwstotal,bold:true},{text:accesstotal,bold:true},{text:damagestotal,bold:true},{text:othertotal,bold:true},{text:overalltotal,bold:true}]],
              headerRows: 1,
        },
layout: {
fillColor: '#ffef96'
},
},

],
pageOrientation: 'landscape',
pageSize: 'A3',
pageMargins: [30,30,30,40],

styles: {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 20]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  tableExample: {
    margin: [0, 5, 0, 15]
  },
  tableHeader: {
    bold: true,
    fontSize: 13,
    color: 'white',
    fillColor: 'blue',
    alignment: 'center'
  }
},
defaultStyle: {
  // alignment: 'justify'
},
images: {
  logo:mtsLogo

}

}





$scope.printPDF = function(){
  pdfMake.createPdf(dd).download('Cost Analysis Report.pdf');
}

$scope.exportData=(function() {
  var excelArray = example;
  excelArray.splice(0,1);
var file = "https://firebasestorage.googleapis.com/v0/b/fieldbook-f4928.appspot.com/o/reportTemplates%2FCostAnalysisReport.xlsx?alt=media&token=0a720466-4b82-41dd-b7a1-e4f97e302d2f";
var req = new XMLHttpRequest();
req.open("GET", file, true);
req.responseType = "arraybuffer";
req.onreadystatechange = function () {
    if (req.readyState === 4 && req.status === 200){
        XlsxPopulate.fromDataAsync(req.response)
            .then(function (workbook) {


workbook.sheet(0).cell("A4").value(
  example

);
var dataRange = (3 + excelArray.length).toString();
workbook.sheet(0).range("A3:J3").style("border","medium");
workbook.sheet(0).range("A4:J"+dataRange).style("border",true);


workbook.outputAsync()
    .then(function (blob) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // If IE, you must uses a different method.
            window.navigator.msSaveOrOpenBlob(blob, "Cost Analysis Report.xlsx");
        } else {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = "Cost Analysis Report.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    });
            });
    }
};

req.send();

          });




}); //end of tractsObj snapshot


      $scope.orderByField = 'sequence';
      $scope.reverseSort = false;

      $scope.orderBy = function(fld, e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        $scope.orderByField=fld;
        $scope.reverseSort = !$scope.reverseSort;
      }

      $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
      }




  //And then, in the docdefinition, I did this:




  })
