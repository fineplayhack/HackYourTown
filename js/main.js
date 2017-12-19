var latNow, lngNow;	//現在地
var countdown;  //制限時間のカウントダウン
var M_time = 60;  //最初の残り時間（秒）
var n_time = 0;  //経過時間（秒）
var mcdresult = null; //マクドの検索結果
var mcdistance = 0; //最も近いマクドへの距離
var yujufudanDeg = 0;	//優柔不断度

getPosition();
//getNakanoshimaPosition();//中ノ島の座標
//getManyMcPosition(); //範囲内に3つもマクドがある座標
//getShinjukuPosition(); //大都会

function getNakanoshimaPosition(){
	var latlng = {
		lat: 34.692715,
		lng: 135.490469
	};
	latNow = 34.692715;
	lngNow = 135.490469;
	searchNearMcd(latlng);
	searchRestaurant(latlng);
}

function getManyMcPosition(){
	var latlng = {
		lat: 34.691238,
		lng: 135.563562
	};
	latNow = 34.691238;
	lngNow = 135.563562;
	searchNearMcd(latlng);
	searchRestaurant(latlng);
}

function getShinjukuPosition() {
	latNow = 35.689767;
	lngNow = 139.701399;
	var latlng = {
		lat: latNow,
		lng: lngNow
	};
	searchNearMcd(latlng);
	searchRestaurant(latlng);
}

// 現在地を取得する関数
function getPosition(){
	if(navigator.geolocation){ // 位置情報の取得に対応しているか確認
		navigator.geolocation.getCurrentPosition( // 位置情報取得
				function(position){ // 成功した場合
					var data = position.coords;
					var latlng = {
							lat: data.latitude,
							lng: data.longitude
					};
					latNow = data.latitude;
					lngNow = data.longitude;
					searchNearMcd(latlng);
					searchRestaurant(latlng);
					return latlng;
				},
				function(error){ // 失敗した場合
					var errorInfo = [
					                 "原因不明のエラーが発生しました。",
					                 "位置情報の取得が許可されていません。",
					                 "電波状況の不良等で位置情報が取得できませんでした。",
					                 "位置情報の取得に時間がかかりタイムアウトしました。"
					                 ];

					$('#question').text(errorInfo[error.code]);
				},
				{ // オプション設定
					"timeout": 10000
				}
		)
	} else{
		var errorMessage = "お使いの端末は、位置情報の取得に対応していません";
		$('#question').text(errorMessage);
	}
}

// 一番近いマクドを探す関数
function searchNearMcd(position) {
	var url = 'https://api.gnavi.co.jp/RestSearchAPI/20150630/?callback=?';
	//	パラメータの作成
	params = {
		keyid: 'c7099386a6277495ec9250cd4685ea6f',
		format: 'json',
		hit_per_page: 10,
		latitude: position.lat,
		longitude: position.lng,
		range: 3, // 現在位置からの範囲1kmで検索
		name: 'マクドナルド'
	};
	$.getJSON(url, params, function(json){
		console.log(json);
		if(json.error == undefined) {
			for(i=0; i<json.rest.length; i++){
				if(mcdistance == 0||mcdistance > showDistance(json.rest[i].latitude, json.rest[i].longitude)){
					mcdistance = showDistance(json.rest[i].latitude, json.rest[i].longitude);
					mcdresult = json.rest[i];
				}
			}
		}
	});
}

// 周辺のレストランを検索する関数
function searchRestaurant(position){
	var url = 'https://api.gnavi.co.jp/RestSearchAPI/20150630/?callback=?';
//	パラメータの作成
	params = {
			keyid: 'c7099386a6277495ec9250cd4685ea6f',
			format: 'json',
			hit_per_page: 100,
			latitude: position.lat,
			longitude: position.lng,
			range: 3 // 現在位置からの範囲1kmで検索
	};

	$.getJSON(url, params, function(json){
		result = json;
		if(result.error != undefined){
			entershop(null);
		}
		meshinator(result);
	});
}

//店が決定した際に呼び出される関数
function entershop(result){
	var url = 'decided.html';
	if(result!=null) {
		url += '?id=' + result.id + '&yuju=' + Math.floor(yujufudanDeg*10);
	} else if(mcdresult==null) {
		url += "?id=mcd"
	}
	window.location.href = url;
}

//飯屋を探してくれる関数
function meshinator(result){
	mcdRecommend(result);
	$('#question').text("マクドでよくない？");
	
	//まず適当に選んだ店を表示する
	var rnd = Math.floor(Math.random() * result.rest.length); // 0~(飲食店の数-1)の範囲で乱数発生
	var shoplist=[];//提示済の店のリスト
	var shortlist=[];//提示済の小業態のリスト
	var largelist=[];//提示済の大業態のリスト
	//「マクドでよくない？」がすでに表示されている
	$("#yes").on('click', function(){  //近くのマクドを探す
		refreshevent();
		entershop(mcdresult);
	});
	$("#no").on('click', function () {
		refreshevent();
		clearDetail();
		atShopNode(rnd);
		showRemainingTime();//初めにnoを押すと制限時間のカウント開始
	})
	//ここから下は関数定義

	var largeDecided = false;		//大業態が決まったかどうか
	var shortDecided = false;

	var words = ['はいかがですか？', 'に行きませんか？', 'にしませんか？', 'はいかがでしょう？'];
	var words_gyoutai = ['はいかがですか？', 'にしませんか？', 'は好きですか？', 'っていいですよね', 'はいかがでしょう？'];

	//[店]はいかがですか？
	function atShopNode(rnd){
		if(Math.random()<0.05){
			mcd_subliminal(rnd,2);
		} else {
            var rnd_word = Math.floor(Math.random() * words.length);
            $('#question').text(result.rest[rnd].name +'(' + result.rest[rnd].code.category_name_s[0] + ')' + words[rnd_word]);		//rndで指定したお店を提案する
            showDetail(result.rest[rnd]);		//詳細を提示する
            $("#yes").on('click', function () {  //やった！
                entershop(result.rest[rnd]);
                stopRemainingTime();
                refreshevent();
            });
            $("#no").on('click', function () {
				refreshevent();
				randomChangeFace();
				clearDetail();
                shoplist.push(rnd);		//現在の店は[検索から省くリスト]に入れる
                var short = result.rest[rnd].code.category_name_s[0];	//今の[小業態]を記憶
                if (shortDecided) {	//[小業態]が決まっているなら
                    //現在の[小業態]で違うお店を探す
                    rnd = recommendRestaurantbysameshort(result, short, shoplist);
                    if (rnd != -1) {
                        atShopNode(rnd);
                        updateYuju();
                    } else {
						$('#question').text('これ以上' + short + 'の店は見つからないからマクドでよくない？');
						endProcess();	
                    }
                } else {
                    //[小業態]が決まっていないなら、[小業態]を聞きに行く
                    atShortNode(rnd);
                    updateYuju();
                }
            });
        }
	}

	//[小業態]はいかがですか？
	function atShortNode(rnd){
		refreshevent()
		if(Math.random()<0.05){
			mcd_subliminal(rnd, 1);
		}else {
            //[小業態]を提示。
            var rnd_word = Math.floor(Math.random() * words_gyoutai.length);
            $('#question').text('' + result.rest[rnd].code.category_name_s[0] + words_gyoutai[rnd_word]);
            $("#yes").on('click', function () {
                //[小業態]は決まった。
                shortDecided = true;
                //その[小業態]で別のお店を探す
                var short = result.rest[rnd].code.category_name_s[0];		//今の[小業態]を記憶
                rnd = recommendRestaurantbysameshort(result, short, shoplist);
                if (rnd != -1) {
                    atShopNode(rnd);
                } else {
					$('#question').text('これ以上' + short + 'の店は見つからないからマクドでよくない？');
                    endProcess();
                }
            });

            $("#no").on('click', function () {
				refreshevent();
				randomChangeFace();
                shortlist.push(result.rest[rnd].code.category_name_s[0]);	//この[小業態]は[検索から省くリスト]に入れる
                var short = result.rest[rnd].code.category_name_s[0];		//今の[小業態]を記憶
                var large = result.rest[rnd].code.category_name_l[0];		//今の[大業態]を記憶
                if (largeDecided) {	//[大業態]が決まっているなら
                    //現在の[大業態]で違う[店]を探す
                    rnd = recommendRestaurantbysamelarge(result, large, shortlist);
                    if (rnd != -1) {
                        atShopNode(rnd);
                    } else {
						$('#question').text('これ以上' + large + 'の店は見つからないからマクドでよくない？');
						endProcess();	
                    }
                } else {
                    //[大業態]が決まっていないなら、[大業態]を聞きに行く
                    atLargeNode(rnd);
                }
            });
        }
	}

	//[大業態]はいかがですか？
	function atLargeNode(rnd){
		refreshevent()
		if(Math.random()<0.05) {
            mcd_subliminal(rnd, 0);
        } else {
            //[大業態]を提示。
            var rnd_word = Math.floor(Math.random() * words_gyoutai.length);
            $('#question').text('' + result.rest[rnd].code.category_name_l[0] + words_gyoutai[rnd_word]);
            $("#yes").on('click', function () {
                //[大業態]は決まった。
                largeDecided = true;
                var large = result.rest[rnd].code.category_name_l[0];		//今の[大業態]を記憶
                //現在の[大業態]で[店]を探す
                rnd = recommendRestaurantbysamelarge(result, large, shortlist);
                if (rnd != -1) {
                    atShopNode(rnd);	//[店]を聞く
                } else {
					$('#question').text('これ以上' + large + 'の店は見つからないからマクドでよくない？');
					endProcess();
                }
            });

            $("#no").on('click', function () {
				refreshevent();
				randomChangeFace();
                largelist.push(result.rest[rnd].code.category_name_l[0]);	//この[大業態]は[検索から省くリスト]に入れる
                rnd = recommendRestaurantbyanotherlarge(result, largelist);//他の大業態の店のresultにおける配列番号
                if (rnd != -1) {
                    atShopNode(rnd);	//[店]を聞く
                } else {
					$('#question').text('これ以上店は見つからないからマクドでよくない？');
					endProcess();
                }
            });
        }
	}

	// サブリミナルにマクドを薦めてくる関数
    function mcd_subliminal(rnd, depth){
        var question = ["黄色は好きですか？", "Mは好きですか？", "ご一緒にポテトはいかがですか？", "あなたはMですか？"];
        var q_rnd = Math.floor(Math.random() * question.length);
        $('#question').text(question[q_rnd]);

        $('#yes').on('click', function () {
			refreshevent();
			randomChangeFace();
			mcdRecommend();
			$('#question').text("つまりマクドに行きたい？");
			$('#chara').attr('src', 'img/ika_nico.png');

			$('#yes').on('click', function () {
				refreshevent();
				entershop(mcdresult);
			});
			$('#no').on('click', function() {
				refreshevent();
				randomChangeFace();
				clearDetail();
				if(depth===0){
					atLargeNode(rnd);
				}else if(depth===1){
					atShortNode(rnd);
				}else if(depth===2){
					atShopNode(rnd);
				}
			});
        });
        $('#no').on('click', function() {
			refreshevent();
			randomChangeFace();
			if(depth===0){
				atLargeNode(rnd);
			}else if(depth===1){
				atShortNode(rnd);
			}else if(depth===2){
				atShopNode(rnd);
			}
        });
    }

	//優柔不断度を更新します
	function updateYuju() {//提示済みの店のリストshoplistをもらってくる
		yujufudanDeg = (shoplist.length*20 + n_time/M_time*100)/2;
		if(shoplist.length > 4 ){
			$('#question').text('実はポテトたべたいやろ？マクドいけ');
			$('#chara').attr('src', 'img/ika_nico.png');
			endProcess();
		}
	}

	//-------------------------------------------------------------------------
}

//resultと指定された小業態と提示済の店を受け取り同じ小業態の別の店舗のresultにおける配列番号を返す関数
function recommendRestaurantbysameshort(result,short,list) {
    var rnd = Math.floor(Math.random() * result.rest.length); // 0~(飲食店の数-1)の範囲で乱数発生
    var count = rnd;
    while(list.indexOf(count)>=0||result.rest[count].code.category_name_s[0]!=short){
        count++;
        if(count===result.rest.length){
            count = 0;
        }
        if(count===rnd){
            return -1;
        }
    }
    console.log("entercount:"+count+"   result.rest[count].code.category_name_l[0]:"+result.rest[count].code.category_name_l[0]);
    return count;
}

//与えられた大業態でありなおかつこれまで選ばれた小業態ではない店舗のresultにおける配列番号を返す関数
function recommendRestaurantbysamelarge(result,large,list) {
    var rnd = Math.floor(Math.random() * result.rest.length); // 0~(飲食店の数-1)の範囲で乱数発生
    var count = rnd;
    while(list.indexOf(result.rest[count].code.category_name_s[0])>=0||result.rest[count].code.category_name_l[0]!=large){
        count++;
        if(count===result.rest.length){
            count = 0;
        }
        if(count===rnd){
            return -1;
        }
    }
    console.log("entercount:"+count+"   result.rest[count].code.category_name_l[0]:"+result.rest[count].code.category_name_l[0]);
    return count;
}

//既に選んだ大業態以外の大業態の店舗のresultにおける配列番号を返す関数
function recommendRestaurantbyanotherlarge(result,list) {
    var rnd = Math.floor(Math.random() * result.rest.length); // 0~(飲食店の数-1)の範囲で乱数発生
	var count = rnd;
	while(list.indexOf(result.rest[count].code.category_name_l[0])>=0){
		count++;
		if(count===result.rest.length){
			count = 0;
		}
		if(count===rnd){
			return -1;
		}
	}
    console.log("entercount:"+count+"   result.rest[count].code.category_name_l[0]:"+result.rest[count].code.category_name_l[0]);
    return count;
}

// イベントを消去する関数
function refreshevent(){
	//放っておくとイベントが重複する(前の問いかけのイベントが残る)ので、選択肢が選ばれるたびに一旦イベントを消去する
	$("#yes").off('click');
	$("#no").off('click');
}

//現在地からの距離を算出する関数
function showDistance(lat,lng){
	function radians(degrees){
		return degrees * Math.PI / 180;
	}

	var num = Math.cos(radians(latNow)) * Math.cos(radians(lat)) * Math.cos(radians(lng - lngNow)) + Math.sin(radians(latNow)) * Math.sin(radians(lat));
	var dist =  6378.14 * Math.acos(num);
	console.log('現在地から:'+Math.floor(dist*1000)+'m');
	return Math.floor(dist*1000);//距離を返してもらうようにしました
}

//残り時間を表示する関数
function showRemainingTime(flag){
	countdown = setInterval(function(){  //カウントダウン
		if(n_time < M_time){
			var r_time = M_time - n_time;  //残り時間
			$('#RemainingTime').text(r_time);
			n_time++;
		} else {
			$('#RemainingTime').text(0);
			$('#question').text('もうマクドでよくない？');
			$('#chara').attr('src', 'img/ika_nico.png');
			endProcess();
		}
	},1000);

	//プログレスバー進捗
	$('#prog-bar').css({
		'width' : '0%',
		'transition-duration' : M_time+1 + 's',
		'transition-property' : 'width',
		'transition-timing-function' : 'linear'
	});
}

//残り時間カウントを停止する関数
function stopRemainingTime(){
	clearInterval(countdown);
	//プログレスバー停止
	var current_width = $('#prog-bar').css('width');//現在のバーの長さ
	$('#prog-bar').css({
		'width' : current_width
	});
}

//マクドを薦める関数
function mcdRecommend() {
	if(mcdresult != null) {
		//マクド見つかった処理
		console.log(mcdresult);
		showDetail(mcdresult);
		showDistance(mcdresult.latitude,mcdresult.longitude);
	}else{
        console.log("マクドがなかったようだ");
	}
}

//詳細を表示する関数(店内画像や予算・営業時間をまとめて表示する)
function showDetail(result) {
	$('#message').text('');
	codeAddress(result.address);				//お店の住所から地図を表示する!!!!
	showBudget(result.budget);					//予算を表示させる
	showOpenTime(result.opentime);				//営業時間を表示
	getTelephoneNo(result.tel);					//電話番号をとってくる
	showDistance(result.latitude, result.longitude);
}

//イカの表情をランダムで変更する関数
function randomChangeFace() {
	var imgsrc = 'img/';
	switch(Math.floor(Math.random() * 6)) {
		case 0:
			imgsrc += "ika.png";
			break;
		case 1:
			imgsrc += 'ika_--.png';
			break;
		case 2:
			imgsrc += 'ika_cry.png';
			break;
		case 3:
			imgsrc += 'ika_kya.png';
			break;
		case 4:
			imgsrc += 'ika_jito.png';
			break;
		case 5:
			imgsrc += 'ika_white.png';
			break;
	}
	$('#chara').attr('src', imgsrc);
}

//詳細をリセットする関数
function clearDetail(){
	$('#budget').text('');
	$('#opentime').text('');
}

// 時間切れまたは優柔不断度MAXの際にマクドに誘導する関数
function endProcess() {
	stopRemainingTime();
	refreshevent();
	mcdRecommend();

	$("#yes").on('click', function() {
		refreshevent();
		movedelete();
	});
	$("#no").on('click', function () {
		refreshevent();
		$('#question').text('でも結局のところマクドじゃない？');
		$("#yes").text("はい");
		$("#no").text("Yes");
		$('#chara').attr('src', 'img/ika.png');

		$("#yes").on('click', function() {
			refreshevent();
			movedelete();
		});
		$("#no").on('click', function () {
			refreshevent();
			movedelete();
		});
	});
}

//deleted.htmlに遷移する際に呼び出される関数
function movedelete(){
	var mcdid = mcdresult!=null ? '?id='+mcdresult.id : '';
	window.location.href = 'deleted.html' + mcdid;
}
