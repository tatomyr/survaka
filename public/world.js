

function actionHandler(event) {
	console.log(event.keyCode);

	switch (event.keyCode) {
		case 100: case 68: S.dx= 1; break; //move right
		case 97: case 65: S.dx= -1; break; //move left
		case 119: case 87: S.dy= 1; break; //move up
		case 115: case 83: S.dy= -1; break; //move down

		case 32: S.dy= 1;  break; //jump

		case 101: case 69: S.selfAction= 1; break; //E - do somethig with himself (eat some food from actual slot, for example... or shoot)

	}

}

function manipulate(cell, element) {
	//console.log(cell);//x
	cell.j= cell.j + S.x-dispX;//!
	if (element.className==="active") {
		S.manipulate= cell;
	}


	//------------d-r-a-w---b-e-a-m------(


	var R= Math.max(Math.abs(cell.i-S.y),Math.abs(cell.j-S.x));
	console.log(cell, R);//x
	var ssq_fi= (cell.i-S.y)/R,
		csq_fi= (cell.j-S.x)/R;
	for (var r= 1; r<=R; r++) {

		var i= Math.round(S.y+ssq_fi*r),
			j= Math.round(dispX+csq_fi*r);

		$('#c'+i+'-'+j).text("%");
		console.log("%",r,i,j)

	}
	//------------d-r-a-w---b-e-a-m------)


}

function choose(n) {
	S.I[0]= n; //активний слот інструментів
	console.log(S);//x
}

//const:
//var dispH= 10, dispW= 15;




//------------------------------o-n---r-e-a-d-y--------------------------------(
(function() {

	var sname= getUrlVars().sname; //витягуємо змінну з url

	console.log('world | sname: '+sname);

	$.getJSON('/api/start-param/?sname='+sname, function(initData) {//це мусить тут бути. фактично, це ініціалізація входу суб'єкта S
		//H= data.H;
		//W= data.W;
		//O= data.O; //? //об'єкти (світ)
		S= initData.S; //? //суб'єкт ... як їх зробити множинними? щоб могло ,,жити'' декілька одночасно...
		dispH= initData.dispH;
		dispW= initData.dispW;


		tick= initData.tick;
		//tick= 1000;//x

		$("#tick").text(""+tick+"⌛");

		//-----------------------------r-e-f-r-e-s-h-------------------------------(

		setInterval(function() { //just output data

			$.ajax({
				type: "POST",
				url: "/api/refresh/?sname="+sname,
				dataType: "json",
				data: {
					"dy": S.dy,
					"dx": S.dx,
					"n": S.I[0],
					"cell": S.manipulate,
					"selfAction": S.selfAction
				},
				success: function(data) {
					//get data:
					O= data.O;
					Q= O.Q;
					H= O.H;
					W= O.W;
					S= data.S;
					var actionMask= data.actionMask;
					var reviewMask= data.reviewMask;
					var others= data.others; //o
					t= data.t;
					//dispH

					/*var*/ dispX= 7; //поки що висоту відображаємо повністю //задаємо поки постійне значення вручну

					//build world:
					for (var i=0;i<dispH;i++) {
						for (var j=0;j<dispW;j++) {//!!!*2
							var cell= $('#c'+i+'-'+j);
							//cell.text(O[i][j]).removeClass("active"); //у кожну клітинку: (а) виводимо, шо в ній знаходиться; (б) видаляємо поки що ознаку ,,активності"


							var jAbs= j + S.x-dispX;
							//!
							var q= Math.floor(jAbs/W);//!
							var J= jAbs-q*W;//!
							q= (q%O.Q+O.Q)%O.Q;//!
							//!

							cell.text(O[q][i][J]).removeClass("active"); //! ~//у кожну клітинку: (а) виводимо, шо в ній знаходиться; (б) видаляємо поки що ознаку ,,активності"




							if ( actionMask.indexOf( '['+i+'|'+jAbs+']' )>-1 ) {
								/*/
								cell.text(cell.text()+'.'); //помічаємо активні блоки (з якими теоретично можна взаємодіяти) крапочками
								// */
								cell.addClass( "active" ); //event вішати треба тільки ОДИН РАЗ! тому присвоюємо активним блокам відповідний клас, а уже по класу орієнтуємося в хендлері
							}
							if ( reviewMask.indexOf( '['+i+'|'+jAbs+']' )===-1 ) {
								/*/
								cell.text("?"); //помічаємо блоки, які НЕ ,,бачить'' персонаж
								// */
							}
						}
					}


					//put others ☻:
					for (var key in others) {
						//if ( $('#c'+others[key].y+'-'+others[key].x).text()!=="?" ) {
						if ( $('#c'+others[key].y+'-'+(others[key].x-S.x+dispX)).text()!=="?" ) {
							$('#c'+others[key].y+'-'+(others[key].x-S.x+dispX)).html( "<span class=others>"+others[key].face + "<sup>"+others[key].tool+"</sup></span>" ); //o
							//$('#c'+others[key].y+'-'+others[key].x).html( others[key].face + "<sup>"+others[key].tool+"</sup>" ); //o
						}
					}

					//and at last put self ☻:
					$('#c'+S.y+'-'+dispX).html( "<span id=self>"+S.face + "<sup>"+S.I[S.I[0]]+"</sup></span>" );
					//$('#c'+S.y+'-'+S.x).html( S.face + "<sup>"+S.I[S.I[0]]+"</sup>" );
					$("#coordinates").text(S.x+"|"+S.y);


					//inventory:? why dont working??????
					for (var n=1; n<=9; n++) {
						$("#inv"+n).text(S.I[n]);
					}
					var choosenInv= $("#inv"+S.I[0]);
					choosenInv.text("["+choosenInv.text()+"]").addClass("choosen");

					//healtg&fullness:
					$("#health").text(""+Math.round(S.health)+"♥");
					$("#fullness").text(""+Math.round(S.fullness)+"*");
					//time effects:
					var dayTime= Math.round(t/1000/60)%24;
					$("#t").text(""+dayTime+"⌚");
					var skyTimer= {
						0: "MidnightBlue",
						1: "MidnightBlue",
						2: "MidnightBlue",
						3: "DarkBlue",
						4: "DeepSkyBlue4",
						5: "Blue2",
						6: "SkyBlue",
						7: "LightSkyBlue",
						8: "LightSkyBlue",
						9: "azure",
						10: "azure",
						11: "azure",
						12: "azure",
						13: "azure",
						14: "azure",
						15: "azure",
						16: "LightSkyBlue",
						17: "LightSkyBlue",
						18: "SkyBlue",
						19: "SkyBlue",
						20: "RoyalBlue4",
						21: "DarkBlue",
						22: "Blue4",
						23: "MidnightBlue"
					}
					$(".shell").css({backgroundColor: skyTimer[dayTime]});
					//if (S.I[S.I[0]]==="⊥") $(".active").css({backgroundColor: "yellow"});
				}
			});


		}, tick);
		//-----------------------------r-e-f-r-e-s-h-------------------------------)



	});



})();
//------------------------------o-n---r-e-a-d-y--------------------------------)