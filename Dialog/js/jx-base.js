var jQ = $;

$.ns = function (packageName) {
    var packages = packageName.split('.');
    for (var i = 0, l = packages.length, path = ''; i < l; i++) {
        path += (i > 0 ? '.' : '') + packages[i];
        eval('if(typeof ' + path + ' == "undefined") window.' + path + ' = {}');
    }
};

$.ns('JX');

JX.ROOT = {
	DOMAIN : 'http://www.jiexi.com/',
	DOMAIN_V2 : 'http://www.jiexi.com',
	STATIC : 'http://jximg.com/',
	IMG_UPLOAD_DOMAIN : 'http://upload.renren.com/',
	UPLOAD_IMG_SERVER : 'http://fmn.rrimg.com/'
};

try {
document.domain = 'jiexi.com';
}
catch(e) {}

//获取字符串长度，一个汉字长度为2
$.widthCheck = function (s){ 
	 
	var w = 0,
		chineseReg = /[^\x00-\xFF]/;
	 
	for (var i=0; i<s.length; i++) { 
		var c = s.charAt(i); 
		if (chineseReg.test(c)) {
			w+=2; 
		}
		else{ 
			w++;
		} 
	} 

	return w;
	 
};

$.password = function(id){
	$('#'+id).bind('keydown', function(e) {
		if (e.keyCode == 32) {
			return false;
		}
	});
}

$.rand = function (){
	return parseInt(Math.random() * 1000000, 10);
};


$.eval = function(s){
	return eval('(' + s + ')');
};

$.cutString = function (string, max) {
    if (string == undefined) {
        return '';
    }
    var omet = '...';
    if (string.split('').length > max) {
        return string.substring(0, max) + omet;
    }
    return string;
};

$_REQUEST = function (method, url, data, cb, type) {
	$XHR = $.ajax({
		url: url,
		type: method,
		data: data,
		cache:false,
		success: function (d) {
			if(!$.ifLogon(d)){
				location.href = 'http://www.jiexi.com/user/login';
			}
			
			if (type == 'json') {
				var json = eval('(' + d + ')');
				json.err = 0;
				cb(json);
			} 
			else{
			
				cb(d);
			}
		},
		error: function (d){
			cb({
				err: 1,
				status: d.msg
			});
		}
	});
	
	return $XHR;
};

$.GET = function (url, data, cb, type){
   return $_REQUEST('GET', url, data, cb, type);
};

$.POST = function (url, data, cb, type){
   return  $_REQUEST('POST', url, data, cb, type);
};

//用于判断ajax请求时，用户是否处于登陆态
$.ifLogon = function(r){

	if(r.indexOf('reg_login') > -1 || r.indexOf('请登录') > -1){
		return false;
	}
	else{
		return true;
	}
};



//ipad下
JX.uaApple = (function(){return (/\((iPhone|iPad|iPod)/i).test(navigator.userAgent);})();
//IE6下
JX.IE6 = !!($.browser.msie && ($.browser.version == "6.0"));
//平板下的鼠标事件
JX.EVENTS = {
     OVER:(function(){return JX.uaApple?'touchstart':'mouseover';})(),
	 OUT:(function(){return JX.uaApple?'touchend':'mouseout';})(),
	 DOWN:(function(){return JX.uaApple?'touchstart':'mousedown';})(),
	 UP:(function(){return JX.uaApple?'touchend':'mouseup';})(),
	 MOVE:(function(){return JX.uaApple?'touchmove':'mousemove';})()
};
JX.overwrite = {
	rnamespaces:/\.(.*)$/,
	liveMap:{
	  focus: "focusin",
	  blur: "focusout",
	  mouseenter: "mouseover",
	  mouseleave: "mouseout"
     },
     liveConvert:function( type, selector ) {
 	          return "live." + (type && type !== "*" ? type + "." : "") + selector.replace(/\./g, "`").replace(/ /g, "&");
     },
	 getEvent:function(type) {
	    var arr = ['mouseover','mouseout','mousedown','mouseup','mousemove'];
		var index = $.inArray(type,arr);
		if(index!=-1) {
		   type = JX.EVENTS[arr[index].replace('mouse','').toUpperCase()];
		}
		return type;
	 }
};

//覆写jquery的bind,one方法
jQuery.each(["bind", "one"], function( i, name ) {
	jQuery.fn[ name ] = function( type, data, fn ) {
		if(typeof type === 'string') {
			type = JX.overwrite.getEvent(type);
		}
		if ( typeof type === "object" ) {
			for ( var key in type ) {
				this[ name ](key, data, type[key], fn);
			}
			return this;
		}
		
		if ( jQuery.isFunction( data ) ) {
			fn = data;
			data = undefined;
		}

		var handler = name === "one" ? jQuery.proxy( fn, function( event ) {
			jQuery( this ).unbind( event, handler );
			return fn.apply( this, arguments );
		}) : fn;

		if ( type === "unload" && name !== "one" ) {
			this.one( type, data, fn );

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.add( this[i], type, handler, data );
			}
		}
		return this;
	};
});

//覆写jquery的鼠标事件
jQuery.each( ("mousedown mouseup mousemove mouseover mouseout").split(" "), function( i, name ) {
	name = JX.overwrite.getEvent(name);
	jQuery.fn[ name ] = function( fn ) {
		return fn ? this.bind( name, fn ) : this.trigger( name );
	};
	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}
});
//覆写jquery的其他事件
/*
jQuery.fn.extend({
	unbind: function( type, fn ) {
		if(typeof type==='string') {
		   type = JX.overwrite.getEvent(type);
		}
		if ( typeof type === "object" && !type.preventDefault ) {
			for ( var key in type ) {
				this.unbind(key, type[key]);
			}

		} else {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				jQuery.event.remove( this[i], type, fn );
			}
		}

		return this;
	},
	delegate: function( selector, types, data, fn ) {
		if(typeof types === 'string') {
			types = JX.overwrite.getEvent(types);
		}
		console.log(types);
		return this.live( types, data, fn, selector );
	},
	undelegate: function( selector, types, fn ) {
		if ( arguments.length === 0 ) {
				return this.unbind( "live" );
		} else {
			return this.die( types, null, fn, selector );
		}
	},
	trigger: function( type, data ) {
		if(typeof type==='string') {
		   type = JX.overwrite.getEvent(type);
		}		
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if(typeof type==='string') {
		   type = JX.overwrite.getEvent(type);
		}		
		if ( this[0] ) {
			var event = jQuery.Event( type );
			event.preventDefault();
			event.stopPropagation();
			jQuery.event.trigger( event, data, this[0] );
			return event.result;
		}
	}
});
*/





//关于IE6下背景图hover的解决
if(JX.IE6) {
    try{
        document.execCommand("BackgroundImageCache", false, true);
       }
	catch(e){}
}
//工具方法
JX.utils = {
	//获取路径参数值
	getUrlParams:function() {
      var arr = arguments;
	  var value = {};
	  var url = location.search;
	  if(url.indexOf('?')!=-1) {
	   var str = url.substr(1);
	   if(str.indexOf('&')!=-1) {
	     var v = str.split('&');
	     for(var i=0;i<arr.length;i++) {
		     for(var j=0;j<v.length;j++) {
			    if(arr[i]==v[j].split('=')[0]) value[arr[i]] = v[j].split('=')[1];
			 }
		 }
	   }
	   else value[str.split('=')[0]] = str.split('=')[1];
	   }
	  return value;	
	},
	//路径追加参数
	setUrlParams:function(url,args) {
		if(typeof args == 'undefined') return url;
	    var u = (url.indexOf('?')!=-1)?(url+'?'):(url+'&');
		var arr = [];
		for(var name in args) {
		    arr.push(name+'='+args[name]);
		}
		u+=arr.join('&');
		return u;
	},
	//获取cookie
	getCookie:function(name) {
        var tmp, reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)","gi");
		if( (tmp = reg.exec( unescape(document.cookie) )) )
			return(tmp[2]);
		return null;	
	},
	//设置cookie
	setCookie:function(name,value,expires,path,domain) {
        var str = name + "=" + escape(value);
		if (expires != null || expires != '') {
			if (expires == 0) {expires = 100*365*24*60;}
			var exp = new Date();
			exp.setTime(exp.getTime() + expires*60*1000);
			str += "; expires=" + exp.toGMTString();
		}
		if (path) {str += "; path=" + path;}
		if (domain) {str += "; domain=" + domain;}
		document.cookie = str;	
	},
	//删除cookie
	delCookie:function(name,path,domain) {
        document.cookie = name + "=" +
			((path) ? "; path=" + path : "") +
			((domain) ? "; domain=" + domain : "") +
			"; expires=Thu, 01-Jan-70 00:00:01 GMT";	
	},
	//异步加载js,css,img
	load:function(type,url,callback,id) {
	    if(type!=='img' && type!=='script'&&type!=='css') return;
		var road = null;
		if(type === 'img') {
		   road = new Image();
		   road.src = url;
		}
		else {
			if(type==='script') {
		       road = document.createElement('script');
			   road.type = 'text/javascript';
			   road.src = url;
			   if(typeof id !='undefined') road.id = id;
	        }
		    else {
		       road = document.createElement('link');
			   road.type = 'text/css';
			   road.rel = 'stylesheet';
			   road.href = url;
		    }
			document.getElementsByTagName('head')[0].appendChild(road);
		}
		if(road.readyState) {
		        road.onreadystatechange = function() {
				          if(road.readyState == 'loaded' || road.readyState == 'complete') {
						       road.onreadystatechange = null;
							   if(callback && Object.prototype.toString.call(callback)==='[object Function]') callback(road);
						  }
				}
		}
		else {
		        road.onload = function() {
				      callback(road);
				}
		}
	},
	//时间戳
	now:function() {
	   return new Date().getTime();
	},
	//全角数字和字母转半角
	removeSBC:function(str,flag){
       var i;
       var result='';
       for(i=0;i<str.length;i++)
       { str1=str.charCodeAt(i);
         if(str1<65296){ result+=String.fromCharCode(str.charCodeAt(i)); continue;}
         if(str1<125&&!flag)
         result+=String.fromCharCode(str.charCodeAt(i));
         else
         result+=String.fromCharCode(str.charCodeAt(i)-65248);
        }
        return result; 	    
	},
	
	//获取当前日期
	getCurrentDate : function(style){
		
		style = style || 'style1';
		var date = new Date(),
			year = date.getFullYear(),
			month = date.getMonth() == 0 ? 1 : date.getMonth() + 1,
			day = date.getDate();
		
		if(style == 'style1'){
			return parseInt(year) + '-' + parseInt(month) + '-' + parseInt(day);
		}
		
	}
};


/*
 *  悬浮到某个按钮，展现其下拉菜单；移除此按钮或是整个下拉菜单，则恢复原状
 *
 */
(function($,window){
	
	$.ns('JX.UI.HoverList');

	var HoverList = function(options){
		
		$.extend(this,{
			
			hoverBtnId : null,
			listId : null,
			hoverClass : null,//悬浮到按钮上时添加的样式
			delay : 20, //鼠标移出button后，间隔多长时间下拉菜单消失
			minWidth:0
			
		},options || {});
		
		this._timerId = 0;
		this._listTimer = 0
		
		this._init();
	};
	
	$.extend(HoverList.prototype,{
		
		_init : function(){			
			this._addEvent();
			
		},
		
		_addEvent : function(){
			
			//给下拉按钮添加交互
			var that  = this,
				hoverBtn = $('#' + this.hoverBtnId),
				list = $('#' + this.listId);
				
			hoverBtn.hover(function(){
				
				clearTimeout(that._timerId);
				clearTimeout(that._listTimer);
				hoverBtn.addClass(that.hoverClass);
				if(that.minWidth!=0) {
						var w = $('#' + that.hoverBtnId).width();
						w+=23;
						if(w>=that.minWidth) {
							$('#' + that.listId).css({width:w});
						}
						else {
							 $('#' + that.listId).css({'background-position':w+'px 0'});
						}
				}				
				list.show();
				
			},function(){
				
				that._timerId = setTimeout(function(){
					
					hoverBtn.removeClass(that.hoverClass);
					list.hide();
					
				},that.delay);  
				
			});
			
			list.hover(function(){
				clearTimeout(that._timerId);
				list.show();
				
			},function(){
				hoverBtn.removeClass(that.hoverClass);
				
				that._listTimer = setTimeout(function(){
				
					list.hide(); 			
				
				},that.delay);
			});
		}
		
	});
	
	JX.UI.HoverList = function(options){
		
		return new HoverList(options);
		
	};
	
	
})(jQuery,window);

//v3版添加头部的js交互
(function($,window){
	
	var header = {
		
		init : function(){
			this._addEvent();
		},
		
		_addEvent : function(){		

			//关注我们下拉
			JX.UI.HoverList({
				hoverBtnId : 'focus-us',
				listId : 'attention-list',
				hoverClass : 'icon-on'
			});		
			
			//我的皆喜下拉
			JX.UI.HoverList({
				hoverBtnId : 'my-jiexi',
				listId : 'my-jiexi-list',
				hoverClass : 'icon-on'
			});
			
			//网站导航下拉
			JX.UI.HoverList({
				hoverBtnId : 'site-map',
				listId : 'site-map-list',
				hoverClass : 'icon-on'
			});
			
			//城市下拉
			JX.UI.HoverList({
				hoverBtnId : 'change-city',
				listId : 'change-city-list',
				delay : 100
			});
			
		
			//结婚商城下拉
			JX.UI.HoverList({
				hoverBtnId : 'mall',
				listId : 'mall-list',
				hoverClass : 'nav-on'
			});
		
	
			//结婚工具下拉
			JX.UI.HoverList({
				hoverBtnId : 'tool',
				listId : 'tool-list',
				hoverClass : 'tool-on'
			});
		
			
			//点击注册要把原始页面的url带着，可以让注册后还可以回到以前的页面
			$('#login_head').add('#register_head').bind('click',function(){
		
				var link = $(this);
				var url = location.href;
				if(location.href.indexOf('originUrl') == -1){
					if(window.needOriginUrl && window.needOriginUrl==false){
						location.href = link.attr('href');
					}
					else{
						if(location.href.indexOf('/event/')!=-1 && location.href.indexOf('rg=true')!=-1) url = location.href.split('?')[0];
						location.href = link.attr('href') + '?originUrl=' + encodeURIComponent(url);
					}
					return false;
				}
				
				
			});
			
			
			//搜索框交互
			var input = $('#global-search-input'),
				tip = input.attr('placeholder'),
				form = $('#global-search-form');
			
			input.bind('focus',function(){$(this).addClass('text-focus');}).bind('blur',function(){$(this).removeClass('text-focus');});
			//添加input交互
			if (!('placeholder' in document.createElement('input'))){
				input.val(tip);
				input.bind('focus',function(e){
					if($.trim(input.val()) == tip){
						input.val('');
					}
				})
				.bind('blur',function(e){
					if($.trim(input.val()) == ''){
						input.val(tip);
					}
				})
				.bind('keypress',function(e){
					if(e.keyCode == 13){
						form.trigger('submit');
					}
				});
			}
			
			//form提交校验
			form.bind('submit',function(e){

				var inputvalue = $.trim(input.val());
				if(inputvalue == '' || inputvalue == tip || inputvalue.length < 2){
					var left = 0;
					var globalTip = $('#global-search-tip-wrapper');
					if($.browser.msie && $.browser.version == '6.0'){					
						left = 5;
					}
					else{
						left = 1;		
					}
					if(globalTip.size() == 0){
					
						var tips_c = '<a href="javascript:;"></a>为了获得更准确的效果，<br/>输入两个字以上的关键词。',
							tips_css = 'search_tips_css';
				   
						var div = $('<div id="global-search-tip-wrapper"></div>');
							div.addClass(tips_css);
							var t = input.offset().top + 31,
								l = input.offset().left - left;
			
							div.css({left:l,top:t,opacity:'0'});
							div.html(tips_c);
							$(document.body).append(div);
							div.find('a').bind('click',function(){
								  div.remove();
								  return false;
							});						
							div.animate({opacity:1},'slow');
					}		
					
					return false;
					
				}
				
				
			});
		}
	};
	
	$(function(){
		header.init();
	}); 
	

})(jQuery,window);

//处理在FF下node无outerHTML属性的问题
if (typeof(HTMLElement) != "undefined" && !$.browser.msie) {
	   HTMLElement.prototype.__defineSetter__("outerHTML", function(s) {
	        var r = this.ownerDocument.createRange();
	        r.setStartBefore(this);
	        var df = r.createContextualFragment(s);
	        this.parentNode.replaceChild(df, this);
	        return s;
	    });
	   HTMLElement.prototype.__defineGetter__("outerHTML", function(){
	        var a = this.attributes, str = "<" + this.tagName.toLowerCase(), i = 0;
	        for (; i < a.length; i++)
	            if (a[i].specified)
                str += " " + a[i].name + '="' + a[i].value + '"';
	        if (!this.canHaveChildren)
	            return str + " />";
	        return str + ">" + this.innerHTML + "</" + this.tagName.toLowerCase() + ">";
	    });
	 
	    HTMLElement.prototype.__defineGetter__("canHaveChildren", function(){
	        return  !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
	    });
}

//为Array添加方法
Array.prototype.min = function(){   
	return Math.min.apply({},this) 
};
	
Array.prototype.max = function(){   
	return Math.max.apply({},this) 
};

$(function(){
    //监听sem
    if($('#headOnline')[0] && typeof agrant_send =='function') {
		$('#headOnline').bind('click',function(){
			agrant_send();
		});
	}
});