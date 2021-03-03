var ALERT_PERCENTAGE = 200; // %
var UPDATE_API_S = 10;
var EURO_ICON = "&#8364;";
var PERCENTAGE_ICON = "%";
var PENDING_FATBTC = false;



var STATUS = {
  SELL : 'SELL!',
  BUY : 'BUY!',
  HODL : 'HODL!',
  SUSPENDED : 'SUSPENDED',
  UNKNOWN : ''
};


var COINS = {
  'CYFM' : {src: 'fatbtc', id: 'cyfmeth', lastBuy: 0.0000000030, amount: 1882935},
  'ETG' : {src: 'fatbtc', id: 'etgeth', lastBuy: 0.00004888, amount: 319},
  'ENTS' : {src: 'fatbtc', id: 'entseth', lastBuy: 0.0000000024, amount: 5380866},
  'HTML' : {src: 'fatbtc', id: 'htmleth', lastBuy: 0.000000030 },
  'BIZZ' : {src: 'fatbtc', id: 'bizzeth', lastBuy: 0.000700, amount: 3 },
  'FXC' : {src: 'fatbtc', id: 'fxceth', lastBuy: 0.00001546, amount : 236 },
  'BTC' : {src: 'coinbase', id: '5b71fc48-3dd3-540c-809b-f8c94d0e68b5', amount: 1.089},
  'ETH' : {src: 'coinbase', id: 'd85dce9b-5b73-5c3c-8978-522ce1d1c1b4', amount: 3.8},
  'ADA' : {src: 'etoro', id: '63062039-7afb-56ff-8e19-5e3215dc404a', amount: 252.30},
  'MIOTA' : {src: 'coinbase', id: 'abf34ed2-cfa1-5a12-88c4-5282a6c9eddb', amount: 91.17}

};




function onLoad(){
 var query = window.location.search.substring(1);
 if(Number(query) === (new Date()).getDay()){
	 initUI();
	 startUpdateInterval();
 }else{
	 
	 window.location.href = "http://www.google.de";
 }

}


function startUpdateInterval(){
	getCoinInfos();
	setInterval(getCoinInfos, UPDATE_API_S * 1000);
    setInterval(updateUI, 1000);
}



function updateUI(){
  var date;
  var totalAmountCb = 0;
  var totalAmountFatBtc = 0;
  var totalAmountEToro = 0;
  var tradedAmountCb = 0;
  var tradedAmountFatBtc = 0;
  var tradedAmountEToro = 0;

  for(var key of Object.keys(COINS)){
	  if(COINS[key]['data']){
			date = new Date(COINS[key].data.timestamp);
			COINS[key].row.cells[1].innerHTML = roundIt(COINS[key].data.price, 12).toString() + (COINS[key].src == 'fatbtc' ? 'ETH' : EURO_ICON);
			COINS[key].row.cells[2].innerHTML = roundIt(COINS[key].data.change_h * 100, 2).toString() + PERCENTAGE_ICON;
			COINS[key].row.cells[3].innerHTML = roundIt(COINS[key].data.change_d * 100, 2).toString() + PERCENTAGE_ICON;
			COINS[key].row.cells[5].innerHTML = date.toLocaleDateString('de-DE') + ', ' + date.toLocaleTimeString('de-DE');

			if((Number(COINS[key].row.cells[2].innerHTML.slice(0, -1)) >= ALERT_PERCENTAGE || Number(COINS[key].row.cells[3].innerHTML.slice(0, -1)) >= ALERT_PERCENTAGE) && COINS[key].data.status != STATUS.SELL){
			  COINS[key].row.cells[6].innerHTML = COINS[key].data.status = STATUS.SELL;
			  COINS[key].row.className = 'sell';
			}

			if((Number(COINS[key].row.cells[2].innerHTML.slice(0, -1)) <= -1*ALERT_PERCENTAGE || Number(COINS[key].row.cells[3].innerHTML.slice(0, -1)) <= -1*ALERT_PERCENTAGE) && COINS[key].data.status != STATUS.BUY){
			  COINS[key].row.cells[6].innerHTML = COINS[key].data.status = STATUS.BUY;
			  COINS[key].row.className = 'buy';
			}

			if(COINS[key].data.status == STATUS.UNKNOWN){
			  COINS[key].row.cells[6].innerHTML = COINS[key].data.status = STATUS.HODL;
			  COINS[key].row.className = 'hodl';
			}

			if(COINS[key].data.status == STATUS.SUSPENDED){
			  COINS[key].row.cells[6].innerHTML = COINS[key].data.status = STATUS.SUSPENDED;
			  COINS[key].row.className = 'suspended';
			}

	  }

	if(COINS[key]['amount']){
		if(COINS[key].src == 'coinbase' && COINS[key]['data']){
			totalAmountCb += COINS[key].data.price * COINS[key]['amount'];
			tradedAmountCb += COINS[key].data.price * COINS[key].data.change_d *  COINS[key]['amount'];
		}
		if(COINS[key].src == 'etoro' && COINS[key]['data']){
			totalAmountEToro += COINS[key].data.price * COINS[key]['amount'];
			tradedAmountEToro += COINS[key].data.price * COINS[key].data.change_d *  COINS[key]['amount'];
		}
		if(COINS[key].src == 'fatbtc' && COINS[key]['lastBuy'] && COINS[key]['data']){
			totalAmountFatBtc += COINS['ETH'].data.price *  COINS[key].data.price * COINS[key]['amount'];
			tradedAmountFatBtc += COINS['ETH'].data.price * COINS[key].data.price * COINS[key].data.change_d *  COINS[key]['amount'];
		}
	}


  }
	totalAmountCb = roundIt(totalAmountCb, 2);
    tradedAmountCb = roundIt(tradedAmountCb, 2);
	totalAmountFatBtc = roundIt(totalAmountFatBtc, 2);
    tradedAmountFatBtc = roundIt(tradedAmountFatBtc, 2);
	totalAmountEToro = roundIt(totalAmountEToro, 2);
    tradedAmountEToro = roundIt(tradedAmountEToro, 2);
    document.getElementById('totalAmount').innerHTML = moneySplit([totalAmountCb, totalAmountEToro, totalAmountFatBtc]);
	var traded = document.getElementById('tradedAmount');
		traded.innerHTML = moneySplit([tradedAmountCb, tradedAmountEToro, tradedAmountFatBtc]);
		traded.className = (tradedAmountCb + tradedAmountFatBtc) < 0 ? 'sell' : 'buy';


}


function initUI(){

  var coinTable = document.getElementById("coinTable");
  var row, cell;

  for(var key of Object.keys(COINS)){
    row = coinTable.insertRow(-1);

    row.insertCell(0).innerHTML = key;
    row.insertCell(1).innerHTML = "???";
    row.insertCell(2).innerHTML = "???";
    row.insertCell(3).innerHTML = "???";
    row.insertCell(4).innerHTML = '<div id="'+ key + '_chart" style="height: 100px; width: 400px; margin: 0px auto;"></div>';
    row.insertCell(5).innerHTML = "???";
	row.insertCell(6).innerHTML = "???";

    row.addEventListener("click", function(e){
      if(this.cells[6].innerHTML != STATUS.HODL && this.cells[6].innerHTML != STATUS.SUSPENDED)
        for(var key of Object.keys(COINS))
          if(COINS[key]['row'] == this && this.cells[6].innerHTML == COINS[key].data.status){
            alert("Aye! Let's trade !!!11");
            this.cells[6].innerHTML = STATUS.HODL;
            COINS[key].row.className = 'hodl';
          }

    });



    COINS[key]['row'] = row;

	COINS[key]['chart'] = new CanvasJS.Chart(key + "_chart", {
		animationEnabled: false,
		theme: "dark1",
		//backgroundColor: "LightGray",
		title:{
			text: ''
		},
		axisY:{
			includeZero: false
		},
		data: [{
												type: "line",
												dataPoints: [

												]
											}]
	});




  }


	document.getElementById('totalAmount').innerHTML = '???';
	document.getElementById('tradedAmount').innerHTML = '???';

}



function getCoinInfos(){

  for(var key of Object.keys(COINS)){
	 if(COINS[key].src == 'coinbase' || COINS[key].src == 'etoro')
		getCBCoinData(COINS[key].id, function(res, inKey){
			var data = res.data;
			if(typeof(COINS[inKey]['data']) == 'undefined')
				COINS[inKey]['data'] = {status: COINS[inKey]['suspended'] ? STATUS.SUSPENDED : STATUS.UNKNOWN};
			COINS[inKey]['data']['name'] = key;
			COINS[inKey]['data']['price']  = data.prices.latest_price.amount.amount;
			COINS[inKey]['data']['change_h']  = data.prices.latest_price.percent_change.hour;
			COINS[inKey]['data']['change_d'] = data.prices.latest_price.percent_change.day;
			COINS[inKey]['data']['timestamp'] = data.prices.latest_price.timestamp;
      var dataPoints = [];
			for(var entry of data.prices.year.prices)
				dataPoints.push({ y: Number(entry[0]), x : new Date(1000 *  entry[1]) });

			COINS[inKey]['chart'].options.data = [{
											type: "line",
											dataPoints: dataPoints
										}];
			COINS[inKey]['chart'].render();
		}, key);

	if(COINS[key].src == 'fatbtc')
		getFatBTCChartData(COINS[key].id, function(res, inKey){
			var data = res.datas;
			var dataPoints = [];
			for(var entry of data)
				dataPoints.push({ y: entry[4], x : new Date(1000 *  entry[0]) });


				COINS[inKey]['chart'].options.data = [{
												type: "line",
												dataPoints: dataPoints
											}];
				COINS[inKey]['chart'].render();
		}, key);

  }

  getFatBTCData(function(res){
	  for(var key of Object.keys(COINS)){
		  if(COINS[key].src == 'fatbtc' && res['data']){
			 var data = res.data[COINS[key].id + '_ticker'];
				if(typeof(COINS[key]['data']) == 'undefined')
					COINS[key]['data'] = {status: COINS[key]['suspended'] ? STATUS.SUSPENDED : STATUS.UNKNOWN};
				COINS[key]['data']['name'] = key;
				COINS[key]['data']['price']  = Number(data.bis1[0]);
				COINS[key]['data']['change_h']  =  COINS[key]['data']['price']/ COINS[key].lastBuy - 1;
				COINS[key]['data']['change_d'] = COINS[key]['data']['change_h'];
				COINS[key]['data']['timestamp'] = data.timestamp;

		  }

	  }


	});
}

function getFatBTCChartData(coin_id, cb, paththrough){
   httpJSONGet("https://fatbtc.com/m/kline/" + coin_id + "/1week/100", cb, paththrough);
}

function getFatBTCData(cb, paththrough){
 if(!PENDING_FATBTC){
	PENDING_FATBTC = true;
	httpJSONGet("https://fatbtc.com/m/allticker/1", function(res, paththrough){ PENDING_FATBTC = false;
																				cb(res, paththrough);}, paththrough);

 }

}


function getCBCoinData(coin_id, cb, paththrough){
   httpJSONGet("https://www.coinbase.com/api/v2/assets/prices/" + coin_id + "?base=EUR", cb, paththrough);
}


function httpJSONGet(theUrl, cb, paththrough)
{
    var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 ){
			try{
				cb(JSON.parse(xmlHttp.responseText), paththrough);
			}catch(e){
				console.log(e);
			}
		}

    };
    xmlHttp.open( "GET", theUrl, true ); // false for synchronous request
    xmlHttp.send( null );
}

function moneySplit(moneyArray){
	var result = moneyArray[0];

	for(var i=1; i<moneyArray.length; ++i){
		result += ((moneyArray[i]>=0) ? ' +' : ' ') + moneyArray[i].toString();
	}

	return result;
}


function roundIt(num, digits){
  var factor = Math.pow(10, digits);
  return Math.round(num * factor) / factor;

}
