 
(function($,window){
	
	$.ns('UI.Cover');
	
	var Cover = function(options){
		
		var that = this;
		
		$.extend(true,this,{
			color : '#000', //遮罩的颜色
			opacity : 0.5, //透明度
			zIndex : 1,
			ifHideScrollbar : true //是否隐藏滚动条
		},options || {});
		
		
		var _root = 'cover-' + $.rand();
		
		
		var _createTmpl = function(){
			var doc = $(document);
			
			$('<div id="' + _root + '"></div>').css({
				backgroundColor : that.color ,
				opacity : that.opacity,
				zIndex : that.zIndex,
				width : '100%',
				height : doc.height(),
				position : 'absolute',
				left : 0,
				top : 0
			}).appendTo('body');
			
		};
		
		var _addEvent = function(){
			
			$(window).bind('scroll',function(e){
				that.updateHeight();
			});
			
		};
		
		var _init = function(){
			if(that.ifHideScrollbar){
				that.hideScrollbar();
			}
			_createTmpl();
			_addEvent();
		};
		
		this.getRoot = function(){
			return _root;
		};
		
		_init();
	};
	
	$.extend(Cover.prototype,{
		
		hideScrollbar : function(){
			if($.IE6){
				$('html').css({
				    'overflow-x':'hidden',
					'overflow-y' : 'hidden'
				});
			}
			else{
				$('body').css({
					overflow : 'hidden'
				});
			}
		},
		
		showScrollbar : function(){
			if($.IE6){
				$('html').css({
					'overflow-x':'hidden',
					'overflow-y' : 'auto'
				});
			}
			else{
				$('body').css({
					overflow : 'auto'
				});
			}
		},
		
		//隐藏遮罩
		hide : function(){
			$('#' + this.getRoot()).hide();
		},
		
		//显示遮罩
		show : function(){
			$('#' + this.getRoot()).show();
		},
		
		//删除遮罩
		remove : function(){
			$('#' + this.getRoot()).remove();
			this.showScrollbar();
		},
		
		//更新高度
		updateHeight : function(){
			
			var cover = $('#' + this.getRoot());
			cover.css({height : $(document).height() , width : '100%'});
			
		}
		
		
	});
	
	UI.Cover = function(options){
		return new Cover(options);
	};
	
})(jQuery,window);