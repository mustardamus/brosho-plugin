/*
 *
 * Copyright (c) 2009 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * See details in: <a href="http://cloudgen.w0ng.hk/javascript/javascript.php">Javascript Examplet</a>
 *
 */
(function($){
	$.fn.caret=function(options,opt2){
		var start,end,t=this[0];
		if(typeof options==="object" && typeof options.start==="number" && typeof options.end==="number") {
			start=options.start;
			end=options.end;
		} else if(typeof options==="number" && typeof opt2==="number"){
			start=options;
			end=opt2;
		} else if(typeof options==="string"){
			if((start=t.value.indexOf(options))>-1) end=start+options.length;
			else start=null;
		} else if(Object.prototype.toString.call(options)==="[object RegExp]"){
			var re=options.exec(t.value);
			if(re != null) {
				start=re.index;
				end=start+re[0].length;
			}
		}
		if(typeof start!="undefined"){
			if($.browser.msie){
				var selRange = this[0].createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end-start);
				selRange.select();
			} else {
				this[0].selectionStart=start;
				this[0].selectionEnd=end;
			}
			this[0].focus();
			return this
		} else {
			if($.browser.msie){
				var val = this.val();
				var range = document.selection.createRange().duplicate();
				range.moveEnd("character", val.length)
				var s = (range.text == "" ? val.length : val.lastIndexOf(range.text));
				range = document.selection.createRange().duplicate();
				range.moveStart("character", -val.length);
				var e = range.text.length;				
			} else {
				var s=t.selectionStart,
					e=t.selectionEnd;
			}
			var te=t.value.substring(s,e);
			return {start:s,end:e,text:te,replace:function(st){
				return t.value.substring(0,s)+st+t.value.substring(e,t.value.length)
			}}
		}
		return this;
	}
})(jQuery);