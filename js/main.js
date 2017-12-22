var json = "https://raw.githubusercontent.com/wakayama-pref-org/pr_magazine_event_2017_12/master/json/pr_magazine_event_2017_12.json";

$(document).ready(function calendarMake(){ //カレンダーを作成する関数
  $.getJSON(json , function(data) {
    len = data.length;
    console.log("json", data); //jsonの中身をコンソールで表示
    var event_array = [];
    for(var i = 0; i < len; i++) { //jsonの中身を取り出す

      var eventdate;
      if(data[i]["開催日"].indexOf("月") != -1){ // イベント開催日をカレンダーが取得しやすい形に変換
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
        event_array.push({ // イベントの配列に追加
          title: data[i]["催し名"],
          start: eventdate,
          url: 'map.html' + '?date=' + eventdate
        });
      }
    }
    $('#calendar').fullCalendar({
      events:event_array
    });
  });
});
