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

$(document).ready(function(){
  putTitle();
});

function putTitle(){
  var splitDate = query.date.split('-');
  var date = splitDate[1] + "月" + splitDate[2] + "日";
  $("#title").text(date + "開催のイベント")
}

function attrLatLngFromAddress(callback,data){ // 住所から緯度経度を算出
  address = data["住所"];
  var geocoder = new google.maps.Geocoder();
  console.log("address",address);

  geocoder.geocode({'address': address}, function(results, status){
    if(status == google.maps.GeocoderStatus.OK) {
      callback({ // 使用するデータ項目を追加してください
        // 小数点第六位以下を四捨五入した値を緯度経度にセット、小数点以下の値が第六位に満たない場合は0埋め
        "lat": (Math.round(results[0].geometry.location.lat() * 1000000) / 1000000).toFixed(6),
        "lng": (Math.round(results[0].geometry.location.lng() * 1000000) / 1000000).toFixed(6),
        "location": data["見出し"], // 建物名
        "eName": data["催し名"],// イベント名
        "phonenum": data["電話"],
        "fax": data["ファックス"],
        "off": data["休館日"],
        "streetadd": data["住所"],
        "info": data["備考"],
        "teritory": data["区分"],
        "capacity": data["定員"],
        "target": data["対象"],
        "application": data["申込"],
        "cost": data["費用"],
        "evdate": data["開催日"],
        "openning": data["開館時間"],
        "place": data["場所"]
      });
    }
  });
}

function geoResults(eventObj){
  console.log("latlng",eventObj.lat);
  var markerLatlng = new google.maps.LatLng(eventObj.lat,eventObj.lng); // マーカを立てる位置

  var contentString = '<div id="content">'+
  '<div id="siteNotice">'+
  '</div>'+
  '<h2 id="firstHeading" class="firstHeading">' + eventObj.eName + '</h2>'+
  '<div id="bodyContent">'+
  '<p>' + eventObj.location + '</p>'+
  '</div>'; //情報ウィンドウの説明，適宜追加してください

  var infowindow = new google.maps.InfoWindow({ //情報ウィンドウの表示
    content: contentString
  });
  var marker = new google.maps.Marker({ //マーカを立てる処理
    position: markerLatlng,
    title:eventObj.location
  });
  marker.setMap(map);
  marker.addListener('click', function() { //マーカをクリックしたときの処理
    infowindow.open(map, marker); //情報ウィンドウを開く
    $("#detail").html(
      "<ul>" +
      "<li>イベント："+ eventObj.eName +"</li>"
      +"<li>場所："+ eventObj.location +"</li>"
      +"<li>費用："+ eventObj.cost +"</li>"
      +"<li>住所"+ eventObj.streetadd +"</li>"
      +"<li>電話："+ eventObj.phonenum +"</li>"
      +"<li>開催日："+ eventObj.evdate.replace(/\?/g,"～") +"</li>"
      +"<li>開館時間："+ eventObj.openning +"</li>"
      +"<li>申込："+ eventObj.application +"</li>"
      +"<li>区分："+ eventObj.teritory +"</li>"
      +"<li>定員："+ eventObj.capacity +"</li>"
      +"<li>対象："+ eventObj.target +"</li>"
      +"<li>ファックス："+ eventObj.fax +"</li>"
      +"<li>休館日："+ eventObj.off +"</li>"
      +"<li>備考："+ eventObj.info +"</li>"
      + "</ul>"
    )
  });

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
  putMarker();
});

function putMarker(){　//マーカをたてる関数
  $.getJSON(json , function(data) {
    len = data.length;
    var markers = [];
    console.log("json", data); //jsonの中身をコンソールで表示
    for(var i = 0; i < len; i++) { // イベントの日にちを取得
      var eventdate;
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
      if(eventdate == query.date){ // イベントの日にちとクエリの日にちが同じなら
        attrLatLngFromAddress(geoResults,data[i]); // マーカを立てる処理
      }
    }
  });
}
