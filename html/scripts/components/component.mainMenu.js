// MainPage
Vue.component('component-mainMenu-main', {
    props: ['model'],
    template: '#template-mainMenu-main',

    methods: {
        // Btn Click
        handleMouseDown: function (nextId) {
            kiosk.API.goToNext(nextId);
        },
        goClassroom: function () {
			$.currentReadCard = null;
			kiosk.API.goToNext('classroom');
        },
		doDraw: function () {
			var s = $.ecampus.setting;

			if(s.lessonsDt != null && s.lesson != null && s.lesson.row != null && s.lessons != null){
				var lessonId1 = $.trim($("#inLessonStds").attr("lessonId"));
				var lessonId2 = s.lessonsDt+'-'+s.lessons[s.lesson.row].id;
				if(lessonId1 != '' && lessonId1 != lessonId2){
					$("#txtDraw4").html('');
					$("#inLessonStds").html('');
					$("#unlucky").hide().html('');
				}
			}

			var stds = $("#main-lesson-stds").find(".studentBlock");
			if(stds && stds.length){
				if($("#txtDraw4").html() == ''){
					var html = '<option value="">請選擇</option>';
					for(var i=0;i<stds.length/2;i++)
						html += '<option value="'+(i+1)+'">'+(i+1)+'</option>';
					$("#txtDraw4").html(html);
				}

				if($("#inLessonStds").html() == ''){
					var ary1 = [];
					var html = '';
					$.each(stds, function(i,x){
						var o = $(x);
						html += '<div class="dotwords" style="float: left;padding: 5px 10px;margin: 0 6px 4px 0;width: 150px;">'+o.attr("seat")+'．'+o.text()+'</div>';
						ary1.push([ary1.length,o.attr("seat"),o.text()]);
					})

					var lessonId = $.ecampus.setting.lessonsDt+'-'+$.ecampus.setting.lessons[$.ecampus.setting.lesson.row].id;
					$("#inLessonStds").attr("lessonId",lessonId).html(html);
				}
			}

			$("#drawModal").modal('show');
		},
		doGroup: function () {
			var s = $.ecampus.setting;

			if(s.lessonsDt != null && s.lesson != null && s.lesson.row != null && s.lessons != null){
				var lessonId1 = $.trim($("#groupGroup").attr("lessonId"));
				var lessonId2 = s.lessonsDt+'-'+s.lessons[s.lesson.row].id;
				if(lessonId1 != '' && lessonId1 != lessonId2){
					$("#txtGroup").html('');
					$("#groupGroup").html('');
				}
			}

			var stds = $("#main-lesson-stds").find(".studentBlock");
			if(stds && stds.length){
				if($("#txtGroup").html() == ''){
					var html = '<option value="">請選擇</option>';
					for(var i=0;i<stds.length/2;i++)
						html += '<option value="'+(i+1)+'">'+(i+1)+'</option>';
					$("#txtGroup").html(html);
				}
			}

			$("#groupModal").modal('show');
		},
        doRollcall: function () {
			var _this = this;
			if($.initReaderSuccess){
				if($.currentReadCard != 'doRollcall'){
					showMessagePopup('請靠卡確認身分...',0,{b:'rgb(227,123,12)',c:'white',w:'380px',h:'80px'});
					$.currentReadCard = 'doRollcall';

					$.ecampus.messagePopup1 = setInterval(function(){
						var s = new Date().getSeconds()%3;
						var t = $(".messagePopup").text().substring(0,7)+'...';
						$(".messagePopup").text(t.substring(0,s+8));
					},1000);

					$.ecampus.messagePopup2 = setTimeout(function(){
						$.currentReadCard = 'main';
						clearMessagePopup();
					},10000);
				}
			}else this.remindNoDevice();

			//$.ecampus.setting.rollCallList = [{"id":234599,"lesson":"第三節","empno":"0356","tp":"3","subjname":"數學","emp":"老師","subj":"1011010203"},{"id":234646,"lesson":"第四節","empno":"0356","tp":"3","subjname":"數學","emp":"老師","subj":"1011010203"}];
			//kiosk.API.goToNext('rollcall');
        },
        doUnlock: function () {
			if($.initReaderSuccess){
				$.currentReadCard = 'unlock';

				showMessagePopup('請靠卡解鎖...(10)',0);

				$.ecampus.messagePopup1 = setInterval(function(){
					var clr = true;
					var t = $(".messagePopup").text();

					if(t != null && t.length > 10 && t.substring(0,8) == '請靠卡解鎖...'){
						t = parseInt(t.substring(9,t.length-1),10);
						if(!isNaN(t)){
							if(t > 0){
								$(".messagePopup").text('請靠卡解鎖...('+(t-1)+')');
								clr = false;
							}
						}
					}

					if(clr)
						clearMessagePopup();
				},1000);
			}else this.remindNoDevice();
        },
		remindNoDevice: function () {
			if(!$.lockRemindNoDeviceEffect){
				$.lockRemindNoDeviceEffect = true;

				var o = $(".device-not-found");
				if(o.length){
					var w = o.width()/2;
					var h = o.height()/2;
					o.hide().css({right:'calc(50% - '+(w+24)+'px)',bottom:'calc(50% - '+(h+11)+'px)'});

					$.remindFlicker = setInterval(function(){
						o.toggle();
					},120);

					setTimeout(function(){
						clearInterval($.remindFlicker);
						o.show();
						setTimeout(function(){
							o.animate({right: "20px",bottom: "20px"},400,function(){
								$.lockRemindNoDeviceEffect = false;
							});
						},1500)
					},700);
				}
			}
		},
		INIT_READER: function () {
			var _this = this;
			$.initReaderCount = ($.initReaderCount||0)+1;

			kiosk.API.Device.MD150.Open(function (res) {
				if(res.IsSuccess){
					$.initReaderSuccess = true;

					setInterval(function(){
						if($.listenerCardClose){
							kiosk.API.Device.MD150.GetCardID(function (res) {
								if(res.IsSuccess && res.Error == null && $.trim(res.dataStr) != ''){
									//暫時測試卡...
									//if(res.dataStr.slice(-8) == '1776140F')
									//	shutDownAPP();

									/*$('<audio></audio>').append('body').bind('ended',function(){
										$(this).remove();
									}).attr({src:"images/beep.mp3",autoplay:true});*/

									//$("#name, #welcome, #accu").hide().html('');
									//$("#enter").html('請刷卡').show();
									//$("#photo").css({"background-image": "url('images/default.png')","background-size": "143%"});

									var s = $.ecampus.setting;
									var guid = (s.server1 != null && s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
									!window.external||!window.external.System||(guid=window.external.System.GetKioskId);

									if($.currentReadCard == 'main'){
										$.listenerCardClose = false;
										//if(s.lessons && s.lesson && s.lesson.row != null && $.ecampus.setting.lessons[$.ecampus.setting.lesson.row].id != null){
											showMessagePopup('處理中，請稍候...',0);

											var postId = '';
											var tp = '';
											if(s.lessons && s.lesson && s.lesson.row != null){
												postId = s.lessons[s.lesson.row].id;
												tp = s.lessons[s.lesson.row].tp;
											}

											delete $.callMainCardResult;

											_this.MAIN_CARD('1',res.dataStr.slice(-8),postId,tp);
										//}else{
										//	showMessagePopup('非上課時間').css('color','red');
										//}
									}else if($.currentReadCard == 'queryReserve'){
										$.listenerCardClose = false;
										showMessagePopup('查詢中，請稍候...',0);
										var delpost = {client:s.client,kiosk:guid,card:res.dataStr.slice(-8)}

										$.ajax({
											url: s.library+'/listmyreserve',
											type: "POST",
											contentType: "application/json;charset=utf-8",
											dataType: "json",
											data: JSON.stringify(delpost),
											success: function(json,status,xhr){
												if(json){
													if(json.error){
														showMessagePopup(json.error);
													}else if(json.success == 'Y'){
														var r = json.data;
														var html = '';
														if(r && r.length){
															html += '<div class="row">';
															html += '<div class="col-sm-3" style="text-align: center;"><div style="border-bottom: 1px solid red;">日期</div></div>';
															html += '<div class="col-sm-5" style="text-align: center;"><div style="border-bottom: 1px solid red;">閱覽室</div></div>';
															html += '<div class="col-sm-2" style="text-align: center;"><div style="border-bottom: 1px solid red;">座位</div></div>';
															html += '<div class="col-sm-2" style="text-align: center;"><div style="border-bottom: 1px solid red;">取消</div></div>';
															html += '</div>';
															for(var i=0;i<r.length;i++){
																var d = r[i];
																html += '<div class="row" style="margin-top: 10px;margin-bottom: 12px;">'
																	+'<div class="col-sm-3 imdate" style="text-align: center;">'+d.dt+'</div>'
																	+'<div class="col-sm-5" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">'+d.room+'&nbsp;'+d.area+'</div>'
																	+'<div class="col-sm-2" style="text-align: center;">'+d.ser+'</div>'
																	+'<div class="col-sm-2" style="text-align: center;color: red;">';
																if(d.del == 'Y')
																	html += '<i class="glyphicon glyphicon-remove remove-reserve" res="'+d.id+'"></i>';
																html += '</div></div>';
															}
														}else{
															html = '<div style="text-align: center;">無預約紀錄</div>';
														}

														$("#resRecBody").html(html).find(".remove-reserve").click(function(){
															var id = $(this).attr("res");
															var alert = '<div id="messagebox-alertMessage" style="text-align: left;background-color: rgb(255,200,200);padding: 15px 20px;border-radius: 10px;">'
																+'<strong>刪除確認</strong><hr/><div>確定要刪除'+$(this).parent().parent().find(".imdate").text()+'的預約紀錄？</div>'
																+'<div style="text-align: center;margin-top: 25px;overflow: hidden;height: 38px;">'
																+'<div style="float: right;"><button type="button" class="btn btn-secondary btn-cancel">取消</button></div>'
																+'<div style="float: right;margin-right: 45px;"><button type="button" class="btn btn-info btn-submit">確定</button></div>'
																+'<div style="display: none;"><div class="spinner-border text-warning" role="status"><span class="sr-only">Loading...</span></div><span style="font-size: 1.2rem;margin-left: 10px;display: inline-block;vertical-align: top;">處理中，請稍候...</span></div>'
																+'</div>'
																+'</div>';
															alert = $(alert).appendTo('#classroom-div-block').css({'position':'fixed','min-width':'240px','z-index':'9999'});
															alert.css({
																'top': 'calc(50% - '+(alert.outerHeight()/2)+'px)',
																'left': 'calc(50% - '+(alert.outerWidth()/2)+'px)'
															})

															alert.find("button.btn-submit").click(function(){
																$("#messagebox-alertMessage").remove();
																delpost.id = id;

																$.ajax({
																	url: s.library+'/delReserve',
																	type: "POST",
																	contentType: "application/json;charset=utf-8",
																	dataType: "json",
																	data: JSON.stringify(delpost),
																	success: function(json,status,xhr){
																		if(json.error){
																			showMessagePopup(json.error);
																		}else if(json.success == 'Y'){
																			if(json.msg){
																				$('.delReserve-messagePopup').remove();
																				var sigh = showMessagePopup(json.msg).removeClass('messagePopup').addClass('delReserve-messagePopup');
																				setTimeout(function(){
																					sigh.remove();
																				},4444)
																			}
																			_this.showMyResRec(s.library,delpost);
																		}else{
																			showMessagePopup('連線失敗(2)').css('color','red');
																		}
																	},
																	error: function(e){
																		showMessagePopup('連線失敗').css('color','red');
																	}
																	,complete: function(){
																		//delete $.lockListenerCard;
																	}
																})
															});

															alert.find("button.btn-cancel").click(function(){
																$("#messagebox-alertMessage").remove();
															});
														});

														clearMessagePopup();
														$("#resRecModal").modal('show');
													}else{
														showMessagePopup('連線失敗(qr2)').css('color','red');
													}
												}else{
													showMessagePopup('連線失敗(qr1)').css('color','red');
												}
											},
											error: function(e){
												showMessagePopup('連線失敗(qr)').css('color','red');
											}
											,complete: function(){
												$.currentReadCard = null;
												$.listenerCardClose = true;
											}
										});
									}else if($.currentReadCard == 'applyReserve'){
										$.listenerCardClose = false;
										showMessagePopup('處理中，請稍候...',0);

										var week = '';
										if($("#weekend1").prop('checked')) week += '1';
										if($("#weekend2").prop('checked')) week += '2';
										if($("#weekend3").prop('checked')) week += '3';
										if($("#weekend4").prop('checked')) week += '4';
										if($("#weekend5").prop('checked')) week += '5';
										if($("#weekend6").prop('checked')) week += '6';
										if($("#weekend7").prop('checked')) week += '7';

										var x,y;
										var seat = $("#classroom_seats").find(".thisismine").parent();
										if(seat.length == 1){
											x = seat.attr('x');
											y = seat.attr('y');
										}

										$.ajax({
											url: s.library+'/reserve',
											type: "POST",
											contentType: "application/json;charset=utf-8",
											dataType: "json",
											data: '{"client":"'+s.client+'","kiosk":"'+guid+'","card":"'+res.dataStr.slice(-8)+'","areaId":"'+$("#rooms").val()+'","dt1":"'+$("#dt1").val()+'","dt2":"'+$("#dt2").val()+'","week":"'+week+'","x":"'+x+'","y":"'+y+'"}',
											success: function(json,status,xhr){
												if(json){
													if(json.error){
														showMessagePopup('預約失敗<br/>'+json.error,7777,{b:'rgba(255,0,0,0.7)',c:'white'});
													}else if(json.success == 'Y'){
														if(json.msg){
															showMessagePopup('預約成功<br/>'+json.msg,6666,{b:'rgba(66,200,66,0.7)',c:'white'});
														}else showMessagePopup('預約成功',4000,{b:'rgba(66,200,66,0.7)',c:'white'});
													}else{
														showMessagePopup('連線失敗(ar2)').css('color','red');
													}
												}else{
													showMessagePopup('連線失敗(ar1)').css('color','red');
												}
											},
											error: function(e){
												showMessagePopup('連線失敗(ar)').css('color','red');
											}
											,complete: function(){
												delete $.currentReadCard;
												$.listenerCardClose = true;
											}
										});
									}else if($.currentReadCard == 'unlock'){
										$.listenerCardClose = false;
										showMessagePopup('處理中，請稍候...',0);
										_this.UNLOCK_CARD('1',res.dataStr.slice(-8));
									}else if($.currentReadCard == 'doRollcall'){
										$.listenerCardClose = false;
										showMessagePopup('查詢中，請稍候...',0);
										_this.queryTeaRollcall(1,res.dataStr.slice(-8),guid);
									}else if($.currentReadCard == 'submitRollcall'){
										$.listenerCardClose = false;
										showMessagePopup('正在送出點名結果，請稍候...',0);

										var id = $("#rclist").val();
										var tp = '';
										if(id != '')
											tp = $("#rclist").find("[value='"+id+"']").attr("tp");

										var server = '';
										if(tp == '3') server = s.server1;
										else if(tp == '5') server = s.server2;

										var seat = $("#rollcall_seats").find('.marked');
										var rcdata = {};
										$.each(seat, function(i,x){
											var a = $(x).attr('rc').substring(1,2);
											var b = $(x).parent().attr('id').substring(6);
											rcdata[b] = a;// += ",'"+b+"':'"+a+"'";
										})

										if(id != '' && server != '' && seat.length > 0){
											//data = '{'+data.substring(1)+'}';

											$.ajax({
												url: server+'/submitRollCall',
												type: "POST",
												contentType: "application/json;charset=utf-8",
												dataType: "json",
												data: "{'client':'"+s.client+"','kiosk':'"+guid+"','dt':'"+$("#rollcall_seats").attr("dt")+"','tp':'"+tp+"','card':'"+res.dataStr.slice(-8)+"','id':'"+id+"','data':'"+JSON.stringify(rcdata)+"'}",
												success: function(json,status,xhr){
													if(json){
														if(json.error){
															showMessagePopup('處理失敗<br/>'+json.error,7777,{b:'rgba(255,0,0,0.7)',c:'white'});
														}else if(json.success == 'Y'){
															if(json.msg){
																showMessagePopup('處理成功<br/>'+json.msg,6666,{b:'rgba(66,200,66,0.7)',c:'white'});
															}else showMessagePopup('處理成功',4000,{b:'rgba(66,200,66,0.7)',c:'white'});
															//$("#rclist").change();
															$.each(rcdata, function(i,x){
																var r = $("#rcstd_"+i).find(".rcmark").remove().end();
																if(x == '1'){
																	$('<div class="rcmark" rc="1" style="color: #c33;">曠課</div>').appendTo(r);
																	
																}else if(x == '7'){
																	$('<div class="rcmark" rc="7" style="color: #882;">遲到</div>').appendTo(r);
																}
															})
															if(json.rc1 != null)
																$("#rcStdAbsCount").attr({"num":""+json.rc1}).text('曠課人數：'+json.rc1);
															if(json.rc7 != null)
																$("#rcStdLateCount").attr({"num":""+json.rc7}).text('遲到人數：'+json.rc7);
															if(json.rcdm != null)
																$("#rollcall_step1").text(json.rcdm+' 已點名').css({'color':'blue','visibility':'visible'});
														}else{
															showMessagePopup('處理失敗').css('color','red');
														}
													}else{
														showMessagePopup('連線失敗(src1)').css('color','red');
													}
												},
												error: function(e){
													showMessagePopup('連線失敗(src)').css('color','red');
												}
												,complete: function(){
													delete $.currentReadCard;
													$.listenerCardClose = true;
												}
											});
										}
									}else if($.currentReadCard == 'submitArrived'){
										$.listenerCardClose = false;
										showMessagePopup('正在送出全到確認，請稍候...',0);

										var id = $("#rclist").val();
										var tp = '';
										if(id != '')
											tp = $("#rclist").find("[value='"+id+"']").attr("tp");

										var server = '';
										if(tp == '3') server = s.server1;
										else if(tp == '5') server = s.server2;

										if(id != '' && server != ''){
											//data = '{'+data.substring(1)+'}';

											$.ajax({
												url: server+'/submitArrived',
												type: "POST",
												contentType: "application/json;charset=utf-8",
												dataType: "json",
												data: "{'client':'"+s.client+"','kiosk':'"+guid+"','dt':'"+$("#rollcall_seats").attr("dt")+"','tp':'"+tp+"','card':'"+res.dataStr.slice(-8)+"','id':'"+id+"'}",
												success: function(json,status,xhr){
													if(json){
														if(json.error){
															showMessagePopup('處理失敗<br/>'+json.error,7777,{b:'rgba(255,0,0,0.7)',c:'white'});
														}else if(json.success == 'Y'){
															if(json.msg){
																showMessagePopup('處理成功<br/>'+json.msg,6666,{b:'rgba(66,200,66,0.7)',c:'white'});
															}else showMessagePopup('處理成功',4000,{b:'rgba(66,200,66,0.7)',c:'white'});

															if(json.rcdm != null)
																$("#rollcall_step1").text(json.rcdm+' 已點名').css({'color':'blue','visibility':'visible'});
														}else{
															showMessagePopup('處理失敗').css('color','red');
														}
													}else{
														showMessagePopup('連線失敗(src1)').css('color','red');
													}
												},
												error: function(e){
													showMessagePopup('連線失敗(src)').css('color','red');
												}
												,complete: function(){
													delete $.currentReadCard;
													$.listenerCardClose = true;
												}
											});
										}
									}
								}
							},function () {});
						}
					},1000);

					$(".deviceMessage").remove();
					var nodevice = $('<div style="font-size: 5rem;font-weight: bold;border-radius: 5px;z-index: 5;display: none;">讀卡機啟用成功</div>').appendTo('body')
						.css({background:'rgb(30,180,30)',color:'white',position:'fixed',right:'20px',bottom:'20px',padding:'11px 24px',opacity:'0.6'}).show();
					setTimeout(function(){
						nodevice.fadeOut(1500,function(){
							nodevice.remove();
						});
					},2000)
				}else{
					//alert('Device init failure:'+JSON.stringify(res));
				}
			},function () {}, $.ecampus.setting.readerPort);
		},
		INIT_INTERVAL: function () {
			var _this = this;

			setInterval(function(){
				var s = $.ecampus.setting;
				var guid = (s.server1 != null && s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
				!window.external||!window.external.System||(guid=window.external.System.GetKioskId);

				var d = new Date();
				var h = d.getHours();
				var m = (''+(d.getMinutes()+100)).slice(-2);
				var sec = d.getSeconds();
				var datestr = [''+d.getFullYear(),(''+(d.getMonth()+101)).slice(-2),(''+(d.getDate()+100)).slice(-2)];

				$.support.cors = true;
				$.daySecondSUM = ($.daySecondSUM||0)+1;
				if($.daySecondSUM >= 86400) $.daySecondSUM = 0;//每24小時歸0

				//日期變換時要一次資料,失敗的話每30秒要問一次
				if((s.lessonsDt != (''+datestr[0]+datestr[1]+datestr[2]) && $.currentReadCard == 'main' && $.daySecondSUM%30 == 1) || $.loadLessonsRightNow){
					delete $.loadLessonsRightNow;
					$("#header-date").text(datestr[0]+'-'+datestr[1]+'-'+datestr[2]);

					if(!$.callEcampusLessons){
						delete $.roomLessons1;
						delete $.roomLessons2;

						$.callEcampusLessons = true;
						delete $.ecampus.setting.lesson;
						delete $.ecampus.setting.lessons;
						$.ecampus.setting.callStds = 0;//下次變換節次的時間點(一天的第幾秒)

						_this.queryRoomLessons(1,guid,datestr);

						$.ajax({
							url: s.server1+"/announce",
							type: "POST",
							//async :	false,
							contentType: "application/json;charset=utf-8",
							dataType: "json",
							data: '{"client":"'+s.client+'","kiosk":"'+guid+'"}',
							success: function(json,status,xhr){
								if(json && json.length){
									var html = '';
									for(var i=0;i<json.length;i++)
										//var m = json[i];
										//html += '<tr><td><div class="announce'+i+'" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div></td></tr>';
										html += '<div class="announce'+i+'" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div>';
									$('#announce').html(html);

									for(var i=0;i<json.length;i++){
										var m = json[i];
										$('#announce').find(".announce"+i).text(m.d+' '+m.t);
									}
								}
							},
							error: function(){
								//showMessagePopup('連線失敗');
								//console.log('load announce failed');
							},
							complete: function(){
							}
						});
					}
				}

				if(sec < 3 || !s.lessons)
					$("#header-time").text(('0'+(h%12)).slice(-2)+':'+m+' '+(h<12?'AM':'PM'));

				if(sec%4 == 0 && $.currentReadCard == 'main'){
					var daysec = h*60*60+d.getMinutes()*60+sec;

					var e;!$.ecampus||!$.ecampus.setting||(e=$.ecampus.setting.lessons);
					if(($.ecampus.setting.lesson == null || $.ecampus.setting.callStds < daysec) && e != null && e.length > 0){
						//變換節次資料前先清空畫面
						$("#main-lesson-table").find(".lesson-time").text('').end()
							.find(".teacher-no-head").hide().end()
							.find(".teacher-name").text('').end()
							.find(".lesson-name").text('');
						$("#main-abs-memo").hide().find("div:first").html('');
						$("#main-abs-downarrow").hide();
						$("#main-abs-percentbar").hide();
						$("#main-lesson-stds").html('');

						if($.ecampus.setting.lesson && $.ecampus.setting.lesson.row != null)
							delete $.ecampus.setting.lesson.row;

						for(var i=0;i<e.length;i++){
							var b = (e[i].tb||'').split(':').join('');
							var c = (e[i].et||'').split(':').join('');

							if(b.length == 4 && c.length == 4 && !isNaN(b) && !isNaN(c)){
								if((''+(h+100)).slice(-2)+m <= c){
									$.ecampus.setting.lesson = {row:i};
									$.ecampus.setting.callStds = parseInt(c.substring(0,2),10)*60*60+parseInt(c.substring(2,4),10)*60;

									$("#main-lesson-table").find(".lesson-time").text(e[i].name+' '+e[i].tb+'-'+e[i].et);

									if(e[i].s){
										$("#main-lesson-table").find(".teacher-no-head").css("display","inline-block").end()
											.find(".teacher-name").text($.trim(e[i].e)+' 老師').end()
											.find(".lesson-name").text(e[i].s);

										var server = '';
										if(e[i].tp == '3') server = s.server1;
										else if(e[i].tp == '5') server = s.server2;

										if(server != ''){
											$.support.cors = true;

											$.ajax({
												url: server+"/stds",
												type: "POST",
												async :	false,
												contentType: "application/json;charset=utf-8",
												dataType: "json",
												data: '{"client":"'+s.client+'","kiosk":"'+guid+'","id":"'+e[i].id+'","tp":"'+e[i].tp+'"}',
												success: function(json,status,xhr){
													$.ecampus.setting.lessons[$.ecampus.setting.lesson.row]['total'] = json.stds.length;
													if(json.stds.length){
														var abs = (json.abs && !isNaN(json.abs))?parseInt(json.abs,10):0;
														$("#main-abs-memo").find("div:first").html('應出席:<span style="color: red;">'+json.stds.length+'</span>/缺席:<span style="color: red;">'+(json.stds.length-abs)+'</span>人').end().show();
														$("#main-abs-downarrow").show();

														var p = parseInt(abs*100/json.stds.length);
														if(p < 1) $("#main-abs-percentbar").css("background-color","#D5D4E7");
														else if(p >= 100) $("#main-abs-percentbar").css("background","#E97D03");
														else $("#main-abs-percentbar").css("background","linear-gradient(to right,#E97D03 "+p+"%,#ccc "+p+"%)");

														$("#main-abs-percentbar").show();
														//$("#main-abs-detail").show();

														var sign = 0;
														var unsign = 0;
														var leave = 0;
														var late = 0;
														var le = json.stds;
														var html = '';
														if(le != null){
															for(var k in le){
																html += '<div id="std_'+le[k].id+'" style="float: left;width: 49.5%;text-align: left;margin-bottom: 12px;position: relative;"><table style="width: 100%;background-color: rgba(0,0,0,0);"><tr><td width="1">';
																if(le[k].p && le[k].ct){
																	html += '<img src="data:'+le[k].ct+';base64,'+le[k].p+'" style="width: 55px;height: 55px;border-radius: 50%;margin-right: 10px;"/>';
																}else html += '<div style="width: 55px;height: 55px;border-radius: 50%;margin-right: 10px;display: inline-block;background-color: rgb(213,212,231);color: white;text-align: center;vertical-align: middle;font-size: 3.8rem;font-weight: bold;">?</div>';
																html += '</td><td align="left"><div class="studentBlock" style="color: #777;font-size: 1.7rem;max-height: 50px;overflow: hidden;" seat="'+le[k].seat+'">'+le[k].name+'</div></td></tr></table>';

																//本日本節課沒點名紀錄時全部呈現未點名
																if(json.tearc != 'Y'){
																	le[k].opa = 'noopacity';
																	html += '<div class="stds-not-coming">未到</div>';
																}else{
																	/*
																	if(le[k].abs == 'A'){
																		sign++;//已到
																		le[k].opa = 'noopacity';
																	}else{
																		unsign++;
																		le[k].opa = 'opacity4';
																		html += '<div class="stds-not-coming">未到</div>';
																	}
																	*/
																	if(le[k].abs == '1'){
																		unsign++;
																		le[k].opa = 'noopacity';
																		html += '<div class="stds-not-coming">曠課</div>';
																	}else if(le[k].abs == '7'){
																		unsign++;
																		le[k].opa = 'noopacity';
																		html += '<div class="stds-not-coming">遲到</div>';
																	}else{
																		sign++;//已到
																		le[k].opa = 'noopacity';
																	}
																}
																html += '</div>';
															}
															$.ecampus.setting.lessonStd = le;
														}

														if($.ecampus.setting.lesson != null)
															$.ecampus.setting.lesson = $.extend($.ecampus.setting.lesson,{total:json.total,sign:sign,unsign:unsign,leave:leave,late:late});

														$("#main-lesson-stds").html(html);
													}else{
														$("#main-abs-memo").hide().find("div:first").html('');
														$("#main-abs-downarrow").hide();
														$("#main-abs-percentbar").hide();
														$("#main-lesson-stds").html('');
													}
												}
											});
										}
									}
									break;
								}
							}
						}
					}
				}

				if($.daySecondSUM % 3600 == 1){//每次開啟或間隔一小時查一次
					if($.ecampus.setting.temperatureSite){
						//溫度
						/*$.ajax({
							url: "https://opendata.epa.gov.tw/api/v1/ATM00698?$skip=0&$top=40&$format=json",
							//url: "https://223.200.80.137/api/v1/ATM00698?$skip=0&$top=40&$format=json",
							dataType: "json",
							success: function(json,status,xhr){
								if(json && json.length){
									for(var j in json){
										var a = json[j];
										if(a.SiteName == $.ecampus.setting.temperatureSite){
											if($.trim(a.Temperature) != ''){
												var html = $.trim(a.Temperature);
												if(html != null && html.indexOf('(') >= 1)
													html = html.substring(0,html.indexOf('('))+'℃';

												if(a.Weather == '晴'){
													html = '<div style="height: 100%;padding-left: 31px;background-image: url(images/svg/wi-day-sunny_white.svg);background-repeat: no-repeat;background-size: 30px 100%;">'+html+'</div>';
												}else if(a.Weather == '多雲'){
													html = '<div style="height: 100%;padding-left: 31px;background-image: url(images/svg/wi-cloudy_white.svg);background-repeat: no-repeat;background-size: 30px 100%;">'+html+'</div>';
												}else if(a.Weather == '陰有靄'){
													html = '<div style="height: 100%;padding-left: 31px;background-image: url(images/svg/wi-day-cloudy_white.svg);background-repeat: no-repeat;background-size: 30px 100%;">'+html+'</div>';
												}else if(a.Weather == '雨'){
													html = '<div style="height: 100%;padding-left: 31px;background-image: url(images/svg/wi-rain_white.svg);background-repeat: no-repeat;background-size: 30px 100%;">'+html+'</div>';
												}

												$("#temperature").html(html);
												$.ecampus.setting.temperature = html;
												break;
											}
										}
									}
								}
							}
						});*/
					}

					if($.ecampus.setting.pmSite && typeof($.ecampus.setting.pmSite) == 'object' && Object.keys($.ecampus.setting.pmSite).length > 0){
						//PM2.5 & CO
						/*$.ajax({
							url: "https://opendata.epa.gov.tw/api/v1/AQI?$skip=0&$top=1000&$format=json",
							//url: "https://223.200.80.137/api/v1/AQI?$skip=0&$top=1000&$format=json",
							dataType: "json",
							success: function(json,status,xhr){
								if(json && json.length){
									var size = Object.keys($.ecampus.setting.pmSite).length+1;
									var pm = new Array(size);
									var co = new Array(size);
									var AQI = new Array(size);

									for(var j in json){
										var a = json[j];
										if(a.County == $.ecampus.setting.pmCity){
											if(a.SiteName in $.ecampus.setting.pmSite){
												var ser = $.ecampus.setting.pmSite[a.SiteName];
												if($.trim(a['PM2.5']) != '') pm[ser] = $.trim(a['PM2.5']);
												if($.trim(a.CO) != '') co[ser] = $.trim(a.CO);
												if($.trim(a.AQI) != '') AQI[ser] = $.trim(a.AQI);
											}
										}
									}

									for(var i=0;i<size-1;i++){
										if(pm[size] == null)
											if($.trim(pm[i]) != '')
												pm[size] = $.trim(pm[i]);
										if(co[size] == null)
											if($.trim(co[i]) != '')
												co[size] = $.trim(co[i]);
										if(AQI[size] == null)
											if($.trim(AQI[i]) != '')
												AQI[size] = $.trim(AQI[i]);
									}

									pm = $.trim(pm[size]);
									co = $.trim(co[size]);
									AQI = $.trim(AQI[size]);

									var span = '<span style="font-weight: bold;border-radius: 45%;padding: 0 5px;'
									if(AQI){
										if(AQI <= 50) span += 'background-color: rgba(0,232,0,0.3);';
										else if(AQI <= 100) span += 'background-color: rgba(255,255,0,0.3);';
										else if(AQI <= 150) span += 'background-color: rgba(255,126,0,0.3);';
										else if(AQI <= 200) span += 'background-color: rgba(255,0,0,0.3);';
										else if(AQI <= 300) span += 'background-color: rgba(143,63,151,0.3);';
										else if(AQI <= 500) span += 'background-color: rgba(126,0,35,0.3);';
									}
									span += '">';

									$.ecampus.setting.pm25 = 'PM2.5&nbsp;'+span+$.trim(pm)+'</span>';
									$.ecampus.setting.co = 'CO&nbsp;'+span+$.trim(co)+'</span>';

									$("#PM25").html('PM2.5&nbsp;'+span+$.trim(pm)+'</span>');
									$("#CO").html('CO&nbsp;'+span+$.trim(co)+'</span>');
								}
							}
						});*/
					}
				}

				if($.groupInfoSecond != null && $.daySecondSUM >= $.groupInfoSecond){
					delete $.groupInfoSecond;
					_this.QUERY_GROUP_INFO('1');
					_this.QUERY_GROUP_INFO('2');

					$.showGroupInfoResult = setInterval(function(){
						if($.groupInfoResult1 && $.groupInfoResult2){
							clearInterval($.showGroupInfoResult);
							delete $.showGroupInfoResult;

							var group1 = null;
							var group2 = null;

							if($.groupInfoResult1.status == 'success')
								group1 = $.groupInfoResult1.json;
							if($.groupInfoResult2.status == 'success')
								group2 = $.groupInfoResult2.json;
							_this.PROCESS_GROUPINFO(group1,group2);

							delete $.groupInfoResult1;
							delete $.groupInfoResult2;
						}
					},1000)
				}
			}, 1000);
		},
		QUERY_GROUP_INFO: function(serverNo){
			var s = $.ecampus.setting;
			var guid = (s.server1 != null && s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
			!window.external||!window.external.System||(guid=window.external.System.GetKioskId);
			$.support.cors = true;

			if(s['server'+serverNo] != null){
				$.ajax({
					url: s['server'+serverNo]+"/groupInfo",
					type: "POST",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: '{"client":"'+s.client+'","kiosk":"'+guid+'"}',
					success: function(json,status,xhr){
						$['groupInfoResult'+serverNo] = {server:serverNo,status:'success',json:json};
					},
					error: function(){
						$['groupInfoResult'+serverNo] = {server:serverNo,status:'error'};
					}
				});
			}else $['groupInfoResult'+serverNo] = {server:serverNo,status:'error'};
		},
		queryLessonSubject: function(serverNo){
			var _this = this;
			var s = $.ecampus.setting;
			var guid = (s.server1 != null && s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
			!window.external||!window.external.System||(guid=window.external.System.GetKioskId);
			$.support.cors = true;

			if(s['server'+serverNo] != null){
				$.ajax({
					url: s['server'+serverNo]+'/lessonSubject',
					type: "POST",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: '{"client":"'+s.client+'","kiosk":"'+guid+'"}',
					success: function(json,status,xhr){
						$['lessonSubject'+serverNo] = {server:serverNo,status:'success',json:json};
					},
					error: function(e){
						$['lessonSubject'+serverNo] = {server:serverNo,status:'error'};
					},
					complete: function(){
						if(serverNo < 2) _this.queryLessonSubject(serverNo+1);
						else _this.execLessonSubject();
					}
				});
			}else{
				$['lessonSubject'+serverNo] = {server:serverNo,status:'error'};
				if(serverNo < 2) _this.queryLessonSubject(serverNo+1);
				else _this.execLessonSubject();
			}
		},
		execLessonSubject: function(){
			if($.lessonSubject1 && $.lessonSubject2){
				if($.lessonSubject1.status == 'success' || $.lessonSubject2.status == 'success'){
					var less = [];

					if($.lessonSubject1.status == 'success'){
						var json = $.lessonSubject1.json;
						if(json && json.lessons && json.lessons.length)
							less = json.lessons;
					}

					if($.lessonSubject2.status == 'success'){
						var json = $.lessonSubject2.json;
						if(json && json.lessons && json.lessons.length){
							if(less.length == 0){
								less = json.lessons;
							}else{
								var p = {};
								for(var i=0;i<less.length;i++){
									var d = less[i];
									p['no'+d.no] = i;
								}

								for(var i=0;i<json.lessons.length;i++){
									var d = json.lessons[i];
									if(p['no'+d.no] != null){
										for(var j=0;j<=6;j++){
											var s = d[''+j];
											if(s != null)
												less[p['no'+d.no]]['a'+j] = s;
										}
									}
								}
							}
						}
					}

					if(less.length > 0){
						var html = '<div style="border-bottom: 1px solid #eee;padding-bottom: 4px;"><div style="width: 125px;display: inline-block;"></div><div class="lessonSubj-cell">星期日</div><div class="lessonSubj-cell">星期一</div><div class="lessonSubj-cell">星期二</div><div class="lessonSubj-cell">星期三</div><div class="lessonSubj-cell">星期四</div><div class="lessonSubj-cell">星期五</div><div class="lessonSubj-cell">星期六</div></div>';
						for(var i=0;i<less.length;i++){
							var d = less[i];
							html += '<div style="border-bottom: 1px solid #eee;padding-bottom: 4px;">';
							html += '<div style="display: inline-block;vertical-align: top;width: 125px;text-align: center;">'+d.name+'<br/>'+d.tb+' ~ '+d.et+'</div>';
							for(var j=0;j<=6;j++){
								html += '<div class="lessonSubj-cell">';
								var s1 = d[''+j];
								var s2 = d['a'+j];
								if(s1 == null && s2 == null){
									html += '&nbsp;';
								}else{
									if(s1 != null) html += '<div style="color: blue;">'+$.trim(s1[0])+'</div><div style="color: purple;">'+$.trim(s1[1])+'</div>';
									if(s2 != null) html += '<div style="color: blue;">'+$.trim(s2[0])+'</div><div style="color: purple;">'+$.trim(s2[1])+'</div>';
								}
								html += '</div>';
							}
							html += '</div>';
						}

						$("#roomSubjectBody").html(html);
					}else{
						$("#roomSubjectBody").html('<div style="text-align: center;">無資料</div>');
					}

					$("#roomSubject").modal('show');

					clearMessagePopup();
				}else{
					showMessagePopup('連線失敗(ls)').css('color','red');
				}

				delete $.lessonSubject1;
				delete $.lessonSubject2;
				$("#subject").removeAttr("inQry");
			}
		},
		queryRoomLessons: function(serverNo,guid,datestr){
			var _this = this;
			var s = $.ecampus.setting;

			if(s['server'+serverNo] != null){
				$.support.cors = true;
				$.ajax({
					url: s['server'+serverNo]+"/lessons",
					type: "POST",
					//async :	false,
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: '{"client":"'+s.client+'","kiosk":"'+guid+'"}',
					success: function(json,status,xhr){
						$['roomLessons'+serverNo] = {server:serverNo,status:'success',json:json};
					},
					error: function(){
						$['roomLessons'+serverNo] = {server:serverNo,status:'error'};
					},
					complete: function(){
						if(serverNo < 2) _this.queryRoomLessons(serverNo+1,guid,datestr);
						else _this.execRoomLessons(datestr);
					}
				});
			}else{
				$['roomLessons'+serverNo] = {server:serverNo,status:'error'};
				if(serverNo < 2) _this.queryRoomLessons(serverNo+1,guid,datestr);
				else _this.execRoomLessons(datestr);
			}
		},
		execRoomLessons: function(datestr){
			if($.roomLessons1 && $.roomLessons2){
				if($.roomLessons1.status == 'success' || $.roomLessons2.status == 'success'){
					var less = [];
					var group1 = null;
					var group2 = null;
					var flag = false;

					if($.roomLessons1.status == 'success'){
						var json = $.roomLessons1.json;

						if(json){
							if(json.lessons){
								flag = true;

								if(json.dt != (''+datestr[0]+datestr[1]+datestr[2])){
									//showMessagePopup('日期異常1:'+json.dt+','+''+datestr[0]+datestr[1]+datestr[2]);
									showMessagePopup('日期異常');
								}else{
									//$.ecampus.setting.lessons = json.lessons;
									less = json.lessons;
									$.ecampus.setting.lessonsDt = json.dt;
									if(json.room)
										$("#roomName").text($.ecampus.setting.info.room = json.room);
									//if(json.mbg) $.ecampus.setting.info.mbg = json.mbg;
									//if(json.sbg) $.ecampus.setting.info.sbg = json.sbg;
									//$('<style>.master-bgc {background-color: '+mbg+';color: white;} .master-fc {color: '+mbg+';} #absence-stat-tabs li.active div:first-child {color: '+mbg+';} .secondary-bgc {background-color: '+sbg+';} .secondary-fc {color: '+sbg+';}</style>').appendTo('body');
								}
							}

							group1 = json.groupInfo;
						}
					}

					if($.roomLessons2.status == 'success'){
						var json = $.roomLessons2.json;

						if(json){
							if(json.lessons){
								flag = true;

								if(json.dt != (''+datestr[0]+datestr[1]+datestr[2])){
									//showMessagePopup('日期異常2:'+json.dt+','+''+datestr[0]+datestr[1]+datestr[2]);
									showMessagePopup('日期異常');
								}else{
									//$.ecampus.setting.lessons = json.lessons;
									if(less.length == 0){
										less = json.lessons;
										$.ecampus.setting.lessonsDt = json.dt;
										if(json.room)
											$("#roomName").text($.ecampus.setting.info.room = json.room);
										//if(json.mbg) $.ecampus.setting.info.mbg = json.mbg;
										//if(json.sbg) $.ecampus.setting.info.sbg = json.sbg;
										//$('<style>.master-bgc {background-color: '+mbg+';color: white;} .master-fc {color: '+mbg+';} #absence-stat-tabs li.active div:first-child {color: '+mbg+';} .secondary-bgc {background-color: '+sbg+';} .secondary-fc {color: '+sbg+';}</style>').appendTo('body');
									}else if(json.lessons.length){
										var r1 = 0;
										var r2 = 0;
										var ret = [];

										while(r1 < less.length || r2 < json.lessons.length){
											if(r1 >= less.length){
												if(json.lessons[r2].id != null)
													ret.push(json.lessons[r2]);
												r2++;
											}else if(r2 >= json.lessons.length){
												if(less[r1].id != null)
													ret.push(less[r1]);
												r1++;
											}else{
												var b1 = (less[r1].tb||'').split(':').join('');
												var c1 = (less[r1].et||'').split(':').join('');
												var b2 = (json.lessons[r2].tb||'').split(':').join('');
												var c2 = (json.lessons[r2].et||'').split(':').join('');

												if(b1.length != 4 || c1.length != 4 || isNaN(b1) || isNaN(c1)){
													r1++;
												}else if(b2.length != 4 || c2.length != 4 || isNaN(b2) || isNaN(c2)){
													r2++;
												}else{
													b1 = parseInt(b1,10);
													c1 = parseInt(c1,10);
													b2 = parseInt(b2,10);
													c2 = parseInt(c2,10);
													if(b1<b2){
														if(less[r1].id != null)
															ret.push(less[r1]);
														r1++;
													}else if(b2<b1){
														if(json.lessons[r2].id != null)
															ret.push(json.lessons[r2]);
														r2++;
													}else{
														if(c2<c1){
															if(json.lessons[r2].id != null)
																ret.push(json.lessons[r2]);
															r2++;
														}else{
															if(less[r1].id != null)
																ret.push(less[r1]);
															r1++;
														}
													}
												}
											}
										}

										less = ret;
									}
								}
							}

							group2 = json.groupInfo;
						}
					}

					this.PROCESS_GROUPINFO(group1,group2);

					if(!flag){
						showMessagePopup('無法取得課程資訊');
					}else $.ecampus.setting.lessons = less;
				}else{
					showMessagePopup('連線失敗(rl)').css('color','red');
				}

				delete $.roomLessons1;
				delete $.roomLessons2;
				delete $.callEcampusLessons;
			}
		},
		queryTeaRollcall: function(serverNo,card,guid){
			var _this = this;
			var s = $.ecampus.setting;

			if(s['server'+serverNo] != null){
				$.support.cors = true;
				$.ajax({
					url: s['server'+serverNo]+"/teaRollCall",
					type: "POST",
					//async :	false,
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: '{"client":"'+s.client+'","kiosk":"'+guid+'","card":"'+card+'"}',
					success: function(json,status,xhr){
						$['teaRollCall'+serverNo] = {server:serverNo,status:'success',json:json};
					},
					error: function(){
						$['teaRollCall'+serverNo] = {server:serverNo,status:'error'};
					},
					complete: function(){
						if(serverNo < 2) _this.queryTeaRollcall(serverNo+1,card,guid);
						else _this.execTeaRollcall();
					}
				});
			}else{
				$['teaRollCall'+serverNo] = {server:serverNo,status:'error'};
				if(serverNo < 2) _this.queryTeaRollcall(serverNo+1,card,guid);
				else _this.execTeaRollcall();
			}
		},
		execTeaRollcall: function(){
			if($.teaRollCall1 && $.teaRollCall2){
				if($.currentReadCard == 'doRollcall'){
					if($.teaRollCall1.status == 'success' || $.teaRollCall2.status == 'success'){
						var isTea = false;
						var clist = [];

						if($.teaRollCall1.status == 'success'){
							var json = $.teaRollCall1.json;

							if(json){
								if(json.isTea == 'Y')
									isTea = true;
								if(json.list && json.list.length)
									clist = clist.concat(json.list);
							}
						}

						if($.teaRollCall2.status == 'success'){
							var json = $.teaRollCall2.json;

							if(json){
								if(json.isTea == 'Y')
									isTea = true;
								if(json.list && json.list.length)
									clist = clist.concat(json.list);
							}
						}

						if(isTea){
							$.currentReadCard = null;
							$.ecampus.setting.rollCallList = clist;
							clearMessagePopup();
							delete $.groupInfoSecond;
							kiosk.API.goToNext('rollcall');
						}else{
							showMessagePopup('非教師不可以點名');
							$.currentReadCard = 'main';
						}
					}else{
						showMessagePopup('連線失敗(trc)').css('color','red');
						$.currentReadCard = 'main';
					}
				}

				delete $.teaRollCall1;
				delete $.teaRollCall2;
				$.listenerCardClose = true;
			}
		},
		UNLOCK_CARD: function(serverNo, card) {
			var _this = this;
			var s = $.ecampus.setting;
			var guid = (s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
			!window.external||!window.external.System||(guid=window.external.System.GetKioskId);

			if(s['server'+serverNo] != null){
				$.support.cors = true;
				$.ajax({
					url: s['server'+serverNo]+"/unlock",
					type: "POST",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: '{"client":"'+s.client+'","kiosk":"'+guid+'","card":"'+card+'"}',
					success: function(json,status,xhr){
						if(json.isTea == 'Y'){
							shutDownAPP();
						}else{
							if(serverNo == '1' && s['server2'] != null){
								_this.UNLOCK_CARD('2',card);
							}else{
								showMessagePopup('處理失敗：非教師卡不可以解鎖').css('color','red');
								$.listenerCardClose = true;
								$.currentReadCard = 'main';
							}
						}
					},
					error: function(e){
						if(serverNo == '1' && s.server2 != null){
							_this.UNLOCK_CARD('2',card);
						}else{
							showMessagePopup('處理失敗：連線錯誤').css('color','red');
							$.listenerCardClose = true;
							$.currentReadCard = 'main';
						}
					}
				});
			}else{
				showMessagePopup('處理失敗：未設定連線位址').css('color','red');
				$.listenerCardClose = true;
				$.currentReadCard = 'main';
			}
		},
		MAIN_CARD: function(serverNo, card, postId, tp) {
			var _this = this;
			var s = $.ecampus.setting;
			var guid = (s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
			!window.external||!window.external.System||(guid=window.external.System.GetKioskId);
			$.support.cors = true;

			if(s['server'+serverNo] != null){
				$.ajax({
					url: s['server'+serverNo]+"/card",
					type: "POST",
					contentType: "application/json;charset=utf-8",
					dataType: "json",
					data: '{"client":"'+s.client+'","kiosk":"'+guid+'","card":"'+card+'","id":"'+postId+'","tp":"'+tp+'"}',
					success: function(json,status,xhr){
						if($.trim(json.next) != 'N' && serverNo == '1' && s.server2 != null){
							$.callMainCardResult = json;
							_this.MAIN_CARD('2',card,postId,tp);
						}else{
							if($.trim(json.next) != 'N' && $.callMainCardResult != null){
								_this.PROCESS_MAIN_CARD($.callMainCardResult);
							}else _this.PROCESS_MAIN_CARD(json);
						}
					},
					error: function(e){
						if(serverNo == '1' && s.server2 != null){
							_this.MAIN_CARD('2',card,postId,tp);
						}else{
							if($.callMainCardResult != null){
								_this.PROCESS_MAIN_CARD($.callMainCardResult);
							}else{
								showMessagePopup('連線失敗(mc)').css('color','red');
								$.listenerCardClose = true;
							}
						}
					}
				});
			}else{
				$['roomLessons'+serverNo] = {server:serverNo,status:'error'};
			}
		},
		PROCESS_MAIN_CARD: function(json) {
			if(json.mode == 'enter'){
				$("#announce").hide();

				var tm = $.trim(json.tm);
				if(tm != '' && tm.length == 14)
					tm = tm.substring(8,10)+':'+tm.substring(10,12)+':'+tm.substring(12,14);

				if(json.success == 'Y'){
					if(json.dup == 'Y'){
						showMessagePopup(json.name+' 重複刷卡',5000);
					}else{
						if(json.type == '學生'){
							var t = tm+' '+$.trim(json.name)+' 同學';
							if(json.isLate == 'Y'){
								t += '<span style="color: #00D600;">刷卡成功</span>，<span style="color: purple;">你遲到了</span>';
							}else t += '<span style="color: #00D600;">刷卡成功</span>';
							if(json.late)
								t += '；<span style="color: red;">本月已累計遲到'+json.late+'次</span>';
							$('<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div>').prependTo("#outin").html(t);
						}else{
							$('<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div>').prependTo("#outin").html(tm+' '+$.trim(json.name)+' 教師<span style="color: #00D600;">刷卡成功</span>');
						}

						showMessagePopup(json.name+' 刷卡成功',5000);
					}
				}else{
					showMessagePopup(json.name+' 刷卡失敗',5000);
				}

				$("#rightDownTitle").text('出入校園刷卡紀錄');
				$("#outin").show();
			}else{
				$("#outin").hide();
				$("#rightDownTitle").text('公告事項');
				$("#announce").show();

				if(json.isTea == 'Y'){
					shutDownAPP();
				}else if($.trim(json.error) != ''){
					showMessagePopup(json.error).css('color','red');
				}else if(json.success == 'Y'){
					var txt = json.name+' 上課簽到成功';
					if($.trim(json.warning) != '')
						txt += json.warning;
					showMessagePopup(txt);

					$("#std_"+json.id).find(".stds-not-coming").remove();
					if(json.arrival){
						var total = $.ecampus.setting.lessons[$.ecampus.setting.lesson.row]['total'];
						$("#main-abs-memo").find("div:first").html('應出席:<span style="color: red;">'+total+'</span>/缺席:<span style="color: red;">'+(total-json.arrival)+'</span>人').end().show();
						var p = parseInt(json.arrival*100/total);
						if(p < 1) $("#main-abs-percentbar").css("background-color","#D5D4E7");
						else if(p >= 100) $("#main-abs-percentbar").css("background","#E97D03");
						else $("#main-abs-percentbar").css("background","linear-gradient(to right,#E97D03 "+p+"%,#ccc "+p+"%)");
					}
				}else{
					showMessagePopup('連線失敗(mc2)').css('color','red');
				}
			}
			$.listenerCardClose = true;
		},
		PROCESS_GROUPINFO: function(g1,g2) {
			$.groupInfoSecond = $.daySecondSUM+30;

			var d = new Date();
			var t = ('00'+d.getHours()).slice(-2)+(''+(d.getMinutes()+100)).slice(-2);
			var text = [];
			var media = [];

			if(g1 != null){
				if(g1.text != null){
					$.each(g1.text, function(i,x){
						if((x.b == null || t >= x.b) && (x.e == null || t <= x.e))
							text.push(x.t);
					})
				}
				if(g1.media != null){
					$.each(g1.media, function(i,x){
						if((x.b == null || t >= x.b) && (x.e == null || t <= x.e))
							media.push(x.n);
					})
				}
			}

			if(g2 != null){
				if(g2.text != null){
					$.each(g2.text, function(i,x){
						if((x.b == null || t >= x.b) && (x.e == null || t <= x.e))
							text.push(x.t);
					})
				}

				if(g2.media != null && !media.length){
					$.each(g2.media, function(i,x){
						if((x.b == null || t >= x.b) && (x.e == null || t <= x.e))
							media.push(x.n);
					})
				}
			}

			if(text.length){
				$.prepareBroadcast = text.join('<br/>');
				if($("#main-broadcast-text").find(".current-broadcast").length == 0){
					var o = $("#main-broadcast-text");
					o.css('font-size',''+(o.height()/14.44)+'rem');
					var k = o.html('<div class="current-broadcast" topnow="-1" style="position: absolute;z-index: 1;padding: 0;top: '+o.height()+'px;">'+$.prepareBroadcast+'</div>').find(".current-broadcast");
					this.NEXT_TEXT();
				}
			}else delete $.prepareBroadcast;

			if(media.length)
				this.CHECK_MEDIA(media,0);
		},
		NEXT_TEXT: function() {
			var _this = this;
			var k = $("#main-broadcast-text").find(".current-broadcast");
			var period = 10000;
			var ani = 1000;

			if(k.length == 1){
				var o = $("#main-broadcast-text");
				var h = o.height()*0.988;
				var top = parseInt(k.attr("topnow"),10)+1;

				if(k.height() < h*top+10){
					k.removeClass('current-broadcast');

					if($.prepareBroadcast != null){
						var u = o.append('<div class="current-broadcast" topnow="0" style="position: absolute;z-index: 11;padding: 0;top: '+o.height()+'px;">'+$.prepareBroadcast+'</div>').find(".current-broadcast");
						u.animate({top:'0'}, ani);
					}

					k.animate({top:'-'+(h*top)+'px'}, ani);
					setTimeout(function(){
						k.remove();
					},period)
				}else{
					k.attr("topnow",""+top);
					k.animate({top:'-'+(h*top)+'px'}, ani);
				}

				setTimeout(function(){
					_this.NEXT_TEXT();
				},period);
			}
		},
		CHECK_MEDIA: function(media,index) {
			var _this = this;

			if(media && media.length && index < media.length){
				var fn = media[index].toLowerCase();

				if(fn.length > 4){
					fn = fn.substring(fn.length-3);
					var w = $("#media-block").width();
					var h = $("#media-block").height();

					if(fn == 'mp4'){
						$('<video><source src="'+media[index]+'" type="video/mp4"></video>').on('canplay', function() {
							if(!$.currentMediaFile || $.currentMediaFile != media[index]){
								$.currentMediaFile = media[index];
								var html = '<video style="max-width: 100%;max-height: 100%;" autoplay loop>'
									+'<source src="'+media[index]+'" type="video/mp4">Your browser does not support the video tag.'
									+'</video>';
								var o = $("#media-block").html(html).find("video");
								if(w/o.width() > h/o.height()){
									o.css("height","100%");
								}else o.css("width","100%");
							}
						}).bind('error', function() {
							_this.CHECK_MEDIA(media,index+1);
						})
					}else if(fn == 'jpg' || fn == 'png' || fn == 'gif' || fn == 'bmp'){
						$('<img src="'+media[index]+'" />').on('load', function() {
							if(!$.currentMediaFile || $.currentMediaFile != media[index]){
								var o = $("#media-block").html('<img src="'+media[index]+'" style="max-width: 100%;max-height: 100%;" />').find("img");
								if(w/o.width() > h/o.height()){
									o.css("height","100%");
								}else o.css("width","100%");
							}
						}).bind('error', function() {
							_this.CHECK_MEDIA(media,index+1);
						})
					}else{
						_this.CHECK_MEDIA(media,index+1);
					}
				}else{
					_this.CHECK_MEDIA(media,index+1);
				}
			}
		},
		randomDraw: function(n) {
			var stds = $("#main-lesson-stds").find(".studentBlock");

			if(!stds || !stds.length){
				showMessagePopup('沒有學生').css('z-index','1200');
			}else if(isNaN(parseInt(n,10)) || parseInt(n,10) < 1){
				showMessagePopup('人數必須是正整數').css('z-index','1200');
			}else{
				$("#unlucky").hide().html('');

				var ary1 = [];
				var html = '';
				$.each(stds, function(i,x){
					var o = $(x);
					html += '<div class="dotwords" style="float: left;padding: 5px 10px;margin: 0 6px 4px 0;width: 150px;">'+o.attr("seat")+'．'+o.text()+'</div>';
					ary1.push([ary1.length,o.attr("seat"),o.text()]);
				})

				var lessonId = $.ecampus.setting.lessonsDt+'-'+$.ecampus.setting.lessons[$.ecampus.setting.lesson.row].id;
				$("#inLessonStds").attr("lessonId",lessonId).html(html);

				stds = [];
				html = '<div>本次將抽出'+n+'人</div><div style="margin-bottom: 10px;">中選者為</div><table style="margin: 0 auto;background: rgba(0,0,0,0);">';
				while(ary1.length && n > 0){
					var row = Math.floor(Math.random()*ary1.length);
					stds.push(ary1.splice(row,1)[0]);
					n--;
				}

				stds.sort(function(a,b){
					return a[0]-b[0];
				});

				for(var i=0;i<stds.length;i++)
					html += '<tr><td align="left" style="font-size: 2.5rem;">'+stds[i][1]+'．'+stds[i][2]+'</td></tr>';
				html += '</table>';

				$("#unlucky").html(html).show();
			}
		},
		showMyResRec: function(server,delpost){
			var _this = this;

			$.ajax({
				url: server+'/listmyreserve',
				type: "POST",
				contentType: "application/json;charset=utf-8",
				dataType: "json",
				data: JSON.stringify(delpost),
				success: function(json,status,xhr){
					if(json){
						if(json.error){
							showMessagePopup(json.error);
						}else if(json.success == 'Y'){
							var r = json.data;
							var html = '';
							if(r && r.length){
								html += '<div class="row">';
								html += '<div class="col-sm-3" style="text-align: center;"><div style="border-bottom: 1px solid red;">日期</div></div>';
								html += '<div class="col-sm-5" style="text-align: center;"><div style="border-bottom: 1px solid red;">區域</div></div>';
								html += '<div class="col-sm-2" style="text-align: center;"><div style="border-bottom: 1px solid red;">座位</div></div>';
								html += '<div class="col-sm-2" style="text-align: center;"><div style="border-bottom: 1px solid red;">取消</div></div>';
								html += '</div>';
								for(var i=0;i<r.length;i++){
									var d = r[i];
									html += '<div class="row" style="margin-top: 10px;margin-bottom: 12px;">'
										+'<div class="col-sm-3 imdate" style="text-align: center;">'+d.dt+'</div>'
										+'<div class="col-sm-5" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">'+d.room+'&nbsp;'+d.area+'</div>'
										+'<div class="col-sm-2" style="text-align: center;">'+d.ser+'</div>'
										+'<div class="col-sm-2" style="text-align: center;color: red;">';
									if(d.del == 'Y')
										html += '<i class="glyphicon glyphicon-remove remove-reserve" res="'+d.id+'"></i>';
									html += '</div></div>';
								}
							}else{
								html = '<div style="text-align: center;">無預約紀錄</div>';
							}

							$("#resRecBody").html(html).find(".remove-reserve").click(function(){
								var id = $(this).attr("res");
								var alert = '<div id="messagebox-alertMessage" style="text-align: left;background-color: rgb(255,200,200);padding: 15px 20px;border-radius: 10px;">'
									+'<strong>刪除確認</strong><hr/><div>確定要刪除'+$(this).parent().parent().find(".imdate").text()+'的預約紀錄？</div>'
									+'<div style="text-align: center;margin-top: 25px;overflow: hidden;height: 38px;">'
									+'<div style="float: right;"><button type="button" class="btn btn-secondary btn-cancel">取消</button></div>'
									+'<div style="float: right;margin-right: 45px;"><button type="button" class="btn btn-info btn-submit">確定</button></div>'
									+'<div style="display: none;"><div class="spinner-border text-warning" role="status"><span class="sr-only">Loading...</span></div><span style="font-size: 1.2rem;margin-left: 10px;display: inline-block;vertical-align: top;">處理中，請稍候...</span></div>'
									+'</div>'
									+'</div>';
								alert = $(alert).appendTo('#classroom-div-block').css({'position':'fixed','min-width':'240px','z-index':'9999'});
								alert.css({
									'top': 'calc(50% - '+(alert.outerHeight()/2)+'px)',
									'left': 'calc(50% - '+(alert.outerWidth()/2)+'px)'
								})

								alert.find("button.btn-submit").click(function(){
									$("#messagebox-alertMessage").remove();
									delpost.id = id;

									$.ajax({
										url: server+'/delReserve',
										type: "POST",
										contentType: "application/json;charset=utf-8",
										dataType: "json",
										data: JSON.stringify(delpost),
										success: function(json,status,xhr){
											if(json.error){
												showMessagePopup(json.error);
											}else if(json.success == 'Y'){
												if(json.msg){
													$('.delReserve-messagePopup').remove();
													var sigh = showMessagePopup(json.msg).removeClass('messagePopup').addClass('delReserve-messagePopup');
													setTimeout(function(){
														sigh.remove();
													},4444)
												}
												_this.showMyResRec(server,delpost);
											}else{
												showMessagePopup('連線失敗(2)').css('color','red');
											}
										},
										error: function(e){
											showMessagePopup('連線失敗').css('color','red');
										}
										,complete: function(){
											//delete $.lockListenerCard;
										}
									})
								});

								alert.find("button.btn-cancel").click(function(){
									$("#messagebox-alertMessage").remove();
								});
							});

							clearMessagePopup();
							$("#resRecModal").modal('show');
						}else{
							showFormErrorAutoMsg('連線失敗(2)').css('color','red');
						}
					}else{
						showFormErrorAutoMsg('連線失敗(1)').css('color','red');
					}
				},
				error: function(e){
					showMessagePopup('連線失敗').css('color','red');
				}
				,complete: function(){
					delete $.lockListenerCard;
				}
			});
		},
		addLog: function(text) {
			$('<div style="word-break: break-all;">'+text+'</div>').prependTo('#logStack');
		}
    },

    data: function () {
        // Status 清除
        kiosk.API.initStatus();
        return {};
    },

	mounted: function () {
		//this.$refs.input.select();

		this.$nextTick(function() {
//$('<div id="logStack" style="position: absolute;z-index: 999;left: 50%;top: 0;height: 500px;width: 45%;overflow: auto;opacity: 0.5;color: red;font-weight: bold;"></div>').appendTo('body');
			var _this = this;

			$.currentReadCard = 'main';
			//var ht = document.body.clientHeight;
			var ht = window.screen.height;
			$("#main-div-block").css("height",''+ht+'px');
			$("#schoolLogo").css("height",''+(ht*0.074074)+'px').attr("src",$.ecampus.setting.info.logo);
			var teaPicture = $("#main-lesson-table").find(".teacher-head").parent();
			teaPicture.find(".teacher-no-head").css("width",teaPicture.height()+"px").css('font-size',''+(teaPicture.height()/14.3)+'rem');

			$("#bottomLink1").css('width',$("#bottomLink1").height()+'px');

			var d = new Date();
			var h = d.getHours();
			var m = (''+(d.getMinutes()+100)).slice(-2);
			var datestr = [''+d.getFullYear(),(''+(d.getMonth()+101)).slice(-2),(''+(d.getDate()+100)).slice(-2)];
			$("#header-date").text(datestr[0]+'-'+datestr[1]+'-'+datestr[2]);
			$("#header-time").text(('0'+(h%12)).slice(-2)+':'+m+' '+(h<12?'AM':'PM'));
			if($.ecampus.setting.temperature != null) $("#temperature").html($.ecampus.setting.temperature);
			if($.ecampus.setting.pm25 != null) $("#PM25").html($.ecampus.setting.pm25);
			if($.ecampus.setting.co != null) $("#CO").html($.ecampus.setting.co);
			$.loadLessonsRightNow = true;

			/*
			$("#main-lesson-stds").css("height",''+(ht*0.3246-40)+'px');
			$("#schoolLogo").css("background-image","url('"+$.ecampus.setting.info.logo+"')");
			$("#main-lesson-table").find(".teacher-head").css({"height":""+(ht*0.1003*0.7)+'px','max-width':''+(ht*0.1003*0.7)+'px'});
			*/

			$.listenerCardClose = true;

			if(!$.initReaderSuccess){
				if('Device' in window.external && kiosk && kiosk.API && kiosk.API.Device && kiosk.API.Device.MD150){
					$('<div class="deviceMessage" style="font-size: 5rem;font-weight: bold;border-radius: 5px;z-index: 5;display: none;">讀卡機啟用中..</div>').appendTo('body')
						.css({background:'rgb(200,180,30)',color:'white',position:'fixed',right:'20px',bottom:'20px',padding:'11px 24px',opacity:'0.6'}).show();

					setTimeout(function(){
						_this.INIT_READER();

						$.initReaderInterval = setInterval(function(){
							if($.initReaderSuccess){
								clearInterval($.initReaderInterval);
								delete $.initReaderInterval;
							}else if(($.initReaderCount||0) >= 5){
								clearInterval($.initReaderInterval);
								delete $.initReaderInterval;
								$(".deviceMessage").remove();
								$('<div style="font-size: 5rem;font-weight: bold;border-radius: 5px;z-index: 5;display: none;">讀卡機啟用失敗</div>').appendTo('body')
									.css({background:'red',color:'white',position:'fixed',right:'20px',bottom:'20px',padding:'11px 24px',opacity:'0.6'}).show();
							}else{
								_this.INIT_READER();
							}
						},2000);
					},2000);
				}else{
					//alert('no Device');
					if(!$(".device-not-found").length){
						var nodevice = $('<div class="device-not-found" style="font-size: 5rem;font-weight: bold;border-radius: 5px;z-index: 5;display: none;">找不到讀卡機</div>').appendTo('body')
							.css({background:'red',color:'white',position:'fixed',right:'20px',bottom:'20px',padding:'11px 24px',opacity:'0.6'}).show();
						//setTimeout(function(){ nodevice.remove(); },6666);
					}
				}
			}

			if($.daySecondSUM == null)
				_this.INIT_INTERVAL();

			$("#subject").click(function(){
				if($("#subject").attr("inQry") != 'Y'){
					$("#subject").attr("inQry","Y");

					$("#roomSubjectBody").html('');
					delete $.lessonSubject1;
					delete $.lessonSubject2;
					showMessagePopup('查詢中，請稍候...',0,{b:'rgb(227,123,12)',c:'white',w:'380px',h:'80px'});
					_this.queryLessonSubject(1);
				}
			});

			$("#btnDraw1").click(function(){
				_this.randomDraw(1);
			})

			$("#btnDraw2").click(function(){
				_this.randomDraw(2);
			})

			$("#btnDraw3").click(function(){
				_this.randomDraw(3);
			})

			$("#btnDraw4").click(function(){
				var n = $.trim($("#txtDraw4").val());

				if(n == ''){
					showMessagePopup('請選擇人數').css('z-index','1200');
				}else if(isNaN(parseInt(n,10)) || parseInt(n,10) < 1){
					showMessagePopup('人數必須是正整數').css('z-index','1200');
				}else{
					_this.randomDraw(parseInt(n,10));
				}
			})

			$("#btnGroup").click(function(){
				var n = $.trim($("#txtGroup").val());
				var stds = $("#main-lesson-stds").find(".studentBlock");

				if(n == ''){
					showMessagePopup('請輸入要分為幾組').css('z-index','1200');
				}else if(isNaN(parseInt(n,10)) || parseInt(n,10) < 1){
					showMessagePopup('分組數必須是正整數').css('z-index','1200');
				}else if(!stds || !stds.length){
					showMessagePopup('沒有學生').css('z-index','1200');
				}else if(parseInt(n,10) >= stds.length){
					showMessagePopup('分組數必須小於學生人數('+stds.length+')').css('z-index','1200');
				}else{
					var ary1 = [];
					for(var i=0;i<stds.length;i++)
						ary1.push([ary1.length,stds[i].getAttribute('seat'),stds[i].innerText]);

					stds = new Array(parseInt(n,10));
					var next = 0;
					while(ary1.length > 0){
						if(stds[next] == null)
							stds[next] = [];
						var row = Math.floor(Math.random()*ary1.length);
						stds[next++].push(ary1.splice(row,1)[0]);
						if(next >= stds.length)
							next = 0;
					}

					var html = '';
					for(var i=0;i<stds.length;i++){
						stds[i].sort(function(a,b){
							return a[0]-b[0];
						});

						html += '<table style="background: rgba(0,0,0,0);width: 100%;margin-bottom: 20px;"><tr><td valign="top" style="width: 100px;text-align: center;">第'+(''+(i+101)).slice(-2)+'組：</td><td valign="top" style="text-align: left;"><div style="word-break: break-all;">';
						for(var j=0;j<stds[i].length;j++){
							if(j>0) html += '、';
							html += stds[i][j][1]+'．'+stds[i][j][2];
						}
						html += '</div></td></tr></table>';
					}

					var lessonId = $.ecampus.setting.lessonsDt+'-'+$.ecampus.setting.lessons[$.ecampus.setting.lesson.row].id;
					$("#groupGroup").attr("lessonId",lessonId).html(html);
				}
			})

			/*
			$('<video><source src="SampleVideo_1280x720_1mb.mp4" type="video/mp4"></video>').on('canplay', function() {
				alert('true');
			}).bind('error', function() {
				alert('false');
			});
			*/
		});
	},
    computed: {
		paiInfo: function() {
			return $.ecampus.setting.info||{};
		}
    },
});

// 表頭
Vue.component('component-mainMenu-navBar', {
    props: ['culture', 'model'],
    template: '#template-common-navBar',
});