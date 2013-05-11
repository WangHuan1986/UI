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
					'<%=yearlist%>' +
					'<%=monthlist%>' +
				'</div>' +
				'<span id="<%=root%>-nextMon" class="right-btn">&gt;</span>' +
			'</div>',
			
	yearlist :	'<ul id="<%=root%>-yearlist" class="yearlist">' +
					'<% for(var i = startyear;i <= endyear;i++){ %>' +
						'<li><a href="#"><%=i%></a></li>' +
					'<% } %>' +
				'</ul>',
				
	monthlist :	'<ul id="<%=root%>-monthlist" class="monthlist">' +
					'<% for(var i = startmonth;i <= endmonth;i++){ %>' +
						'<li><a href="#"><%=i%></a></li>' +
					'<% } %>' +
				'</ul>',		
	
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
									'<td id="<%=days[i].id%>" year="<%=days[i].year%>" month="<%=days[i].month%>" day="<%=days[i].day%>" '+ 
										'class="day'+
											'<%if(days[i].ifToday){%> today<%}%>'+
											'<%if(days[i].notCurrentMonDay){%> not-currentmonth-day<%}%>'+
											'<%if(!days[i].ifValid){%> invalid<%}%>'+
										'"><%=days[i].day%>' + 
									'</td>' +
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
			root : 'calendar-' + $.rand(),
			id : '', //日历对应的文本框的id
			renderTo : 'body', //默认渲染到的容器
			startyear : 1940, //能够选择的开始年份
			endyear : 2100,
			from : null, //20130509，标识此天之前的日期不能被选中，如果写入“today”，则标识当前日期(包括)可以被选中
			to : null,
			relativeFrom : null, //指定一个文本输入框的id，此文本输入框的日期将作为起始日期。此功能用于两个日历组件配合选取一个时间段
			relativeTo : null 
		},options || {});
		
		//当前日历状态
		var current = this.current = this._getCurrent();
		//当前被选中的天
		this.selectedDayId = null; //2013-05-08
		
		if(this.id != ''){
			this._initInput();
		}
		else{
			this._init();
			this._goTo(current.year,current.month,current.day);
		}
		
	};
	
	$.extend(Canlendar.prototype,{
		
		_isDate : function(str){
			return /^(\d{4})-?(\d{1,2})-?(\d{1,2})$/.test(str);
		},
		
		//验证一个字符串并试图将其转换为20130505这样的格式，如果不能转换则按当天日期进行计算
		_regulateDate : function(str,transToString){
			var ret = null;
			if(this._isDate(str)){
				var match = str.match(/^(\d{4})-?(\d{1,2})-?(\d{1,2})$/);
				ret = {
					year : parseInt(match[1]),
					month : parseInt(this._transToSingle(match[2])),
					day : parseInt(this._transToSingle(match[3]))
				};
				if(transToString){
					return ret.year + this._transToDouble(ret.month) + this._transToDouble(ret.day);
				}
				else{
					return ret;
				}
			}
			else{
				return ret;
			}
		},
		
		_initInput : function(){
			
			var that = this;
			
			var input = $('#' + this.id);
			input.bind('focus',function(e){
				if(!input.data('hasCalendar')){
					var val = $.trim(input.val());
					//以当前输入框中的值渲染日历
					that._init();
					if(that.relativeFrom !== null){
						that._setFrom($('#' + that.relativeFrom).val());
					}
					if(that.relativeTo !== null){
						that._setTo($('#' + that.relativeTo).val());
					}
					var date = that._regulateDate(val);
					if(date === null){
						var current = that._getCurrent();
						that._goTo(current.year,current.month,current.day);
					}
					else{
						that._goTo(date.year,date.month,date.day);
					}
					input.data('hasCalendar',true);
					//获取输入框位置，并定位日历
					var position = input.offset();
					$('#' + that.root).css({
						position : 'absolute',
						left : position.left,
						top : position.top + input.outerHeight()
					});
				}
			})
			.bind('click',function(e){
				e.stopPropagation();
			});
			
			$(document).bind('click',function(r){
				that.destroy();
				input.removeData('hasCalendar');
			});
		},
		
		_init : function(){
			
			$(this._createTmpl()).appendTo(this.renderTo);
			this._addEvent();
		},
		
		destroy : function(){
			$('#' + this.root).remove();
		},
		
		_addEvent : function(){
			
			var root = this.root,
				that = this,
				current = this._getCalendarCurrent();
			
			//阻止日历中的click事件冒泡
			$('#' + root).bind('click',function(e){
				e.stopPropagation();
			});
			
			//上个月和下个月按钮
			$('#' + root + '-preMon').bind('click',function(e){
				var preAndNext = that._getPreAndNext(current.year,current.month);
				that._goTo(preAndNext.preYear,preAndNext.preMonth);
				that._selectDay(that.selectedDayId);
			});
			
			$('#' + root + '-nextMon').bind('click',function(e){
				var preAndNext = that._getPreAndNext(current.year,current.month);
				that._goTo(preAndNext.nextYear,preAndNext.nextMonth);
				that._selectDay(that.selectedDayId);
			});
			
			//点击年份或月份，弹出下拉框
			var yearlist = $('#' + root + '-yearlist'),
				monthlist = $('#' + root + '-monthlist');
			$('#' + root + '-year').bind('click',function(e){
	
				if(yearlist.is(':hidden')){
					monthlist.hide();
					yearlist.show();
				}
				else{
					that._hideYearList();
				}
				
				e.stopPropagation();
			});
			
			$('#' + root + '-month').bind('click',function(e){
	
				if(monthlist.is(':hidden')){
					yearlist.hide();
					monthlist.show();
				}
				else{
					that._hideMonthList();
				}
				
				e.stopPropagation();
			});
			
			$(document).bind('click',function(){
				yearlist.hide();
				monthlist.hide();
			});
			
			//点选下拉框中的年份或是月份
			yearlist.delegate('li a','click',function(e){
				var link = $(this),
					current = that._getCalendarCurrent();
				that._goTo(parseInt(link.html()),current.month);
				yearlist.hide();
				e.preventDefault();
			});
			
			monthlist.delegate('li a','click',function(e){
				var link = $(this),
					current = that._getCalendarCurrent();
				that._goTo(current.year,parseInt(link.html()));
				monthlist.hide();
				e.preventDefault();
			});
			
			//选取某天
			$('#' + root + '-body').delegate('.day','click',function(e){
				var day = $(this),	
					valid = !day.hasClass('invalid');
					
				if(valid){
					that._selectDay(day);
				}
				//如果绑定到了一个文本框
				if(that.id !== '' && valid){
					$('#' + that.id).val(that._getDate(day));
					that.destroy();
				}
			})
			//鼠标浮动到日期上边框变色
			.delegate('.day','mouseenter',function(e){
				$(this).addClass('hover');
			})
			.delegate('.day','mouseleave',function(e){
				$(this).removeClass('hover');
			});
			
			
		},
		
		_hideYearList : function(){
			$('#' + this.root + '-yearlist').hide();
		},
		
		_hideMonthList : function(){
			$('#' + this.root + '-monthlist').hide();
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
		
		_createYearList : function(start,end){
			return $.MT('yearlist',tmpl['yearlist'],{
				root : this.root,
				startyear : this.startyear,
				endyear : this.endyear
			});
		},
		
		_createMonthList : function(){
			return $.MT('monthlist',tmpl['monthlist'],{
				root : this.root,
				startmonth : 1,
				endmonth : 12
			});
		},
		
		_createHead : function(year,month){
			
			return $.MT('head',tmpl['head'],{
				root : this.root,
				year : year,
				month : month,
				yearlist : this._createYearList(),
				monthlist : this._createMonthList()
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
		
		_getMonthInfo : function(year,month,day){
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
		
		//返回20130506
		_getCurrentStr : function(){
			var current = this._getCurrent();
			return current.year + '' + this._transToDouble(current.month) + '' + this._transToDouble(current.day);
		},
		
		//设置日历的起始日期
		_setFrom : function(from){
			this.from = this._regulateDate(from,true);
		},
		
		//设置日历的结束日期
		_setTo : function(to){
			this.to = this._regulateDate(to,true);
		},
		
		/*
		 *	根据给定的day(20130506)用合法的时间范围(from to)，判断此天是否有效
		 */
		_ifValid : function(id){
			var from = this.from,
				to = this.to;
			if(from === null && to === null) return true;
			var today = this._getCurrentStr();
			if(from == null){
				from = 0;
			}
			if(to == null){
				to = 9999999999;
			}
			if(from == 'today'){
				from = today;
			}
			if(to == 'today'){
				to = today;
			}
			if(parseInt(id) >= parseInt(from) && parseInt(id) <= parseInt(to)){
				return true
			}
			else{
				return false;
			}
		},
		
		/* 
		 * 根据某年某月计算出该月的数据信息，pre和next分别包含当月补齐的相邻月份的日期,current为当月数据
		*/
		_getData : function(year,month){
		
			var root = this.root;
			var monthInfo = this._getMonthInfo(year,month),
				currentMonth = this._getCurrent(),
				today = currentMonth.year + '' + currentMonth.month +  currentMonth.day;
			//当前月数据
			var current  = {},currentDays = [];
			current.year = monthInfo.year;
			current.month = monthInfo.month;
			for(var i = 1;i <= monthInfo.totalDay;i++){
				//判断是否是今天
				var ifToday = today === current.year + '' + current.month + '' + i ? true : false;
				//判断此日期是否有效
				var ifValid = true,
					id = parseInt(current.year + '' + this._transToDouble(current.month) + this._transToDouble(i));
				var day = {
					"id" : id + '-' + root,
					"year" : current.year,
					"month" : current.month,
					"day" : i,
					"ifToday" : ifToday,
					"ifValid" : this._ifValid(id)
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
				//判断此日期是否有效
				var ifValid = true,
					id = parseInt(pre.year + '' + this._transToDouble(pre.month) + this._transToDouble(d));
				var day = {
					"id" : id + '-' + root,
					"year" : pre.year,
					"month" : pre.month,
					"day" : d,
					"notCurrentMonDay" : true,
					"ifValid" : this._ifValid(id)
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
				//判断此日期是否有效
				var ifValid = true,
					id = parseInt(next.year + '' + this._transToDouble(next.month) + this._transToDouble(d));
				var day = {
					"id" : id + '-' + root,
					"year" : next.year,
					"month" : next.month,
					"day" : d,
					"notCurrentMonDay" : true,
					"ifValid" : this._ifValid(id)
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
		
		//将一个双的转换成单的，如将03转换为3
		_transToSingle : function(s){
			
			s = s.toString();
			if(s.length == 2 && s.search(/0/) == 0){
				return s.substring(1);
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
			
			var current = this._getCurrent();
		
			var html = $.MT('frame',tmpl['frame'],{
				root : this.root,
				head : this._createHead(current.year,current.month),
				body : ''
			});
			
			return html;
			
		},
		
		
		_goTo : function(year,month,day){
		
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
			
			if(typeof day !== 'undefined'){
				var day = $('#' + year + this._transToDouble(month) + this._transToDouble(day) + '-' + root);
				this._selectDay(day);
			}
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
		
		/*
		 * 选中某天
		 * day可以是jq对象，也可以某天的id
		 */
		_selectDay : function(day){
	
			if(typeof day ===  'string'){
				day = $('#' + day);
			}
			var selectedDayId = this.selectedDayId;
			if(selectedDayId !== null){
				$('#' + selectedDayId).removeClass('selected');
			}
			if(day && day.size() > 0){
				day.addClass('selected');
				this.selectedDayId = day.attr('id');
			}
			
		}
		
	});
	
	UI.Canlendar = function(options){
		return new Canlendar(options);
	};
	
})(jQuery,window);

$(function(){
	
	var from = UI.Canlendar({
		id : 'from',
		relativeTo : 'to'
	});
	
	var to = UI.Canlendar({
		id : 'to',
		relativeFrom : 'from'
	});
});






