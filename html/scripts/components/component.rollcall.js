// MainPage
Vue.component('component-rollcall-main', {
    props: ['model'],
    template: '#template-rollcall-main',

    methods: {
        // Btn Click
        handleMouseDown: function (nextId) {
            kiosk.API.goToNext(nextId);
        },
        goHome: function () {
			clearMessagePopup();
			$.currentReadCard = '';
			kiosk.API.goToNext('mainMenu');
		},
		rcmarkhtml: function(rc) {
			var html = '';
			var r = rc.substring(0,1);
			var c = rc.substring(1,2);
			if(r == c){
				if(r == '1'){
					html = '<span style="color: #c33;">曠課</span>';
				}else if(r == '7'){
					html = '<span style="color: #882;">遲到</span>';
				}
			}else{
				if(r == '1') r = '<span style="color: #c33;">曠</span>';
				else if(r == '7') r = '<span style="color: #882;">遲</span>';
				else r = '<span style="color: #aaa;">無</span>';
				if(c == '1') c = '<span style="color: #c33;">曠</span>';
				else if(c == '7') c = '<span style="color: #882;">遲</span>';
				else c = '<span style="color: #aaa;">無</span>';
				html = r+'<i class="glyphicon glyphicon-chevron-right" aria-hidden="true" style="font-size: 1.7rem;color: #444;"></i>'+c;
			}

			return html;
		},
		setrcmark: function(o,mark) {
			var rcmark = o.find(".rcmark");

			if(rcmark.length == 0){
				if(mark != 'x')
					$('<div class="rcmark marked" rc="x'+mark+'"></div>').appendTo(o).html(this.rcmarkhtml('x'+mark));
			}else{
				var rc = rcmark.attr("rc").substring(0,1);
				if(rc == mark){
					if(mark == 'x'){
						rcmark.remove();
					}else{
						rcmark.attr('rc',rc).removeClass('marked').html(this.rcmarkhtml(rc+mark));
					}
				}else{
					rcmark.attr('rc',rc+mark).addClass('marked').html(this.rcmarkhtml(rc+mark));
				}
			}
		},
		latemark: function () {
			this.togglemark($("#latemark"));
		},
		absmark: function () {
			this.togglemark($("#absmark"));
		},
		nomark: function () {
			this.togglemark($("#nomark"));
		},
		togglemark: function(o) {
			if(o.hasClass('rollcallfocus')){
				o.removeClass('rollcallfocus');
			}else{
				$(".rollcallbutton").removeClass('rollcallfocus');
				o.addClass('rollcallfocus');
			}
			this.setNotice();
		},
		setNotice: function () {
			var v1 = $("#rclist").val();
			var t1 = $("#rollcall_step1").text();
			var v2 = $(".rollcallfocus");
			$("#rollcall_step1").css('visibility', (v1 == ''||t1.length > 10)?'visible':'hidden');
			$("#rollcall_step2").css('visibility', v2.length?'hidden':'visible');
			if(v1 != '' && v2.length){
				var o = $("#rollcall_seats").find('.rc_stddiv');
				if(o.length){
					if(v2.attr("id") == 'latemark'){
						$("#rollcall_msg").text('請選擇遲到的學生');
					}else if(v2.attr("id") == 'absmark'){
						$("#rollcall_msg").text('請選擇曠課的學生');
					}else if(v2.attr("id") == 'nomark'){
						$("#rollcall_msg").text('請選擇要取消缺曠的學生');
					}
				}else{
					$("#rollcall_msg").text('沒有學生可以點名');
				}
			}else{
				$("#rollcall_msg").text('');
			}
		},
		resetRcstd: function () {
			$("#rollcall_seats").find('.rc_std_selected').removeClass('rc_std_selected');
		},
		confirmRollCall: function() {
			var seat = $("#rollcall_seats").find('.marked');

			if($("#rclist").val() == ''){
				showMessagePopup('請選擇點名節次');
			}else if(seat.length == 0){
				showMessagePopup('未點名');
			}else{
				showMessagePopup('請靠卡確認並送出點名結果...',0,{b:'rgb(211,26,26)',c:'white'});
				$.currentReadCard = 'submitRollcall';

				$.ecampus.messagePopup1 = setInterval(function(){
					var s = new Date().getSeconds()%3;
					var t = $(".messagePopup").text().substring(0,12)+'...';
					$(".messagePopup").text(t.substring(0,s+13));
				},1000);

				$.ecampus.messagePopup2 = setTimeout(function(){
					clearMessagePopup();
				},10000);
			}
		},
		confirmArrived: function() {
			var t1 = $("#rollcall_step1").text();

			if($("#rclist").val() == ''){
				showMessagePopup('請選擇點名節次');
			}else if(t1.length > 10){
				showMessagePopup('本節課已點過名，不用再確認全到');
			}else{
				showMessagePopup('請靠卡確認全到...',0,{b:'rgb(211,26,26)',c:'white'});
				$.currentReadCard = 'submitArrived';

				$.ecampus.messagePopup1 = setInterval(function(){
					var s = new Date().getSeconds()%3;
					var t = $(".messagePopup").text().substring(0,7)+'...';
					$(".messagePopup").text(t.substring(0,s+8));
				},1000);

				$.ecampus.messagePopup2 = setTimeout(function(){
					clearMessagePopup();
				},10000);
			}
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
			//清除不知道為什麼會一直跑的檢查身分動作
			delete $.teaRollCall1;
			delete $.teaRollCall2;
			if($.showTeaRollCall != null){
				clearInterval($.showTeaRollCall);
				delete $.showTeaRollCall;
			}

			$.currentReadCard = null;
			//var ht = document.body.clientHeight;
			var _this = this;
			var ht = window.screen.height;
			$("#rollcall-div-block").css("height",''+ht+'px');
			$("#schoolLogo").css("height",''+(ht*0.074074)+'px').attr("src",$.ecampus.setting.info.logo);
			//$('.calendar').datepicker({format: "yyyymmdd",language: 'zh-TW'});
			var height = $("#rollcall_tb").height()-30;
			$("#rollcall_seats").css('max-height',''+height+'px');

			$.support.cors = true;

			var html = '<option value="">請選擇</option>';
			if($.ecampus.setting.rollCallList != null && $.ecampus.setting.rollCallList.length > 0){
				$.each($.ecampus.setting.rollCallList, function(i,k){
					html += '<option value="'+k.id+'" tp="'+k.tp+'">'+k.lesson+' '+k.subjname+' '+k.emp+' '+(k.tp=='3'?'(高中)':'(國中)')+'</option>';
				})
			}

			$("#rclist").html(html).change(function(){
				$("#rollcall_seats").removeAttr("dt").html('');
				showMessagePopup('正在查詢上課學生...',0);

				var id = $(this).val();
				var tp = '';
				var server = '';

				var s = $.ecampus.setting;
				var guid = (s.server1 != null && s.server1.length > 23 && s.server1.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
				!window.external||!window.external.System||(guid=window.external.System.GetKioskId);

				if(id != ''){
					tp = $(this).find("[value='"+id+"']").attr("tp");
					if(tp == '3' && s.server1 != null) server = s.server1;
					if(tp == '5' && s.server2 != null) server = s.server2;
				}else{
					_this.setNotice();
					clearMessagePopup();
				}

				if(server != ''){
					$.ajax({
						url: server+'/rcstds',
						type: "POST",
						contentType: "application/json;charset=utf-8",
						dataType: "json",
						data: '{"client":"'+s.client+'","kiosk":"'+guid+'","id":"'+id+'","tp":"'+tp+'"}',
						success: function(json,status,xhr){
							if(json){
								if(json.error){
									showMessagePopup(json.error);
								}else if(json.success == 'Y'){
									clearMessagePopup();

									var html = '';
									if(json.stds){
										var late = 0;
										var abs = 0;
										for(var i=0;i<json.stds.length;i++){
											html += '<div id="rcstd_'+json.stds[i].sid+'" class="rc_stddiv" style="float: left;width: 250px;text-align: left;margin: 0 20px 12px 0;position: relative;border: 1px solid #ccc;padding: 7px 10px;border-radius: 4px;"><table style="width: 100%;background-color: rgba(0,0,0,0);"><tr><td width="1">';
											if(json.stds[i].p && json.stds[i].ct){
												html += '<img src="data:'+json.stds[i].ct+';base64,'+json.stds[i].p+'" style="width: 55px;height: 55px;border-radius: 50%;margin-right: 10px;"/>';
											}else html += '<div style="width: 55px;height: 55px;border-radius: 50%;margin-right: 10px;display: inline-block;background-color: rgb(213,212,231);color: white;text-align: center;vertical-align: middle;font-size: 3.8rem;font-weight: bold;">?</div>';
											html += '</td><td align="left"><div style="color: #777;font-size: 2rem;max-height: 50px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;width: 100px;">'+json.stds[i].name+'</div>'
												+'<div style="color: #777;font-size: 2rem;max-height: 50px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;font-size: 1.7rem;width: 100px;">';
											if($.trim(json.stds[i].cls) != '') html += $.trim(json.stds[i].cls)+'班';
											if($.trim(json.stds[i].seat) != '') html += $.trim(json.stds[i].seat)+'號';
											html += '</div></td><td><div class="rcdiv" style="width: 42px;"></div></td></tr></table>';

											if(json.stds[i].rc == '1'){
												html += '<div class="rcmark" rc="1" style="color: #c33;">曠課</div>';
												abs++;
											}else if(json.stds[i].rc == '7'){
												html += '<div class="rcmark" rc="7" style="color: #882;">遲到</div>';
												late++;
											}
											if(json.stds[i].abs != 'A')
												html += '<div style="position: absolute;right: 6px;top: 2px;color: #e93;font-size: 1.4rem;">未刷卡報到</div>';
											html += '</div>';
										}

										$("#rcStdCount").text('總人數：'+json.stds.length);
										$("#rcStdLateCount").attr({"num":""+late}).text('遲到人數：'+late);
										$("#rcStdAbsCount").attr({"num":""+abs}).text('曠課人數：'+abs);
									}

									$("#rcdt").text(json.dt.substring(0,4)+'/'+json.dt.substring(4,6)+'/'+json.dt.substring(6,8));
									$("#rollcall_seats").attr("dt",json.dt).html(html).find(".rc_stddiv").click(function(){
										//$(this).toggleClass('rc_std_selected');
										var v2 = $(".rollcallfocus");
										if(v2.length == 1){
											var mark = '';
											if(v2.attr("id") == 'latemark') mark = '7';
											else if(v2.attr("id") == 'absmark') mark = '1';
											else if(v2.attr("id") == 'nomark') mark = 'x';
											else showMessagePopup('請選擇缺曠類別');

											if(mark != '')
												_this.setrcmark($(this),mark);
										}else showMessagePopup('請選擇缺曠類別');
									});

									if(json.rcdm != null){
										$("#rollcall_step1").text(json.rcdm+' 已點名').css('color','blue');
									}else $("#rollcall_step1").text('請選擇點名節次').css('color','red');
								}else{
									showMessagePopup('連線失敗(2)').css('color','red');
								}
							}else{
								showMessagePopup('連線失敗(1)').css('color','red');
							}
						},
						error: function(e){
							showMessagePopup('連線失敗').css('color','red');
						}
						,complete: function(){
							$.currentReadCard = null;
							$.listenerCardClose = true;
							_this.setNotice();
						}
					});
				}else{
					$("#rollcall_seats").html('');
				}
			});
		});
	},

    computed: {
		paiInfo: function() {
			return $.ecampus.setting.info;
		}
    },
});