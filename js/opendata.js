var jsondata = "";

$(function() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  jsondata = "https://raw.githubusercontent.com/wakayama-pref-org/pr_magazine_event_" + year + "_" + month + "/master/json/pr_magazine_event_" + year + "_" + month + ".json";
});

$(function() {
  $.getJSON(jsondata , function(data) {
    var ulObj = $("#demo"),
    len = data.length;
    console.log("json", data);
    //console.log("json[0]", data[0]["見出し"]);
    //console.log("jsonlen", len);
    for(var i = 0; i < len; i++) {
      if(data[i]["対象"].indexOf("小学生") != -1)
        ulObj.append($("<li>").attr({"id":i}).text(data[i]["開催日"]));
        opdata[] = [
          title : text(data[i]["見出し"])
          start : text(data[i]["開催日"])
        ];
    }
    // for(var i = 0; i < len; i++) {
    //   ulObj.append($("<li>").attr({"id":i}).text(data[i]));
    // }
  });

  $('#calendar').fullCalendar({
    editable : true,
    events : opdata[],
  });

});
