/**
 * baseic calendar
 *
**/

$.ns('UI.Canlendar');

var tmpl = {
	
	frame : '<div class="calendar-skin-wrapper">' +
				'<%=head%>' + '<%=body%>' +
			'</div>',
	
	head :  '<div class="calendar-head clearfix">' +
				'<span class="left-btn">&lt;</span>' +
				'<div class="year-month">' +
					'<span class="year"><%=year%></span>' +
					'<span>年</span>' +
					'<span class="month"><%=month%></span>' +
					'<span>月</span>' +
				'</div>' +
				'<span class="right-btn">&gt;</span>' +
			'</div>',
			
	body :  '<table class="calendar-body">' +
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
									 '<td class="not-currentmonth-day"><%=days[i].day%></td>' +
							  '<%	}else{ %>' +
									 '<td><%=days[i].day%></td>' +
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
			
			
		},options || {});
		
		this._init();
		
	};
	
	$.extend(Canlendar.prototype,{
		
		_init : function(){
			
			$(this._createTmpl()).appendTo('body');
		},
		
		_createBody : function(days){
			
			return $.MT('body',tmpl['body'],{
				days : days
			});
		},
		
		_createTmpl : function(){
			
			var head = $.MT('head',tmpl['head'],{
				year : 2013,
				month : 5
			});
			
			var days = [];
			for(var i = 28;i <= 30;i++){
				var singleDay = {
					year : 2013,
					month : 5,
					day : i,
					notCurrentMonDay : true
				};
				
				days.push(singleDay);
			}
			
			for(var i = 1;i <= 31;i++){
				var singleDay = {
					year : 2013,
					month : 5,
					day : i
				};
				
				days.push(singleDay);
			}
			
			days.push({year:2013,month:5,day:1,notCurrentMonDay : true});
			
			var body = this._createBody(days);
			
			var html = $.MT('frame',tmpl['frame'],{
				head : head ,
				body : body
			});
			
			return html;
			
		}
		
	});
	
	UI.Canlendar = function(options){
		return new Canlendar(options);
	};
	
})(jQuery,window);

$(function(){
	UI.Canlendar();
});






