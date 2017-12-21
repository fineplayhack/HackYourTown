var json = "https://raw.githubusercontent.com/wakayama-pref-org/pr_magazine_event_2017_12/master/json/pr_magazine_event_2017_12.json";
var query = getQuery();
var event_array = [];

function getQuery() { // クエリを処理する
  var vars = [], max = 0, hash = "", array = "";
  var url = window.location.search;

      //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
  hash  = url.slice(1).split('&');
  max = hash.length;
  for (var i = 0; i < max; i++) {
      array = hash[i].split('=');    //keyと値に分割。
      vars.push(array[0]);    //末尾にクエリ文字列のkeyを挿入。
      vars[array[0]] = array[1];    //先ほど確保したkeyに、値を代入。
  }

  return vars;
}

// $(document).ready(function calendarMake(){ //カレンダーを作成する関数
//   $.getJSON(json , function(data) {
//     var ulObj = $("#demo"), //ulタグに挿入するオブジェクトを作成
//     len = data.length;
//     console.log("json", data); //jsonの中身をコンソールで表示
//     for(var i = 0; i < len; i++) { //jsonの中身を取り出す
//       var eventdate;
//       if(data[i]["開催日"].indexOf("月") != -1){
//         var splitdate = data[i]["開催日"].split("月");
//         var month = splitdate[0].slice(-2);
//         var date = splitdate[1].slice(0, 2);
//         if(isNaN(date) == true){
//           var date = date.slice(0, 1);
//           var date = "0" + date;
//         }
//         if(date.length == 1){
//           var date = date.slice(0, 1);
//           var date = "0" + date;
//         }
//         if(month == 1){
//           eventdate = "2018-" + "0" + month + "-" + date;
//         }else{
//           eventdate = "2017-" + month + "-" + date;
//         }
//         console.log(eventdate);
//         console.log(data[i]["催し名"]);
//         event_array.push({
//           title: data[i]["催し名"],
//           start: eventdate,
//         });
//       }
//     }
//     });
//   });
// });

function attrLatLngFromAddress(callback,address){ // 住所から緯度経度を算出
  address = address.slice(1, 8);
  var latlng = new Object();
  latlng.lat;
  latlng.lng;
  var lat;
  var lng;
  var dfd = new $.Deferred();
  var geocoder = new google.maps.Geocoder();
  console.log(address);

  geocoder.geocode({'address': address}, function(results, status){
    if(status == google.maps.GeocoderStatus.OK) {
      callback({
         // 小数点第六位以下を四捨五入した値を緯度経度にセット、小数点以下の値が第六位に満たない場合は0埋め
         "lat": (Math.round(results[0].geometry.location.lat() * 1000000) / 1000000).toFixed(6),
         "lng": (Math.round(results[0].geometry.location.lng() * 1000000) / 1000000).toFixed(6)
       });
         // console.log(lat);
         // return latlng;
       }
     });
}

function testresults(attrLatLngFromAddress)
{
  console.log(attrLatLngFromAddress);
  var markerLatlng = new google.maps.LatLng(attrLatLngFromAddress.lat,attrLatLngFromAddress.lng);
}

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), { // #sampleに地図を埋め込む
    center: { // 地図の中心を指定（和歌山市役所）
      lat: 34.230517, // 緯度
      lng: 135.170808 // 経度
    },
    zoom: 10 // 地図のズームを指定
  });
}

$(document).ready(function(){
  //$("#marker").on('click', function(){  //"マーカ"ボタンが押されたときマーカをたてる
  putMarker();
  //});
});

function putMarker(){　//マーカをたてる関数
  $.getJSON(json , function(data) {
    len = data.length;
    var markers = [];
    console.log("json", data); //jsonの中身をコンソールで表示
    for(var i = 0; i < len; i++) { //jsonの中身を取り出す
      var eventdate;
      var latlng;
      if(data[i]["開催日"].indexOf("月") != -1){
        var splitdate = data[i]["開催日"].split("月");
        var month = splitdate[0].slice(-2);
        var date = splitdate[1].slice(0, 2);
        if(isNaN(date) == true){
          var date = date.slice(0, 1);
          var date = "0" + date;
        }
        if(date.length == 1){
          var date = date.slice(0, 1);
          var date = "0" + date;
        }
        if(month == 1){
          eventdate = "2018-" + "0" + month + "-" + date;
        }else{
          eventdate = "2017-" + month + "-" + date;
        }
        console.log(eventdate);
        console.log(data[i]["催し名"]);
      }

      if(eventdate == query.date){
        //$.when(
        attrLatLngFromAddress(testresults,data[i]["住所"]);
        //).done(function(){


//var latlng = attrLatLngFromAddress(data[i]["住所"]);
        console.log("latlng",latlng);
        var markerLatlng = new google.maps.LatLng(1,1);// マーカを立てる位置

        var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">和歌山市役所</h1>'+
        '<div id="bodyContent">'+
        '<p>ここは和歌山市役所です．</p>'+
        '</div>'; //情報ウィンドウの説明

        var infowindow = new google.maps.InfoWindow({ //情報ウィンドウの表示
          content: contentString
        });
        var marker = new google.maps.Marker({ //マーカを立てる処理
          position: markerLatlng,
          title:"和歌山市役所"
        });
        marker.setMap(map);
        marker.addListener('click', function() { //マーカをクリックしたときの処理
          infowindow.open(map, marker); //情報ウィンドウを開く
        });
      }
    }
  });
}
