var json = "";
var jdate;
var jyear;
var jmonth;

$(function() {
  var jdate = new Date();
  var jyear = jdate.getFullYear();
  var jmonth = ("00" + (jdate.getMonth()+1)).slice(-2);
  console.log(jmonth);
  console.log(jyear);
  // if(month.length == 1){
  //   var month = "0" + month;
  // }
  json = "https://raw.githubusercontent.com/wakayama-pref-org/pr_magazine_event_" + jyear + "_" + jmonth + "/master/json/pr_magazine_event_" + jyear + "_" + jmonth + ".json";
});

$(document).ready(function calendarMake(){ //カレンダーを作成する関数
  $.getJSON(json , function(data) {
    len = data.length;
    console.log("json", data); //jsonの中身をコンソールで表示
    var event_array = [];
    for(var i = 0; i < len; i++) { //jsonの中身を取り出す

      var eventdate;
      if(data[i]["開催日"].indexOf("月") != -1){ // イベント開催日をカレンダーが取得しやすい形に変換
        var jdate = new Date();
        var jyear = jdate.getFullYear();
        var year = jyear;
        var jmonth = ("00" + (jdate.getMonth()+1)).slice(-2);
        var splitdate = data[i]["開催日"].split("月");
        var month = splitdate[0].slice(-2);
        if(month.length == 2 && month.indexOf("1") == -1){
          var month = month.slice(-1);
          console.log("month",month);
        }
        if(month.length == 1){
          var month = "0" + month;
          console.log("month",month);
        }
        if(jmonth == "10" && month.indexOf("0") == 0){  // jsonが10月のデータだったときの処理
          year = year + 1;
          console.log("year",year);
        }
        if(jmonth == "11" && month.indexOf("0") == 0){  // jsonが11月のデータだったときの処理
          year = year + 1;
          console.log("year",year);
        }
        if(jmonth == "12" && month.indexOf("0") == 0){  // jsonが12月のデータだったときの処理
          year = year + 1;
          console.log("year",year);
        }
        var date = splitdate[1].slice(0, 2);
        if(isNaN(date) == true){
          var date = date.slice(0, 1);
          var date = "0" + date;
        }
        if(date.length == 1){
          var date = date.slice(0, 1);
          var date = "0" + date;
        }
        eventdate = year + "-" +month + "-" + date;
        console.log(eventdate);
        console.log(data[i]["催し名"]);
        event_array.push({ // イベントの配列に追加
          title: data[i]["催し名"],
          start: eventdate,
          url: 'map.html' + '?date=' + eventdate
        });
      }
    }
    console.log("eventarray",event_array);
    $('#calendar').fullCalendar({
      events:event_array
    });
  });

  $("#licence").append("データ提供元：" + json);
});
