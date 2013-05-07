/**
 * baseic calendar
 *
**/

$.ns('UI.Canlendar');

var tmpl = {
	
	frame : '<div id="<%=root%>" class="calendar-skin-wrapper">' +
				'<%=head%>' +
				 '<div id="<%=root%>-body">' +
					'<%=body%>' +
				'</div>' +
			'</div>',
	
	head :  '<div class="calendar-head clearfix">' +
				'<span id="<%=root%>-preMon" class="left-btn">&lt;</span>' +
				'<div class="year-month">' +
					'<span id="<%=root%>-year" class="year"><%=year%></span>' +
					'<span>年</span>' +
					'<span id="<%=root%>-month" class="month"><%=month%></span>' +
					'<span>月</span>' +
				'</div>' +
				'<span id="<%=root%>-nextMon" class="right-btn">&gt;</span>' +
			'</div>',
			
	 
	body :	'<table class="calendar-body">' +
					 '<tbody>' +
						  '<tr class="weekmark">' +
							 '<td>日</td>' +
							 '<td>一</td>' +
							 '<td>二</td>' +
							 '<td>三</td>' +
							 '<td>四</td>' +
							 '<td>五</td>' +
							 '<td>六</td>' +               
						 '</tr>' +
						 '<% var count = 0; %> ' +
						  '<% for(var i = 0;i < days.length ;i++){ %>' +  //days : [{year:2013,month:5,day:1,notCurrentMonDay : true}]
							  '<%	if(count % 7 == 0){ %>' +
									 '<tr>' +
							  '<%	} %>' +
							  '<%	if(days[i].notCurrentMonDay){ %>' +
									 '<td year="<%=days[i].year%>" month="<%=days[i].month%>" day="<%=days[i].day%>" class="day not-currentmonth-day"><%=days[i].day%></td>' +
							  '<%	}else{ %>' +
									 '<td year="<%=days[i].year%>" month="<%=days[i].month%>" day="<%=days[i].day%>" class="day"><%=days[i].day%></td>' +
							  '<%  } %>' +
							  '<%	count++; %>' +
							  '<%	if(count % 7 == 0){ %>' +
									 '</tr>' +
							  '<%	} %>' +
						  '<% } %>' +
					'</tbody>'+
			 '</table>'
			
};

(function($,window){
	
	var Canlendar = function(options){
		
		$.extend(this,{
			
			root : 'calendar-' + $.rand()
			
		},options || {});
		
		//当前日历状态
		this.current = this._getCurrent();
		
		this._init();
		
	};
	
	$.extend(Canlendar.prototype,{
		
		_init : function(){
			
			$(this._createTmpl()).appendTo('body');
			this._addEvent();
		},
		
		_addEvent : function(){
			
			var root = this.root,
				that = this,
				current = this._getCalendarCurrent();
				
			//上个月和下个月按钮
			$('#' + root + '-preMon').bind('click',function(e){
				var preAndNext = that._getPreAndNext(current.year,current.month);
				that._goTo(preAndNext.preYear,preAndNext.preMonth);
			});
			
			$('#' + root + '-nextMon').bind('click',function(e){
				var preAndNext = that._getPreAndNext(current.year,current.month);
				that._goTo(preAndNext.nextYear,preAndNext.nextMonth);
			});
			
			//选取某天
			$('#' + root + '-body').delegate('.day','click',function(e){
				console.log(that._getDate($(this)));
			});
			
		},
		
		//根据给定的当前年月返回上个月和下个月
		_getPreAndNext : function(year,month){
			return {
				"preYear" :  month - 1 == 0 ? year - 1 : year,
				"preMonth" : month - 1 == 0 ? 12 : month - 1,
				"nextYear" :  month + 1 > 12 ? year + 1 : year,
				"nextMonth" : month + 1 > 12 ? 1 : month + 1
			}
		},
		
		_createHead : function(year,month){
			
			return $.MT('head',tmpl['head'],{
				root : this.root,
				year : year,
				month : month
			});
		},
		
		_createBody : function(days){
			
			return $.MT('body',tmpl['body'],{
				days : days
			});
		},
		
		//与本地时间一致
		_getCurrent : function(){
			
			var date = new Date();
			return {
				year : date.getFullYear(),
				month : date.getMonth() + 1,
				day : date.getDate()
			};
		},
		
		//与当前日历一致
		_getCalendarCurrent : function(){
			return this.current;
		},
		
		_getMonthInfo : function(year,month){
			
			var current = this._getCurrent();
			if(typeof year === 'undefined' || typeof month === 'undefined'){
				year = current.year;
				month = current.month;
				day = current.day;
			}
			
			var date = new Date(year,month,0);
			date.setDate(1);	
			return {
				year :year,
				month : month,
				day : day,
				firstWeekday : date.getDay(), //此月第一天是星期几，0-6为对应 ，0是星期日
				totalDay : new Date(year,month,0).getDate() //此月一共有多少天
			};
		},
		
		/* 根据某年某月计算出该月的数据信息，pre和next分别包含当月补齐的相邻月份的日期
			{
				current : {
							year : 2013,
							month : 5 , 
							days : [{day : 1}},{……}]
						},
				
				pre : {
							year : 2013,
							month : 4 , 
							days : [{day : 1}},{……}]
					},
				
				next : {
							year : 2013,
							month : 6 , 
							days : [{day : 1}},{……}]
					}
			}
		*/
		_getData : function(year,month){
			
			var monthInfo = this._getMonthInfo(year,month);
			//当前月数据
			var current  = {},currentDays = [];
			current.year = monthInfo.year;
			current.month = monthInfo.month;
			for(var i = 1;i <= monthInfo.totalDay;i++){
				var day = {
					"year" : current.year,
					"month" : current.month,
					"day" : i
				};
				currentDays.push(day);
			}
			current.days = currentDays;
			//本月显示的上个月数据
			var pre  = {},preDays = [],
				preDaysCount = monthInfo.firstWeekday;//需要显示的上个月的天数
			pre.year = monthInfo.month - 1 == 0 ? monthInfo.year - 1 : monthInfo.year;
			pre.month = monthInfo.month - 1 == 0 ? 12 : monthInfo.month - 1;
			var lastDayOfPreMon =  new Date(pre.year,pre.month,0).getDate();
			
			for(var d = lastDayOfPreMon - preDaysCount + 1;d <= lastDayOfPreMon;d++){
				var day = {
					"year" : pre.year,
					"month" : pre.month,
					"day" : d,
					"notCurrentMonDay" : true
				};
				preDays.push(day);
			}
			pre.days = preDays;
			//本月显示的下个月数据
			var next  = {},nextDays = [];
			next.year = monthInfo.month + 1 > 12 ? monthInfo.year + 1 : monthInfo.year;
			next.month = monthInfo.month + 1 > 12 ? 1 : monthInfo.month + 1;
			var date = new Date(next.year,next.month,0);
			date.setDate(1);	
			var nextDaysCount = 7 - date.getDay();//需要显示的下个月的天数
	
			for(var d = 1;d <= nextDaysCount;d++){
				var day = {
					"year" : next.year,
					"month" : next.month,
					"day" : d,
					"notCurrentMonDay" : true
				};
				nextDays.push(day);
			}
			next.days = nextDays;
			
			return {
				current : current,
				pre : pre,
				next : next
			};
			
		},
		
		//将一个单位的月转换成双位的，如将3转换为03
		_transToDouble : function(s){
			
			s = s.toString();
			if(s.length == 1){
				return '0' + s;
			}
			else{
				return s.toString();
			}
			
		},
		
		//返回渲染日历所需要的数据,days : [{year:2013,month:5,day:1,notCurrentMonDay : true}]
		_getRenderData : function(year,month){
			var data = this._getData(year,month);
			return data.pre.days.concat(data.current.days).concat(data.next.days);
		},
		
		_createTmpl : function(){
			
			var days = this._getRenderData(),
				current = this._getCurrent();
		
			var html = $.MT('frame',tmpl['frame'],{
				root : this.root,
				head : this._createHead(current.year,current.month),
				body : this._createBody(days)
			});
			
			return html;
			
		},
		
		
		_goTo : function(year,month){
		
			var current = this._getCurrent();
			if(typeof year === 'undefined' || typeof month === 'undefined'){
				year = current.year;
				month = current.month;
			}
			
			var days = this._getRenderData(year,month),
				root = this.root;
			$('#' + root + '-year').html(year);
			$('#' + root + '-month').html(month);
			$('#' + root + '-body').html(this._createBody(days));
			
			this.current.year = year;
			this.current.month = month;
			
		},
		
		/*
		 *	获取当前选中的日期
		 *	day : jq的包装对象
		 *  style : 返回的日期格式，默认为2013-05-07,'yyyy-mm-dd'
		 */
		_getDate : function(day,style){
		
			var year = day.attr('year'),
				month = day.attr('month'),
				day = day.attr('day');
				
			if(typeof style === 'undefined' || /^yyyy-mm-dd$/.test(style)){
				return year + '-' + this._transToDouble(month) + '-' + this._transToDouble(day);
			}
		},
		
		//选中某天
		_selectDay : function(day){
			day.addClass('selected');
		}
		
	});
	
	UI.Canlendar = function(options){
		return new Canlendar(options);
	};
	
})(jQuery,window);

$(function(){
	UI.Canlendar();
});






