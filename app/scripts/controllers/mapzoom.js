
'use strict';
/**
 * @ngdoc function
 * @name mts.fieldbook.controller:MapZoomCtrl
 * @description
 * # MainCtrl
 * Controller of the mts.fieldbook
 */
angular.module('mts.fieldbook')

// .factory('MapZoom', ['$firebaseObject', 'Ref', 'ROW',
//   function($firebaseObject, Ref, ROW) {
//     return function(mapid) {
//
//       var m = mapid;
//       if (mapid === "new") {
//         m = Ref.child('centroids').push().key;
//
//       }
//       var mapRef = Ref.child('centroids').child(m);
//       var mapObj = $firebaseObject(mapRef);
//
//
//       return mapObj;
//
//     };
//   }
//
// ])

  .controller('MapZoomCtrl', ['$firebaseArray','$firebaseObject', '$location','$q','$firebaseAuth', '$routeParams', '$scope', '$rootScope','$timeout', 'Ref', 'LOCATIONS', 'user', 'Auth', 'ROW','WORKSPACE',
    function ($firebaseArray, $firebaseObject, $location,$q,$firebaseAuth, $routeParams, $scope, $rootScope, $timeout, Ref, LOCATIONS, user, Auth, WORKSPACE, ROW) {
      var newmapdata;
      var newmapdata2;
      var parsedData;
      var parsedData2;
      var text ="";
      var coords = "";
      var geoArr = [];
      var zoomedTract=[];
      var zoomedPropertyText = "";

// console.log($routeParams.mapid)

var centroid = $firebaseObject(Ref.child('centroids').child($routeParams.mapid));

            centroid.$loaded()
              .catch(alert)
              .then(function() {
var centroidLat = centroid.latitude;
var centroidLong = centroid.longitude;
var centroidTract = "Tract "+centroid.tract;

      //
      $.AdminLTE.layout.fix();

      // var map = new google.maps.Map(document.getElementById('map'), {
      //
      //             center: {lat: Number(centroidLat), lng: Number(centroidLong)},
      //             zoom: 16,
      //             mapTypeId: 'hybrid'
      //
      //           });

var obj = $firebaseArray(Ref.child('tracts'));

            obj.$loaded()
              .catch(alert)
              .then(function() {

                var finalmapdata= {};
                var newmaparray = [];
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

obj.forEach(function(x){
//JOIN function using extend
Ref.child('tracts').child(x.$id).on('value', function(tractSnap){
  var tractRecords = extend({}, tractSnap.val());
  Ref.child('geometry').child(tractSnap.key).once('value',function(geoSnap){

      geoArr.push(extend({}, x, geoSnap.val()) );

  });

});

});//end forEach loop on 'tracts'

var mapMarker ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAABHNCSVQICAgIfAhkiAAAIABJREFUeJzt3XuUXWV9N/Dv97fPmRCCmtvMBCQIUkuBAmYmilgvpQqSmXDpDe1Nqb6u2r7L1bevtaWWdr28VZcXql1WtLX2RalUhRZFMhOQIhouJZCZXMAEMAFCuGQmCRASMpk5ez/f948zQS5J5nbOec7e5/dZy7VcCZzzPcw+33n2s5+9H8A555xzzjnnnHPOOeecc84555xzzjnnnHPOOeecc84555xzzjnnnHPOOeecc84555xzzjlXHIwdwOXTkhseO2bWrCOOHAvhuBBoLPHVScBrwsv+OQOQGXYr1XNmCm1mj42O7t+39sLjnoyR2+WbF5Y7rO6bd/6SpeGUCnisUSdQnCvDqxU0z4DZAhaTMAHzklmzj4D00hcgkY2O7CfwjIRAYFsARmh8hgHPiXo2iI+UocfHyni4NL/9pwNLWYnzaV2z88JyL/HGH+54ZzKKt6uENxI6QcJRAOdSmIPE5jBJAAkvFJMCBLz0z16OBMjqwUZ7yZ8py4AsPC/qeYB7SOwVsJkp1mWzcPu6c9t/Uv9P7fLCC6uFLb1p15uVhdNhOBFBZwI4DcQCAIQZSAMkSAJwmEKaKRIAwQMlpgCEAACCsAvAfTCuRsAWJrZhzXkL7qlPENfsvLBazBl9w28sge8Qw1sB/jKAX7By2yyEDAp1LqapOlBkRsAShMrYKIDNgO6n7K4UWrW+t2Nd7JiucbywWkT3TU92KZT+BMA7AHZaKXk1gqqjmWYpqImQ1VGfESHNngM0BGgVzb4ycF77YOx4rv68sAqse+WOHgW9C1CvlcongQRCyFdJHcoL5VWdEwuVyqMk/xPEjwaWtfdHTufqxAurYLpvefo1SivnU/xNAd1myWJBB+aEiosGkggh20ZgQNR/Zvv3rVj/6yc8Gzuaqx0vrAL55f4d75ylcClo3TC2E4RCFjtWQ9ESVAtaO0SsSxC+eu+yzu/FzuVqwwsr5173vUfmLph11J9QuoCzjjgTIasuFVDBR1QToYFJAphBo6OrRf4gG937FR9x5ZsXVk6dfvX2OaWFyXJIfwLyTBpnFf60b7rMoBBGJawj7R/TUvr9Decuej52LDd1Xlg59KaVO9+UKXyMwK/RkvZCTKLXGwlagpCluyjcDiSfGehdsDp2LDc1Xlg58pa+XSdXEP5Qpj9OSrOOCmnFT/2migaWSgfWdH2tNJb90z0XHb0xdiw3OV5YOdG1ctclCOHPQJ1KWuJFNUNkdRU/8FMTvrqmt+PK2JHcxLywmtySvl0nG9L/CdolIOc01Ur0vGP1diAF7QNxlQV9/V5fOd/UvLCaWPeK4Q/I8BdmySmS/PSvXsavKCpNtwjZpwZ7Fl0VO5I7OC+sJrWkf8fnDfgQS6V5Sv1pK43AUhlKK88I+Mbw3tG/fvzixSOxM7mX8sJqMktufuYMy8Y+J/BdPlcVAQ1SyAjemoB/fU/PwjWxI7mfs9gB3M91rxj+baaVb1jb7HNJelnFoACSibXNOjeDvrGkb+cfxI7kfs5HWE1iad/OPwoIf2OJvVa+ALQp0BKEkG032v9Zs2zhP8fO47ywmkJ3//DlEC5lYm1eVk3GDMgyiPrUYM+iy2LHaXVeWBF137TjaITwN4JdYsbZXlZNygzKwhjJb4+m4S/vv6BzKHakVlWKHaCVBenvDHw/ibKXVRMLAeOj398vl5kC+B+xI7UqH2FFcPoPt3eUUvt0csSRHwqjI74QNC9I2KzZyPbv+9e0FD6x4dxFw7EjtRovrAZbcsvOYzAWriDxXpLmZZUzJCQFCd9Fm/352nMW+v6KDeSnhA3GSvg7Er8FmvmyhRySQJoR4bdUCSMAPhQ7UivxdVgN1NU//MnSkUd9EGTZyyrHFACyXJp91Ae7+oY+FztOK/FTwgbp7h/+FMA/BTHHTwMLorqH4vOgXTm4rP0vY8dpBT7CaoA39g99WMAHYfSyKhIJtGQOED7Q1b/jw7HjtAIfYdXZmTfv6E6zcCus9Bq02IYQLcMSIGS7FcrnDy6fd3vsOEXmI6w6WnrDjiWVDF9hUvayKrKQgUnpNWDli2f0PfPG2HGKzAurTk6/evuc0IY/I/TmVttqqxUpZCDUnVj6v0+/evuc2HmKygurTsoL7ROQ3geaLwxtBVL11FB6X3mhfSJ2nKLyOaw66F45/DaJN9A437feajFmUNDTCJWLBpcf4/NZNeYjrBp76w+3dyjgU2bmZdWKQoCZzZeVPr3klp3HxI5TNF5YNbY/tb+i8R3yhaEtSwow8m2s6K9iZykaL6wa6lox/B4I7+f4FlKuRUkgCSD8/pK+4fNixykSL6waouEyS5L5/qgYpxBgVpprxF/HzlIkXlg10t03dJnAt/ipoDtAChD4lu6+IX9SaY14YdXA0ht2niTyfWZW8lNB9wIJZlYS+b6lN+w8KXacIvDCqoEsyf7ULDnVF4i6l1PIYJacmiXZn8bOUgS+DmuGlq4YemsgbqHZkT66cgdFQiHsM+GcNcs774odJ898hDVDov2uldu8rNyhSbBy25Gi/W7sKHnnhTUDS1cMvRXQe/1U0E2keozovdVjxk2XF9YMBLM/gtlCX9HuJhQCYLYwmP1R7Ch55oU1Td19288G8PbqAkHnJjZ+rLx9/Nhx0+CFNW38TTM7wU8H3WRVrxjaCQB/M3aWvPLhwTQs+9nPZg3/bO52EHNberKdHB81EJhopCkBECS19m1LJCA82/GGZxetfMMbRmPHyRvf5msahjfPfx9LNldpJXaUxiNBSwBLoMpoJUjbAewBsJfAyMH+FQGzARwF4FUEFrE8q4yQVSeiW628JLBUnju8ef77AHwzdpy88cKaBim7hGqhwSkJ0qollVb2hSxbi1C5T8RDlNZnnPXw+mXzHj3cS5yx8pnjE42+PpBnMN3/i5CdRmAJS21HImSQQuuUlwQpuwReWFPWQt+62ujuG7oQ5L+A1l74vQXHT/ek8ByFTZL+Y/+s8rUbz5n/WC1e/pRbnj7uiNHKxSR/S8TJpL0aaIFTRjMghB2QPjzQ23lD7Dh54iOsqSLeBqDYZTV+2heydITAKhJ95VnJ9Xe/a8ETtXyb8eK74i237vp2ZSz7DUi9gt5hSWl2oU8Xq8tg2kW+E4AX1hT4CGsKTlu586Ry0P+zUvJWZWnsOHVBM4QQUgCDBL4x0NPx1Ua+f3f/8B8LuARAl5mVivqoHiYlqJKuziz74LqeozfGzpMXvqxhCmZBS4BwWmGXMliCkIU9ED5xxP5wfqPLCgAGejq+esT+cD6ET4Qs7IEljY7QEAoZRJ2SWOmM2FnyxE8JpyCAbyJ5FIp2pnJgrirL7gf1mcGezmtixrnrNxYNA/h8V//Qk8qyS2n2y4Wb26o+lfQoBrwVwLdjx8kLH2FNhcJvAyCK1FgH1k9l4VpY+fdil9WLDfZ0XgMr/x6ycC2Aidd65Q8DdGHsEHniI6wpsHLbYlXGYseoHRqkLBD2b2uWd1zSjHUwuGzeBgHvXdq/Y0QIf0AmVqQLHlZuWxw7Q574CGuSuvt3XlSoaxTVTRICAq8a6GlvyrI6gAAGetovQeBVQAjFGmlx/Nhyk+GFNUlB2YWF+c1Ojj9UDv/StqD9o7HjTFbbgvaPKuBfDuQvBIXqseUmxQtrMtaobGYnF2nSV5nuskrlU3efxYPeTtOM7j6LI1apfEqZivPUzupz30/GGpVjR8kDL6xJWLpr+E0C2gtRWJYA0mMQLl1z0Wu3xY4zVWsueu02CJdCeqwQSx4kCGhfumv4TbGj5IEX1iSEjCdBoSP3W3iRUJbuyYTPDi5vvz12nOkaXN5+eyZ8Vlm6J++nhtV7KENHyOi76kyCF9bknGiltqPyPsJiqQ0w/PANz7d/PXaWmXrD8+1fh+GHLLXFjjIzEqzUdhSAE2NHyQMvrMlZlPff5DRDqIw+zaArr7uYuV+bcd3FHGPQlaEy+jQt54dx9dhaFDtGHuT8J11/Z6586niCx+Z7dEUoBEn41kDvottip6mVgd5Ft0n4lkJQrpecSCB47Jkrnzo+dpRm54U1gZSl+YAW5LmwaASA7QlxbewstTb+mbaPf8Z8qj6NdUH1WHOH44U1EWGRgGPzPOEuCRJWrenpuDN2llpb09Nxp4RVyvEvFClAwLGQnxZOxAtrAiHDqyHMy+0Ii4Sk/TReHTtKvdB4taT9uZ1nlABhXsjw6thRmp0X1gTMOI/M73+n6oQ0Hxyau7Awc1cvV/1sfDDPk+8kzIzzYudodvn9CTcIEV6V29/cAGAJiHDX4zla0T5Vj5/FESLcleuFpGT1WHOH5U9rmEAQFwMy5vUqVJZB5P2xY9SbyPuZ5fTBigIEmUR/csMEfIQ1ATK8Cnm9Zm6GoOwJQQ/GjlJvgh4Myp5Afk8LOX6sucPI7U/XTYzVTTuHMcatsbPU3Ri3Qhhmnk/f3YS8sCbAwHnV70AerxISFJ5Ze2HH5thJ6m3thR2bKTyTz8Gwqk/MCT7pPhEvrAkE4jgop/+dSIjYGztGo4jYm9sLJIIF4rjYMZpdPr+IDUQiIJ/Dq6qgnM5ET0O+P6vGjzV3GF5YBZfntUlT1UqftVX5T3gCEggop+cZLj/EfN/B3RheWBMgMAYwt6eEOb4FssVQAPbHTtHsvLAmpK3I8xwW1To/Y+V3JCxAoAp/NXemWudgnr591bbK4Xehurvw7NgxGkW5/azVY4sBeb5o0BBeWBOQ5Xh0BUDAvNP6dx0bO0e9jX/G+bl9qgbyf6w1ghfWRGTDEJTHAVZ1AkvtbcyOjx2l3qqfUe25nLQjAEGQDceO0uy8sCZAww4ac/gtABQEAsdLPDl2lnqTeDKB4xXyOUihMdCwI3aOZueFNQEFPY3cTroLVp4FQoXfQorQSVaehdz+qACNH2vuMLywJiBht6TcXm5WyCDprNg56k3SWQr5nbOWtF/C7tg5mp0X1gTEbBeChsh8/qdSyEDaG9/Ut+MdsbPUy5L+nUtJOyOvhUUaEDQkZrtiZ2l2+fwWNtBs4VEktiW3z1mq7shyZAb9buwo9WLQBwHNye0VQjMgsS2zhUdjR2l2Of0WNs5/9x69lcJQbp8CAICWAKZzuq99snBPA+i+9snjxPAe5vnxyCAo7dr9/KKnYidpdl5Yk0E9ltvf3gAUAiCegDmlj8XOUnNzSh+DeIJCLi/kjhMEPLqxADty15sX1iQI9pDSyu78jrIEs4QA3v3m7z91Suw0tTL+Wd5d/Ww5/YVConps6YHYUfLAC2syTJtEDOd14h0Yn3wvl09J25IPx85SK2lb8mGWy6fkdbIdqE64ixiG2abYWfIgv9/ABhp8T/sAgafyO8Kqqn6x+YHu/qHcT8B337T9dwB+IM9lBWB8ey88Nfie9oHYUfLAC2uSQqZ7kOMRFgAgBJCYF4CPnbHyqeNjx5mut9y0bb6C/S8S85DruSsAtOqx5SYl59/AxmHZvsMkz1eixgkwJl2JSl+IHWW6xsIR/0zizbFz1AKTBCzbd2LnyIt8n+M0WFf/0B6CR8XOMWMkYAmQZZ/BsoV/O0BWYkeajG6pjJU7/y+T5FKFDHm+cnuAoL2DPZ2+H+Ek+QhrKsTbkNvLUS8iHXiSw0ewctdlseNM2spdlwH6iBQKUVYANH5MuUnywpoCEncCYCEGpiGAlswV9fGu/qG/jR1nIl39Q38r6uO0ZG7u560AjB9DHD+m3CSVYgfIk4zZjxKVNjCx05Xl/OoUXrjPcDZL5cu7+ocXZmH0s+uXL34idq4XO2PFttcmNusvrVT6qLKA3F8VHMfEoCxsyJj+KHaWPPER1hSsW3b0vSLWF2KEdYAClAVQ+JCx7Qvd/U+fFjvSAd39T59mbPsChQ8pCwXbUYMQsX7dsqPvjZ0kT7ywpsgC71SWPZ/3NVkvoQCYHWnkxULWt2TF0AWxIy1ZMXSBkPUZeTHMjixUWZFQlj1vgX46OEVeWFNUSkauA7Al92uyXm68ECxJFjPhdd0rh288fcXwexod4/QVw+/pXjl8IxNeZ0my+MXZCqN67GwZP5bcFBRomNA4S/qHPp8kbX+uLBerAaZufPQohSEI12Vm/7l+WfuP6/mWS/uHf0XgRUL4A9I6xwPU8y2jYVJGlo1dsban8+Oxs+SNF9Y0nPq94ROPmG2bEYQirHI4lOrW70QIYRjSQLDkqllt6arV7+ocqsXrn3nrUOfoWOkdFrI/BLGEtEUkCzOxfnAEjNg/En7hp7/esSV2mrzxwpqmrr6hG5kky4txiX0CZoAESSmAzQJvM8OggAfbUnv47uULJnVl8e037Th6b4Y3GHV8gM4k+GsAfoFkCSRa5b+lsmzFYG/n+bGj5JEva5gu8nqF8KskjyrqqcsLxotkvFh+ychfUhAo7agk2cNd/cPDJHdBYQTCkwraAwA0vgrEMYAdCeg1+4IWGXkiaO2JEZLGF7GqsKd/L1EdPe5FwutjR8krL6xp2r8X1x0xh7/DJDlHWRo7TmOMF8sL1UJrpyXtJKvzXhJCWslozABARGKlcnLg7yCNP0wwQEU+6zsEWgKkund3yFbEzpJXBbvU1TgbL+7YS+pWZdlooZY4TIUClKVQWoEqY1BaAcEExjYY2wgmL/47ZWnxrvhNVnUpwyiImzf3HO37D06TF9YMlOeNfknSZuZ1g4q6ePEpXguc5k0SzSBp89C8LV+KnSXP/Js2A3eftXgEpi9Vdxtu0VGWmwRCQYDpS4+fddZI7DR55oU1QyolK6Bwn4+y3KHQDFC4T6XE565myL9lM7T2nIVPArhGytCyc1nu0EioeoXhmvFjxc2AF1YNjLwOVwbhjjxvUuHqgzQE4Y6R1+HK2FmKwL9hNbDx1I69MLsmhDDioyz3AhIhhBGYXbPx1I69seMUgX+7aqirb3jQSqUlLbMuyx0WkxJCWlk72NvZFTtLUfgIq4aI8LGQpc8V7kkObupoCFm6F9Sfx45SJP7NqqGB3kW3UbiW5gPXVkcSJP/jxL277oidpUi8sGrNSt8MWbaNVoAtwdy00BKEkG0D9K/XXXzqWOw8ReKFVWMDy+bfAdpnFDL5BHwLqt7gLNA+M7Csw0dXNebfqDrp6hu6g0nyKy3xyBT3c9XHx9w52Nv5tthRishHWPVCfFUh2+0r4FsHzaCQ7Qbx1dhZisq/TXUy2NN5DWhfCyELfmrYAkhUf9b2tcGezmtixykqL6w6Yin5MsFBn4AvPloCgoMsJV+OnaXIvLDqaOCc+Y9J4fKQpZmPsgqMRMjSTAqXD5wz/7HYcYrMC6vOBnsXrSD53dg5XH2R/O5g7yJ/GkOdeWE1wCjCZwWtY+JPpC4aJiUIWjeK8NnYWVqBF1YD3L+scwMDrwxZ9rTftlMgNIQse5qBV96/rHND7DitwL89DTLQ2/51Uf/GUjl2FFcjLJUh6t8Getu/HjtLq/CZ4Abr6ht+zJJkcbE3Cy0+WoKQZdsGezuOi52llfgIq8FIXRpC2OFLHfKreq9g2EHq0thZWo0XVoMN9HT+O4VrpWzMlzrkUPWRx2MUrh3o6fz32HFajRdWDNQXBfpVwxyqXhXkOlBfjJ2lFfmv+EiWfv+JxaGtbRPJOS27uWje0CDpeRsbO3nNRa/dFjtOK/IRViTVA17/IMmfA58HJCSNAPoHL6t4vLAi2jW7/ZOCVvsTHZofzSBo9a7Z7Z+MnaWV+Tcloq1nc39C+4iysN7XZzUvlspQFtYntI9sPZv7Y+dpZV5Yka1ZtvBBgJ8LacVPDZsRiZBWRgB+rvqzcjF5YTWBgZ6F/w7YDdWNWL20mgdR/ZnYDdWfkYvNC6tJ7N+74P1Sttp33GkeNELKVu/fu+D9sbO4Ki+sJrHxYlYoXB5CGPZV8PGNr2YfpnD5xotZiZ3HVXlhNZE1PR0rCfyTFODzWRGRkAII/NOano6VseO4n/NvRRNa0jf8PTNeBCl2lNZEIgR9f21vx6/HjuJeykdYTYhKPymFh/zUsPFoCaTwEJX6eqsm5IXVhAaXHzMQyE8HhT3+wL8GoiEo7AnkpweXHzMQO457Jf82NKl1yzq+SeFbPpfVQCQofGvdso5vxo7iDs4Lq4mxrXyFstSf6tAATEpQlq5jW/mK2FncoXlhNbE17577MBO7TFm21eez6oeWQFm2lYldtubdcx+OnccdmhdWkxs4r71P5JdDyFI/PayD6o7NqcgvD5zX3hc7jjs8/wbkRFf/8I+t1PZOpWOxoxQKS20I6dhPBns6fjV2FjcxH2HlBFH6aEhHH/RTw9qhJVBa2WIh+YvYWdzkeGHlxEDP/PsofE0he9aXOtQADQrZs0HhK2uWL7gndhw3OX7k58iY9l8l8UaW/KrhTLFUgsQbU+2/KnYWN3k+h5VDXf3DD1qp/ItK/Z7c6WCpjJBWHhrs6TgpdhY3NT7CyiGj/l7p2LN+1XAaaFBaedaov48dxU2dH/E51dU//B0Av03S/CbpySIAIQA/WNvTcWHsNG7qfISVUzZW+TjEu30V/ORV5/7437BZH4udxU2Pj7BybOmKoXcHw/fJxPc2nAgJQWMALhhc1nFz7DhuenyElWNrlnf+F2Arq792/HfPobH6v8AbvazyzQsr50pp+S8QwgM+AX8YJKDwQCnLPh47ipsZL6ycu+eCuY+I+EcpPOcLSg+CBik8J+If77lg0SOx47iZ8SO8ANIkfJOB1/uC0ldiqQQGXp8mwZ9xVQB+HlEQXSuHTqd4I82OU/AJeGB8e/kQHhN1/uCyzg2x87iZ8xFWQQwu69wg8TtBIfh8FqqPjVEIEr/jZVUcfmQXTFf/jv8m8ZaWX0xKQsLdgz3tZ8WO4mrHR1gFI+nzkrbTWvdHSzNI2i7p87GzuNpq3aO6oNb2dlxvQD9aeQV8UoIB/Wt7O66PHcXVlhdWAWVKrtDY2FYmrfewPyYJNDa2NVPim0kUkBdWAa3tXbApMFwX0hZ7DjyJkGZpYLhube+CTbHjuNrzwiqotpRXkNjcaoVFYnNbSh9dFZQXVkGtvqBzSMJnFcJoS5QWifHPesXqCzqHYsdx9eGFVWCDPT/9FoBbW2HjivHPeOvIEfpu7Cyufrywioxnp5L9IKTpWKFHWSRCmo5J9oONZ3fsjR3H1U+Bj2J3wJK+oR+a2TmFXUxKIoRwy9reznNjR3H15SOsFmDAlZJ2FfJpDjRI2mXAlbGjuPor4BHsXm7nkR03I2hVEVe/0wwIWrXzSH8wXyso3hHsXmHr2dwP2BeVpXsLNcqiQVm6F7AvVj+jK7oCHb3ucAaXt98O4LYiXTGkGSDeMf7ZXAvwwmotK0NaKca6rOqVwVFQP4gdxTVOAY5cNxVd/cOrSb4591cMSUi6Z7Cn48zYUVzj+Air1VD9AkZyPcoiIWA/yP7YUVxjeWG1mFJl1tUI4YE8z2WNXxl8RNQ1sbO4xvLCajH3XDD3EULXIs9LHCwBiW+uPa9jc+worrFyfNS66UrLdlOojO3KZWmZIVTGdqUl+LqrFpTDI9bN1PpzO9aB/DFzuCaLNID88fpzO9bFzuIaL39HrKsJQjcqy/blavKdhLJsH6EbY0dxceToaHW11tW3YwuNr4dyso8hDQp6eLC3/cTYUVwcPsJqZVQfFCq5GGWRqGZVX+woLh4vrBZG4loB25mDwmJ17dV2EtfGzuLi8cJqZWn6gIRVudgSLCmB4u2zlT0YO4qLxwurhQ2cf8xOEd9XWkFTnxaSUKUCJFhxR8/RO2LHcfF4YbW4ZP/InQoaaOZnZdESBGhwJNt7W+wsLq7mPUpdQwz8xuuegnGNsua9UigJlO7f2HvC9thZXFxeWA4J+K+CmvPhfiQQsr1Gfi12FBdfE09cuEbq6t+xntDpsXMcTADuW9vT0ZTZXGM14a9UFwOpPpDNtR0YCZBjRqyIHcU1By8sBwAIqW6E8GQz3V9IEgh6KqR+K46rap6j00W1LyT3A/gJkiZ6TlZSgsC7ZpWP8LVXDoAXlhv34IUL9wRglSpjaorTQhKqjEnEf9193muejh3HNQcvLPeCINwhYFMznBaSBoGbQhvuiJ3FNY/4R6ZrGut72x8CtDF2DgCobpERHlj/7vaHIkdxTcQLy72EkFwdQsiinhaSUAiZMn0jXgjXjJpgssI1m67+4adILoq2FVh1C6/tgz0dR8cJ4JqVj7DcK5F3IupT/RSqGZx7KS8s9woK4QaJcXaIJiFxVCHc0Pg3d83OC8sdRGkNoPtj7F1YfU/dX83g3Et5YblXWNu7YBPAtVFuhqYB4NpqBudeygvLHZSJd4R0rLFb2pMI6diIib72yh2UF5Y7KCLcAuCRho6yqu/1yPh7O/cKXljuoO7t7dgO8IEDSzgbQwD4QPW9nXslLyx3SAH6toLShpwWklBQGkL6nfq/mcsrLyx3SOt6Ov4DwHONe0ftWXfvou817v1c3nhhucMjftyQs0IBIG/D5Uwb8G4up7yw3ATCzaBCXU8LSYAKQLi5fm/iisALyx1eZpsAPFX3wgKeGn8v5w7JC8sd1uDy9tsh3lvPVe+0BBDvHVzefnvd3sQVgheWmwRtUFpBfR7uQVRfWxvq8OKuYLyw3IQI3C1gV11OC0kI2EXg7tq/uCsafx6Wm5SulTu2GO31CllNX5eWICg8PLis/cSavrArJB9huckR7qp1WQGAQgYId9X8hV0heWG5yTH7kYDarnqvng6mMPtR7V7UFZkXlpuUUBm5A8Du2s4iEAB2j7+2cxPywnKTksCeILiKNRxhkQTBVQnsiZq9qCs0Lyw3KQPnH7MPCoOwGh4yZoDC4MD5x+yr3Yu6IvPCcpNnNqi0sq8m81gklFb2wWxw5i/mWoUXlpu0RLYBwqZarHqvrm7HpkTmC0bdpHlhuUm7p2fB4wIfqc3EOyHwkXt6FjxegxdzLcILy02JyHtDls5seQOJkKWpyHtrl8yqXos+AAADYUlEQVS1Ai8sNyUm/oTQnpmNsghCe0z8Sc2CuZbgt+a4KevqH95Gs2MRprk5tBkUwuODPR2La5vMFZ2PsNyUCVg/7bICgBCqr+HcFHlhuWmwVdO+TefA7TiwVbXP5YrOC8tNHbMBAPtn8Ar7x1/DuSnxwnJTVgq2DZjeeqzxf2fT+Gs4NyVeWG7KQqg8DnDttG7Tqf47G0bLC/3+QTdlXlhuygbOP2Yflf10uiMsShs3nMvn6xDNFZwXlpsWmT0YRkd2T2ninUQYHdkt40/rl8wVmReWm5ZSJTwEcCuncFpIGiRso7C5jtFcgXlhuWm554JFj0h4EpzCIWQGkk8O9HRsqV8yV2ReWG76iPXVLbomR1mKQPlmqW7avLDc9IVwH4DKpOaxSECqMNOauudyheWF5aZNJa4GOPkhFlhRib7/oJs2v/nZzUhX/44hEh2QDv8PVkdhOweWtbc3IpcrJh9huZkRBqGJ2gqAJAn+dFE3I15YbkZoWishHH4eixAQIK1rWDBXSF5Yboa4hcThnzVDgEAg6FcI3Yx4YbkZycweAznBBquEhN0ZwtaGBXOF5IXlZqREPqWgzYdb8U4jAGwtgzsaFswVkheWm5EkqewA+fhh57BokPFRANsblcsVkxeWm5HV7+ocArCFh7lFhzRQ2Hxvb4cXlpsRLyw3cyHslA497y4FIISdDUzkCsoLy80YjY8qrTx70BuhaVBaeZbVU0LnZsQLy82YAocEPnuwaSwSEPisAocan8wVjReWmzHOOWITgOGDj7AIELvaYA83PJgrHC8sN2MDZ79qJ6h9B/9bAsCeu5cv8Ge4uxnzwnI1oYDhQ/5lpucaGMUVmBeWq40ED+BgVwolgH7Ts6sNLyxXGym3HuyZDZIg8ZHGB3JF5IXlaqINlfXVEdaLLxUSkEBUfhYrlysWf4Cfq5nu/mGNPwq5+gfj/39NT8dUNgNz7pB8hOXqi5CXlasVLyxXMwKfx8vnsfSKP3Fu2rywXA2FLXhxP0kAeH+0OK5wSrEDuCLhbpZnHXj+FRQEpaMjkUO5AvHCcjVj4N+EyujrX/xnIWhbrDzOOeecc84555xzzjnnnHPOOeecc84555xzzjnnnHPOOeecc84555xzzjnnnHPOOeecc84555rZ/wftK5PqKBMiEgAAAABJRU5ErkJggg=='


  setTimeout(function(){
    geoArr.forEach(function (i){

      var tract,address,city,state,surveydenied,zip,type,county,acquireddate,acquisitionapproved,acres,surveypermissionapproved,surveypermission,specialconditions,titlecomplete,parcelid,id,owner,geometry,civilsurveycomplete, civilsurveyapproved,biosurvey,culturalsurvey,environmentalsurveyapproved,negotiations,condemnation;

      if(i.tract!==null&&typeof(i.tract)!=='undefined'&&i.tract!==''){tract=i.tract}else{tract=''};
      if(i.address!==null&&typeof(i.address)!=='undefined'&&i.address!==''){address=i.address}else{address=''};
      if(i.city!==null&&typeof(i.city)!=='undefined'&&i.city!==''){city=i.city}else{city=''};
      if(i.state!==null&&typeof(i.state)!=='undefined'&&i.state!==''){state=i.state}else{state=''};
      if(i.zip!==null&&typeof(i.zip)!=='undefined'&&i.zip!==''){zip=i.zip}else{zip=''};
      if(i.type!==null&&typeof(i.type)!=='undefined'&&i.type!==''){type=i.type}else{type=''};
      if(i.county!==null&&typeof(i.county)!=='undefined'&&i.county!==''){county=i.county}else{county=''};
      if(i.acres!==null&&typeof(i.acres)!=='undefined'&&i.acres!==''){acres=i.acres}else{acres=''};
      if(i.surveypermission!==null&&typeof(i.surveypermission)!=='undefined'&&i.surveypermission!==''){surveypermission=i.surveypermission}else{surveypermission=''};
      if(i.surveypermissionapproved!==null&&typeof(i.surveypermissionapproved)!=='undefined'&&i.surveypermissionapproved!==''){surveypermissionapproved=i.surveypermissionapproved}else{surveypermissionapproved=''};
      if(i.specialconditions!==null&&typeof(i.specialconditions)!=='undefined'&&i.specialconditions!==''){specialconditions=i.specialconditions}else{specialconditions=''};
      if(i.surveydenied!==null&&typeof(i.surveydenied)!=='undefined'&&i.surveydenied!==''){surveydenied=i.surveydenied}else{surveydenied=''};
      if(i.parcelid!==null&&typeof(i.parcelid)!=='undefined'&&i.parcelid!==''){parcelid=i.parcelid}else{parcelid=''};
      if(i.titlecomplete!==null&&typeof(i.titlecomplete)!=='undefined'&&i.titlecomplete!==''){titlecomplete=i.titlecomplete}else{titlecomplete=''};
      if(i.id!==null&&typeof(i.id)!=='undefined'&&i.id!==''){id=i.id}else{id=''};
      if(i.owner!==null&&typeof(i.owner)!=='undefined'&&i.owner!==''){owner=i.owner}else{owner=''};
      if(i.geometry !== null && i.geometry !=='' && typeof(i.geometry)!=='undefined'){geometry=i.geometry}else {geometry='[0,0]'};
      if(i.acquireddate !== null && i.acquireddate !=='' && typeof(i.acquireddate)!=='undefined'){acquireddate=i.acquireddate}else {acquireddate=''};
      if(i.acquisitionapproved !== null && i.acquisitionapproved !=='' && typeof(i.acquisitionapproved)!=='undefined'){acquisitionapproved=i.acquisitionapproved}else {acquisitionapproved=''};
      if(i.civilsurveycomplete !== null && i.civilsurveycomplete !=='' && typeof(i.civilsurveycomplete)!=='undefined'){civilsurveycomplete=i.civilsurveycomplete}else {civilsurveycomplete=''};
      if(i.civilsurveyapproved !== null && i.civilsurveyapproved !=='' && typeof(i.civilsurveyapproved)!=='undefined'){civilsurveyapproved=i.civilsurveyapproved}else {civilsurveyapproved=''};
      if(i.biosurvey !== null && i.biosurvey !=='' && typeof(i.biosurvey)!=='undefined'){biosurvey=i.biosurvey}else {biosurvey=''};
      if(i.culturalsurvey !== null && i.culturalsurvey !=='' && typeof(i.culturalsurvey)!=='undefined'){culturalsurvey=i.culturalsurvey}else {culturalsurvey=''};
      if(i.environmentalsurveyapproved !== null && i.environmentalsurveyapproved !=='' && typeof(i.environmentalsurveyapproved)!=='undefined'){environmentalsurveyapproved=i.environmentalsurveyapproved}else {environmentalsurveyapproved=''};
      if(i.negotiations!==null&&typeof(i.negotiations)!=='undefined'&&i.negotiations!==''){negotiations=i.negotiations}else{negotiations=''};
      if(i.condemnation!==null&&typeof(i.condemnation)!=='undefined'&&i.condemnation!==''){condemnation=i.condemnation}else{condemnation=''};


                    text += '{"type": "Feature", "properties": { "Tract": "' + tract +'", "Address": "' + address +'","City": "' + city +'","State": "' + state +'", "Survey Denied": "' + surveydenied +'", "Zip": "' + zip +'","Type": "' + type +'", "County": "' + county +'", "Acres": "' +
                     acres +'", "Survey Approved": "' + surveypermissionapproved +'", "Survey Permission": "' + surveypermission +'", "Special Conditions": "' + specialconditions + '", "Acquired": "' + acquireddate + '", "Acquisition Approved": "' + acquisitionapproved +'", "Civil Survey": "' +
                     civilsurveycomplete +'", "Civil Survey Approved": "' + civilsurveyapproved +'", "Bio Survey": "' + biosurvey +'", "Cultural Survey": "' + culturalsurvey +'", "Negotiation Status": "' + negotiations + '", "Condemnation": "' + condemnation + '", "Environmental Approved": "' + environmentalsurveyapproved +'", "Title Search": "' + titlecomplete +'", "Parcel ID": "' + parcelid +'","View Details": "https://fieldbook-f4928.firebaseapp.com/#/tracts/'+ id +'","Owner": "' + owner +'","timestamp": null, "begin": null, "end": null, "altitudeMode": null, "tessellate": -1, "extrude": -1, "visibility": -1, "drawOrder": null, "icon": null, "snippet": "" }, "geometry": {"type": "MultiPolygon", "coordinates": [[['+ geometry + ']]]}},';
                    coords = geometry + ',';

                      newmapdata = '{"type":"FeatureCollection","features": [' + text +']}';
                      newmapdata2 = '{"type":"FeatureCollection","crs": {"type": "name","properties": {"name": "EPSG:4326"},"projection": "EPSG:4326"},"features": [' + text +']}';


                      //get zoomed property coordinates only
                        zoomedPropertyText = '{"type": "Feature", "properties": {"ZoomedTract": "' + id + '"},"geometry": {"type": "MultiPolygon", "coordinates": [[['+ geometry + ']]]}},';



                        if(i.$id === $routeParams.mapid){
                        var zoomedText = '{"type": "Feature", "properties": { "Tract": "' + tract +'", "Address": "' + address +'","City": "' + city +'","State": "' + state +'", "Survey Denied": "' + surveydenied +'", "Zip": "' + zip +'","Type": "' + type +'", "County": "' + county +'", "Acres": "' +
                         acres +'", "Survey Approved": "' + surveypermissionapproved +'", "Survey Permission": "' + surveypermission +'", "Special Conditions": "' + specialconditions + '", "Acquired": "' + acquireddate + '", "Acquisition Approved": "' + acquisitionapproved +'", "Civil Survey": "' +
                         civilsurveycomplete +'", "Civil Survey Approved": "' + civilsurveyapproved +'", "Bio Survey": "' + biosurvey +'", "Cultural Survey": "' + culturalsurvey +'", "Negotiation Status": "' + negotiations + '", "Condemnation": "' + condemnation + '", "Environmental Approved": "' + environmentalsurveyapproved +'", "Title Search": "' + titlecomplete +'", "Parcel ID": "' + parcelid +'","View Details": "https://fieldbook-f4928.firebaseapp.com/#/tracts/'+ id +'","Owner": "' + owner +'","timestamp": null, "begin": null, "end": null, "altitudeMode": null, "tessellate": -1, "extrude": -1, "visibility": -1, "drawOrder": null, "icon": null, "snippet": "" }, "geometry": {"type": "MultiPolygon", "coordinates": [[['+ geometry + ']]]}},';
                        coords = geometry + ',';
                        zoomedTract = '{"type":"FeatureCollection","crs": {"type": "name","properties": {"name": "EPSG:4326"},"projection": "EPSG:4326"},"features": [' + zoomedText +']}';
                      }
        });
// console.log(zoomedTract);

},3500)


// setTimeout(function(){
//   var parsedData = (JSON.parse(newmapdata.replace('},]','}]')));
//   // console.log("Map Data equals:" + data);
//   map.data.addGeoJson(parsedData);
//
  // var parsedZoomedTract = (JSON.parse(zoomedTract.replace('},]','}]')));
  // map.data.addGeoJson(parsedZoomedTract);
//
//   var routelayer = document.getElementById("routedata").innerText;
//   var parsedRoute = JSON.parse(routelayer);
//
//
//
//   map.data.addGeoJson(parsedRoute);
//   var legend = document.getElementById("legend");
//   if (legend.className==="hidden"){legend.className="visible"};
//
//   // var marker = new google.maps.Marker({
//   //   position: {lat: centroidLat, lng: centroidLong},
//   //   map: map,
//   //   title: centroidTract,
//   //
//   //   icon: {
//   //     path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
//   //     strokeWeight: 2,
//   //     strokeColor: 'black',
//   //     strokeOpacity: 1,
//   //     fillColor: "#0099ff",
//   //     fillOpacity: 0.85
//   //   },
//   //
//   //   animation: google.maps.Animation.DROP,
//   //
//   // });
//
// },3000);
//
//
// var marker = new google.maps.Marker({
//   position: {lat: centroidLat, lng: centroidLong},
//   map: map,
//   title: centroidTract,
//   // title: "Lat: "+centroidLat+", Long: "+ centroidLong,
//   // label: {
//   //   text: centroidTract,
//   //   color: "black",
//   //   fontWeight: "bold"
//   // },
//   // icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//   icon: {
//     path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
//     strokeWeight: 2,
//     strokeColor: 'black',
//     strokeOpacity: 1,
//     fillColor: "#0099ff",
//     fillOpacity: 0.85
//   },
//
//   animation: google.maps.Animation.DROP,
//
// });
//
//   map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legend)
//
//
//             map.data.setStyle(function(feature) {
//                 var id = feature.getProperty('ID');
//                 var zoomedTract = feature.getProperty('ZoomedTract');
//                 var surveypermission = feature.getProperty('Survey Permission');
//                 var specialconditions = feature.getProperty('Special Conditions');
//                 var surveydenied = feature.getProperty('Survey Denied');
//                 var surveyapproved=feature.getProperty('Survey Approved');
//                 // var surveyed = feature.getProperty('Tract Surveyed');
//                 var routename = feature.getProperty('Name')
//                 var stroke;
//                 var color;
//                 var strokeweight;
//                 var strokeopacity;
//
//                 if (zoomedTract){
//                   color='transparent',
//                   stroke = '#0099ff',
//                   strokeweight = 8
//
//                 }
//                 else if (routename === "South 1A"){
//                   stroke = 'red',
//                   strokeweight = 4,
//                   strokeopacity = 1.0
//                 }
//                 // if (surveyed !==""){
//                 //   color='green';
//                 // }
//                 else if (id===$routeParams.mapdata &&surveyapproved !== null &&typeof(surveyapproved)!="undefined"&&surveyapproved!="" && surveypermission!=""&&specialconditions =="YES" ) {
//                   color='yellow',
//                   stroke=null,
//                   strokeweight = 0,
//                   strokeopacity = 0.0
//                 }
//                 else if (id!==$routeParams.mapdata &&surveyapproved !== null &&typeof(surveyapproved)!=="undefined"&&surveyapproved!=="" && surveypermission!==""&&specialconditions ==="YES" ) {
//                   color='yellow',
//                   stroke='black',
//                   strokeweight= 2,
//                   strokeopacity = 1.0
//                 }
//
//
//                 else if (id===$routeParams.mapdata &&surveyapproved !== null &&typeof(surveyapproved)!=="undefined"&&surveyapproved!=="" && surveypermission!=="") {
//                   color='#00ff80',
//                   stroke=null,
//                   strokeweight = 0,
//                   strokeopacity = 0.0
//                 }
//                 else if (id!==$routeParams.mapdata &&surveyapproved!==null && typeof(surveyapproved)!=="undefined"&&surveyapproved!==''&& surveypermission!=="") {
//                   color='#00ff80',
//                   stroke='black',
//                   strokeweight= 2,
//                   strokeopacity = 1.0
//                 }
//                 else if (id===$routeParams.mapdata && surveydenied !=="") {
//                   color='red',
//                   stroke=null,
//                   strokeweight = 0,
//                   strokeopacity = 0.0
//                 }
//                 else if (id!==$routeParams.mapdata&&surveydenied !=="") {
//                   color='red',
//                   stroke='black',
//                   strokeweight = 2,
//                   strokeopacity = 1.0
//                 }
//                 else if (id===$routeParams.mapdata) {
//                   color='white',
//                   stroke=null,
//                   strokeweight = 0,
//                   strokeopacity = 0.0
//                 }
//                 else {
//                   color='white',
//                   stroke='black',
//                   strokeweight = 2,
//                   strokeopacity = 1.0
//                 }
//             return {
//               fillColor: color,
//               strokeColor: stroke,
//               strokeWeight: strokeweight,
//               strokeOpacity: strokeopacity
//
//             }
//             });
//             var infoWindow = new google.maps.InfoWindow();
//             //when the user clicks, open an infoWindow
//             map.data.addListener('click', function(event) {
//               var tract = event.feature.getProperty("Tract");
//               var parcelid = event.feature.getProperty("Parcel ID");
//               var owner = event.feature.getProperty("Owner");
//               var address = event.feature.getProperty("Address");
//               var city = event.feature.getProperty("City");
//               var state = event.feature.getProperty("State");
//               var zip = event.feature.getProperty("Zip");
//               var title = event.feature.getProperty("Title Search");
//               var type = event.feature.getProperty("Type");
//               var county = event.feature.getProperty("County");
//               var acres = event.feature.getProperty("Acres");
//               var surveypermission = event.feature.getProperty("Survey Permission");
//               var surveydenied = event.feature.getProperty("Survey Denied");
//               var myRoute = event.feature.getProperty("Name");
//               var link = event.feature.getProperty("View Details");
//
//
//             infoWindow.setContent('<table style="font-family:Arial,Verdana,Times;font-size:14px;text-align:left;width:100%;border-collapse:collapse;padding:3px 3px 3px 3px"><tr style="text-align:center;font-weight:bold;background:#0000FF;color:white"><td>Tract '+ tract+'</td></tr><tr><td><table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-spacing:0px; padding:3px 3px 3px 3px"><tr style="height:6px"></tr><tr><td>PARCEL ID</td><td></td><td>'+ parcelid+'</td></tr><tr bgcolor="#D0D0D0"><td>LAND OWNER</td><td></td><td>'+owner+'</td></tr><tr><td>ADDRESS</td><td></td><td>'+address+'</td></tr><tr bgcolor="#D0D0D0"><td>CITY</td><td></td><td>'+city+'</td></tr><tr><td>STATE</td><td></td><td>'+state+'</td></tr><tr bgcolor="#D0D0D0"><td>ZIP</td><td></td><td>'+zip+'</td></tr><tr><td>TYPE</td><td></td><td>'+type+'</td></tr><tr bgcolor="#D0D0D0"><td>COUNTY</td><td></td><td>'+county+'</td></tr><tr><td>ACRES</td><td style="width: 10px"></td><td>'+acres+
//             '</td></tr><tr bgcolor="#D0D0D0"><td>TITLE SEARCH</td><td></td><td>'+title+'</td></tr><tr><td>SURVEY PERMISSION</td><td></td><td>'+surveypermission+'</td></tr><tr bgcolor="#D0D0D0"><td>SURVEY DENIED</td><td></td><td>'+surveydenied+'</td></tr><tr><td>VIEW DETAILS</td><td></td><td>'+ '<u><a style="color:blue;font-weight:bold;" href = "' + link + '">Tract ' + tract + '</a></u>' +'</td></tr></table></td></tr></table>');
//             if(myRoute === "South 1A"){infoWindow.setContent('<table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:200px;border-spacing:0px; margin:auto; height:100%"; ><tr style="text-align:center;font-weight:bold;background-color:white;color:blue"><td>South 1A Route</td></tr></table>');}
//             infoWindow.setPosition(event.latLng);
//
//             // infoWindow.setOptions({pixelOffset: new google.map.Size(0,-30)});
//             infoWindow.open(map);
//           });
// //add legend
//
// var div = document.createElement('div');
// div.innerHTML = ' <img style="height:40px;width:40px;margin-left:50px;margin-right:auto" src="data:image/png;base64,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"/><hr style="border:solid 1px black;opacity:.4;margin-top:3px"><span style="border:1px solid black;background-color:green;opacity:0.8">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;<span style="font-weight:bold;font-size:12px">Survey Granted</span><br> <br><span style="border:1px solid black;background-color:yellow">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;<span style="font-weight:bold;font-size:12px">Special Conditions</span> <br><br><span style="border:1px solid black;background-color:red;opacity:0.75">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;<span style="font-weight:bold;font-size:12px">Survey Denied</span><br><br>';
// legend.appendChild(div);
var bingStyles = [
  'Road',
  'RoadOnDemand',
  'Aerial',
  'AerialWithLabels',
  'collinsBart',
  'ordnanceSurvey'
];
var layers = [];
var i, ii;
     for (i = 0, ii = bingStyles.length; i < ii; ++i) {
       layers.push(new ol.layer.Tile({
         visible: false,
         preload: Infinity,
         source: new ol.source.BingMaps({
           key: 'AqYrp0zK9UCQXRQzhXrR1JmQHQnZhYkJQvpXgT-7H50d7GtJ1GF6kkdcjm7M5d0v',
           // key: 'AkF8YBQQRo-2qiCr40JPp86hAIaFsBphQtARxQQxLu5AaAZj-x1ale62l6r28Yf5',
           // key: '0f51ad22-9103-40d5-bb90-33b16950a650',
           // key: 'ApJnO9QB5zKS_IFMVY7KhsD7PqcvCnM9HP8ydQxXiFsmiMq0E3w-IYw2prXwON8r',
           imagerySet: bingStyles[i]
           // use maxZoom 19 to see stretched tiles instead of the BingMaps
           // "no photos at this zoom level" tiles
           // maxZoom: 19
         })
       }));
     }

window.app = {};
var mapApp = window.app;

mapApp.layerSelectControl = function(opt_options) {

        var options = opt_options || {};

        // var button = document.createElement('button');
        // button.innerHTML = 'N';

        var layerTable = document.createElement('div');
        layerTable.innerHTML=
        '<div class="sidepanel"><span class="sidepanel-title">Basemaps</span><div class="height: 100%"><input type="checkbox" id="hybrid" checked ng-click = "setHybrid()" > Hybrid<br><input type="checkbox" id="aerial" ng-click = "setAerial()" > Aerial<br><input type="checkbox" id="road-map" ng-click = "setRoadMap()" > Road</div><br><div class="height: 100%"><span class="sidepanel-title">Layers</span><input type="checkbox" id="centerline" checked ng-click = "toggleRoute()" >Centerline<br><input type="checkbox" id="tractsCheckbox" checked ng-click = "toggleTracts()" > Tracts<br><input type="checkbox" id="surveyPermissionsCheckbox" ng-click = "togglePermissions()" > Survey Permissions<br><input type="checkbox" id="civilCheckbox" ng-click = "toggleCivil()" > Civil Survey<br><input type="checkbox" id="environmentalCheckbox" ng-click = "toggleEnvironmental()" > Environmental Survey<br><input type="checkbox" id="acquiredCheckbox" ng-click = "toggleAcquired()" >Acquisition</div></div>';
        var this_ = this;
        var handleRotateNorth = function() {
          this_.getMap().getView().setRotation(0);
        };
        //
        // button.addEventListener('click', handleRotateNorth, false);
        // button.addEventListener('touchstart', handleRotateNorth, false);

        var element = document.createElement('div');
        element.setAttribute("id","layersDiv");
        element.className = 'layerSelect ol-unselectable ol-control';
        // element.appendChild(button);
        // element.className='sidepanel';
        element.appendChild(layerTable);

        ol.control.Control.call(this, {
          element: element,
          target: options.target
        });

      };

var mercerLogo = '<img align="middle" style="height:40px;width:40px"; src="data:image/png;base64,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"/>'


mapApp.defaultLegendControl = function(opt_options) {

        var options = opt_options || {};

        var legendTable = document.createElement('div');
        legendTable.setAttribute("id","defaultLegend");
        legendTable.setAttribute("style","display:none;width:200px;height:100%");
        legendTable.innerHTML=
                          ' <div style="background-color:rgba(255,255,255,0.6);padding:8px;width:100%;height:100%"><div style="text-align:center;align-content:middle;margin-left:auto;margin-right:auto">'+mercerLogo+'</div><hr style="border:solid 1px black;opacity:.4;margin-top:5px;margin-bottom:5px"><div style="background-color:transparent;width:100%;padding:0px"><div style="padding-left:2px;width:20%;float:left"><div style="background-color:blue;height:3px;margin-top:25%"></div></div><div style="width:75%;float:right"><div style="font-size:1.0em">Centerline</div></div></div><br><div style="margin-top:3px;background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:transparent; border:2px solid black;width:20%;height:100%;float:left"></div><div style="width:75%;float:right;font-size:1.0em">Tracts</div></div></div>';
        var handleRotateNorth = function() {
          this_.getMap().getView().setRotation(0);
        };

        var legendElement = document.createElement('div');
        legendElement.className = 'legendTable ol-unselectable ol-control';
        // element.appendChild(button);
        // element.className='sidepanel';
        legendElement.appendChild(legendTable);

        ol.control.Control.call(this, {
          element: legendElement,
          target: options.target
        });

      };



      mapApp.surveyPermissionsLegendControl = function(opt_options) {

              var options = opt_options || {};

              var legendTable = document.createElement('div');
              legendTable.setAttribute("id","surveyPermissionsLegend");
              legendTable.setAttribute("style","display:none;width:200px");
              legendTable.innerHTML=
                    ' <div style="background-color:rgba(255,255,255,0.6);padding:8px;width:100%;height:100%"><div style="text-align:center;align-content:middle;margin-left:auto;margin-right:auto">'+mercerLogo+'</div><div style="font-weight:bold;font-size:1.2em;text-align:center;align-content:middle;margin-left:auto;margin-right:auto">Survey Permissions</div><hr style="border:solid 1px black;opacity:.4;margin-top:5px;margin-bottom:5px"><div style="background-color:transparent;width:100%;padding:0px"><div style="padding-left:2px;width:20%;float:left"><div style="background-color:blue;height:3px;margin-top:25%"></div></div><div style="width:75%;float:right"><div style="font-size:1.0em">Centerline</div></div></div><br><div style="margin-top:3px;margin-bottom:5px;background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:transparent; border:2px solid black;width:20%;height:100%;float:left"></div><div style="width:75%;float:right;font-size:1.0em">Tracts</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px;margin-bottom:5px"><div style="background-color:rgba(0,128,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Survey Granted</div></div><div style="margin-bottom:5px;background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:rgba(255,255,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Special Conditions</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:rgba(255,0,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Survey Denied</div></div></div>';
              var this_ = this;
              var handleRotateNorth = function() {
                this_.getMap().getView().setRotation(0);
              };

              var legendElement = document.createElement('div');
              legendElement.className = 'legendTable ol-unselectable ol-control';
              // element.appendChild(button);
              // element.className='sidepanel';
              legendElement.appendChild(legendTable);

              ol.control.Control.call(this, {
                element: legendElement,
                target: options.target
              });

            };
            mapApp.civilLegendControl = function(opt_options) {

                    var options = opt_options || {};

                    var legendTable = document.createElement('div');
                    legendTable.setAttribute("id","civilSurveyLegend");
                    legendTable.setAttribute("style","display:none;width:200px");
                    legendTable.innerHTML=
                          ' <div style="background-color:rgba(255,255,255,0.6);padding:8px;width:100%;height:100%"><div style="text-align:center;align-content:middle;margin-left:auto;margin-right:auto">'+mercerLogo+'</div><div style="font-weight:bold;font-size:1.2em;text-align:center;align-content:middle;margin-left:auto;margin-right:auto">Civil Survey</div><hr style="border:solid 1px black;opacity:.4;margin-top:5px;margin-bottom:5px"><div style="background-color:transparent;width:100%;padding:0px"><div style="padding-left:2px;width:20%;float:left"><div style="background-color:blue;height:3px;margin-top:25%"></div></div><div style="width:75%;float:right"><div style="font-size:1.0em">Centerline</div></div></div><br><div style="margin-top:3px;margin-bottom:5px;background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:transparent; border:2px solid black;width:20%;height:100%;float:left"></div><div style="width:75%;float:right;font-size:1.0em">Tracts</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px;margin-bottom:5px"><div style="background-color:rgba(0,128,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Survey Complete</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:rgba(255,0,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Survey Denied</div></div></div>';
                    var this_ = this;
                    var handleRotateNorth = function() {
                      this_.getMap().getView().setRotation(0);
                    };

                    var legendElement = document.createElement('div');
                    legendElement.className = 'legendTable ol-unselectable ol-control';
                    // element.appendChild(button);
                    // element.className='sidepanel';
                    legendElement.appendChild(legendTable);

                    ol.control.Control.call(this, {
                      element: legendElement,
                      target: options.target
                    });

                  };
                  mapApp.environmentalLegendControl = function(opt_options) {

                          var options = opt_options || {};

                          var legendTable = document.createElement('div');
                          legendTable.setAttribute("id","environmentalLegend");
                          legendTable.setAttribute("style","display:none;width:200px");
                          legendTable.innerHTML=
                                ' <div style="background-color:rgba(255,255,255,0.6);padding:8px;width:100%;height:100%"><div style="text-align:center;align-content:middle;margin-left:auto;margin-right:auto">'+mercerLogo+'</div><div style="font-weight:bold;font-size:1.2em;text-align:center;align-content:middle;margin-left:auto;margin-right:auto">Environmental Survey</div><hr style="border:solid 1px black;opacity:.4;margin-top:5px;margin-bottom:5px"><div style="background-color:transparent;width:100%;padding:0px"><div style="padding-left:2px;width:20%;float:left"><div style="background-color:blue;height:3px;margin-top:25%"></div></div><div style="width:75%;float:right"><div style="font-size:1.0em">Centerline</div></div></div><br><div style="margin-top:3px;margin-bottom:5px;background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:transparent; border:2px solid black;width:20%;height:100%;float:left"></div><div style="width:75%;float:right;font-size:1.0em">Tracts</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px;margin-bottom:5px"><div style="background-color:rgba(0,128,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Survey Complete</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:rgba(255,0,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Survey Denied</div></div></div>';
                          var this_ = this;
                          var handleRotateNorth = function() {
                            this_.getMap().getView().setRotation(0);
                          };

                          var legendElement = document.createElement('div');
                          legendElement.className = 'legendTable ol-unselectable ol-control';
                          // element.appendChild(button);
                          // element.className='sidepanel';
                          legendElement.appendChild(legendTable);

                          ol.control.Control.call(this, {
                            element: legendElement,
                            target: options.target
                          });

                        };
                        mapApp.acquisitionLegendControl = function(opt_options) {

                                var options = opt_options || {};

                                var legendTable = document.createElement('div');
                                legendTable.setAttribute("id","acquisitionLegend");
                                legendTable.setAttribute("style","display:none;width:200px");
                                legendTable.innerHTML=
                                      ' <div style="background-color:rgba(255,255,255,0.6);padding:8px;width:100%;height:100%"><div style="text-align:center;align-content:middle;margin-left:auto;margin-right:auto">'+mercerLogo+'</div><div style="font-weight:bold;font-size:1.2em;text-align:center;align-content:middle;margin-left:auto;margin-right:auto">Acquisition</div><hr style="border:solid 1px black;opacity:.4;margin-top:5px;margin-bottom:5px"><div style="background-color:transparent;width:100%;padding:0px"><div style="padding-left:2px;width:20%;float:left"><div style="background-color:blue;height:3px;margin-top:25%"></div></div><div style="width:75%;float:right"><div style="font-size:1.0em">Centerline</div></div></div><br><div style="margin-top:3px;margin-bottom:5px;background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:transparent; border:2px solid black;width:20%;height:100%;float:left"></div><div style="width:75%;float:right;font-size:1.0em">Tracts</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px;margin-bottom:5px"><div style="background-color:rgba(0,128,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Acquired</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px;margin-bottom:5px"><div style="background-color:rgba(255,255,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Negotiating</div></div><div style="background-color:transparent;width:100%;height:20px;padding-left:1px"><div style="background-color:rgba(255,0,0,.8); border:2px solid black;width:20%;height:100%;float:left;padding:2px"></div><div style="width:75%;float:right;font-size:1.0em">Condemnation</div></div></div>';
                                var this_ = this;
                                var handleRotateNorth = function() {
                                  this_.getMap().getView().setRotation(0);
                                };

                                var legendElement = document.createElement('div');
                                legendElement.className = 'legendTable ol-unselectable ol-control';
                                // element.appendChild(button);
                                // element.className='sidepanel';
                                legendElement.appendChild(legendTable);

                                ol.control.Control.call(this, {
                                  element: legendElement,
                                  target: options.target
                                });

                              };
      ol.inherits(mapApp.layerSelectControl, ol.control.Control);
      ol.inherits(mapApp.defaultLegendControl, ol.control.Control);
      ol.inherits(mapApp.surveyPermissionsLegendControl, ol.control.Control);
      ol.inherits(mapApp.civilLegendControl, ol.control.Control);
      ol.inherits(mapApp.environmentalLegendControl, ol.control.Control);
      ol.inherits(mapApp.acquisitionLegendControl, ol.control.Control);


var map2 = new ol.Map({
  // layers: [
  //   new ol.layer.Tile({
  //     source: new ol.source.OSM()
  //   })
  // ],
  controls: ol.control.defaults().extend([
    new ol.control.FullScreen({
      source: 'fullscreen'
    }),
    new mapApp.layerSelectControl(),
    new mapApp.defaultLegendControl(),
    new mapApp.surveyPermissionsLegendControl(),
    new mapApp.civilLegendControl(),
    new mapApp.environmentalLegendControl(),
    new mapApp.acquisitionLegendControl()

  ]),
layers: layers,
// [
//   new ol.layer.Tile({
//
//     source: new ol.source.BingMaps({
//       key: 'AkF8YBQQRo-2qiCr40JPp86hAIaFsBphQtARxQQxLu5AaAZj-x1ale62l6r28Yf5',
//       // key: '0f51ad22-9103-40d5-bb90-33b16950a650',
//       // key: 'ApJnO9QB5zKS_IFMVY7KhsD7PqcvCnM9HP8ydQxXiFsmiMq0E3w-IYw2prXwON8r',
//       imagerySet: 'AerialWithLabels'
//       // use maxZoom 19 to see stretched tiles instead of the BingMaps
//       // "no photos at this zoom level" tiles
//       // maxZoom: 19
//     })
//   })
// ],
 loadTilesWhileInteracting: true,

  target: 'map2',
  // controls: ol.control.defaults({
  //   attributionOptions: {
  //     collapsible: false
  //   }
  // }),

  // view: new ol.View({
  //   center: [ -99.3,  36.361040 ],
  //   zoom: 8.20,
  //   projection: 'EPSG:4326'
  //
  // })
  view: new ol.View({
    center: [ centroidLong,  centroidLat ],
    zoom: 16,
    projection: 'EPSG:4326'

  })

});

// map2.addControl(fullscreen);
// var select = document.getElementById('layer-select');
// function onChange() {
//   var style = select.value;
//   for (var i = 0, ii = layers.length; i < ii; ++i) {
//     layers[i].setVisible(bingStyles[i] === style);
//   }
// }
// select.addEventListener('change', onChange);
// onChange();
var roadMap = document.getElementById('road-map');
var aerialMap = document.getElementById('aerial');
var hybridMap = document.getElementById('hybrid');

function setRoadMap() {
if (roadMap.checked===true){
  layers[0].setVisible(true);
  layers[2].setVisible(false);
  layers[3].setVisible(false);
  aerialMap.checked=false;
  hybridMap.checked=false;
} else {
  layers[0].setVisible(false)
}
}
roadMap.addEventListener('change', setRoadMap);
setRoadMap();

function setAerial() {
if (aerialMap.checked===true){
  layers[2].setVisible(true);
  layers[0].setVisible(false);
  roadMap.checked=false;
  hybridMap.checked=false;
  layers[3].setVisible(false);
} else {
  layers[2].setVisible(false)
}
}
aerialMap.addEventListener('change', setAerial);
setAerial();

function setHybrid() {
if (hybridMap.checked===true){
  layers[3].setVisible(true);
  layers[2].setVisible(false);
  roadMap.checked=false;
  aerialMap.checked=false;
  layers[0].setVisible(false);
} else {
  layers[3].setVisible(false)
}
}
hybridMap.addEventListener('change', setHybrid);
setHybrid();

setTimeout(function(){


  var parsedData = (JSON.parse(newmapdata.replace('},]','}]')));
// console.log(newmapdata);
var parsedData2 = (JSON.parse(newmapdata2.replace('},]','}]')));
  // console.log("Map Data equals:" + data);
  // map.data.addGeoJson(parsedData);

  var routelayer = document.getElementById("routedata").innerText;
  var parsedRoute = JSON.parse(routelayer);

  var parsedZoomedTract = (JSON.parse(zoomedTract.replace('},]','}]')));
  // map.data.addGeoJson(parsedRoute);
  var legend = document.getElementById("legend");
  // if (legend.className==="hidden"){legend.className="visible"};

  //Begin OpenLayers Map
var propertyColor = 'white';


        var styles = {

          'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'blue',
              width: 4
            })
          }),
          'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'green',
              width: 1
            })
          }),

          'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'black',
              width: 1
            }),
            fill: new ol.style.Fill({
              // color: 'rgba(255, 255, 0, 0.1)'
              color: propertyColor
            })


          }),
          'Polygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'blue',
              lineDash: [4],
              width: 3
            }),
            fill: new ol.style.Fill({
              color: 'rgba(0, 0, 255, 0.1)'
            })
          }),
          'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'magenta',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'magenta'
            }),
            image: new ol.style.Circle({
              radius: 10,
              fill: null,
              stroke: new ol.style.Stroke({
                color: 'magenta'
              })
            })
          }),
          'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'red',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.2)'
            })
          })
        };

        var styleFunction = function(feature) {
          return styles[feature.getGeometry().getType()];
        };

        var polygonData = {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:4326'
            },
            'projection': 'EPSG:4326'
          },
          'features': [{"type": "Feature", "properties": { "Tract": "001", "Address": "HC 4 BOX 39","City": "TEXHOMA","State": "OK", "Survey Denied": "", "Zip": "73949","Type": "PROPERTY", "County": "CIMARRON", "Acres": "161.34", "Survey Approved": "05/08/2017", "Survey Permission": "05/08/2017", "Special Conditions": "NO", "Title Search": "05/01/2017","Tract Surveyed": "undefined", "Parcel ID": "0000-36-04N-09E-4-000-00","View Details": "https://fieldbook-f4928.firebaseapp.com/#/tracts/Tract_001","Owner": "HENDERSON, FARMS, L.P.","timestamp": null, "begin": null, "end": null, "altitudeMode": null, "tessellate": -1, "extrude": -1, "visibility": -1, "drawOrder": null, "icon": null, "snippet": "" }, "geometry": {"type": "MultiPolygon", "coordinates": [[[[-102.04093225599996,36.762272891000066],[-102.04094586199994,36.769566077000036],[-102.03184981,36.76955476200004],[-102.03185188899994,36.76230171800006],[-102.04093225599996,36.762272891000066]]]]}},{"type": "Feature", "properties": { "Tract": "002", "Address": "RT 4 BOX 39","City": "TEXHOMA","State": "OK", "Survey Denied": "", "Zip": "73949","Type": "PROPERTY", "County": "TEXAS", "Acres": "50", "Survey Approved": "05/08/2017", "Survey Permission": "05/08/2017", "Special Conditions": "NO", "Title Search": "05/01/2017","Tract Surveyed": "undefined", "Parcel ID": "700008787","View Details": "https://fieldbook-f4928.firebaseapp.com/#/tracts/Tract_002","Owner": "HAYS FARMS, LLC","timestamp": null, "begin": null, "end": null, "altitudeMode": null, "tessellate": -1, "extrude": -1, "visibility": -1, "drawOrder": null, "icon": null, "snippet": "" }, "geometry": {"type": "MultiPolygon", "coordinates": [[[[-102.02311084399997,36.76257857600007],[-102.02310662099995,36.76229803200005],[-102.03185188899994,36.76230171800006],[-102.03184981,36.76955476200004],[-102.03160154099999,36.769554810000045],[-102.03155228099996,36.769554819000064],[-102.03144523899999,36.769554836000054],[-102.03146517699997,36.769330172000025],[-102.03148118399997,36.76914979800006],[-102.03150894399994,36.768836984000075],[-102.0314286,36.76833213700007],[-102.03137147799998,36.76797320000003],[-102.03086554599997,36.76670157900003],[-102.03041314699999,36.76605454000003],[-102.03025690899995,36.765767218000065],[-102.02991784099999,36.76538497700005],[-102.02961558199996,36.76509200900006],[-102.02920332199994,36.76472821300007],[-102.02883463199998,36.764467610000054],[-102.02815414299994,36.76403518300003],[-102.02769319,36.76374225700005],[-102.02683601499996,36.76342908300006],[-102.02602865699998,36.76313410100005],[-102.02533053599996,36.76296165400004],[-102.02442222299999,36.76273727900008],[-102.02425195699999,36.76271161400007],[-102.02404939099995,36.76268213000003],[-102.02383768899995,36.76267168500004],[-102.02352846799994,36.76265642800007],[-102.02311100099996,36.76266283600006],[-102.02311084399997,36.76257857600007]]]]}
        }]
  }

        var geojsonObject = {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:4326'
            },
            'projection': 'EPSG:4326'
          },
          'features': [{
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [0, 0]
            }
          }, {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [[4e6, -2e6], [8e6, 2e6]]
            }
          }, {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [[4e6, 2e6], [8e6, -2e6]]
            }
          }, {
            'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
            }
          }, {
            'type': 'Feature',
            'geometry': {
              'type': 'MultiLineString',
              'coordinates': [
                [[-1e6, -7.5e5], [-1e6, 7.5e5]],
                [[1e6, -7.5e5], [1e6, 7.5e5]],
                [[-7.5e5, -1e6], [7.5e5, -1e6]],
                [[-7.5e5, 1e6], [7.5e5, 1e6]]
              ]
            }
          }, {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates':[ [ -102.032052949011998, 36.762928363802601, 0.0 ], [ -102.031882546598993, 36.747999060105101, 0.0 ], [ -102.031882473574001, 36.747992653636203, 0.0 ], [ -102.031509602092996, 36.689922874768001, 0.0 ], [ -101.988098974002, 36.689864868614698, 0.0 ], [ -101.889151211186004, 36.689983139093201, 0.0 ], [ -101.816268874203999, 36.690055965981998, 0.0 ], [ -101.789424510489994, 36.672292151842399, 0.0 ], [ -101.751008086926007, 36.6465714319569, 0.0 ], [ -101.708484370896997, 36.617162520429602, 0.0 ], [ -101.700096322533, 36.616888698185498, 0.0 ], [ -101.690673306543005, 36.616981732732697, 0.0 ], [ -101.690017994599003, 36.616982102974603, 0.0 ], [ -101.677128435713996, 36.616854770763801, 0.0 ], [ -101.672563981427004, 36.616798572019398, 0.0 ], [ -101.672570894204995, 36.6057193541928, 0.0 ], [ -101.672089572573995, 36.602257747376598, 0.0 ], [ -101.672578904326997, 36.598262775958098, 0.0 ], [ -101.672354498486996, 36.569219912181602, 0.0 ], [ -101.669434525962004, 36.566519513784797, 0.0 ], [ -101.654658727075997, 36.566441348334799, 0.0 ], [ -101.645591128964995, 36.566580184186201, 0.0 ], [ -101.636484862002007, 36.566091962663997, 0.0 ], [ -101.627177486696993, 36.566165367113598, 0.0 ], [ -101.624344709059002, 36.566162168280499, 0.0 ], [ -101.611713491751999, 36.565726549688499, 0.0 ], [ -101.608825090539995, 36.565623090024303, 0.0 ], [ -101.603843515281, 36.5659730080218, 0.0 ], [ -101.599993843169997, 36.565910575802498, 0.0 ], [ -101.596884258982001, 36.566073825442302, 0.0 ], [ -101.588905428358999, 36.566102903345197, 0.0 ], [ -101.581215216340993, 36.565349731576397, 0.0 ], [ -101.573932034018, 36.565598586106198, 0.0 ], [ -101.569107184955001, 36.565980951562302, 0.0 ], [ -101.556251276525998, 36.566089164862603, 0.0 ], [ -101.538379951078994, 36.566658253964199, 0.0 ], [ -101.528627948638004, 36.566555439396303, 0.0 ], [ -101.504650925586006, 36.573143930823697, 0.0 ], [ -101.475424847387998, 36.573143349821301, 0.0 ], [ -101.446839909820994, 36.572590957386304, 0.0 ], [ -101.438116151247002, 36.572932584853298, 0.0 ], [ -101.419047521072997, 36.572817447091502, 0.0 ], [ -101.399798409796006, 36.57284776369, 0.0 ], [ -101.386541310222, 36.571676553890498, 0.0 ], [ -101.363341080625005, 36.5707209872444, 0.0 ], [ -101.327386240506002, 36.5711574098382, 0.0 ], [ -101.309871555317997, 36.5661934110557, 0.0 ], [ -101.295728076724998, 36.562623679049601, 0.0 ], [ -101.287680264700001, 36.560229033392901, 0.0 ], [ -101.275066017154003, 36.556486998724601, 0.0 ], [ -101.262274065691003, 36.552437231829799, 0.0 ], [ -101.242075728874994, 36.547055923000102, 0.0 ], [ -101.231777072900002, 36.5441044356321, 0.0 ], [ -101.225685695889993, 36.542317992126897, 0.0 ], [ -101.217835892037002, 36.539767892998, 0.0 ], [ -101.208481873352994, 36.5368250084274, 0.0 ], [ -101.199821739564996, 36.536558605235903, 0.0 ], [ -101.188330818473005, 36.536473048856301, 0.0 ], [ -101.179496208661007, 36.536983558043801, 0.0 ], [ -101.172503157286997, 36.537027507738202, 0.0 ], [ -101.166630645401, 36.536954306767498, 0.0 ], [ -101.152342237712006, 36.537857515595803, 0.0 ], [ -101.143933570637998, 36.5377610352554, 0.0 ], [ -101.120772361095007, 36.536622810084502, 0.0 ], [ -101.104769797936996, 36.536568247822601, 0.0 ], [ -101.095059047126995, 36.536448227014198, 0.0 ], [ -101.089192737190999, 36.536446097063802, 0.0 ], [ -101.071334885965996, 36.5363086973055, 0.0 ], [ -101.052865787393998, 36.529498894142598, 0.0 ], [ -101.051431876107003, 36.529498079603599, 0.0 ], [ -101.048479033, 36.529492298971903, 0.0 ], [ -101.045724786771004, 36.5294904849152, 0.0 ], [ -101.04287949287, 36.529486022044701, 0.0 ], [ -101.040024450632998, 36.529485923665199, 0.0 ], [ -101.037170902655006, 36.529483179007599, 0.0 ], [ -101.034319858771994, 36.529477835737602, 0.0 ], [ -101.031466059478007, 36.529473038947302, 0.0 ], [ -101.028609887876001, 36.529470810149398, 0.0 ], [ -101.025760346946001, 36.529428024335502, 0.0 ], [ -101.022916781923996, 36.529428891116197, 0.0 ], [ -101.020065701343995, 36.529432872799603, 0.0 ], [ -101.017212075366004, 36.529436202501898, 0.0 ], [ -101.014359927775999, 36.529438115594402, 0.0 ], [ -101.011508190515002, 36.529439885870801, 0.0 ], [ -101.008655763803006, 36.529441122523799, 0.0 ], [ -101.005801030561003, 36.529444168653399, 0.0 ], [ -101.002948315926005, 36.529445022009703, 0.0 ], [ -101.000099359011003, 36.529447022218598, 0.0 ], [ -100.997122873083001, 36.529448316739597, 0.0 ], [ -100.994395313609999, 36.529451022476401, 0.0 ], [ -100.991542260198003, 36.529451022323698, 0.0 ], [ -100.988688356173995, 36.529453373033299, 0.0 ], [ -100.985841219297996, 36.529456023577701, 0.0 ], [ -100.983034138261004, 36.529455346523399, 0.0 ], [ -100.980132636701001, 36.529457023129602, 0.0 ], [ -100.976637292974004, 36.5294620225351, 0.0 ], [ -100.973144732663002, 36.529460265313702, 0.0 ], [ -100.970294719384995, 36.529463076125097, 0.0 ], [ -100.967440076111004, 36.529464780501897, 0.0 ], [ -100.964588505235, 36.529464418274202, 0.0 ], [ -100.961685959147005, 36.529466022814503, 0.0 ], [ -100.958751881726997, 36.529464027015599, 0.0 ], [ -100.955828886229, 36.529529623965502, 0.0 ], [ -100.952376803215998, 36.529554959655599, 0.0 ], [ -100.936272634755994, 36.529548579284501, 0.0 ], [ -100.926966307659001, 36.529571552199897, 0.0 ], [ -100.917655514781998, 36.532848382781303, 0.0 ], [ -100.898628386979993, 36.532698704870299, 0.0 ], [ -100.882570351903993, 36.532784973727203, 0.0 ], [ -100.875167010857993, 36.529665195860197, 0.0 ], [ -100.868592793207995, 36.529645436897397, 0.0 ], [ -100.864624878067005, 36.529650561810797, 0.0 ], [ -100.863569006510005, 36.529529246109, 0.0 ], [ -100.801321281056005, 36.529425503233597, 0.0 ], [ -100.796767264017006, 36.529113015682697, 0.0 ], [ -100.756118731439003, 36.529110626980497, 0.0 ], [ -100.756098600138998, 36.507985242812303, 0.0 ], [ -100.756098341810997, 36.507713771085101, 0.0 ], [ -100.755758581966006, 36.507713945296601, 0.0 ], [ -100.752099202970996, 36.507709916717197, 0.0 ], [ -100.748436041076999, 36.507709735439299, 0.0 ], [ -100.744756952040007, 36.507708655802404, 0.0 ], [ -100.741095295844005, 36.507709341695801, 0.0 ], [ -100.737419287064995, 36.507707527412101, 0.0 ], [ -100.733752325604996, 36.5077091256682, 0.0 ], [ -100.730114791811005, 36.507705666069398, 0.0 ], [ -100.726424951799999, 36.507704241813002, 0.0 ], [ -100.722798201033001, 36.507706795816802, 0.0 ], [ -100.719192900102996, 36.507708957287001, 0.0 ], [ -100.715504355091994, 36.507709631707201, 0.0 ], [ -100.711846020026996, 36.507710845906502, 0.0 ], [ -100.708201708237993, 36.507712598506103, 0.0 ], [ -100.704548124696998, 36.507713232151197, 0.0 ], [ -100.700906599090004, 36.507712660830698, 0.0 ], [ -100.697238133759996, 36.507711912851597, 0.0 ], [ -100.693581661728999, 36.507712490902399, 0.0 ], [ -100.689949553576994, 36.507715350811097, 0.0 ], [ -100.686344941732003, 36.507716038821002, 0.0 ], [ -100.682838804111995, 36.507718950850702, 0.0 ], [ -100.679206345208001, 36.507720229265601, 0.0 ], [ -100.676316769178996, 36.507726026946003, 0.0 ], [ -100.673587076646996, 36.507718562687003, 0.0 ], [ -100.669882652259005, 36.5077177456184, 0.0 ], [ -100.666183017205995, 36.507719621991399, 0.0 ], [ -100.662559443218996, 36.5077205034952, 0.0 ], [ -100.658943543004, 36.507720768044798, 0.0 ], [ -100.655323032544999, 36.507719597672903, 0.0 ], [ -100.651625980817002, 36.507720121743198, 0.0 ], [ -100.648008638590994, 36.507718991266898, 0.0 ], [ -100.644533510667003, 36.507718468227402, 0.0 ], [ -100.640914854572998, 36.507718957235703, 0.0 ], [ -100.637295663436007, 36.507715320190698, 0.0 ], [ -100.633669856221005, 36.507713643007897, 0.0 ], [ -100.630058247554004, 36.507716417756399, 0.0 ], [ -100.626430923490005, 36.507709145489997, 0.0 ], [ -100.622785866081998, 36.507708464906997, 0.0 ], [ -100.619172272702002, 36.507705729934102, 0.0 ], [ -100.615573478944, 36.507704970595398, 0.0 ], [ -100.611972083064998, 36.507702891662298, 0.0 ], [ -100.608335172051, 36.5076989682224, 0.0 ], [ -100.604704896650006, 36.507697072793199, 0.0 ], [ -100.601064917550005, 36.507693133003897, 0.0 ], [ -100.597421656945997, 36.507690436796302, 0.0 ], [ -100.593788652884001, 36.507690706700899, 0.0 ], [ -100.590149654629997, 36.5076916910511, 0.0 ], [ -100.586519471317004, 36.507686293173798, 0.0 ], [ -100.582883163944004, 36.507685515885903, 0.0 ], [ -100.579254610120998, 36.507683476078199, 0.0 ], [ -100.575621771106995, 36.5076798166114, 0.0 ], [ -100.571834757152004, 36.507674579905803, 0.0 ], [ -100.568290733992001, 36.5076756290403, 0.0 ], [ -100.564667186703005, 36.507672072170401, 0.0 ], [ -100.561104261458993, 36.507665857273203, 0.0 ], [ -100.558635390860005, 36.507660565894497, 0.0 ], [ -100.557165741031994, 36.509093902420602, 0.0 ], [ -100.554954341721, 36.511231824670098, 0.0 ], [ -100.552717488651993, 36.5133963863316, 0.0 ], [ -100.550266607593997, 36.515452447844098, 0.0 ], [ -100.547771634217995, 36.5175515708247, 0.0 ], [ -100.545302887559004, 36.519632613693503, 0.0 ], [ -100.542832319523001, 36.521703579740901, 0.0 ], [ -100.540354897590007, 36.523786123631197, 0.0 ], [ -100.537870835369006, 36.525878269713999, 0.0 ], [ -100.535386640653002, 36.527965467274903, 0.0 ], [ -100.532932703688999, 36.530026533120903, 0.0 ], [ -100.530443927568001, 36.532118474311297, 0.0 ], [ -100.527966311517005, 36.534200887880701, 0.0 ], [ -100.525483598183996, 36.536286922461301, 0.0 ], [ -100.524979480406003, 36.536711244860399, 0.0 ], [ -100.504553919867007, 36.536668753971902, 0.0 ], [ -100.486555126314997, 36.536627710328098, 0.0 ], [ -100.468606555864994, 36.536605055968899, 0.0 ], [ -100.450666230164998, 36.536566214431097, 0.0 ], [ -100.432556977831993, 36.536606353581099, 0.0 ], [ -100.414663832602002, 36.536620288679401, 0.0 ], [ -100.379204570968994, 36.536775192982603, 0.0 ], [ -100.375545437468006, 36.536704110648998, 0.0 ], [ -100.361594962438005, 36.536891183810702, 0.0 ], [ -100.357617700660995, 36.537072854723903, 0.0 ], [ -100.352152306416997, 36.536513263998799, 0.0 ], [ -100.172441357688001, 36.536573909850397, 0.0 ], [ -100.153929639797994, 36.540444483075902, 0.0 ], [ -100.144937651120003, 36.543462197703398, 0.0 ], [ -100.077052866439004, 36.5435088478458, 0.0 ], [ -100.037018300647006, 36.543450676252903, 0.0 ], [ -100.006738936410002, 36.515520590659897, 0.0 ], [ -99.954996923356404, 36.515138108861102, 0.0 ], [ -99.892060819897296, 36.515134135769699, 0.0 ], [ -99.856858006849293, 36.515145650132197, 0.0 ], [ -99.824623431558905, 36.515030997106102, 0.0 ], [ -99.806618157320699, 36.515357460438601, 0.0 ], [ -99.802455529043087, 36.515335330814203, 0.0 ], [ -99.799651808027193, 36.513889808266597, 0.0 ], [ -99.796494558931698, 36.512261873956803, 0.0 ], [ -99.793808515301095, 36.511123026988898, 0.0 ], [ -99.790530045973796, 36.509689756554501, 0.0 ], [ -99.787279444472006, 36.508219624509998, 0.0 ], [ -99.78403266214589, 36.506763451581897, 0.0 ], [ -99.780947653648596, 36.505364193033103, 0.0 ], [ -99.777711442631414, 36.503902149287498, 0.0 ], [ -99.774484278679694, 36.502438899181101, 0.0 ], [ -99.771461891249885, 36.501070341686003, 0.0 ], [ -99.768234797092887, 36.499610415159601, 0.0 ], [ -99.765233089916194, 36.498248930764298, 0.0 ], [ -99.761992290121782, 36.4967792507653, 0.0 ], [ -99.758843516932103, 36.495355304727298, 0.0 ], [ -99.755590578766615, 36.493883405819098, 0.0 ], [ -99.752609889654593, 36.492524905499003, 0.0 ], [ -99.7495748136282, 36.491148770671202, 0.0 ], [ -99.746770732070203, 36.489879641083697, 0.0 ], [ -99.743833515788793, 36.4885458295213, 0.0 ], [ -99.740613003971703, 36.487086114708099, 0.0 ], [ -99.737424325785014, 36.485640275278598, 0.0 ], [ -99.734188764618494, 36.484173738203701, 0.0 ], [ -99.731304630760491, 36.482867608999904, 0.0 ], [ -99.728185328085303, 36.481453686277597, 0.0 ], [ -99.725028902084603, 36.480021575846898, 0.0 ], [ -99.723055711096009, 36.479118960538699, 0.0 ], [ -99.723052301058019, 36.479115745668402, 0.0 ], [ -99.695589633569199, 36.453215284388797, 0.0 ], [ -99.66528149042739, 36.439841411407997, 0.0 ], [ -99.6463257402918, 36.431320250063003, 0.0 ], [ -99.623854614265213, 36.419525403314204, 0.0 ], [ -99.561906483880406, 36.419476579014002, 0.0 ], [ -99.557794462934197, 36.417426687771403, 0.0 ], [ -99.535250734566006, 36.405570158275502, 0.0 ], [ -99.520594557927282, 36.397270827692601, 0.0 ], [ -99.510194313485499, 36.391593964625699, 0.0 ], [ -99.497669958197307, 36.383903745884801, 0.0 ], [ -99.483732715726703, 36.3803802775995, 0.0 ], [ -99.4722385491674, 36.376384005654401, 0.0 ], [ -99.457476905646104, 36.364923100746701, 0.0 ], [ -99.455494785413705, 36.363339063567501, 0.0 ], [ -99.454132601334294, 36.362189146709298, 0.0 ], [ -99.445053827451105, 36.362167505342903, 0.0 ], [ -99.440058449387607, 36.362730864368203, 0.0 ], [ -99.433962935165098, 36.362165471382099, 0.0 ], [ -99.413730651434605, 36.361870592265902, 0.0 ], [ -99.407265211072698, 36.361878124409998, 0.0 ], [ -99.405404256646804, 36.3611953792498, 0.0 ], [ -99.394029599511398, 36.361186821738002, 0.0 ], [ -99.389765397927391, 36.361191125193798, 0.0 ], [ -99.388282192216479, 36.361942169410497, 0.0 ], [ -99.38627174749611, 36.361626477907798, 0.0 ], [ -99.373661828239506, 36.361838995908798, 0.0 ], [ -99.371575293206519, 36.362216240099798, 0.0 ], [ -99.368192084496783, 36.361900579440601, 0.0 ], [ -99.357998175257492, 36.362089484261503, 0.0 ], [ -99.352892424850197, 36.3622214118896, 0.0 ], [ -99.336437541345404, 36.3610173092829, 0.0 ], [ -99.296983518485405, 36.362321569367502, 0.0 ], [ -99.289156353129712, 36.3620637922265, 0.0 ], [ -99.283295480279307, 36.362572781127, 0.0 ], [ -99.264677095441499, 36.3626335825832, 0.0 ], [ -99.247001832201704, 36.362647124309198, 0.0 ], [ -99.2331571624118, 36.362650363815398, 0.0 ], [ -99.229347557055902, 36.3624345101261, 0.0 ], [ -99.224487307485504, 36.362515490644199, 0.0 ], [ -99.210257991554201, 36.362730946711899, 0.0 ], [ -99.201980010133184, 36.362689736827001, 0.0 ], [ -99.192939196452102, 36.362745462682803, 0.0 ], [ -99.15653401579489, 36.362505546444801, 0.0 ], [ -99.145346548986382, 36.367521311238498, 0.0 ], [ -99.138165470462411, 36.369843510379198, 0.0 ], [ -99.121462611760307, 36.376569248994599, 0.0 ], [ -99.07619856900611, 36.376390714363197, 0.0 ], [ -99.050103590159779, 36.376438562420901, 0.0 ], [ -99.032779355014597, 36.376439052895002, 0.0 ], [ -98.996602868271111, 36.376481654051503, 0.0 ], [ -98.977225272535506, 36.376296558164, 0.0 ], [ -98.935460953690693, 36.376276296111101, 0.0 ], [ -98.915643829062986, 36.376159672308098, 0.0 ], [ -98.901775016251818, 36.376014125422799, 0.0 ], [ -98.892890951880617, 36.375334839646698, 0.0 ], [ -98.887139323745501, 36.376010124853302, 0.0 ], [ -98.876628243512101, 36.375944783090503, 0.0 ], [ -98.835545209537798, 36.3756554409972, 0.0 ], [ -98.830583829667106, 36.375611743590298, 0.0 ], [ -98.825985701538698, 36.375488156556798, 0.0 ], [ -98.815478382260494, 36.375200617401703, 0.0 ], [ -98.813154909400794, 36.375389356253002, 0.0 ], [ -98.810004305664805, 36.375423365660602, 0.0 ], [ -98.804378981034404, 36.3760347310509, 0.0 ], [ -98.800145498039797, 36.376502758096997, 0.0 ], [ -98.794133839634597, 36.376424663644997, 0.0 ], [ -98.791592590488492, 36.376423763601302, 0.0 ], [ -98.786882832520988, 36.376321486678101, 0.0 ], [ -98.773515695234494, 36.376001317235101, 0.0 ], [ -98.769451035493304, 36.375989714884, 0.0 ], [ -98.763018645643797, 36.375948076738901, 0.0 ], [ -98.756897385528021, 36.375953450976702, 0.0 ], [ -98.7488281385411, 36.376096077658701, 0.0 ], [ -98.741052476064297, 36.376106807560802, 0.0 ], [ -98.732981534992021, 36.376622814588401, 0.0 ], [ -98.7270313695184, 36.377081753987603, 0.0 ], [ -98.720740256996294, 36.3774327133168, 0.0 ], [ -98.713385734113203, 36.377927188686598, 0.0 ], [ -98.708265019628101, 36.378299870727297, 0.0 ], [ -98.706411508404997, 36.378409947306601, 0.0 ], [ -98.701982845558703, 36.378651673278199, 0.0 ], [ -98.697653737915203, 36.377995397703302, 0.0 ], [ -98.694727002652797, 36.379181455643803, 0.0 ], [ -98.686660380716006, 36.379147196421698, 0.0 ], [ -98.6829452327447, 36.379074329384402, 0.0 ], [ -98.677575250450602, 36.3790153357359, 0.0 ], [ -98.676699588507802, 36.378973153856002, 0.0 ], [ -98.671641347707194, 36.378729590995199, 0.0 ], [ -98.664833613667298, 36.378581497647197, 0.0 ], [ -98.663091038254606, 36.378519993156601, 0.0 ], [ -98.658570533861095, 36.378355124576601, 0.0 ], [ -98.658530177097816, 36.378383428593303, 0.0 ], [ -98.650761132869206, 36.383831591106599, 0.0 ], [ -98.623334497963398, 36.383583278727102, 0.0 ], [ -98.618100784670787, 36.383439055979302, 0.0 ], [ -98.595315146656503, 36.383394097402899, 0.0 ], [ -98.578982779524409, 36.383728888011397, 0.0 ], [ -98.563586794599487, 36.383867802124499, 0.0 ], [ -98.540395600886299, 36.384119338157802, 0.0 ], [ -98.516134846227303, 36.384145167881101, 0.0 ], [ -98.497852928817807, 36.384019729635199, 0.0 ], [ -98.484240403469499, 36.383239468614903, 0.0 ], [ -98.464083816352087, 36.370918076044298, 0.0 ], [ -98.463185938831799, 36.370369048072902, 0.0 ], [ -98.458032629136412, 36.368727096989197, 0.0 ], [ -98.431036242660184, 36.358492336382703, 0.0 ], [ -98.400504458304809, 36.347563523396403, 0.0 ], [ -98.336971856863002, 36.347731972168702, 0.0 ], [ -98.318750446531297, 36.347740979229997, 0.0 ], [ -98.313862110584012, 36.347198269211397, 0.0 ], [ -98.305753116387805, 36.345299261222998, 0.0 ], [ -98.296043852694595, 36.347186571821297, 0.0 ], [ -98.283983057772019, 36.3473145644274, 0.0 ], [ -98.277154490458287, 36.347312352180602, 0.0 ], [ -98.272888683531605, 36.347959158149699, 0.0 ], [ -98.255596544549405, 36.347813016925002, 0.0 ], [ -98.252635946690219, 36.354611858683498, 0.0 ], [ -98.194255727234818, 36.354286449904997, 0.0 ], [ -98.166710784640202, 36.3543949278436, 0.0 ], [ -98.157319206153005, 36.354444642607902, 0.0 ], [ -98.122648966549804, 36.354381195444702, 0.0 ], [ -98.101792362368599, 36.354389881966398, 0.0 ], [ -98.096373623301403, 36.354728742185202, 0.0 ], [ -98.033666875056511, 36.354837645582997, 0.0 ], [ -98.029844000840995, 36.354415812270197, 0.0 ], [ -98.006236980485511, 36.354357504061802, 0.0 ], [ -97.997665590364491, 36.3543987969353, 0.0 ], [ -97.997092877319702, 36.322542534349999, 0.0 ], [ -97.996997876627489, 36.306006174073303, 0.0 ], [ -97.996922404542318, 36.296796016567697, 0.0 ], [ -97.988820694537296, 36.2963529128156, 0.0 ], [ -97.974370366569389, 36.296340071602003, 0.0 ], [ -97.961297935052897, 36.296481999041397, 0.0 ], [ -97.948495102052703, 36.296766960610498, 0.0 ], [ -97.942569877771405, 36.2963632241743, 0.0 ], [ -97.925857955783599, 36.296338759011597, 0.0 ], [ -97.907596329119812, 36.296491699947097, 0.0 ], [ -97.880038461740696, 36.2965204895741, 0.0 ], [ -97.866354674118782, 36.2965091603592, 0.0 ], [ -97.854111039326114, 36.296532065574503, 0.0 ], [ -97.836810527083301, 36.296568025069497, 0.0 ], [ -97.827792867353594, 36.296510845589303, 0.0 ], [ -97.827513150614394, 36.306413880794501, 0.0 ], [ -97.823510395188407, 36.308511187427598, 0.0 ], [ -97.816376681070594, 36.311976735748097, 0.0 ], [ -97.79880409433531, 36.32067714918, 0.0 ], [ -97.790843415206993, 36.324660498397897, 0.0 ], [ -97.788133179271597, 36.325168853659399, 0.0 ], [ -97.782834021160696, 36.325212188667201, 0.0 ], [ -97.782827682813306, 36.325233150683701, 0.0 ], [ -97.781138125135811, 36.330820183694897, 0.0 ], [ -97.779084745926895, 36.335373453624001, 0.0 ], [ -97.767680948414593, 36.339835069293997, 0.0 ], [ -97.766788351686714, 36.3407335037694, 0.0 ], [ -97.747117685216679, 36.348594330190302, 0.0 ], [ -97.729185406625405, 36.355764510218698, 0.0 ], [ -97.720975811232194, 36.359207252226398, 0.0 ], [ -97.711177684571595, 36.363399299102703, 0.0 ], [ -97.693187827872819, 36.371279635810602, 0.0 ], [ -97.684087226571904, 36.375102365644601, 0.0 ], [ -97.684126281943705, 36.390427014197599, 0.0 ], [ -97.684169916271287, 36.400151743355998, 0.0 ], [ -97.684175739447596, 36.418451328552003, 0.0 ], [ -97.683924835234805, 36.419259095340799, 0.0 ], [ -97.684193424743299, 36.419993632871702, 0.0 ], [ -97.684141259530506, 36.433956634716502, 0.0 ], [ -97.657777960191297, 36.443256909331303, 0.0 ], [ -97.652716520649605, 36.445048700043998, 0.0 ], [ -97.650754907206206, 36.445737483642901, 0.0 ], [ -97.648619646520601, 36.4464790287863, 0.0 ], [ -97.646548200341499, 36.447216261785897, 0.0 ], [ -97.644707053983396, 36.447891187904098, 0.0 ], [ -97.634518858296303, 36.4514434877631, 0.0 ], [ -97.623567161517784, 36.455291876717702, 0.0 ], [ -97.604258980776393, 36.455300057879001, 0.0 ], [ -97.595145916834397, 36.455254022593401, 0.0 ], [ -97.595301474173297, 36.465314720388598, 0.0 ], [ -97.586743898545308, 36.468299109679798, 0.0 ], [ -97.582675719523706, 36.469753970439299, 0.0 ], [ -97.575511663367095, 36.472534182824504, 0.0 ], [ -97.566907813024699, 36.475863651968098, 0.0 ], [ -97.559392771194496, 36.478833023119499, 0.0 ], [ -97.550760376450512, 36.482306279743099, 0.0 ], [ -97.528044372810598, 36.490908307000403, 0.0 ], [ -97.519440397048811, 36.4941235520985, 0.0 ], [ -97.507516216063493, 36.498532885831203, 0.0 ], [ -97.506594673605207, 36.498889250986601, 0.0 ], [ -97.499166068360196, 36.5015573620176, 0.0 ], [ -97.496591938285121, 36.502345155313797, 0.0 ], [ -97.495093007834896, 36.502951361842797, 0.0 ], [ -97.492983437801001, 36.5036793815989, 0.0 ], [ -97.490762627058217, 36.504417660954601, 0.0 ], [ -97.488488139172205, 36.505081802975802, 0.0 ], [ -97.48584891502172, 36.505965224612602, 0.0 ], [ -97.482047599951898, 36.507259352956297, 0.0 ], [ -97.479599721426197, 36.508118152092003, 0.0 ], [ -97.477104177970517, 36.508858828536702, 0.0 ], [ -97.47495532321679, 36.5095670991616, 0.0 ], [ -97.471458122011796, 36.510729368568299, 0.0 ], [ -97.470775023252116, 36.510962431179202, 0.0 ], [ -97.466298103109082, 36.512222532981397, 0.0 ], [ -97.464098499192701, 36.513014161332002, 0.0 ], [ -97.463295260935197, 36.5130174774404, 0.0 ], [ -97.360009903481895, 36.513399162090998, 0.0 ], [ -97.351822755260102, 36.514317573345501, 0.0 ], [ -97.319337693208908, 36.515164056634802, 0.0 ], [ -97.264392326301916, 36.514780311003797, 0.0 ], [ -97.236368356806793, 36.513855368429503, 0.0 ], [ -97.211046164545706, 36.513838641068503, 0.0 ], [ -97.205414223057488, 36.513776768992798, 0.0 ], [ -97.192712864887099, 36.514031506017403, 0.0 ], [ -97.185337374365318, 36.514643482077602, 0.0 ], [ -97.138656825964404, 36.514761382823501, 0.0 ], [ -97.126420818543707, 36.514113017179199, 0.0 ], [ -97.12000569140838, 36.513988800219501, 0.0 ], [ -97.084833386701689, 36.5141093457663, 0.0 ], [ -97.084827313965206, 36.514109365347402, 0.0 ], [ -97.068922796905596, 36.510767954041398, 0.0 ], [ -97.068036447526993, 36.510581739310403, 0.0 ], [ -97.032060604506796, 36.510451996233797, 0.0 ], [ -97.014879117630201, 36.510394917632702, 0.0 ], [ -96.978804432374602, 36.510864518631102, 0.0 ], [ -96.943231390127096, 36.510506130342399, 0.0 ], [ -96.943225331658596, 36.485426371906897, 0.0 ], [ -96.889168006537815, 36.485584252791, 0.0 ], [ -96.835313792471396, 36.485498489359998, 0.0 ], [ -96.817597238493889, 36.4861400178292, 0.0 ], [ -96.815812345113102, 36.485577595552499, 0.0 ], [ -96.799985948451194, 36.485659972418802, 0.0 ], [ -96.764283805828711, 36.485512617593102, 0.0 ], [ -96.728352355199505, 36.4854551273582, 0.0 ], [ -96.692526073766203, 36.4852019245875, 0.0 ], [ -96.656594966820805, 36.485413082828202, 0.0 ], [ -96.649071409122584, 36.4857287445639, 0.0 ], [ -96.645883599906384, 36.484659751689399, 0.0 ], [ -96.642132088642498, 36.485198066747103, 0.0 ], [ -96.602807663075779, 36.4855599533036, 0.0 ], [ -96.586232602364205, 36.485708632903098, 0.0 ], [ -96.501725149784079, 36.485026879878703, 0.0 ], [ -96.479033609524208, 36.484402845974699, 0.0 ], [ -96.439765095426395, 36.459699963715899, 0.0 ], [ -96.415686623614107, 36.459543830179499, 0.0 ], [ -96.4073780245443, 36.459488834150797, 0.0 ], [ -96.389760778568018, 36.459293692097802, 0.0 ], [ -96.383849047449303, 36.4595367126581, 0.0 ], [ -96.372824532607382, 36.459661782838701, 0.0 ], [ -96.36233672385022, 36.459577236247398, 0.0 ], [ -96.353095810513395, 36.459369889781897, 0.0 ], [ -96.192157893468902, 36.457894356651202, 0.0 ], [ -96.157164494353381, 36.456948847132999, 0.0 ], [ -96.122495022742399, 36.456056455420402, 0.0 ], [ -96.122411300902399, 36.456054288329398, 0.0 ], [ -96.122258175023404, 36.454688343300099, 0.0 ], [ -96.121871778830197, 36.452501662512297, 0.0 ], [ -96.121651744247103, 36.450837986231001, 0.0 ], [ -96.121478132297113, 36.449424172162203, 0.0 ], [ -96.121205699727298, 36.446923711661697, 0.0 ], [ -96.120883775269519, 36.444371345115798, 0.0 ], [ -96.120668912602497, 36.442311641011997, 0.0 ], [ -96.120418478712082, 36.440397362829103, 0.0 ], [ -96.120189939477498, 36.438615806132802, 0.0 ], [ -96.120232549153997, 36.436914220008497, 0.0 ], [ -96.120193336146599, 36.434590391023796, 0.0 ], [ -96.120211304130493, 36.432817149374998, 0.0 ], [ -96.120217305640693, 36.430820481876601, 0.0 ], [ -96.120213111365899, 36.428593140874398, 0.0 ], [ -96.120232113004406, 36.425900210260302, 0.0 ], [ -96.120215669865686, 36.423986789217203, 0.0 ], [ -96.120229648856892, 36.422177090051697, 0.0 ], [ -96.120248367282002, 36.419834162909098, 0.0 ], [ -96.119952549454993, 36.419845972395898, 0.0 ], [ -96.118822519690283, 36.419852016401698, 0.0 ], [ -96.116230168077493, 36.419866379955501, 0.0 ], [ -96.113990564639096, 36.419876364037002, 0.0 ], [ -96.111325264193312, 36.419915460428101, 0.0 ], [ -96.108623644879103, 36.4199274756783, 0.0 ], [ -96.106445173442609, 36.419929476136197, 0.0 ], [ -96.104446344749505, 36.419919591429597, 0.0 ], [ -96.102069208907295, 36.4199365823835, 0.0 ], [ -96.099622027783184, 36.419932580454699, 0.0 ], [ -96.097022204670793, 36.419949408488499, 0.0 ], [ -96.094328942154803, 36.419949400431797, 0.0 ], [ -96.091972415275094, 36.419944401327101, 0.0 ], [ -96.089369000044798, 36.419978830694603, 0.0 ], [ -96.087643260712511, 36.419969807487199, 0.0 ], [ -96.084659156567994, 36.419966804038502, 0.0 ], [ -96.0827728372889, 36.419970604370199, 0.0 ], [ -96.081169437104421, 36.419964610854997, 0.0 ], [ -96.078904884761997, 36.4199915782198, 0.0 ], [ -96.075861834406794, 36.4200085789236, 0.0 ], [ -96.07430525123462, 36.420020938919997, 0.0 ], [ -96.072646410755198, 36.420016931797903, 0.0 ], [ -96.070331272225616, 36.4200279267695, 0.0 ], [ -96.067938046239703, 36.420020928256598, 0.0 ], [ -96.066508960254396, 36.420042825036099, 0.0 ], [ -96.066457326270211, 36.418773507715798, 0.0 ], [ -96.066319075148499, 36.416585542528502, 0.0 ], [ -96.06627602826542, 36.4148019529515, 0.0 ], [ -96.0661820877406, 36.412690436329299, 0.0 ], [ -96.066139048560899, 36.410837109790698, 0.0 ], [ -96.066082468332496, 36.408794545996798, 0.0 ], [ -96.064078716835795, 36.389861040569102, 0.0 ], [ -96.058696092098103, 36.378869494598199, 0.0 ], [ -96.058625443506799, 36.375972523713401, 0.0 ], [ -96.058743734364697, 36.369010871640597, 0.0 ], [ -96.057875522194621, 36.367855086743297, 0.0 ], [ -96.058121795867905, 36.361550381966197, 0.0 ], [ -96.058057132959306, 36.354387060024202, 0.0 ], [ -96.053784574903418, 36.350764651913003, 0.0 ], [ -96.049693866748299, 36.3472987975628, 0.0 ], [ -96.031855932847094, 36.347234841210202, 0.0 ], [ -96.027373488928802, 36.345235124253399, 0.0 ], [ -96.0275078759189, 36.333766692000502, 0.0 ], [ -96.011956400589895, 36.323941108991797, 0.0 ], [ -96.008901289614499, 36.310596883120198, 0.0 ], [ -96.008154918863085, 36.306927127427002, 0.0 ], [ -96.008738762908294, 36.305291805030599, 0.0 ], [ -96.007994722498196, 36.3021966437868, 0.0 ], [ -96.007758532838807, 36.295269425809501, 0.0 ], [ -96.0015868924242, 36.291759874856801, 0.0 ], [ -95.988805650404203, 36.291862165771498, 0.0 ], [ -95.985051040975904, 36.2836161335103, 0.0 ], [ -95.9827633987436, 36.283649785122599, 0.0 ], [ -95.98151714362902, 36.283002811616903, 0.0 ] ],

            }

          }, {
            'type': 'Feature',
            'geometry': {
              'type': 'GeometryCollection',
              'geometries': [{
                'type': 'LineString',
                'coordinates': [[-5e6, -5e6], [0, -5e6]]
              }, {
                'type': 'Point',
                'coordinates': [4e6, -5e6]
              }, {
                'type': 'Polygon',
                'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
              }]
            }
          }]
        };

var routeVectorSource = new ol.source.Vector({
  features:(new ol.format.GeoJSON()).readFeatures(geojsonObject)
});

var tractsVectorSource = new ol.source.Vector({
  features: (new ol.format.GeoJSON()).readFeatures(parsedData2)
});
        // vectorSource.addFeature(new ol.format.GeoJSON()).readFeatures(geojsonObject);
var zoomedVectorSource = new ol.source.Vector({
  features: (new ol.format.GeoJSON()).readFeatures(parsedZoomedTract)
});


        var routeLayer = new ol.layer.Vector({
          source: routeVectorSource,
          style: styleFunction

        });
//get feature properties for styling
var defaultStyles = (function() {
  var styleDefault = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(255, 255, 255, 0.4)',
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      })
  } );
  return styleDefault;
}() );

var surveyPermissionStyles = ( function() {

  var surveyApprovedStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(0, 204, 102, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );

  var surveyDeniedStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(204, 0, 0, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );
  var specialConditionsStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(255, 204, 0, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );
  var styleDefault = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(255, 255, 255, 0.4)',
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      })

  } );

  return function( feature, resolution ) {
    var surveyPermission = feature.get("Survey Permission");
    var surveyDenied = feature.get("Survey Denied");
    var specialConditions = feature.get("Special Conditions");
    var surveyApproved = feature.get("Survey Approved");
    var acquisition = feature.get("Acquired");
    var acquisitionApproved = feature.get("Acquisition Approved");
    var civilSurvey = feature.get("Civil Survey");
    var civilSurveyApproved = feature.get("Civil Survey Approved");
    var bioSurvey = feature.get("Bio Survey");
    var culturalSurvey = feature.get("Cultural Survey");
    var environmentalApproved = feature.get("Environmental Approved");

    if (specialConditions === "YES" && surveyApproved !== null && typeof(surveyApproved)!=='undefined' && surveyApproved !== ''){
    return specialConditionsStyle;
  } else if (surveyApproved !== null && typeof(surveyApproved)!=='undefined'&& surveyApproved !== '' && surveyPermission !== null && typeof(surveyPermission) !== 'undefined' && surveyPermission!=='') {
      return surveyApprovedStyle;
    } else if (surveyDenied !== null && typeof(surveyDenied)!== 'undefined' && surveyDenied !==''){
      return surveyDeniedStyle;
    } else {
      return styleDefault
    }
  };

}() );

var civilSurveyStyles = ( function() {

var surveyCompleteStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(0, 204, 102, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );
  var surveyDeniedStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(204, 0, 0, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );
var styleDefault = new ol.style.Style( {
      fill: new ol.style.Fill( {
        color: 'rgba(255, 255, 255, 0.4)',
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      })
  } );

  return function( feature, resolution ) {
    var surveyPermission = feature.get("Survey Permission");
    var surveyDenied = feature.get("Survey Denied");
    var surveyApproved = feature.get("Survey Approved");
    var civilSurvey = feature.get("Civil Survey");
    var civilSurveyApproved = feature.get("Civil Survey Approved");

  if(surveyApproved===null || surveyApproved===''||typeof(surveyApproved)==='undefined' && surveyDenied!==null&&typeof(surveyDenied)!==null&&surveyDenied!==''){
return surveyDeniedStyle;
  }else if (civilSurveyApproved !== null && typeof(civilSurveyApproved)!=='undefined'&& civilSurveyApproved !== '' && civilSurvey !== null && typeof(civilSurvey) !== 'undefined' && civilSurvey!=='') {
      return surveyCompleteStyle;
        } else {
      return styleDefault
    }
  };

}() );

var environmentalSurveyStyles = ( function() {

var surveyCompleteStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(0, 204, 102, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );
  var surveyDeniedStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(204, 0, 0, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );
var styleDefault = new ol.style.Style( {
      fill: new ol.style.Fill( {
        color: 'rgba(255, 255, 255, 0.4)',
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      })
  } );

  return function( feature, resolution ) {
    var surveyPermission = feature.get("Survey Permission");
    var surveyDenied = feature.get("Survey Denied");
    var surveyApproved = feature.get("Survey Approved");
    var bioSurvey = feature.get("Bio Survey");
    var culturalSurvey = feature.get("Cultural Survey");
    var environmentalApproved = feature.get("Environmental Approved");

    if(surveyApproved===null || surveyApproved===''||typeof(surveyApproved)==='undefined' && surveyDenied!==null&&typeof(surveyDenied)!==null&&surveyDenied!==''){
      return surveyDeniedStyle;
  }else if (environmentalApproved !== null && typeof(environmentalApproved)!=='undefined'&& environmentalApproved !== '') {
      return surveyCompleteStyle;
        } else {
      return styleDefault
    }
  };

}() );
var acquiredStyles = ( function() {

var acquisitionCompleteStyle = new ol.style.Style( {

      fill: new ol.style.Fill( {
        color: 'rgba(0, 204, 102, 0.4)'
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      }),
      opacity: .4
  } );

    var condemnationStyle = new ol.style.Style( {

        fill: new ol.style.Fill( {
          color: 'rgba(204, 0, 0, 0.4)'
        } ),
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 2
        }),
        opacity: .4
    } );
    var negotiationStyle = new ol.style.Style( {

        fill: new ol.style.Fill( {
          color: 'rgba(255, 204, 0, 0.4)'
        } ),
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 2
        }),
        opacity: .4
    } );
var styleDefault = new ol.style.Style( {
      fill: new ol.style.Fill( {
        color: 'rgba(255, 255, 255, 0.4)',
      } ),
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2
      })
  } );

  return function( feature, resolution ) {

    var acquisition = feature.get("Acquired");
    var acquisitionApproved = feature.get("Acquisition Approved");
    var negotiations = feature.get("Negotiation Status");
    var condemnation = feature.get("Condemnation");

    if (acquisitionApproved !== null && typeof(acquisitionApproved)!=='undefined'&& acquisitionApproved !== '' && acquisition !== null && typeof(acquisition) !== 'undefined' && acquisition!=='') {
      return acquisitionCompleteStyle;
    } else if(acquisitionApproved !== null && typeof(acquisitionApproved)!=='undefined'&& acquisitionApproved !== '' &&condemnation === 'RECOMMENDED'){
      return condemnationStyle;
    } else if(negotiations === 'IN PROGRESS'){
      return negotiationStyle;
    } else {
      return styleDefault
    }
  };

}() );

var zoomedStyles = ( function() {

var zoomDefault = new ol.style.Style( {
      fill: new ol.style.Fill( {
        color: 'transparent',
      } ),
      stroke: new ol.style.Stroke({
        color: 'aqua',
        width: 7
      })
  } );

  return function( feature, resolution ) {

      return zoomDefault;

}
}() );
var tractsLayer = new ol.layer.Vector({
  source: tractsVectorSource,
  style: defaultStyles
});
var surveyPermissionsLayer = new ol.layer.Vector({
  source: tractsVectorSource,
  style: surveyPermissionStyles
});
var civilSurveyLayer = new ol.layer.Vector({
  source: tractsVectorSource,
  style: civilSurveyStyles
});
var environmentalSurveyLayer = new ol.layer.Vector({
  source: tractsVectorSource,
  style: environmentalSurveyStyles
});
var acquiredLayer = new ol.layer.Vector({
  source: tractsVectorSource,
  style: acquiredStyles
});

var zoomedLayer = new ol.layer.Vector({
  source: zoomedVectorSource,
  style: zoomedStyles

});



        var container = document.getElementById('popup');
        var content_element = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');


        closer.onclick = function() {
            // overlay.setPosition(undefined);
            closer.blur();
            container.className="hidden";
            return false;
        };

        map2.addLayer(tractsLayer);
        map2.addLayer(surveyPermissionsLayer);
        map2.addLayer(civilSurveyLayer);
        map2.addLayer(environmentalSurveyLayer);
        map2.addLayer(acquiredLayer);
        map2.addLayer(routeLayer);
        map2.addLayer(zoomedLayer);



        var coord = ol.proj.fromLonLat([centroidLong,centroidLat]);
        var pos = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');

             // Vienna marker
             var markerOverlay = new ol.Overlay({
               position: pos,
               positioning: 'center-center',
               element: document.getElementById('pin'),
               stopEvent: false
             });
             map2.addOverlay(markerOverlay);

var layersDiv = document.getElementById('layersDiv');
var routeCheckbox = document.getElementById('centerline');
var tractsCheckbox = document.getElementById('tractsCheckbox');
var surveyPermissionsCheckbox = document.getElementById('surveyPermissionsCheckbox');
var civilCheckbox = document.getElementById('civilCheckbox');
var environmentalCheckbox = document.getElementById('environmentalCheckbox');
var acquiredCheckbox = document.getElementById('acquiredCheckbox');
var surveyPermissionsLegend = document.getElementById('surveyPermissionsLegend');
var civilSurveyLegend = document.getElementById('civilSurveyLegend');
var environmentalLegend = document.getElementById('environmentalLegend');
var acquisitionLegend = document.getElementById('acquisitionLegend');
var defaultLegend = document.getElementById('defaultLegend');

layersDiv.addEventListener('click',function (){
  zoomedLayer.setVisible(false);
  map2.removeOverlay(markerOverlay);
});

var toggleRoute = function (){
// element.checked = !element.checked
if(routeCheckbox.checked===true){routeLayer.setVisible(true)
}else{
  routeLayer.setVisible(false)
};
if(routeCheckbox.checked===true && surveyPermissionsCheckbox.checked===true||routeCheckbox.checked===true && civilCheckbox.checked===true||routeCheckbox.checked===true && environmentalCheckbox.checked===true||routeCheckbox.checked===true && acquiredCheckbox.checked===true){
  routeLayer.setVisible(true);
  tractsCheckbox.checked=true;
  defaultLegend.style.display="none";

}else if(routeCheckbox.checked===false && tractsCheckbox.checked===true && surveyPermissionsCheckbox.checked===true||civilCheckbox.checked===true||environmentalCheckbox.checked===true||acquiredCheckbox.checked===true){
  routeLayer.setVisible(false);
  defaultLegend.style.display="none";
}else if (routeCheckbox.checked===true){
  routeLayer.setVisible(true);
  defaultLegend.style.display="";
}else if(routeCheckbox.checked===false && tractsCheckbox.checked===true){
  routeLayer.setVisible(false);
  defaultLegend.style.display="";
}else{
  routeLayer.setVisible(false);
  defaultLegend.style.display="none";
}

};
routeCheckbox.addEventListener('change', toggleRoute);
toggleRoute();

      // tractsLayer.setVisible(true);
      var toggleTracts = function (){
        if(tractsCheckbox.checked===true){
          tractsLayer.setVisible(true);
          defaultLegend.style.display="";
        }else if(tractsCheckbox.checked===false && routeCheckbox.checked===true){
          tractsLayer.setVisible(false);
          defaultLegend.style.display="";

        }else{
          tractsLayer.setVisible(false);
          defaultLegend.style.display="none";

        };

      if(tractsCheckbox.checked===false){
        surveyPermissionsLegend.style.display="none";
        civilSurveyLegend.style.display="none";
        acquisitionLegend.style.display="none";
        environmentalLegend.style.display="none";
        surveyPermissionsLayer.setVisible(false);
        surveyPermissionsCheckbox.checked =false;
        civilSurveyLayer.setVisible(false);
        civilCheckbox.checked=false;
        environmentalSurveyLayer.setVisible(false);
        environmentalCheckbox.checked=false;
        acquiredLayer.setVisible(false);
        acquiredCheckbox.checked=false;
        tractsCheckbox.checked = false;
      }

      };
      tractsCheckbox.addEventListener('change', toggleTracts);
      toggleTracts();

      // surveyPermissionsLayer.setVisible(false);
      var togglePermissions = function (){
        // element.checked = !element.checked
if(surveyPermissionsCheckbox.checked===true){surveyPermissionsLayer.setVisible(true)
}else{surveyPermissionsLayer.setVisible(false)};

        // vectorLayer3.setVisible(false);
        if(surveyPermissionsCheckbox.checked === true && tractsCheckbox.checked===true){
          surveyPermissionsLegend.style.display="";
          defaultLegend.style.display="none";
          civilSurveyLegend.style.display="none";
          environmentalLegend.style.display="none";
          acquisitionLegend.style.display="none";
          tractsLayer.setVisible(false);
          civilSurveyLayer.setVisible(false);
          civilCheckbox.checked=false;
          environmentalSurveyLayer.setVisible(false);
          environmentalCheckbox.checked=false;
          acquiredLayer.setVisible(false);
          acquiredCheckbox.checked=false;
        } else if (surveyPermissionsCheckbox.checked ===true && tractsCheckbox.checked===false){
          tractsCheckbox.checked=true;
          surveyPermissionsLegend.style.display="";
          defaultLegend.style.display="none";
        } else if (surveyPermissionsCheckbox.checked ===false && tractsCheckbox.checked===true || surveyPermissionsCheckbox.checked ===false &&routeCheckbox.checked==true ){
          tractsLayer.setVisible(true);
          tractsCheckbox.checked=true;
          surveyPermissionsLegend.style.display="none";
          defaultLegend.style.display="";
        }

    };
    surveyPermissionsCheckbox.addEventListener('change', togglePermissions);
    togglePermissions();


    var toggleCivil = function (){
      // element.checked = !element.checked
      if(civilCheckbox.checked===true){civilSurveyLayer.setVisible(true)
      }else{civilSurveyLayer.setVisible(false)};

              // vectorLayer3.setVisible(false);
              if(civilCheckbox.checked === true && tractsCheckbox.checked===true ){
                civilSurveyLegend.style.display="";
                defaultLegend.style.display="none";
                surveyPermissionsLegend.style.display="none";
                environmentalLegend.style.display="none";
                acquisitionLegend.style.display="none";
                tractsLayer.setVisible(false);
                surveyPermissionsLayer.setVisible(false);
                surveyPermissionsCheckbox.checked=false;
                environmentalSurveyLayer.setVisible(false);
                environmentalCheckbox.checked=false;
                acquiredLayer.setVisible(false);
                acquiredCheckbox.checked=false;
              } else if (civilCheckbox.checked ===true && tractsCheckbox.checked===false){
                tractsCheckbox.checked=true;
                civilSurveyLegend.style.display="";
                defaultLegend.style.display="none";
              } else if (civilCheckbox.checked ===false && tractsCheckbox.checked===true || routeCheckbox.checked==true ){
                tractsLayer.setVisible(true);
                tractsCheckbox.checked=true;
                civilSurveyLegend.style.display="none";
                defaultLegend.style.display="";

              }
  };
  civilCheckbox.addEventListener('change', toggleCivil);
  toggleCivil();


  var toggleEnvironmental = function (){
      // element.checked = !element.checked
    if(environmentalCheckbox.checked===true){environmentalSurveyLayer.setVisible(true)
    }else{environmentalSurveyLayer.setVisible(false)};
      // vectorLayer3.setVisible(false);
      if(environmentalCheckbox.checked === true && tractsCheckbox.checked===true){
        surveyPermissionsLegend.style.display="none";
        defaultLegend.style.display="none";
        civilSurveyLegend.style.display="none";
        environmentalLegend.style.display="";
        acquisitionLegend.style.display="none";
        tractsLayer.setVisible(false);
        civilSurveyLayer.setVisible(false);
        civilCheckbox.checked=false;
        surveyPermissionsLayer.setVisible(false);
        surveyPermissionsCheckbox.checked=false;
        acquiredLayer.setVisible(false);
        acquiredCheckbox.checked=false;
      } else if (environmentalCheckbox.checked ===true && tractsCheckbox.checked===false){
        tractsCheckbox.checked=true;
        environmentalLegend.style.display="";
        defaultLegend.style.display="none";
      } else if (environmentalCheckbox.checked ===false && tractsCheckbox.checked===true || environmentalCheckbox.checked ===false &&routeCheckbox.checked==true ){
        tractsLayer.setVisible(true);
        tractsCheckbox.checked=true;
        environmentalLegend.style.display="none";
        defaultLegend.style.display="";
      }

  };
  environmentalCheckbox.addEventListener('change', toggleEnvironmental);
  toggleEnvironmental();

    var toggleAcquired = function (){
      // element.checked = !element.checked
      if(acquiredCheckbox.checked===true){acquiredLayer.setVisible(true)
      }else {
      acquiredLayer.setVisible(false)
      };
      if(acquiredCheckbox.checked === true && tractsCheckbox.checked===true){
        surveyPermissionsLegend.style.display="none";
        defaultLegend.style.display="none";
        civilSurveyLegend.style.display="none";
        acquisitionLegend.style.display="";
        environmentalLegend.style.display="none";
        tractsLayer.setVisible(false);
        civilSurveyLayer.setVisible(false);
        civilCheckbox.checked=false;
        surveyPermissionsLayer.setVisible(false);
        surveyPermissionsCheckbox.checked=false;
        environmentalSurveyLayer.setVisible(false);
        environmentalCheckbox.checked=false;
      } else if (acquiredCheckbox.checked ===true && tractsCheckbox.checked===false){
        tractsCheckbox.checked=true;
        acquisitionLegend.style.display="";
        defaultLegend.style.display="none";
      } else if (acquiredCheckbox.checked ===false && tractsCheckbox.checked===true || acquiredCheckbox.checked ===false &&routeCheckbox.checked==true ){
        tractsLayer.setVisible(true);
        tractsCheckbox.checked=true;
        acquisitionLegend.style.display="none";
        defaultLegend.style.display="";
      }
  };
  acquiredCheckbox.addEventListener('change', toggleAcquired);
  toggleAcquired();

        map2.on('click', function(evt){
          container.className ="ol-popup";
            var feature = map2.forEachFeatureAtPixel(evt.pixel,
              function(feature, layer) {

                return feature;
              });
            if (feature) {
                var geometry = feature.getGeometry();
                var coordinate = evt.coordinate;

                var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');

                var tract,address,city,state,link,surveydenied,zip,type,county,acres,surveypermissionapproved,surveypermission,specialconditions,civilsurveycomplete, civilsurveyapproved,biosurvey,culturalsurvey,environmentalapproved,acquireddate,acquisitionapproved,title,parcelid,id,owner,geometry;
                tract=feature.get('Tract');
                address=feature.get('Address');
                city=feature.get('City');
                state=feature.get('State');
                zip=feature.get('Zip');
                type=feature.get('Type');
                county=feature.get('County');
                acres=feature.get('Acres');
                surveypermission = feature.get('Survey Permission');
                surveypermissionapproved = feature.get('Survey Approved');
                surveydenied=feature.get('Survey Denied');
                specialconditions = feature.get('Special Conditions');
                title = feature.get('Title Search');
                link = feature.get('View Details');
                civilsurveycomplete = feature.get("Civil Survey");
                civilsurveyapproved = feature.get("Civil Survey Approved");
                biosurvey = feature.get("Bio Survey");
                culturalsurvey = feature.get("Cultural Survey");
                environmentalapproved = feature.get("Environmental Approved");
                acquireddate = feature.get("Acquired");
                acquisitionapproved = feature.get("Acquisition Approved");

                if(surveypermission==null&&typeof(surveypermission)!=='undefined'&&surveypermission!==''){var surveypermissiondata=surveypermission}else{surveypermissiondata=''};
                if(surveypermissionapproved!==null&&typeof(surveypermissionapproved)!=='undefined'&&surveypermissionapproved!==''){var surveyapproveddata=surveypermissionapproved}else{surveyapproveddata=''};
                if(specialconditions!==null&&typeof(specialconditions)!=='undefined'&&specialconditions!==''){var specialconditionsdata=specialconditions}else{specialconditionsdata=''};
                if(surveydenied!==null&&typeof(surveydenied)!=='undefined'&&surveydenied!==''){var surveydenieddata=surveydenied}else{surveydenieddata=''};

                if(acquireddate!==null&&typeof(acquireddate)!=='undefined'&&acquireddate!==''){var acquireddatedata=acquireddate}else{acquireddatedata=''};
                if(biosurvey!==null&&typeof(biosurvey)!=='undefined'&&biosurvey!==''){var biosurveydata=biosurvey}else{biosurveydata=''};
                if(culturalsurvey!==null&&typeof(culturalsurvey)!=='undefined'&&culturalsurvey!==''){var culturalsurveydata=culturalsurvey}else{culturalsurveydata=''};
                if(civilsurveycomplete!==null&&typeof(civilsurveycomplete)!=='undefined'&&civilsurveycomplete!==''){var civilsurveycompletedata=civilsurveycomplete}else{civilsurveycompletedata=''};
                if(title!==null&&typeof(title)!=='undefined'&&title!==''){var titlecompletedata=title}else{titlecompletedata=''};
                parcelid=feature.get('Parcel ID');
                id=feature.get('ID');
                owner=feature.get('Owner');
                // if(i.geometry !== null && i.geometry !=='' && typeof(i.geometry)!=='undefined'){geometry=i.geometry}else {geometry='[0,0]'};
                // var content = '<h3>' + feature.get('Tract') + '</h3>';
                // content += '<h5>' + feature.get('Acres') + '</h5>';
var content = '<table style="font-family:Arial,Verdana,Times;font-size:14px;text-align:left;width:100%;border-collapse:collapse;padding:3px 3px 3px 3px"><tr style="text-align:center;font-weight:bold;background:#0000FF;color:white"><td>Tract '+ tract+'</td></tr><tr><td><table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-spacing:0px; padding:3px 3px 3px 3px"><tr style="height:6px"></tr><tr><td>PARCEL ID</td><td></td><td>'+ parcelid+'</td></tr><tr bgcolor="#D0D0D0"><td>LAND OWNER</td><td></td><td>'+owner+'</td></tr><tr><td>ADDRESS</td><td></td><td>'+address+'</td></tr><tr bgcolor="#D0D0D0"><td>CITY</td><td></td><td>'+city+'</td></tr><tr><td>STATE</td><td></td><td>'+state+'</td></tr><tr bgcolor="#D0D0D0"><td>ZIP</td><td></td><td>'+zip+'</td></tr><tr><td>TYPE</td><td></td><td>'+type+'</td></tr><tr bgcolor="#D0D0D0"><td>COUNTY</td><td></td><td>'+county+'</td></tr><tr><td>ACRES</td><td style="width: 10px"></td><td>'+acres+
'</td></tr><tr bgcolor="#D0D0D0"><td>TITLE SEARCH</td><td></td><td>'+title+'</td></tr><tr><td>SURVEY PERMISSION</td><td></td><td>'+surveypermission+'</td></tr><tr bgcolor="#D0D0D0"><td>SURVEY DENIED</td><td></td><td>'+surveydenied+'</td></tr><tr><td>CIVIL SURVEY</td><td></td><td>'+civilsurveycompletedata+'</td></tr><tr bgcolor="#D0D0D0"><td>BIOLOGICAL SURVEY</td><td></td><td>'+biosurveydata+'</td></tr><tr><td>CULTURAL SURVEY</td><td></td><td>'+culturalsurveydata +'</td></tr><tr bgcolor="#D0D0D0"><td>ACQUIRED</td><td></td><td>'+acquireddatedata+'</td></tr><tr><td>VIEW DETAILS</td><td></td><td>'+ '<u><a style="color:blue;font-weight:bold;" href = "' + link + 'Tract_' + tract + '">'+'Tract '+tract+'</a></u>' +'</td></tr></table></td></tr></table>';

                content_element.innerHTML = content;
                var pos = ol.proj.fromLonLat([16.3725, 48.208889]);

                var overlay = new ol.Overlay({
                  position: pos,
                  // positioning: 'center-center',
                    element: container,
                    // stopEvent: false,

        //             offset: [0, -10],
                    autoPanAnimation: {
          duration: 450
        },
          autoPan: true
                });

                map2.addOverlay(overlay);
overlay.setPosition(coordinate);
            }
        });

            //End OpenLayers Map
},5000);



//                 $scope.newmapdata = function(){
//                   setTimeout(function(){
//                 document.getElementById('mapdata').innerText = newmapdata.replace(/,]/g," ]");
//
//               },2000);
// };

                var results = []; //create new array
                obj.forEach(function(i){ //for each tract

                  var rowcost, accesscost, damagescost;

                  if(typeof(i.rowcost)==='undefined'|| i.rowcost=== null || i.rowcost===""){i.rowcost=0};
                  if(typeof(i.accesscost)==='undefined'|| i.accesscost=== null || i.accesscost===""){i.accesscost=0};
                  if(typeof(i.damagescost)==='undefined'|| i.damagescost=== null || i.damagescost===""){i.damagescost=0};
                  if(typeof(i.othercost)==='undefined'|| i.othercost=== null || i.othercost===""){i.othercost=0};


                  var totalCost = Number(i.rowcost) + Number(i.accesscost) + Number(i.damagescost) + Number(i.othercost);

                  results.push(totalCost);

                })
                  //get sum of values in results array
                function getSum(total, num) {
                    return total + num;
                };
                function myFunction(item){
                  results.reduce(getSum)
                };

        $scope.totalCost = results.reduce(getSum);
              // console.log(getSum(1,6));
              // console.log(results);
              // console.log(results.reduce(getSum));
              // console.log(obj.length);

//get total tracts

        var activeTractsLength = [];
        obj.forEach(function(a){
          if (a.inactive!==true){
            activeTractsLength.push(a.inactive);
                      }
        });

        $scope.totaltracts = activeTractsLength.length;




//get total title completed
        var titlecompletedtotal=[];
        obj.forEach(function(t){ //for each tract


        if (t.titlecomplete!=="" && t.titlecomplete!==null && typeof(t.titlecomplete)!=='undefined' && t.inactive !==true){
        titlecompletedtotal.push(t.titlecomplete);
        };
        });

        $scope.titleComplete=function(){
        var percentComplete=titlecompletedtotal.length/activeTractsLength.length;
        return (percentComplete * 100).toFixed(2);
        };
        $scope.titlecompletedtotal=titlecompletedtotal.length

//get total survey permissions
        var surveypermissionstotal=[];
          obj.forEach(function(s){ //for each tract

          if (s.surveypermission!=="" && s.surveypermission!==null && typeof(s.surveypermission) !=='undefined' && s.inactive !==true && s.surveypermissionapproved!==''&s.surveypermissionapproved!==null&&typeof(s.surveypermissionapproved)!=='undefined'){
          surveypermissionstotal.push(s.surveypermission);
                    };
              })

          $scope.surveyPermissionsComplete=function(){
          var percentComplete=surveypermissionstotal.length/activeTractsLength.length;
          return (percentComplete * 100).toFixed(2);
          };
  $scope.surveypermissionsyes=surveypermissionstotal.length

  // //get total survey permissions
  //         var totaltractssurveyed=[];
  //           obj.forEach(function(x){ //for each tract
  //
  //           if (x.tractsurveyed!==""){
  //           totaltractssurveyed.push(x.tractsurveyed);
  //                     };
  //               })
  //
  //           $scope.totalTractsSurveyed=function(){
  //           var percentComplete=totaltractssurveyed.length/obj.length;
  //           return (percentComplete * 100).toFixed(2);
  //           };
  //   $scope.tractsSurveyed=totaltractssurveyed.length;
  var acquiredtotal=[];
  obj.forEach(function(t){ //for each tract


  if (t.acquireddate!=="" && t.acquireddate!==null && typeof(t.acquireddate)!=='undefined' && t.inactive !==true){
  acquiredtotal.push(t.acquireddate);
  };
  });

  $scope.acquisitionsComplete=function(){
  var percentComplete=acquiredtotal.length/activeTractsLength.length;
  return (percentComplete * 100).toFixed(2);
  };
  $scope.acquiredtotal=acquiredtotal.length




//watch for child changed
// obj.$watch(function(event){
//   console.log(event);
// });
//See who is logged in
// $scope.authObj = $firebaseAuth()
// console.log($scope.authObj)
// var authData = $scope.authObj.$getAuth();

// if (authData) {
//   console.log("Logged in as:", authData.uid);
// } else {
//   console.log("Logged out");
// }
//check to see which User made a change

// obj.$watch(function(event){
//   console.log(event+ ': changed by  ' + authData.email + ' on '+ Date());
// var changedKey= event.key;
// // console.log(obj[changedKey].Address)
//
// });


//get payments totals
var rowcostArray = [];
var temporaryworkspaceArray = [];
var atwsArray = [];
var accessArray = [];
var damagesArray = [];
var otherArray = [];
var grandTotalArray = [];

var landownersArray = [];
obj.forEach(function(o){
  if(o.landowners!==null&&typeof(o.landowners)!=='undefined'){
    landownersArray.push(o.landowners)}
});

var singleownerArray=[];

landownersArray.forEach(function(p){

var arr = Object.keys(p).map(function (key) { return p[key]; });
arr.forEach(function(x){
singleownerArray.push(x)
})
});

var paymentsArray=[];
singleownerArray.forEach(function(payments){
  if(payments.payments!==null&&typeof(payments.payments)!=='undefined'){paymentsArray.push(payments.payments)}
});

var singlePaymentArray = [];
paymentsArray.forEach(function(s){
  var arr = Object.keys(s).map(function (key) { return s[key]; });
  arr.forEach(function(f){
  singlePaymentArray.push(f)
  })
})
                singlePaymentArray.forEach(function(i){
                if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){rowcostArray.push(i.rowcost);grandTotalArray.push(i.rowcost)} else {rowcostArray.push(0);grandTotalArray.push(0)};
                if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){temporaryworkspaceArray.push(i.temporaryworkspacecost); grandTotalArray.push(i.temporaryworkspacecost)} else {temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
                if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){atwsArray.push(i.additionalworkspacecost); grandTotalArray.push(i.additionalworkspacecost)} else {atwsArray.push(0);grandTotalArray.push(0)};
                if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){accessArray.push(i.accesscost); grandTotalArray.push(i.accesscost)} else {accessArray.push(0);grandTotalArray.push(0)};
                if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){damagesArray.push(i.damagescost); grandTotalArray.push(i.damagescost)} else {damagesArray.push(0);grandTotalArray.push(0)};
                if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){otherArray.push(i.othercost); grandTotalArray.push(i.othercost)} else {otherArray.push(0);grandTotalArray.push(0)};
              });

//get Tenant payment totals
var tenantsArray = [];
obj.forEach(function(o){
  if(o.tenants!==null&&typeof(o.tenants)!=='undefined'){tenantsArray.push(o.tenants)}
});

var singletenantArray=[];

tenantsArray.forEach(function(p){

var arr = Object.keys(p).map(function (key) { return p[key]; });
arr.forEach(function(x){
singletenantArray.push(x)
})
});

var tenantPaymentsArray=[];
singletenantArray.forEach(function(payments){
  if(payments.payments!==null&&typeof(payments.payments)!=='undefined'){tenantPaymentsArray.push(payments.payments)}
});

var singleTenantPaymentArray = [];
tenantPaymentsArray.forEach(function(s){
  var arr = Object.keys(s).map(function (key) { return s[key]; });
  arr.forEach(function(f){
  singleTenantPaymentArray.push(f)
  })
})
                singleTenantPaymentArray.forEach(function(i){
                if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){rowcostArray.push(i.rowcost);grandTotalArray.push(i.rowcost)} else {rowcostArray.push(0);grandTotalArray.push(0)};
                if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){temporaryworkspaceArray.push(i.temporaryworkspacecost); grandTotalArray.push(i.temporaryworkspacecost)} else {temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
                if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){atwsArray.push(i.additionalworkspacecost); grandTotalArray.push(i.additionalworkspacecost)} else {atwsArray.push(0);grandTotalArray.push(0)};
                if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){accessArray.push(i.accesscost); grandTotalArray.push(i.accesscost)} else {accessArray.push(0);grandTotalArray.push(0)};
                if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){damagesArray.push(i.damagescost); grandTotalArray.push(i.damagescost)} else {damagesArray.push(0);grandTotalArray.push(0)};
                if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){otherArray.push(i.othercost); grandTotalArray.push(i.othercost)} else {otherArray.push(0);grandTotalArray.push(0)};
              });





//get totals for each payment category array

      function getSum(total, num) {
          return total + num;
      };

      $scope.rowcostTotal = rowcostArray.reduce(getSum).toFixed(2);
      $scope.tempworkspaceTotal = temporaryworkspaceArray.reduce(getSum).toFixed(2);
      $scope.atwsTotal = atwsArray.reduce(getSum).toFixed(2);
      $scope.accessTotal = accessArray.reduce(getSum).toFixed(2);
      $scope.damagesTotal = damagesArray.reduce(getSum).toFixed(2);
      $scope.otherTotal = otherArray.reduce(getSum).toFixed(2);

      $scope.grandTotal = grandTotalArray.reduce(getSum).toFixed(2);



// singlepaymentArray.forEach(function(i){
// if(i.rowcost!==null && typeof(i.rowcost)!=='undefined' && i.rowcost!==''){rowcostArray.push(i.rowcost);grandTotalArray.push(i.rowcost)} else {rowcostArray.push(0);grandTotalArray.push(0)};
// if(i.temporaryworkspacecost!==null && typeof(i.temporaryworkspacecost)!=='undefined' && i.temporaryworkspacecost!==''){temporaryworkspaceArray.push(i.temporaryworkspacecost); grandTotalArray.push(i.temporaryworkspacecost)} else {temporaryworkspaceArray.push(0);grandTotalArray.push(0)};
// if(i.additionalworkspacecost!==null && typeof(i.additionalworkspacecost)!=='undefined' && i.additionalworkspacecost!==''){atwsArray.push(i.additionalworkspacecost); grandTotalArray.push(i.additionalworkspacecost)} else {atwsArray.push(0);grandTotalArray.push(0)};
// if(i.accesscost!==null && typeof(i.accesscost)!=='undefined' && i.accesscost!==''){accessArray.push(i.accesscost); grandTotalArray.push(i.accesscost)} else {accessArray.push(0);grandTotalArray.push(0)};
// if(i.damagescost!==null && typeof(i.damagescost)!=='undefined' && i.damagescost!==''){damagesArray.push(i.damagescost); grandTotalArray.push(i.damagescost)} else {damagesArray.push(0);grandTotalArray.push(0)};
// if(i.othercost!==null && typeof(i.othercost)!=='undefined' && i.othercost!==''){otherArray.push(i.othercost); grandTotalArray.push(i.othercost)} else {otherArray.push(0);grandTotalArray.push(0)};
//
//
// });



  }
            )

//permits totals
var approvedpermits = [];
var totalpermits = [];

  //get civil permits
  var civilpermitsobj = $firebaseArray(Ref.child('civilpermits'));
  civilpermitsobj.$loaded()

    .then(function() {
      civilpermitsobj.forEach(function(i){
      $scope.totalCivilPermits = civilpermitsobj.length;
      if (i.inactive!==true){
        totalpermits.push(i.inactive)};

      if (i.inactive!==true && i.permitapproved!=='' && i.permitapproved!==null & typeof(i.permitapproved) !=='undefined'){
          approvedpermits.push(i.permitapproved);
      };


    });
    $scope.totalPermits = totalpermits.length
    $scope.approvedPermits = approvedpermits.length;

    $scope.permitsApproved = function(){
    var approvedPermitsTotal=approvedpermits.length/totalpermits.length;
    return (approvedPermitsTotal * 100).toFixed(2);
    };
    })
    .catch(function () {
     console.log("Promise Rejected");
});

//get environmental permits
    var environmentalpermitsobj = $firebaseArray(Ref.child('environmentalpermits'));
    environmentalpermitsobj.$loaded()
      .catch(alert)
      .then(function() {
        environmentalpermitsobj.forEach(function(i){
          $scope.totalEnvironmentalPermits = environmentalpermitsobj.length
          if (i.inactive!==true){
            totalpermits.push(i.inactive)};

        if (i.inactive!==true && i.permitapproved!=='' && i.permitapproved!==null & typeof(i.permitapproved) !=='undefined'){
            approvedpermits.push(i.permitapproved);
        };
});
$scope.totalPermits = totalpermits.length
$scope.approvedPermits = approvedpermits.length;

$scope.permitsApproved = function(){
var approvedPermitsTotal=approvedpermits.length/totalpermits.length;
return (approvedPermitsTotal * 100).toFixed(2);
};
      });

//get utility permits
  var utilitypermitsobj = $firebaseArray(Ref.child('utilitypermits'));
  utilitypermitsobj.$loaded()
  .catch(alert)
  .then(function() {

  utilitypermitsobj.forEach(function(i){
  $scope.totalUtilityPermits = utilitypermitsobj.length;
  if (i.inactive!==true){
    totalpermits.push(i.inactive)};
    if (i.inactive!==true && i.permitapproved!=='' && i.permitapproved!==null & typeof(i.permitapproved) !=='undefined'){
        approvedpermits.push(i.permitapproved);
    };

});
$scope.totalPermits = totalpermits.length
$scope.approvedPermits = approvedpermits.length;

$scope.permitsApproved = function(){
var approvedPermitsTotal=approvedpermits.length/totalpermits.length;
return (approvedPermitsTotal * 100).toFixed(2);
};




    });





//end of permits totals










$scope.routedata = {
"type": "FeatureCollection",
"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

"features": [
{ "type": "Feature", "properties": { "Name": "South 1A", "description": null,"timestamp": null, "begin": null, "end": null, "altitudeMode": null, "tessellate": 1, "extrude": -1, "visibility": 0, "drawOrder": null, "icon": null, "snippet": "" }, "geometry": { "type": "LineString", "coordinates": [ [ -102.032052949011998, 36.762928363802601, 0.0 ], [ -102.031882546598993, 36.747999060105101, 0.0 ], [ -102.031882473574001, 36.747992653636203, 0.0 ], [ -102.031509602092996, 36.689922874768001, 0.0 ], [ -101.988098974002, 36.689864868614698, 0.0 ], [ -101.889151211186004, 36.689983139093201, 0.0 ], [ -101.816268874203999, 36.690055965981998, 0.0 ], [ -101.789424510489994, 36.672292151842399, 0.0 ], [ -101.751008086926007, 36.6465714319569, 0.0 ], [ -101.708484370896997, 36.617162520429602, 0.0 ], [ -101.700096322533, 36.616888698185498, 0.0 ], [ -101.690673306543005, 36.616981732732697, 0.0 ], [ -101.690017994599003, 36.616982102974603, 0.0 ], [ -101.677128435713996, 36.616854770763801, 0.0 ], [ -101.672563981427004, 36.616798572019398, 0.0 ], [ -101.672570894204995, 36.6057193541928, 0.0 ], [ -101.672089572573995, 36.602257747376598, 0.0 ], [ -101.672578904326997, 36.598262775958098, 0.0 ], [ -101.672354498486996, 36.569219912181602, 0.0 ], [ -101.669434525962004, 36.566519513784797, 0.0 ], [ -101.654658727075997, 36.566441348334799, 0.0 ], [ -101.645591128964995, 36.566580184186201, 0.0 ], [ -101.636484862002007, 36.566091962663997, 0.0 ], [ -101.627177486696993, 36.566165367113598, 0.0 ], [ -101.624344709059002, 36.566162168280499, 0.0 ], [ -101.611713491751999, 36.565726549688499, 0.0 ], [ -101.608825090539995, 36.565623090024303, 0.0 ], [ -101.603843515281, 36.5659730080218, 0.0 ], [ -101.599993843169997, 36.565910575802498, 0.0 ], [ -101.596884258982001, 36.566073825442302, 0.0 ], [ -101.588905428358999, 36.566102903345197, 0.0 ], [ -101.581215216340993, 36.565349731576397, 0.0 ], [ -101.573932034018, 36.565598586106198, 0.0 ], [ -101.569107184955001, 36.565980951562302, 0.0 ], [ -101.556251276525998, 36.566089164862603, 0.0 ], [ -101.538379951078994, 36.566658253964199, 0.0 ], [ -101.528627948638004, 36.566555439396303, 0.0 ], [ -101.504650925586006, 36.573143930823697, 0.0 ], [ -101.475424847387998, 36.573143349821301, 0.0 ], [ -101.446839909820994, 36.572590957386304, 0.0 ], [ -101.438116151247002, 36.572932584853298, 0.0 ], [ -101.419047521072997, 36.572817447091502, 0.0 ], [ -101.399798409796006, 36.57284776369, 0.0 ], [ -101.386541310222, 36.571676553890498, 0.0 ], [ -101.363341080625005, 36.5707209872444, 0.0 ], [ -101.327386240506002, 36.5711574098382, 0.0 ], [ -101.309871555317997, 36.5661934110557, 0.0 ], [ -101.295728076724998, 36.562623679049601, 0.0 ], [ -101.287680264700001, 36.560229033392901, 0.0 ], [ -101.275066017154003, 36.556486998724601, 0.0 ], [ -101.262274065691003, 36.552437231829799, 0.0 ], [ -101.242075728874994, 36.547055923000102, 0.0 ], [ -101.231777072900002, 36.5441044356321, 0.0 ], [ -101.225685695889993, 36.542317992126897, 0.0 ], [ -101.217835892037002, 36.539767892998, 0.0 ], [ -101.208481873352994, 36.5368250084274, 0.0 ], [ -101.199821739564996, 36.536558605235903, 0.0 ], [ -101.188330818473005, 36.536473048856301, 0.0 ], [ -101.179496208661007, 36.536983558043801, 0.0 ], [ -101.172503157286997, 36.537027507738202, 0.0 ], [ -101.166630645401, 36.536954306767498, 0.0 ], [ -101.152342237712006, 36.537857515595803, 0.0 ], [ -101.143933570637998, 36.5377610352554, 0.0 ], [ -101.120772361095007, 36.536622810084502, 0.0 ], [ -101.104769797936996, 36.536568247822601, 0.0 ], [ -101.095059047126995, 36.536448227014198, 0.0 ], [ -101.089192737190999, 36.536446097063802, 0.0 ], [ -101.071334885965996, 36.5363086973055, 0.0 ], [ -101.052865787393998, 36.529498894142598, 0.0 ], [ -101.051431876107003, 36.529498079603599, 0.0 ], [ -101.048479033, 36.529492298971903, 0.0 ], [ -101.045724786771004, 36.5294904849152, 0.0 ], [ -101.04287949287, 36.529486022044701, 0.0 ], [ -101.040024450632998, 36.529485923665199, 0.0 ], [ -101.037170902655006, 36.529483179007599, 0.0 ], [ -101.034319858771994, 36.529477835737602, 0.0 ], [ -101.031466059478007, 36.529473038947302, 0.0 ], [ -101.028609887876001, 36.529470810149398, 0.0 ], [ -101.025760346946001, 36.529428024335502, 0.0 ], [ -101.022916781923996, 36.529428891116197, 0.0 ], [ -101.020065701343995, 36.529432872799603, 0.0 ], [ -101.017212075366004, 36.529436202501898, 0.0 ], [ -101.014359927775999, 36.529438115594402, 0.0 ], [ -101.011508190515002, 36.529439885870801, 0.0 ], [ -101.008655763803006, 36.529441122523799, 0.0 ], [ -101.005801030561003, 36.529444168653399, 0.0 ], [ -101.002948315926005, 36.529445022009703, 0.0 ], [ -101.000099359011003, 36.529447022218598, 0.0 ], [ -100.997122873083001, 36.529448316739597, 0.0 ], [ -100.994395313609999, 36.529451022476401, 0.0 ], [ -100.991542260198003, 36.529451022323698, 0.0 ], [ -100.988688356173995, 36.529453373033299, 0.0 ], [ -100.985841219297996, 36.529456023577701, 0.0 ], [ -100.983034138261004, 36.529455346523399, 0.0 ], [ -100.980132636701001, 36.529457023129602, 0.0 ], [ -100.976637292974004, 36.5294620225351, 0.0 ], [ -100.973144732663002, 36.529460265313702, 0.0 ], [ -100.970294719384995, 36.529463076125097, 0.0 ], [ -100.967440076111004, 36.529464780501897, 0.0 ], [ -100.964588505235, 36.529464418274202, 0.0 ], [ -100.961685959147005, 36.529466022814503, 0.0 ], [ -100.958751881726997, 36.529464027015599, 0.0 ], [ -100.955828886229, 36.529529623965502, 0.0 ], [ -100.952376803215998, 36.529554959655599, 0.0 ], [ -100.936272634755994, 36.529548579284501, 0.0 ], [ -100.926966307659001, 36.529571552199897, 0.0 ], [ -100.917655514781998, 36.532848382781303, 0.0 ], [ -100.898628386979993, 36.532698704870299, 0.0 ], [ -100.882570351903993, 36.532784973727203, 0.0 ], [ -100.875167010857993, 36.529665195860197, 0.0 ], [ -100.868592793207995, 36.529645436897397, 0.0 ], [ -100.864624878067005, 36.529650561810797, 0.0 ], [ -100.863569006510005, 36.529529246109, 0.0 ], [ -100.801321281056005, 36.529425503233597, 0.0 ], [ -100.796767264017006, 36.529113015682697, 0.0 ], [ -100.756118731439003, 36.529110626980497, 0.0 ], [ -100.756098600138998, 36.507985242812303, 0.0 ], [ -100.756098341810997, 36.507713771085101, 0.0 ], [ -100.755758581966006, 36.507713945296601, 0.0 ], [ -100.752099202970996, 36.507709916717197, 0.0 ], [ -100.748436041076999, 36.507709735439299, 0.0 ], [ -100.744756952040007, 36.507708655802404, 0.0 ], [ -100.741095295844005, 36.507709341695801, 0.0 ], [ -100.737419287064995, 36.507707527412101, 0.0 ], [ -100.733752325604996, 36.5077091256682, 0.0 ], [ -100.730114791811005, 36.507705666069398, 0.0 ], [ -100.726424951799999, 36.507704241813002, 0.0 ], [ -100.722798201033001, 36.507706795816802, 0.0 ], [ -100.719192900102996, 36.507708957287001, 0.0 ], [ -100.715504355091994, 36.507709631707201, 0.0 ], [ -100.711846020026996, 36.507710845906502, 0.0 ], [ -100.708201708237993, 36.507712598506103, 0.0 ], [ -100.704548124696998, 36.507713232151197, 0.0 ], [ -100.700906599090004, 36.507712660830698, 0.0 ], [ -100.697238133759996, 36.507711912851597, 0.0 ], [ -100.693581661728999, 36.507712490902399, 0.0 ], [ -100.689949553576994, 36.507715350811097, 0.0 ], [ -100.686344941732003, 36.507716038821002, 0.0 ], [ -100.682838804111995, 36.507718950850702, 0.0 ], [ -100.679206345208001, 36.507720229265601, 0.0 ], [ -100.676316769178996, 36.507726026946003, 0.0 ], [ -100.673587076646996, 36.507718562687003, 0.0 ], [ -100.669882652259005, 36.5077177456184, 0.0 ], [ -100.666183017205995, 36.507719621991399, 0.0 ], [ -100.662559443218996, 36.5077205034952, 0.0 ], [ -100.658943543004, 36.507720768044798, 0.0 ], [ -100.655323032544999, 36.507719597672903, 0.0 ], [ -100.651625980817002, 36.507720121743198, 0.0 ], [ -100.648008638590994, 36.507718991266898, 0.0 ], [ -100.644533510667003, 36.507718468227402, 0.0 ], [ -100.640914854572998, 36.507718957235703, 0.0 ], [ -100.637295663436007, 36.507715320190698, 0.0 ], [ -100.633669856221005, 36.507713643007897, 0.0 ], [ -100.630058247554004, 36.507716417756399, 0.0 ], [ -100.626430923490005, 36.507709145489997, 0.0 ], [ -100.622785866081998, 36.507708464906997, 0.0 ], [ -100.619172272702002, 36.507705729934102, 0.0 ], [ -100.615573478944, 36.507704970595398, 0.0 ], [ -100.611972083064998, 36.507702891662298, 0.0 ], [ -100.608335172051, 36.5076989682224, 0.0 ], [ -100.604704896650006, 36.507697072793199, 0.0 ], [ -100.601064917550005, 36.507693133003897, 0.0 ], [ -100.597421656945997, 36.507690436796302, 0.0 ], [ -100.593788652884001, 36.507690706700899, 0.0 ], [ -100.590149654629997, 36.5076916910511, 0.0 ], [ -100.586519471317004, 36.507686293173798, 0.0 ], [ -100.582883163944004, 36.507685515885903, 0.0 ], [ -100.579254610120998, 36.507683476078199, 0.0 ], [ -100.575621771106995, 36.5076798166114, 0.0 ], [ -100.571834757152004, 36.507674579905803, 0.0 ], [ -100.568290733992001, 36.5076756290403, 0.0 ], [ -100.564667186703005, 36.507672072170401, 0.0 ], [ -100.561104261458993, 36.507665857273203, 0.0 ], [ -100.558635390860005, 36.507660565894497, 0.0 ], [ -100.557165741031994, 36.509093902420602, 0.0 ], [ -100.554954341721, 36.511231824670098, 0.0 ], [ -100.552717488651993, 36.5133963863316, 0.0 ], [ -100.550266607593997, 36.515452447844098, 0.0 ], [ -100.547771634217995, 36.5175515708247, 0.0 ], [ -100.545302887559004, 36.519632613693503, 0.0 ], [ -100.542832319523001, 36.521703579740901, 0.0 ], [ -100.540354897590007, 36.523786123631197, 0.0 ], [ -100.537870835369006, 36.525878269713999, 0.0 ], [ -100.535386640653002, 36.527965467274903, 0.0 ], [ -100.532932703688999, 36.530026533120903, 0.0 ], [ -100.530443927568001, 36.532118474311297, 0.0 ], [ -100.527966311517005, 36.534200887880701, 0.0 ], [ -100.525483598183996, 36.536286922461301, 0.0 ], [ -100.524979480406003, 36.536711244860399, 0.0 ], [ -100.504553919867007, 36.536668753971902, 0.0 ], [ -100.486555126314997, 36.536627710328098, 0.0 ], [ -100.468606555864994, 36.536605055968899, 0.0 ], [ -100.450666230164998, 36.536566214431097, 0.0 ], [ -100.432556977831993, 36.536606353581099, 0.0 ], [ -100.414663832602002, 36.536620288679401, 0.0 ], [ -100.379204570968994, 36.536775192982603, 0.0 ], [ -100.375545437468006, 36.536704110648998, 0.0 ], [ -100.361594962438005, 36.536891183810702, 0.0 ], [ -100.357617700660995, 36.537072854723903, 0.0 ], [ -100.352152306416997, 36.536513263998799, 0.0 ], [ -100.172441357688001, 36.536573909850397, 0.0 ], [ -100.153929639797994, 36.540444483075902, 0.0 ], [ -100.144937651120003, 36.543462197703398, 0.0 ], [ -100.077052866439004, 36.5435088478458, 0.0 ], [ -100.037018300647006, 36.543450676252903, 0.0 ], [ -100.006738936410002, 36.515520590659897, 0.0 ], [ -99.954996923356404, 36.515138108861102, 0.0 ], [ -99.892060819897296, 36.515134135769699, 0.0 ], [ -99.856858006849293, 36.515145650132197, 0.0 ], [ -99.824623431558905, 36.515030997106102, 0.0 ], [ -99.806618157320699, 36.515357460438601, 0.0 ], [ -99.802455529043087, 36.515335330814203, 0.0 ], [ -99.799651808027193, 36.513889808266597, 0.0 ], [ -99.796494558931698, 36.512261873956803, 0.0 ], [ -99.793808515301095, 36.511123026988898, 0.0 ], [ -99.790530045973796, 36.509689756554501, 0.0 ], [ -99.787279444472006, 36.508219624509998, 0.0 ], [ -99.78403266214589, 36.506763451581897, 0.0 ], [ -99.780947653648596, 36.505364193033103, 0.0 ], [ -99.777711442631414, 36.503902149287498, 0.0 ], [ -99.774484278679694, 36.502438899181101, 0.0 ], [ -99.771461891249885, 36.501070341686003, 0.0 ], [ -99.768234797092887, 36.499610415159601, 0.0 ], [ -99.765233089916194, 36.498248930764298, 0.0 ], [ -99.761992290121782, 36.4967792507653, 0.0 ], [ -99.758843516932103, 36.495355304727298, 0.0 ], [ -99.755590578766615, 36.493883405819098, 0.0 ], [ -99.752609889654593, 36.492524905499003, 0.0 ], [ -99.7495748136282, 36.491148770671202, 0.0 ], [ -99.746770732070203, 36.489879641083697, 0.0 ], [ -99.743833515788793, 36.4885458295213, 0.0 ], [ -99.740613003971703, 36.487086114708099, 0.0 ], [ -99.737424325785014, 36.485640275278598, 0.0 ], [ -99.734188764618494, 36.484173738203701, 0.0 ], [ -99.731304630760491, 36.482867608999904, 0.0 ], [ -99.728185328085303, 36.481453686277597, 0.0 ], [ -99.725028902084603, 36.480021575846898, 0.0 ], [ -99.723055711096009, 36.479118960538699, 0.0 ], [ -99.723052301058019, 36.479115745668402, 0.0 ], [ -99.695589633569199, 36.453215284388797, 0.0 ], [ -99.66528149042739, 36.439841411407997, 0.0 ], [ -99.6463257402918, 36.431320250063003, 0.0 ], [ -99.623854614265213, 36.419525403314204, 0.0 ], [ -99.561906483880406, 36.419476579014002, 0.0 ], [ -99.557794462934197, 36.417426687771403, 0.0 ], [ -99.535250734566006, 36.405570158275502, 0.0 ], [ -99.520594557927282, 36.397270827692601, 0.0 ], [ -99.510194313485499, 36.391593964625699, 0.0 ], [ -99.497669958197307, 36.383903745884801, 0.0 ], [ -99.483732715726703, 36.3803802775995, 0.0 ], [ -99.4722385491674, 36.376384005654401, 0.0 ], [ -99.457476905646104, 36.364923100746701, 0.0 ], [ -99.455494785413705, 36.363339063567501, 0.0 ], [ -99.454132601334294, 36.362189146709298, 0.0 ], [ -99.445053827451105, 36.362167505342903, 0.0 ], [ -99.440058449387607, 36.362730864368203, 0.0 ], [ -99.433962935165098, 36.362165471382099, 0.0 ], [ -99.413730651434605, 36.361870592265902, 0.0 ], [ -99.407265211072698, 36.361878124409998, 0.0 ], [ -99.405404256646804, 36.3611953792498, 0.0 ], [ -99.394029599511398, 36.361186821738002, 0.0 ], [ -99.389765397927391, 36.361191125193798, 0.0 ], [ -99.388282192216479, 36.361942169410497, 0.0 ], [ -99.38627174749611, 36.361626477907798, 0.0 ], [ -99.373661828239506, 36.361838995908798, 0.0 ], [ -99.371575293206519, 36.362216240099798, 0.0 ], [ -99.368192084496783, 36.361900579440601, 0.0 ], [ -99.357998175257492, 36.362089484261503, 0.0 ], [ -99.352892424850197, 36.3622214118896, 0.0 ], [ -99.336437541345404, 36.3610173092829, 0.0 ], [ -99.296983518485405, 36.362321569367502, 0.0 ], [ -99.289156353129712, 36.3620637922265, 0.0 ], [ -99.283295480279307, 36.362572781127, 0.0 ], [ -99.264677095441499, 36.3626335825832, 0.0 ], [ -99.247001832201704, 36.362647124309198, 0.0 ], [ -99.2331571624118, 36.362650363815398, 0.0 ], [ -99.229347557055902, 36.3624345101261, 0.0 ], [ -99.224487307485504, 36.362515490644199, 0.0 ], [ -99.210257991554201, 36.362730946711899, 0.0 ], [ -99.201980010133184, 36.362689736827001, 0.0 ], [ -99.192939196452102, 36.362745462682803, 0.0 ], [ -99.15653401579489, 36.362505546444801, 0.0 ], [ -99.145346548986382, 36.367521311238498, 0.0 ], [ -99.138165470462411, 36.369843510379198, 0.0 ], [ -99.121462611760307, 36.376569248994599, 0.0 ], [ -99.07619856900611, 36.376390714363197, 0.0 ], [ -99.050103590159779, 36.376438562420901, 0.0 ], [ -99.032779355014597, 36.376439052895002, 0.0 ], [ -98.996602868271111, 36.376481654051503, 0.0 ], [ -98.977225272535506, 36.376296558164, 0.0 ], [ -98.935460953690693, 36.376276296111101, 0.0 ], [ -98.915643829062986, 36.376159672308098, 0.0 ], [ -98.901775016251818, 36.376014125422799, 0.0 ], [ -98.892890951880617, 36.375334839646698, 0.0 ], [ -98.887139323745501, 36.376010124853302, 0.0 ], [ -98.876628243512101, 36.375944783090503, 0.0 ], [ -98.835545209537798, 36.3756554409972, 0.0 ], [ -98.830583829667106, 36.375611743590298, 0.0 ], [ -98.825985701538698, 36.375488156556798, 0.0 ], [ -98.815478382260494, 36.375200617401703, 0.0 ], [ -98.813154909400794, 36.375389356253002, 0.0 ], [ -98.810004305664805, 36.375423365660602, 0.0 ], [ -98.804378981034404, 36.3760347310509, 0.0 ], [ -98.800145498039797, 36.376502758096997, 0.0 ], [ -98.794133839634597, 36.376424663644997, 0.0 ], [ -98.791592590488492, 36.376423763601302, 0.0 ], [ -98.786882832520988, 36.376321486678101, 0.0 ], [ -98.773515695234494, 36.376001317235101, 0.0 ], [ -98.769451035493304, 36.375989714884, 0.0 ], [ -98.763018645643797, 36.375948076738901, 0.0 ], [ -98.756897385528021, 36.375953450976702, 0.0 ], [ -98.7488281385411, 36.376096077658701, 0.0 ], [ -98.741052476064297, 36.376106807560802, 0.0 ], [ -98.732981534992021, 36.376622814588401, 0.0 ], [ -98.7270313695184, 36.377081753987603, 0.0 ], [ -98.720740256996294, 36.3774327133168, 0.0 ], [ -98.713385734113203, 36.377927188686598, 0.0 ], [ -98.708265019628101, 36.378299870727297, 0.0 ], [ -98.706411508404997, 36.378409947306601, 0.0 ], [ -98.701982845558703, 36.378651673278199, 0.0 ], [ -98.697653737915203, 36.377995397703302, 0.0 ], [ -98.694727002652797, 36.379181455643803, 0.0 ], [ -98.686660380716006, 36.379147196421698, 0.0 ], [ -98.6829452327447, 36.379074329384402, 0.0 ], [ -98.677575250450602, 36.3790153357359, 0.0 ], [ -98.676699588507802, 36.378973153856002, 0.0 ], [ -98.671641347707194, 36.378729590995199, 0.0 ], [ -98.664833613667298, 36.378581497647197, 0.0 ], [ -98.663091038254606, 36.378519993156601, 0.0 ], [ -98.658570533861095, 36.378355124576601, 0.0 ], [ -98.658530177097816, 36.378383428593303, 0.0 ], [ -98.650761132869206, 36.383831591106599, 0.0 ], [ -98.623334497963398, 36.383583278727102, 0.0 ], [ -98.618100784670787, 36.383439055979302, 0.0 ], [ -98.595315146656503, 36.383394097402899, 0.0 ], [ -98.578982779524409, 36.383728888011397, 0.0 ], [ -98.563586794599487, 36.383867802124499, 0.0 ], [ -98.540395600886299, 36.384119338157802, 0.0 ], [ -98.516134846227303, 36.384145167881101, 0.0 ], [ -98.497852928817807, 36.384019729635199, 0.0 ], [ -98.484240403469499, 36.383239468614903, 0.0 ], [ -98.464083816352087, 36.370918076044298, 0.0 ], [ -98.463185938831799, 36.370369048072902, 0.0 ], [ -98.458032629136412, 36.368727096989197, 0.0 ], [ -98.431036242660184, 36.358492336382703, 0.0 ], [ -98.400504458304809, 36.347563523396403, 0.0 ], [ -98.336971856863002, 36.347731972168702, 0.0 ], [ -98.318750446531297, 36.347740979229997, 0.0 ], [ -98.313862110584012, 36.347198269211397, 0.0 ], [ -98.305753116387805, 36.345299261222998, 0.0 ], [ -98.296043852694595, 36.347186571821297, 0.0 ], [ -98.283983057772019, 36.3473145644274, 0.0 ], [ -98.277154490458287, 36.347312352180602, 0.0 ], [ -98.272888683531605, 36.347959158149699, 0.0 ], [ -98.255596544549405, 36.347813016925002, 0.0 ], [ -98.252635946690219, 36.354611858683498, 0.0 ], [ -98.194255727234818, 36.354286449904997, 0.0 ], [ -98.166710784640202, 36.3543949278436, 0.0 ], [ -98.157319206153005, 36.354444642607902, 0.0 ], [ -98.122648966549804, 36.354381195444702, 0.0 ], [ -98.101792362368599, 36.354389881966398, 0.0 ], [ -98.096373623301403, 36.354728742185202, 0.0 ], [ -98.033666875056511, 36.354837645582997, 0.0 ], [ -98.029844000840995, 36.354415812270197, 0.0 ], [ -98.006236980485511, 36.354357504061802, 0.0 ], [ -97.997665590364491, 36.3543987969353, 0.0 ], [ -97.997092877319702, 36.322542534349999, 0.0 ], [ -97.996997876627489, 36.306006174073303, 0.0 ], [ -97.996922404542318, 36.296796016567697, 0.0 ], [ -97.988820694537296, 36.2963529128156, 0.0 ], [ -97.974370366569389, 36.296340071602003, 0.0 ], [ -97.961297935052897, 36.296481999041397, 0.0 ], [ -97.948495102052703, 36.296766960610498, 0.0 ], [ -97.942569877771405, 36.2963632241743, 0.0 ], [ -97.925857955783599, 36.296338759011597, 0.0 ], [ -97.907596329119812, 36.296491699947097, 0.0 ], [ -97.880038461740696, 36.2965204895741, 0.0 ], [ -97.866354674118782, 36.2965091603592, 0.0 ], [ -97.854111039326114, 36.296532065574503, 0.0 ], [ -97.836810527083301, 36.296568025069497, 0.0 ], [ -97.827792867353594, 36.296510845589303, 0.0 ], [ -97.827513150614394, 36.306413880794501, 0.0 ], [ -97.823510395188407, 36.308511187427598, 0.0 ], [ -97.816376681070594, 36.311976735748097, 0.0 ], [ -97.79880409433531, 36.32067714918, 0.0 ], [ -97.790843415206993, 36.324660498397897, 0.0 ], [ -97.788133179271597, 36.325168853659399, 0.0 ], [ -97.782834021160696, 36.325212188667201, 0.0 ], [ -97.782827682813306, 36.325233150683701, 0.0 ], [ -97.781138125135811, 36.330820183694897, 0.0 ], [ -97.779084745926895, 36.335373453624001, 0.0 ], [ -97.767680948414593, 36.339835069293997, 0.0 ], [ -97.766788351686714, 36.3407335037694, 0.0 ], [ -97.747117685216679, 36.348594330190302, 0.0 ], [ -97.729185406625405, 36.355764510218698, 0.0 ], [ -97.720975811232194, 36.359207252226398, 0.0 ], [ -97.711177684571595, 36.363399299102703, 0.0 ], [ -97.693187827872819, 36.371279635810602, 0.0 ], [ -97.684087226571904, 36.375102365644601, 0.0 ], [ -97.684126281943705, 36.390427014197599, 0.0 ], [ -97.684169916271287, 36.400151743355998, 0.0 ], [ -97.684175739447596, 36.418451328552003, 0.0 ], [ -97.683924835234805, 36.419259095340799, 0.0 ], [ -97.684193424743299, 36.419993632871702, 0.0 ], [ -97.684141259530506, 36.433956634716502, 0.0 ], [ -97.657777960191297, 36.443256909331303, 0.0 ], [ -97.652716520649605, 36.445048700043998, 0.0 ], [ -97.650754907206206, 36.445737483642901, 0.0 ], [ -97.648619646520601, 36.4464790287863, 0.0 ], [ -97.646548200341499, 36.447216261785897, 0.0 ], [ -97.644707053983396, 36.447891187904098, 0.0 ], [ -97.634518858296303, 36.4514434877631, 0.0 ], [ -97.623567161517784, 36.455291876717702, 0.0 ], [ -97.604258980776393, 36.455300057879001, 0.0 ], [ -97.595145916834397, 36.455254022593401, 0.0 ], [ -97.595301474173297, 36.465314720388598, 0.0 ], [ -97.586743898545308, 36.468299109679798, 0.0 ], [ -97.582675719523706, 36.469753970439299, 0.0 ], [ -97.575511663367095, 36.472534182824504, 0.0 ], [ -97.566907813024699, 36.475863651968098, 0.0 ], [ -97.559392771194496, 36.478833023119499, 0.0 ], [ -97.550760376450512, 36.482306279743099, 0.0 ], [ -97.528044372810598, 36.490908307000403, 0.0 ], [ -97.519440397048811, 36.4941235520985, 0.0 ], [ -97.507516216063493, 36.498532885831203, 0.0 ], [ -97.506594673605207, 36.498889250986601, 0.0 ], [ -97.499166068360196, 36.5015573620176, 0.0 ], [ -97.496591938285121, 36.502345155313797, 0.0 ], [ -97.495093007834896, 36.502951361842797, 0.0 ], [ -97.492983437801001, 36.5036793815989, 0.0 ], [ -97.490762627058217, 36.504417660954601, 0.0 ], [ -97.488488139172205, 36.505081802975802, 0.0 ], [ -97.48584891502172, 36.505965224612602, 0.0 ], [ -97.482047599951898, 36.507259352956297, 0.0 ], [ -97.479599721426197, 36.508118152092003, 0.0 ], [ -97.477104177970517, 36.508858828536702, 0.0 ], [ -97.47495532321679, 36.5095670991616, 0.0 ], [ -97.471458122011796, 36.510729368568299, 0.0 ], [ -97.470775023252116, 36.510962431179202, 0.0 ], [ -97.466298103109082, 36.512222532981397, 0.0 ], [ -97.464098499192701, 36.513014161332002, 0.0 ], [ -97.463295260935197, 36.5130174774404, 0.0 ], [ -97.360009903481895, 36.513399162090998, 0.0 ], [ -97.351822755260102, 36.514317573345501, 0.0 ], [ -97.319337693208908, 36.515164056634802, 0.0 ], [ -97.264392326301916, 36.514780311003797, 0.0 ], [ -97.236368356806793, 36.513855368429503, 0.0 ], [ -97.211046164545706, 36.513838641068503, 0.0 ], [ -97.205414223057488, 36.513776768992798, 0.0 ], [ -97.192712864887099, 36.514031506017403, 0.0 ], [ -97.185337374365318, 36.514643482077602, 0.0 ], [ -97.138656825964404, 36.514761382823501, 0.0 ], [ -97.126420818543707, 36.514113017179199, 0.0 ], [ -97.12000569140838, 36.513988800219501, 0.0 ], [ -97.084833386701689, 36.5141093457663, 0.0 ], [ -97.084827313965206, 36.514109365347402, 0.0 ], [ -97.068922796905596, 36.510767954041398, 0.0 ], [ -97.068036447526993, 36.510581739310403, 0.0 ], [ -97.032060604506796, 36.510451996233797, 0.0 ], [ -97.014879117630201, 36.510394917632702, 0.0 ], [ -96.978804432374602, 36.510864518631102, 0.0 ], [ -96.943231390127096, 36.510506130342399, 0.0 ], [ -96.943225331658596, 36.485426371906897, 0.0 ], [ -96.889168006537815, 36.485584252791, 0.0 ], [ -96.835313792471396, 36.485498489359998, 0.0 ], [ -96.817597238493889, 36.4861400178292, 0.0 ], [ -96.815812345113102, 36.485577595552499, 0.0 ], [ -96.799985948451194, 36.485659972418802, 0.0 ], [ -96.764283805828711, 36.485512617593102, 0.0 ], [ -96.728352355199505, 36.4854551273582, 0.0 ], [ -96.692526073766203, 36.4852019245875, 0.0 ], [ -96.656594966820805, 36.485413082828202, 0.0 ], [ -96.649071409122584, 36.4857287445639, 0.0 ], [ -96.645883599906384, 36.484659751689399, 0.0 ], [ -96.642132088642498, 36.485198066747103, 0.0 ], [ -96.602807663075779, 36.4855599533036, 0.0 ], [ -96.586232602364205, 36.485708632903098, 0.0 ], [ -96.501725149784079, 36.485026879878703, 0.0 ], [ -96.479033609524208, 36.484402845974699, 0.0 ], [ -96.439765095426395, 36.459699963715899, 0.0 ], [ -96.415686623614107, 36.459543830179499, 0.0 ], [ -96.4073780245443, 36.459488834150797, 0.0 ], [ -96.389760778568018, 36.459293692097802, 0.0 ], [ -96.383849047449303, 36.4595367126581, 0.0 ], [ -96.372824532607382, 36.459661782838701, 0.0 ], [ -96.36233672385022, 36.459577236247398, 0.0 ], [ -96.353095810513395, 36.459369889781897, 0.0 ], [ -96.192157893468902, 36.457894356651202, 0.0 ], [ -96.157164494353381, 36.456948847132999, 0.0 ], [ -96.122495022742399, 36.456056455420402, 0.0 ], [ -96.122411300902399, 36.456054288329398, 0.0 ], [ -96.122258175023404, 36.454688343300099, 0.0 ], [ -96.121871778830197, 36.452501662512297, 0.0 ], [ -96.121651744247103, 36.450837986231001, 0.0 ], [ -96.121478132297113, 36.449424172162203, 0.0 ], [ -96.121205699727298, 36.446923711661697, 0.0 ], [ -96.120883775269519, 36.444371345115798, 0.0 ], [ -96.120668912602497, 36.442311641011997, 0.0 ], [ -96.120418478712082, 36.440397362829103, 0.0 ], [ -96.120189939477498, 36.438615806132802, 0.0 ], [ -96.120232549153997, 36.436914220008497, 0.0 ], [ -96.120193336146599, 36.434590391023796, 0.0 ], [ -96.120211304130493, 36.432817149374998, 0.0 ], [ -96.120217305640693, 36.430820481876601, 0.0 ], [ -96.120213111365899, 36.428593140874398, 0.0 ], [ -96.120232113004406, 36.425900210260302, 0.0 ], [ -96.120215669865686, 36.423986789217203, 0.0 ], [ -96.120229648856892, 36.422177090051697, 0.0 ], [ -96.120248367282002, 36.419834162909098, 0.0 ], [ -96.119952549454993, 36.419845972395898, 0.0 ], [ -96.118822519690283, 36.419852016401698, 0.0 ], [ -96.116230168077493, 36.419866379955501, 0.0 ], [ -96.113990564639096, 36.419876364037002, 0.0 ], [ -96.111325264193312, 36.419915460428101, 0.0 ], [ -96.108623644879103, 36.4199274756783, 0.0 ], [ -96.106445173442609, 36.419929476136197, 0.0 ], [ -96.104446344749505, 36.419919591429597, 0.0 ], [ -96.102069208907295, 36.4199365823835, 0.0 ], [ -96.099622027783184, 36.419932580454699, 0.0 ], [ -96.097022204670793, 36.419949408488499, 0.0 ], [ -96.094328942154803, 36.419949400431797, 0.0 ], [ -96.091972415275094, 36.419944401327101, 0.0 ], [ -96.089369000044798, 36.419978830694603, 0.0 ], [ -96.087643260712511, 36.419969807487199, 0.0 ], [ -96.084659156567994, 36.419966804038502, 0.0 ], [ -96.0827728372889, 36.419970604370199, 0.0 ], [ -96.081169437104421, 36.419964610854997, 0.0 ], [ -96.078904884761997, 36.4199915782198, 0.0 ], [ -96.075861834406794, 36.4200085789236, 0.0 ], [ -96.07430525123462, 36.420020938919997, 0.0 ], [ -96.072646410755198, 36.420016931797903, 0.0 ], [ -96.070331272225616, 36.4200279267695, 0.0 ], [ -96.067938046239703, 36.420020928256598, 0.0 ], [ -96.066508960254396, 36.420042825036099, 0.0 ], [ -96.066457326270211, 36.418773507715798, 0.0 ], [ -96.066319075148499, 36.416585542528502, 0.0 ], [ -96.06627602826542, 36.4148019529515, 0.0 ], [ -96.0661820877406, 36.412690436329299, 0.0 ], [ -96.066139048560899, 36.410837109790698, 0.0 ], [ -96.066082468332496, 36.408794545996798, 0.0 ], [ -96.064078716835795, 36.389861040569102, 0.0 ], [ -96.058696092098103, 36.378869494598199, 0.0 ], [ -96.058625443506799, 36.375972523713401, 0.0 ], [ -96.058743734364697, 36.369010871640597, 0.0 ], [ -96.057875522194621, 36.367855086743297, 0.0 ], [ -96.058121795867905, 36.361550381966197, 0.0 ], [ -96.058057132959306, 36.354387060024202, 0.0 ], [ -96.053784574903418, 36.350764651913003, 0.0 ], [ -96.049693866748299, 36.3472987975628, 0.0 ], [ -96.031855932847094, 36.347234841210202, 0.0 ], [ -96.027373488928802, 36.345235124253399, 0.0 ], [ -96.0275078759189, 36.333766692000502, 0.0 ], [ -96.011956400589895, 36.323941108991797, 0.0 ], [ -96.008901289614499, 36.310596883120198, 0.0 ], [ -96.008154918863085, 36.306927127427002, 0.0 ], [ -96.008738762908294, 36.305291805030599, 0.0 ], [ -96.007994722498196, 36.3021966437868, 0.0 ], [ -96.007758532838807, 36.295269425809501, 0.0 ], [ -96.0015868924242, 36.291759874856801, 0.0 ], [ -95.988805650404203, 36.291862165771498, 0.0 ], [ -95.985051040975904, 36.2836161335103, 0.0 ], [ -95.9827633987436, 36.283649785122599, 0.0 ], [ -95.98151714362902, 36.283002811616903, 0.0 ] ] } }
]
}


});
    }
  ])
