var SNController = {
	actionName: '',	
	setupPageHandlers: function() {
		console.log('SNController init | setup page handlers');
		var that = this;
		/*add pageshow listenr- on page show setup the screen and call the action for the controller*/
		$('body').off('pageshow').on('pageshow','[data-role=page]',function(){	
			/*mark page shown as happened*/
			SNApp.shown = true;
			
			/*call page action function*/
			that[($(this).attr('id') +  'Action')]()
			   
            var id = $(this).attr('id');
			/*history tracking done here:*/
			App_History.init();
			
			var page = this;
			
			if($("#" + id + " [data-role=footer]").length < 1 && (SNApp.getControllerName()+$(this).attr('id'))!='usersindex') {
				$.ajax({
					dataType: 'html',
					url: "footer.html",
					success: function (data) {
						$(page).append(data);
						
						$(".menu").unbind("click").bind("click", function() {
							window.scrollTo(0, 0);
							SNApp.sliderMenu();
							return false;
						});
						
						$(".back").unbind("click").bind("click", function() {
							App_History.go_back();
							return false;
						});
						
						SNApp.checkUserNotificationsCount();
						
						$(".footer_logo").unbind("click").bind("click", function() {
							SNController.goTo('users.html?date=' + Date.parse(new Date()),'notifications');
							return false;
						});
						
						$('.ui-content',page).css('height',
							$(page).outerHeight()
							- $('.ui-footer',page).outerHeight()
							- $('.ui-header',page).outerHeight()
						).css('padding-top',$('.ui-header',page).outerHeight());
						
						$('.ui-page-active .fixed_menu').css('height',
							$('.ui-page-active .fixed_menu').outerHeight()
							- $('.ui-page-active .vSlideMenu.fixed').outerHeight() - 7
						);
							
						if(!App_History.can_go_back()){
							$('.ui-page-active .footer_button .back').hide();
						}
					}
				});
			} else {
				$(".ui-page-active .back").bind("click", function() {
					App_History.go_back();
					return false;
				});
				
				$('.ui-page-active .ui-content').css('height',
					$('.ui-page-active').outerHeight()
					- $('.ui-footer',page).outerHeight()
					- $('.ui-header',page).outerHeight()
				).css('padding-top',$('.ui-header',page).outerHeight());
				
				if(!App_History.can_go_back()){
					$('.ui-page-active .footer_button .back').hide();
				}
			}
			
			/*Android ONLY : on input focus- hide the footer.  This is because it moves up with the keyboard and looks back...*/
			if(!SNApp.isIOS){
				$('body').off('focus').on('focus','input[type="text"],textarea',function(){
					$('.ui-page-active .ui-footer').hide();
					return false;
				}).off('blur').on('blur','input[type="text"],textarea',function(){
					$('.ui-page-active .ui-footer').show();
					return false;
				});
			}
		});
	},
	getActionName: function() {
		var urlParts = $.mobile.path.parseUrl(document.location.href);
		if(urlParts.hash) {
			this.actionName = urlParts.hash; 
		} else {
			this.actionName = 'index';
		}
		return this.actionName;
	},
	
	getParams: function() {
		var urlParts = SNApp.getUrlParts();
		return urlParts.params;
	},
	
	goTo: function(htmlPage, hash) {
		var newUrl = "" + htmlPage;
        if(hash) 
            newUrl += "#" + hash;
			/*look into implementing page transitions*/
		//$.mobile.changePage( "#index", { transition: "slideup", changeHash:true }, true);
		// $.mobile.changePage( newUrl, { transition: "flow", changeHash:true,reloadPage:true }, true);
		
		window.document.location = newUrl;
	},
    /*TODO : eventually make this obsolete...
	*/
    verticalSliderMenu: function(optionsArray, containerElement) {
		/*container must be empty!*/
		if($('*',$(containerElement)).length == 0){
			var sliderHtml = '';
			for(i=0; i < optionsArray.length; i++){
				var first = optionsArray[i].first;
				var last = optionsArray[i].last;
				sliderHtml += 
					'<div onClick="' + optionsArray[i].onClick + '">' +
						'<div class="container"><img src="img/menu/'+optionsArray[i].url + '.png"/></div>' +
						'<div class="first s_m">' + first + '</div>' +
						'<div class="last m_s">' + last + '</div>' +
					'</div>';
			}
			/*margin is for centering the menu when the screen is too large.
			in the case where the margin for centering is would take it off screen, just left align.*/
			var margin = optionsArray.length * - 41;
			if(margin * -1 >window.innerWidth / 2){
				margin = window.innerWidth / -2;
			}
			containerElement.css('width',optionsArray.length * 83 + 1).append(sliderHtml).css('margin-left',margin).off('swiperight').on('swiperight',function(){return false;});
		}
    }
    
};