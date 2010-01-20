/*
   jQuery Brosho Plugin
   =====================
   Design in the Browser
   
   Version 0.1 - 20. Jan 2010
   
   Copyright (c) 2010 by Sebastian Senf:
   http://mustardamus.com/
   http://usejquery.com/
   
   Dual licensed under the MIT and GPL licenses:
   http://www.opensource.org/licenses/mit-license.php
   http://www.gnu.org/licenses/gpl.html
   
   Documentation:   http://usejquery.com/posts/8/brosho-design-in-the-browser-jquery-plugin
   Demo:            http://demos.usejquery.com/brosho-plugin/
   Source:          http://github.com/mustardamus/brosho-plugin
*/


(function($) {
  $.fn.brosho = function(options) {
    var opts = $.extend({}, $.fn.brosho.defaults, options);
    
    
    if($('#brosho-wrapper').length) { //brosho got called the second time by user, remove the current and add back with the options
      $('#brosho-wrapper, #brosho-overlay-wrapper').remove(); //remove old stuff
      $('body *').unbind(); //unbind the previous hover event handler on every element within the body
    } else {
      jQuery('<link/>', { //build the css link to the brosho stylesheet
        rel:    'stylesheet',
        type:   'text/css',
        media:  'screen',
        href:   opts.stylesheet
      }).appendTo('head'); //and append it to the head
    }
    
    
    //build the html for brosho via a string, you could use jQuery() builder in jQuery() itself but it looks ugly/unreadable
    var brosho_html = '<div id="brosho-editor">' +
                        '<div id="brosho-selector">' +
                          '<label for="brosho-selector-field">Selector</label>' +
                          '<input type="text" id="brosho-selector-field" />' +
                        '</div>' +
                        '<div id="brosho-css">' +
                          '<label for="brosho-css-field">CSS Styles</label>' +
                          '<textarea id="brosho-css-field"></textarea>' +
                        '</div>' +
                      '</div>' +
                      '<ul id="brosho-controls">' +
                        '<li id="brosho-position">Position: <a href="#top">Top</a> <a href="#bottom">Bottom</a> <a href="#left">Left</a> <a href="#right">Right</a></li>' +
                        '<li id="brosho-highlight">Highlight Elements: <a href="#highlight">Enabled</a></li>' +
                        '<li id="brosho-generate">CSS Code: <a href="#generate">Generate</a></li>' +
                      '</ul>' +
                      '<div style="clear:both"></div>';
    
    var brosho_over = '<div id="brosho-overlay"></div>' +
                      '<div id="brosho-css-output">' +
                        '<a href="#close">Close</a>' +
                        '<textarea id="brosho-css-output-field"></textarea>' +
                      '</div>'
    
    
    var wrapper = jQuery('<div/>', { //build the brosho wrapper
      id:     'brosho-wrapper',
      'class':'brosho-' + opts.position, //default bottom or as user requested [beware! safari don't like it when you use 'class' (without ') as key]
      html:   brosho_html //use the html build in a string
    }).appendTo('body'); //append the wrapper to the body
    
    
    var overlay = jQuery('<div/>', { //build the overlay for the css output
      id:     'brosho-overlay-wrapper',
      html:   brosho_over,
    }).appendTo('body');
    
    
    $('#brosho-position a', wrapper).click(function() { //position the editor as user requests it
      wrapper.removeClass().addClass('brosho-' + $(this).text().toLowerCase()); //remove all classes on wrapper and add the one requested
      return false; //dont follow the anchor
    });
    
    
    var highlight = true; //variable to determine if we need to hightlight elements on hover
    
    $('#brosho-highlight a', wrapper).toggle(function() { //disable/enable the hover highlight on elements
      $(this).text('Disabled'); //change text
      highlight = false; //no highlight
    }, function() {
      $(this).text('Enabled'); //change text back
      highlight = true; //allow highlight again
    });
    

    $('#brosho-generate a', wrapper).click(function() { //return the css code for the changed elements
      var full_css = ""; //store the generated css code here
      
      $('body *').each(function() { //check every element for changed css
        var el = $(this); //used several times
        var brosho_css = el.attr('brosho-css'); //store the attribute value
        
        if(brosho_css) { //does this element have changed css
          var temp_css = $.fn.brosho.extractCssSelectorPath(el) + ' {\n' //generate css selector path
          var properties = brosho_css.split(";"); //split the properties
          
          for(var i = 0; i < properties.length; i++) { //loop through every property
            if(properties[i].length) temp_css += '\t' + trim(properties[i]) + ';\n'; //trim and add the property
          }
          
          temp_css += '}\n\n'; //close the selector
          
          if(full_css.indexOf(temp_css) == -1) full_css += temp_css; //make sure we dont have the snippet yet and append it to the full css string
        }
      });
      
      overlay.fadeIn('fast'); //fade in the overlay wrapper
      $('#brosho-css-output textarea', overlay).val(trim(full_css)).select(); //set the text for the css output textbox and autoselect it
      
      return false; //dont follow the anchor
    });
    
    
    $('#brosho-css-output a').click(function() { //watch the close button on the css output overlay
      $(this).parent().parent().fadeOut('fast');
      return false; //dont follow the anchor
    });
    
    
    var selector_field = $('#brosho-selector-field', wrapper); //selector textbox, used multiple times
    var css_field = $('#brosho-css-field', wrapper); //the css textarea, used multiple times
    
    //on mouseenter on every element in the body except the brosho wrapper and overlay
    $('body *:not(#brosho-wrapper, #brosho-wrapper *, #brosho-overlay-wrapper, #brosho-overlay-wrapper *)').hover(function() {
      if(highlight) $(this).addClass(opts.elementHoverClass); //add the hover class to the current element
    }, function() { //on mouseleave
      $(this).removeClass(opts.elementHoverClass); //remove the hover class
    }).click(function() { //on element click
      var el = $(this); //store the current element, used multiple times
      
      $('body *').removeClass(opts.elementHoverClass); //remove the brosho hover class on every element so we dont generate a false path
      
      selector_field.val($.fn.brosho.extractCssSelectorPath(el)); //set the css selector path of the current element

      if(el.attr('brosho-css')) { //does the user already have the css of the element
        css_field.val(el.attr('brosho-css')); //set the changed css to the editor
      } else { //this element doesn't have and changed css yet
        css_field.val(''); //clear the css editor
      }
      
      css_field.focus(); //set the focus to the css editor
      
      return false; //dont follow the link if it is one
    });
    
    
    css_field.keyup(function(event) { //watch key up's on the css editor
      if(css_field.val().substr(css_field.val().length - 1, 1) == ';' || //is the last typed character a ;
         css_field.val().length == 0) { //or the css editor is empty

        $(selector_field.val()).attr({ //set the new attributes on each matching element
          style: css_field.val(), //set new style
          'brosho-css': css_field.val() //save exact content of the css editor in a extra attribute *
        });
      }
    });
    
    
    selector_field.blur(function() { //watch the blur event for the selector textbox
      var brosho_css = $(selector_field.val()).attr('brosho-css'); //used multiple times
      
      if(brosho_css) { //check if we already have altered the matching element
        css_field.val(brosho_css); //set the css editor with the value of the attribute brosho-css
      } else { //no changed css yet
        css_field.val(''); //clear the editor
      }
    });
    
    
    wrapper.css('opacity', opts.editorOpacity).hover(function() { //make brosho semi transparent so you can see whats going on underneath
      $(this).fadeTo('fast', 1); //fade to full
    }, function() {
      $(this).fadeTo('fast', opts.editorOpacity); //fade back
    });
  }; //brosho function end
  
  
  //private function to trim strings
  function trim (str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  
  
  //public function to extract a css selector path from an element
  $.fn.brosho.extractCssSelectorPath = function(el) {
    if(el.attr('id')) return '#' + el.attr('id'); //it is (should) be an unique element, return the id selector
    
    var path = $.fn.brosho.extractCssSelectorPath(el.parent()); //to prepend the path of the parent element
    
    if(el.attr('class') && el.attr('class') != ' ') return path + ' .' + el.attr('class'); //if the lement has a class use this as selector
    return path + ' ' + el.get(0).tagName.toLowerCase(); //return the current path with the tag name of the element if t has no id or class
  };
  
  
  //default options for brosho
  $.fn.brosho.defaults = {
    stylesheet:         'js/brosho/jquery.brosho.css',
    position:           'bottom',
    elementHoverClass:  'brosho-element-hover',
    editorOpacity:      0.8
  };
})(jQuery);


$(function () { $.fn.brosho(); }); //auto execute the brosho plugin


// *) Somehow jQuery.data() havent worked to store the css string. It got erased everytime a element got clicked and returns 'undefined'
//    even when I successful set the data within the keyup event on the css editor. Using a non valid attribute... I go to hell. But hey
//    this is just a tool for the development environment ;)