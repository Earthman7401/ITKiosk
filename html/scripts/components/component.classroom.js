// MainPage
Vue.component('component-classroom-main', {
    props: ['model'],
    template: '#template-classroom-main',

    methods: {
        // Btn Click
        handleMouseDown: function (nextId) {
            kiosk.API.goToNext(nextId);
        },
        goHome: function () {
			kiosk.API.goToNext('mainMenu');
        },
		myResRec: function() {
			if($.initReaderSuccess){
				showMessagePopup('請靠卡查詢紀錄...',0,{b:'rgb(227,123,12)',c:'white',w:'380px',h:'80px'});
				$.currentReadCard = 'queryReserve';

				$.ecampus.messagePopup1 = setInterval(function(){
					var s = new Date().getSeconds()%3;
					var t = $(".messagePopup").text().substring(0,7)+'...';
					$(".messagePopup").text(t.substring(0,s+8));
				},1000);

				$.ecampus.messagePopup2 = setTimeout(function(){
					clearMessagePopup();
				},10000);
			}else this.remindNoDevice();
		},
		confirmRes: function() {
			if($.initReaderSuccess){
				var seat = $("#classroom_seats").find(".thisismine");

				if($("#rooms").val() == ''){
					showFormErrorAutoMsg('請選擇教室');
				}else if($("#dt1").val().length != 8 || $("#dt2").val().length != 8){
					showFormErrorAutoMsg('請輸入預約日期');
				}else if(seat.length != 1 || !seat.hasClass('seat')){
					showFormErrorAutoMsg('請選擇要預約的座位');
				}else{
					showMessagePopup('請靠卡確認預約...',10000,{b:'rgb(211,26,26)',c:'white',w:'380px',h:'80px'});
					$.currentReadCard = 'applyReserve';

					$.ecampus.messagePopup1 = setInterval(function(){
						var s = new Date().getSeconds()%3;
						var t = $(".messagePopup").text().substring(0,7)+'...';
						$(".messagePopup").text(t.substring(0,s+8));
					},1000);

					$.ecampus.messagePopup2 = setTimeout(function(){
						clearMessagePopup();
					},10000);
				}
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
		callRoomSet: function (area,dt) {
			$("#classroom_seats").html('');
			$(".classroomcsss").remove();

			var s = $.ecampus.setting;
			var guid = (s.library.length > 23 && s.library.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
			!window.external||!window.external.System||(guid=window.external.System.GetKioskId);

			$.ajax({
				url: s.library+"/roomSet",
				type: "POST",
				//async :	false,
				contentType: "application/json;charset=utf-8",
				dataType: "json",
				data: JSON.stringify({client:s.client,kiosk:guid,areaId:area,resDt:dt}),
				success: function(json,status,xhr){
					if(json){
						var w = parseInt(json.w,10);
						var h = parseInt(json.h,10);
						var set = json.set;
						var res = json.res;

						if(!isNaN(w) && !isNaN(h) && set && set.length){
							var sz = parseInt($("#classroom_seats").width()/w<$("#classroom_seats_tb").height()/h?($("#classroom_seats").width()/w):($("#classroom_seats_tb").height()/h),10);

							if(sz < 30) sz = 30;
							if(sz > 70) sz = 70;

							var xy = {};
							if(set && set.length){
								for(var i=0;i<set.length;i++){
									var o = set[i];
									if(o[2] == 'seat' || o[2] == 'obstacle')
										xy['x'+o[0]+'y'+o[1]] = {o:o[2],s:o[3]};
								}
							}

							var rxy = {};
							if(res && res.length){
								for(var i=0;i<res.length;i++){
									var o = res[i];
									rxy['x'+o[0]+'y'+o[1]] = '1';
								}
							}

							var html = '<style class="classroomcsss">'
								//+'#classroom_seats div.box{float: left;width: '+sz+'px;height: '+sz+'px;border: 1px solid #ccc;}'
								+'#classroom_seats div.box{float: left;width: '+sz+'px;height: '+sz+'px;color: white;}'
								+'#classroom_seats div.seat{width: '+(sz-4)+'px;height: '+(sz-4)+'px;margin: 1px;border-radius: 50%;background-color: #ccc;}'
								+'#classroom_seats div.serial{text-align: center;font-size: '+(sz/21)+'rem;line-height: '+(sz-4)+'px;}'
								+'#classroom_seats div.reserved{background: rgb(237,114,106);}'
								+'#classroom_seats div.thisismine{background: rgb(200,100,200);}'
								+'</style>';
							$(html).appendTo('head');

							html = '';//<div>&nbsp;</div>';
							for(var i=0;i<h;i++){
								html += '<div style="width: '+(w*sz)+'px;overflow: hidden;margin: 0 auto;">';
								for(var j=0;j<w;j++){
									var cs = 'box';

									var s = xy['x'+j+'y'+i];
									var t = '';

									if(s){
										t = '<div class="';
										var ser = '';

										t += s.o;
										if(s.o == 'seat' && s.s != null){
											t += ' serial';
											ser = $.trim(s.s);
										}
										if(('x'+j+'y'+i) in rxy)
											t += ' reserved';

										t += '">'+ser+'</div>';
									}

									html += '<div class="'+cs+'" x="'+j+'" y="'+i+'">'+t+'</div>';
							
								}
								html += '</div>';
							}

							var maxWidth = $("#classroom_seats_tb").width();
							var maxHeight = $("#classroom_seats_tb").height();

							$("#classroom_seats").css({'height':''+maxHeight+'px','width':''+maxWidth+'px'}).html(html).find(".seat").click(function(e){
								/*
								if($(this).hasClass('reserved')){
									var o = $(this).parent();
									var x = positionX(o[0]);
									var y = positionY(o[0]);
									var name = o.attr("x")+'_'+o.attr("y");
									if(x && y && $("div.a0346s_"+name).length == 0){
										var div = $('<div class="a0346s_'+name+'" style="position: absolute;border-radius: 4px;padding: 2px 6px 4px;border: 1px solid rgb(227,123,12);display: none;z-index: 5;text-align: center;font-size: '+(sz/30)+'rem;font-weight: bold;">有人了</div>').appendTo('body');
										div.css({left:(x-((div.width()+12-(sz-4))/2)),top:y,'background-color':'white',color:'rgb(227,123,12)'}).show()
											.animate({opacity:0,top:y-30},{queue:true,duration:1000,complete:function(){$(this).remove();}})
									}
								}else{
								*/
									$("#classroom_seats").find("div.thisismine").removeClass('thisismine');
									$(this).addClass('thisismine');
								//}
							});
						}
					}
				},
				error: function(){
					showFormErrorAutoMsg('連線失敗');
				},
				complete: function(){
				}
			});
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
			var _this = this;
			$.currentReadCard = null;
			//var ht = document.body.clientHeight;
			var ht = window.screen.height;
			$("#classroom-div-block").css("height",''+ht+'px');
			$("#schoolLogo").css("height",''+(ht*0.074074)+'px').attr("src",$.ecampus.setting.info.logo);
			$('.calendar').datepicker({format: "yyyymmdd",language: 'zh-TW'});

			$.support.cors = true;
			$.listenerCardClose = true;

			var s = $.ecampus.setting;
			var guid = (s.library != null && s.library.length > 23 && s.library.substring(0,19) == 'http://192.168.168.')?'88888888888888888888888888888888':'';
			!window.external||!window.external.System||(guid=window.external.System.GetKioskId);

			$.ajax({
				url: s.library+"/listroom",
				type: "POST",
				//async :	false,
				contentType: "application/json;charset=utf-8",
				dataType: "json",
				data: '{"client":"'+s.client+'","kiosk":"'+guid+'"}',
				success: function(json,status,xhr){
					if(json){
						if(json.error){
							showMessagePopup(json.error);
						}else{
							var dt = json.dt;
							var r = json.room;

							$("#roomSetDt").html('<div style="font-size: 2rem;padding-bottom: 5px;border-bottom: 1px solid rgb(88,169,183);">'+dt.substring(0,4)+'</div><div style="font-size: 2.5rem;">'+dt.substring(4,6)+'.'+dt.substring(6,8)+'</div>');
							$("#dt1, #dt2").val(json.tom||dt);

							if(r && r.length){
								var html = '';
								for(var i=0;i<r.length;i++)
									html += '<option value="'+r[i].id+'">'+r[i].name+'&nbsp;'+r[i].area+'</option>';
								$("#rooms").html(html).change();
							}
						}
					}
				},
				error: function(){
					$(".formErrorAutoMsg").remove();
					var err = $('<div class="formErrorAutoMsg">連線失敗</div>').appendTo('body');
					setTimeout(function(){
						err.remove();
					},3333);
				},
				complete: function(){
				}
			});

			$("#rooms").change(function(){
				var v = $.trim($(this).val());
				var dt = $.trim($("#dt1").val());

				if(v != ''){
					_this.callRoomSet(v,dt.length==8?dt:'');
				}else{
					$("#classroom_seats").html('');
				}
			})

			$("#dt1").change(function(){
				var area = $.trim($("#rooms").val());
				var v = $.trim($(this).val());

				if(area != '' && v.length == 8)
					_this.callRoomSet(area,v);
			})
		});
	},

    computed: {
		paiInfo: function() {
			return $.ecampus.setting.info;
		}
    },
});