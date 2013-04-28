/**
  * UI.Dialog contains basic super class -- Dialog 、Alert and Confirm dialog.
  * The technic of inheritance is originated from Douglas Crockford.
  * reference : http://shiningray.cn/private-members-in-javascript.html
**/

$.ns('UI.Dialog');

(function($,window){
	
	var Button = function(options){
		
		var that = this,
			button = null;
		
		$.extend(true,this,{
			
			text : '确定',
			callback : function(){}
			
		},options || {});
		
		var _root = 'button-' + $.rand();
		
		var _createTmpl = function(){
			return '<input id="'+ _root +'" type="button" class="button" value="'+ that.text +'"/>'
		};
		
		var _addEvent = function(){
			button = $(_createTmpl()).bind('click',that.callback);
		};
		
		var _init = function(){
			_addEvent();
		};
		
		_init();
		
		return button;
	};
	
	UI.Button = function(options){
		return new Button(options);
	};
	
	//将一个[{text:'',function(){}},{},……]的json转换为实例化后的button数组
	UI.Button.convert = function(btnArray){
		var ret = [];
		for(var i = 0;i < btnArray.length;i++){
			ret.push(UI.Button(btnArray[i]));
		}
		return ret;
	};
	
	var tmpl = {
		
		'frame' : '<table style="position:<%=position%>;z-index:<%=zIndex%>;" id="<%=root%>" class="dialog-<%=skin%>-wrapper">' + 
					'<tbody>' +
						'<tr>' +
							'<td class="dialog-border-top-left"></td>' +
							'<td class="dialog-border-top-mid" ></td>' +
							'<td class="dialog-border-top-right"></td>' +
						'</tr>' +
						'<tr>' +
							'<td class="dialog-border-mid-left"></td>' +
							'<td id="<%=root%>-content" class="dialog-content"><%=content%></td>' +				
							'<td class="dialog-border-mid-right"></td>' +
						'</tr>' +
						 '<tr>' +
							'<td class="dialog-border-bottom-left"></td>' +
							'<td class="dialog-border-bottom-mid"></td>' +
							'<td class="dialog-border-bottom-right"></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>',
		
		'alert' :   '<h1 id="title" class="dialog-content-head"><%=title%></h1>' +
					'<div class="dialog-content-body"><%=text%></div>'+
					'<div class="dialog-content-foot">' +
						'<div id="<%=buttonsWrapperId%>" class="dialog-content-foot-buttons"></div>' +
					'</div>'
		
	};
	
	var Dialog = function(options){
		
		var that = this;
		$.extend(true,this,{
			renderTo : 'body',
			position : 'absolute',
			zIndex : 1,
			width : 'auto',
			height : 'auto',
			content : '',
			skin : 'skin',
			cover : false //true代表使用cover的默认值，如果为{},则表示cover的配置参数
			
		},options || {});
		
		var _root = 'dialog-' + $.rand();
		
		var _createTmpl = function(){

			var html = $.MT('frame',tmpl['frame'],{
				root : _root ,
				skin : that.skin ,
				position : that.position ,
				content : that.content,
				zIndex : that.zIndex
			});
	
			var dialog = $(html);
			
			$(that.renderTo).append(dialog);
			
			var content = $('#' + _root + '-content');
			content.css({
				width : that.width,
				height : that.height
			});
		};
		
		var _init = function(){
			_createTmpl();
			that.center();
		};
		
		//特权方法()，利用js闭包特性，让公有方法可以访问到私有属性或方法，可以被子类继承
		this.getRoot = function(){
			return _root;
		};
		
		var _cover = null;
		if(this.cover){
			
			if(this.cover === true){
				_cover = UI.Cover();
			}
			else{
				_cover = UI.Cover(this.cover);
			}
			
		}
		
		this.getCover = function(){
			return _cover;
		};
		
		if(!(arguments[1] && arguments[1] == true)){
			_init();
		}
		
	};
	
	
	$.extend(Dialog.prototype,{
	
		//使对话框水平、垂直居中
		center : function(){
			var dialog = $('#' + this.getRoot()),
				doc = $(document),				
				clientWin = $(window),
				clientWidth = clientWin.width(),
				clientHeight = clientWin.height();
				
			dialog.css({
				left : (clientWidth - dialog.outerWidth()) / 2 + doc.scrollLeft() ,
				top : (clientHeight - dialog.outerHeight()) / 2 + doc.scrollTop()
			});
			
		},
		
		setContent : function(content){
			
			$('#' + this.getRoot() + '-content').html(content);
			this.center();
		},
		
		destroy : function(){
			
			var cover = this.getCover();
			if(cover != null){
				cover.remove();
			}
			
			$('#' + this.getRoot()).remove();
			
		}
		
	});
	
	UI.Dialog = function(options){
		return new Dialog(options);
	};
	
	var Alert = function(options){
		
		var that = this;
		if(typeof options == 'undefined' || typeof options == 'string' ){
			options = {
				text : options || ''
			};
		}

		Dialog.call(this,$.extend(true,{
			
			width : 280,
			title : '提示',
			text : '',
			buttons : [{text : '确定' , callback : function(){that.destroy();}}]
			
		},options || {}),true);
		
		var _buttonsWrapperId =  that.getRoot() + '-buttons';
		
		var _createTmpl = function(){
		
			var root = that.getRoot();
			
			var alertHtml = $.MT('alert',tmpl['alert'],{
				title : that.title ,
				text : that.text ,
				buttonsWrapperId : _buttonsWrapperId
			});
			
			var html = $.MT('frame',tmpl['frame'],{
				root :  root,
				skin : that.skin ,
				position : that.position ,
				content : alertHtml,
				zIndex : that.zIndex
			});
			
			
			$(that.renderTo).append(html);
			
			var content = $('#' + root + '-content');
			content.css({
				width : that.width,
				height : that.height
			});
			
		};
		
		var _addEvent = function(){
			$('#title').bind('click',function(e){
				that.destroy();
			});
		};
			
		this.getButtonsWrapperId = function(){
			return _buttonsWrapperId;
		};
		
		var	_init = function(){
			
			_createTmpl();
			that.setButtons(UI.Button.convert(that.buttons));
			_addEvent();
		};
		
		if(!(arguments[1] && arguments[1] == true)){
			_init();
		}
		
		
	};
	
	$.extend(Alert.prototype,Dialog.prototype,{
	
		setButtons : function(buttonsArray){
			
			var wrapper = $('#' + this.getButtonsWrapperId());
			for(var i = 0;i < buttonsArray.length;i++){
				wrapper.append(buttonsArray[i]);
			}
			
			//每次内容有所改变，则相对的居中位置也会发生变化
			this.center();
		}
	});
	
	UI.Dialog.Alert = function(options){
		return new Alert(options);
	};
	
	var Confirm = function(options){
		
		var that = this;

		Alert.call(this,$.extend(true,{
			title : '确认提示',
			onConfirm : function(){},
			buttons : [
						{
							text : '确定' , 
							callback : function(){
								that.onConfirm();
								that.destroy();
							}
						},
						{text : '取消' , callback : function(){that.destroy();}}
			]
			
		},options || {}),true);
		
		
		var _createTmpl = function(){
		
			var root = that.getRoot();
			
			var alertHtml = $.MT('alert',tmpl['alert'],{
				title : that.title ,
				text : that.text ,
				buttonsWrapperId : that.getButtonsWrapperId()
			});
			
			var html = $.MT('frame',tmpl['frame'],{
				root :  root,
				skin : that.skin ,
				position : that.position ,
				content : alertHtml,
				zIndex : that.zIndex
			});
			
			
			$(that.renderTo).append(html);
			
			var content = $('#' + root + '-content');
			content.css({
				width : that.width,
				height : that.height
			});
			
		};
		
		var	_init = function(){
			
			_createTmpl();
			that.setButtons(UI.Button.convert(that.buttons));
		};
		
		if(!(arguments[1] && arguments[1] == true)){
			_init();
		}
		
	};
	
	$.extend(Confirm.prototype,Alert.prototype);
	
	UI.Dialog.Confirm = function(options){
		return new Confirm(options);
	};
	
})(jQuery,window);

$(function(){
	$('#btn').bind('click',function(e){
	
		var alert1 = UI.Dialog.Alert('alert1 -- a simple alert,inherited from Dialog');	
		return;
		var confirm1 =  UI.Dialog.Confirm({
			text : "It's a confirm dialog , inherited from Alert and it'll be automatically destroied after invoking onConfirm callback ",
			onConfirm : function(){
				
			},
			cover : {opacity : 0.5,color : '#000'}
		});
		
		
	});
/*
		var dialog = UI.Dialog({
			content : 'Dialog is a super class'
		});
		
	
	var alert2 = UI.Dialog.Alert({
		text : 'alter2 -- with custom made buttons',
		buttons : [{
			text : '确定1',
			callback : function(){
				console.log('确定1');
				alert2.destroy();
			}
		},
		{
			text : '确定2',
			callback : function(){
				console.log('确定2');
				alert2.destroy();
			}
		},
		{
			text : '确定3',
			callback : function(){
				console.log('确定3');
				alert2.destroy();
			}
		},
		{
			text : '取消',
			callback : function(){
				console.log('取消');
				alert2.destroy();
			}
		}]
	});	
	
	
	*/
});

