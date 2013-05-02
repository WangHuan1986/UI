/**
  * UI.Dialog contains basic super class -- Dialog 、Alert and Confirm dialog.
  * The technic of inheritance is originated from Douglas Crockford.
  * reference : http://shiningray.cn/private-members-in-javascript.html
  * Using prototype-based inheritance and composition
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
							'<td id="<%=root%>-content" class="dialog-content" style="width:<%=width%>;height:<%=height%>;"><%=content%></td>' +				
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
			root : 'dialog-' + $.rand(),
			renderTo : 'body',
			position : 'absolute',
			zIndex : 1,
			width : 'auto',
			height : 'auto',
			content : '',
			skin : 'skin',
			cover : false //true代表使用cover的默认值，如果为{},则表示cover的配置参数
			
		},options || {});
		
		var _createTmpl = function(){

			var html = $.MT('frame',tmpl['frame'],{
				root : that.root ,
				width : that.width,
				height : that.height,
				skin : that.skin ,
				position : that.position ,
				content : that.content,
				zIndex : that.zIndex
			});
	
			$(that.renderTo).append(html);
			
		};
		
		//创建遮罩
		var _cover = null;
		if(this.cover){
			
			if(this.cover === true){
				_cover = UI.Cover();
			}
			else{
				_cover = UI.Cover(this.cover);
			}
			
		}
		
		this.coverObject = _cover;
		
		var _init = function(){
			_createTmpl();
			that.center();
		};
		
		_init();
	};
	
	
	$.extend(Dialog.prototype,{
	
		getCover : function(){
			return this.coverObject;
		},
	
		//使对话框水平、垂直居中
		center : function(){
			var dialog = $('#' + this.root),
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
			
			$('#' + this.root + '-content').html(content);
			this.center();
		},
		
		destroy : function(){

			var cover = this.getCover();
			if(cover != null){
				cover.remove();
			}
			
			$('#' + this.root).remove();
			
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
		
		var _root = 'alert-' + $.rand(),
			_buttonsWrapperId =  _root + '-buttons';
		
		var config = $.extend(true,this,{
			root : _root,
			width : 280,
			title : '提示',
			text : '',
			buttons : [{text : '确定' , callback : function(){that.destroy();}}]
		},options || {});
		
		var _createTmpl = function(){
		
			var alertHtml = $.MT('alert',tmpl['alert'],{
				title : config.title ,
				text : config.text ,
				buttonsWrapperId : _buttonsWrapperId
			});
			
			return alertHtml;
		};
		
		config['content'] = _createTmpl();
		Dialog.call(this,$.extend(true,{},config));
			
		var _setButtons = function(buttonsArray){
			
			var wrapper = $('#' + _buttonsWrapperId);
			for(var i = 0;i < buttonsArray.length;i++){
				wrapper.append(buttonsArray[i]);
			}
			
			//每次内容有所改变，则相对的居中位置也会发生变化
			that.center();
		};
		
		var	_init = function(){
			_setButtons(UI.Button.convert(that.buttons));
		};
		
		_init();
	};
	
	$.extend(Alert.prototype,Dialog.prototype);
	
	UI.Dialog.Alert = function(options){
		return new Alert(options);
	};
	
	var Confirm = function(options){
		
		var that = this,
			_root = 'confirm-' + $.rand();
		var config = $.extend(true,this,{
			root : _root,
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
			
		},options || {});
		
		//这个地方如果用new，那么最后在dialog的方法中的this将不是此处的this所指向的对象
		Alert.call(this,$.extend(true,{},config));
		
	};
	
	$.extend(Confirm.prototype,Alert.prototype);
	
	UI.Dialog.Confirm = function(options){
		return new Confirm(options);
	};
	
})(jQuery,window);

$(function(){
	$('#btn').bind('click',function(e){
	
		var confirm1 =  UI.Dialog.Confirm({
			text : "It's a confirm dialog , inherited from Alert and it'll be automatically destroied after invoking onConfirm callback ",
			onConfirm : function(){
				console.log('in');
				
			}
		});
		
	});
/*
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
		var alert1 = UI.Dialog.Alert('alert1 -- a simple alert,inherited from Dialog');	
		var dialog = UI.Dialog({
			content : 'Dialog is a super class'
		});
		
	
	
	*/
});

