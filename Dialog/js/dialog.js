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
		
		$.extend(this,{
			
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
	
	var Dialog = function(options){
		
		var that = this;
		$.extend(this,{
			
			width : 'auto',
			height : 'auto',
			content : '',
			skin : 'skin'
			
		},options || {});
		
		var _root = 'dialog-' + $.rand();
		
		var _createTmpl = function(){

			var html = '<table id="'+ _root +'" class="dialog-'+ that.skin +'-wrapper">' + 
							'<tbody>' +
								'<tr>' +
									'<td class="dialog-border-top-left"></td>' +
									'<td class="dialog-border-top-mid" ></td>' +
									'<td class="dialog-border-top-right"></td>' +
								'</tr>' +
								'<tr>' +
									'<td class="dialog-border-mid-left"></td>' +
									'<td id="'+ _root +'-content" class="dialog-content">'+ that.content +'</td>' +				
									'<td class="dialog-border-mid-right"></td>' +
								'</tr>' +
								 '<tr>' +
									'<td class="dialog-border-bottom-left"></td>' +
									'<td class="dialog-border-bottom-mid"></td>' +
									'<td class="dialog-border-bottom-right"></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>';
			
			var dialog = $(html);
			
			$('body').append(dialog);
			
			var content = $('#' + _root + '-content');
			content.css({
				width : that.width,
				height : that.height
			});
		};
		
		//特权方法()，利用js闭包特性，让公有方法可以访问到私有属性或方法
		this.getRoot = function(){
			return _root;
		};
		
		var _init = function(){
			_createTmpl();
			that.center();
		};
		
		_init();
		
		
	};
	
	
	$.extend(Dialog.prototype,{
		
		//使对话框水平、垂直居中
		center : function(){
			var dialog = $('#' + this.getRoot()),
				doc = $(document),				
				clientWidth = $(window).width(),
				clientHeight = $(window).height();
				
			dialog.css({
				left : (clientWidth - dialog.outerWidth()) / 2 + doc.scrollLeft() ,
				top : (clientHeight - dialog.outerHeight()) / 2 + doc.scrollTop()
			});
			
			document.title = clientHeight - dialog.outerHeight();
			document.title = dialog.outerHeight();
		},
		
		setContent : function(content){
			
			$('#' + this.getRoot() + '-content').html(content);
			this.center();
		},
		
		destroy : function(){
			
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

		Dialog.call(this,$.extend({
			
			width : 280,
			title : '提示',
			text : '',
			buttons : [{text : '确定' , callback : function(){that.destroy();}}]
			
		},options || {}));
		
		var	_createBtn = function(buttonData){
			return UI.Button(buttonData);
		};
			
		var	_createBtns = function(){
				
			var buttons = that.buttons,
				ret = [];

			for(var i = 0;i < buttons.length;i++){
				ret.push(_createBtn(buttons[i]));
			}
	
			return ret;
		};

		var _buttonsWrapperId =  that.getRoot() + '-buttons';
		
		var _createTmpl = function(){
			var html =  '<h1 class="dialog-content-head" id="test">'+ that.title +'</h1>' +
						'<div class="dialog-content-body">'+ that.text +'</div>'+
						'<div class="dialog-content-foot">' +
							'<div id="'+ _buttonsWrapperId +'" class="dialog-content-foot-buttons"></div>' +
						'</div>';

			that.setContent(html);
		};
			
		this.getButtonsWrapperId = function(){
			return _buttonsWrapperId;
		};
		
		var	_init = function(){
			
			_createTmpl();
			that.setButtons(_createBtns());
		};
		
		_init();
		
		
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
		if(typeof options == 'undefined' || typeof options == 'string' ){
			options = {
				text : options || ''
			};
		}

		Alert.call(this,$.extend({
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
			
		},options || {}));
		
	};
	
	$.extend(Confirm.prototype,Alert.prototype);
	
	UI.Dialog.Confirm = function(options){
		return new Confirm(options);
	};
	
})(jQuery,window);

$(function(){
	/*
	var dialog = UI.Dialog({
		content : 'Dialog is a super class'
	});
	*/
	$('#btn').bind('click',function(e){
		var alert1 = UI.Dialog.Alert('alert1 -- a simple alert,inherited from Dialog');	
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
	
	var confirm1 =  UI.Dialog.Confirm({
		text : "It's a confirm dialog , inherited from Alert and it'll be automatically destroied after invoking onConfirm callback ",
		onConfirm : function(){
			console.log('Fuck it, it\'s done!');
		}
	});
	*/
});
