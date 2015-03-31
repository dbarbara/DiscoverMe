/**
 * Created by Dan on 31-Mar-15.
 */

var SNApp = {
    controllerName: "",
    pushNotification: null,
    isIOS: false, /*change this if testing on android*/
    position_listener: null,
    shown: false,
    init: function() {
        document.body.style.display = 'none';
        SNApp.loadScriptFileSyncronous('js/library/Config.js', 'js');

        /**
         * On ready listener- initialize the plugins
         */
        document.addEventListener("deviceready", function(){
            /*ANDROID SPECIFIC INITIALIZATION OF PLUGINS*/
            if(!SNApp.isIOS){
                /*intercept back navigation...*/
                document.addEventListener("backbutton", function(){
                    App_History.go_back();
                    return false;
                }, false);
            }

            /**
             * Initialize the push notifications
             */
            try{
                SNApp.pushNotification = window.plugins.pushNotification;
            } catch(e) {
                console.log('push notifications failed...');
            }

            /**
             * Dont allow geolocation on startup page or it may halt the initial loading!
             */
            if(navigator && navigator.geolocation) {
                if(!SNApp.position_listener){
                    setTimeout(function(){
                        try{
                            SNApp.position_listener = navigator.geolocation.watchPosition(
                                function(data){
                                    SNApp.checkPositionChange(data)
                                },
                                function(data){
                                    SNApp.positionChangeError(data)
                                },
                                {
                                    timeout: 5000,
                                    maximumAge: 3000,
                                    enableHighAccuracy: true
                                }
                            );
                        } catch(e) {
                            console.log('geolocation error : ',e);
                            navigator.geolocation = false; /*turn it off if it causes an error...*/
                        }
                    },6000);
                }
            }
        }, false);

        /**
         * Load the required JavaScript files
         */
        SNApp.loadScriptFileSyncronous('js/library/functions.js','js');
        SNApp.loadScriptFileSyncronous('js/library/SNStorage.js','js');
        SNApp.loadScriptFileSyncronous('js/library/SNApi.js','js');
        SNApp.loadScriptFileSyncronous('js/library/SNController.js','js');

        SNApp.loadControllerFiles(SNApp.getControllerName());

        /**
         * Date formatting
         * @param e
         * @returns {string}
         */
        Date.prototype.format=function(e){var t="";var n=Date.replaceChars;for(var r=0;r<e.length;r++){var i=e.charAt(r);if(r-1>=0&&e.charAt(r-1)=="\\"){t+=i}else if(n[i]){t+=n[i].call(this)}else if(i!="\\"){t+=i}}return t};Date.replaceChars={shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longMonths:["January","February","March","April","May","June","July","August","September","October","November","December"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longDays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],d:function(){return(this.getDate()<10?"0":"")+this.getDate()},D:function(){return Date.replaceChars.shortDays[this.getDay()]},j:function(){return this.getDate()},l:function(){return Date.replaceChars.longDays[this.getDay()]},N:function(){return this.getDay()+1},S:function(){return this.getDate()%10==1&&this.getDate()!=11?"st":this.getDate()%10==2&&this.getDate()!=12?"nd":this.getDate()%10==3&&this.getDate()!=13?"rd":"th"},w:function(){return this.getDay()},z:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil((this-e)/864e5)},W:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil(((this-e)/864e5+e.getDay()+1)/7)},F:function(){return Date.replaceChars.longMonths[this.getMonth()]},m:function(){return(this.getMonth()<9?"0":"")+(this.getMonth()+1)},M:function(){return Date.replaceChars.shortMonths[this.getMonth()]},n:function(){return this.getMonth()+1},t:function(){var e=new Date;return(new Date(e.getFullYear(),e.getMonth(),0)).getDate()},L:function(){var e=this.getFullYear();return e%400==0||e%100!=0&&e%4==0},o:function(){var e=new Date(this.valueOf());e.setDate(e.getDate()-(this.getDay()+6)%7+3);return e.getFullYear()},Y:function(){return this.getFullYear()},y:function(){return(""+this.getFullYear()).substr(2)},a:function(){return this.getHours()<12?"am":"pm"},A:function(){return this.getHours()<12?"AM":"PM"},B:function(){return Math.floor(((this.getUTCHours()+1)%24+this.getUTCMinutes()/60+this.getUTCSeconds()/3600)*1e3/24)},g:function(){return this.getHours()%12||12},G:function(){return this.getHours()},h:function(){return((this.getHours()%12||12)<10?"0":"")+(this.getHours()%12||12)},H:function(){return(this.getHours()<10?"0":"")+this.getHours()},i:function(){return(this.getMinutes()<10?"0":"")+this.getMinutes()},s:function(){return(this.getSeconds()<10?"0":"")+this.getSeconds()},u:function(){var e=this.getMilliseconds();return(e<10?"00":e<100?"0":"")+e},e:function(){return"Not Yet Supported"},I:function(){var e=null;for(var t=0;t<12;++t){var n=new Date(this.getFullYear(),t,1);var r=n.getTimezoneOffset();if(e===null)e=r;else if(r<e){e=r;break}else if(r>e)break}return this.getTimezoneOffset()==e|0},O:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+"00"},P:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+":00"},T:function(){var e=this.getMonth();this.setMonth(0);var t=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,"$1");this.setMonth(e);return t},Z:function(){return-this.getTimezoneOffset()*60},c:function(){return this.format("Y-m-d\\TH:i:sP")},r:function(){return this.toString()},U:function(){return this.getTime()/1e3}}

    },
    getControllerName: function() {
        if(this.controllerName.length > 0) {
            return this.controllerName;
        } else {
            /**
             * Load the controller name from the url
             */
            var urlParts = this.getUrlParts();
            if(urlParts.baseFileName) {
                this.controllerName = urlParts.baseFileName;
            } else {
                this.controllerName = 'index';
            }

            return this.controllerName;
        }
    },
    loadControllerFiles: function(controllerName) {
        this.loadScriptFileSyncronous('js/controllers/' + controllerName + '.js', 'js');
        this.loadScriptFileSyncronous('css/' + controllerName + '.css', 'css');
        /**
         * Show the page only when all the components have loaded
         */
        $('body').show();
    },
    initController: function() {
        try{
            console.log('SNApp initController');
            SNController.setupPageHandlers();
            var ctrlNameUcFirst = Functions.ucFirst(this.getControllerName());
            if(ctrlNameUcFirst == 'Index') {
                return;
            }
            if(typeof(eval('ctrlNameUcFirst')) != undefined) {
                eval("var controller = " + ctrlNameUcFirst + ".init();");
                if(!SNApp.getUrlParts().hash) {
                    /**
                     * Call the default indexAction
                     */
                    eval(ctrlNameUcFirst + '.indexAction();');
                }
            } else {
                console.log('controller object (' + this.getControllerName() + ') is undefined');
            }
        } catch(e) {
            SNApp.throw_error(e);
        }
    },
    loadScriptFile: function(filename, filetype, onLoadFunction) {
        if (filetype == "js") {
            /**
             * If filename is a external JavaScript file
             */
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
            fileref.onreadystatechange = onLoadFunction;
            fileref.onload = onLoadFunction;
        } else if (filetype == "css") {
            /**
             * If filename is an external CSS file
             */
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }

        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    },
    loadScriptFileSyncronous: function(filename, filetype) {
        if(filetype == 'js') {
            $.ajax({
                url: filename,
                dataType: "script",
                async: false
            });
        } else if (filetype == 'css') {
            $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', filename));
        }
    },
    getUrlParts: function() {
        var urlParsed = $.mobile.path.parseUrl(window.location.href);

        var baseFileHtml = urlParsed.filename;
        var hash = urlParsed.hash.replace("#","");
        var urlMatches = window.location.href.match(/([a-z0-9]+)\.([a-z]{2,4})(.*)/gi);
        var params = {};

        var urlNoHash = urlParsed.hrefNoHash;
        if(urlMatches[0].match(/#/)) {
            var hashes = urlMatches[0].split('#');
            if(hashes.length > 1) {
                urlNoHash = hashes[0];
                hash = hashes[1];
            }
        }
        if(urlParsed.search) {
            /*we have params*/
            var paramParts = urlParsed.search.replace('?','').split('&');
            for(var i=0; i < paramParts.length; i++) {
                var y = paramParts[i].split("=");
                if(y.length > 1) {
                    params[y[0]] = y[1];
                }
            }
        }
        var xx = baseFileHtml.split('.');
        var baseFileName = xx[0];
        var baseFileExtension = xx[1];
        return {
            "baseFileName" : baseFileName,
            "baseFileExtension" : baseFileExtension,
            "baseFileHtml" : baseFileHtml,
            "params" : params,
            "hash" : hash
        };
    },
    showDialog: function(message, noCloseBtn) {
        this.showPopup(message, {});
    },
    showPopup: function(message, options) {
        if(!options)
            options = {};
        /**
         * Create it in memory
         */
        var dlg = null;
        if($("#popup").length >= 1) {
            $("#popup").popup("close");
            $("#popup").popup("destroy");
            $("#popup").remove();
            $("#popup-screen").remove();
            $("#popup-popup").remove();
        }

        var title = '';
        if(options && options.title) title = options.title;

        if(!options || (options && !options.buttons)) {
            options.buttons = [{
                text: 'OK',
                func: function(){}
            }];
        }

        if($("#popup").length < 1) {
            var popup = "";
            popup += '<div data-role="popup" id="popup" data-overlay-theme="a" data-theme="c" class="ui-corner-all" data-dismissible="false">'
            + '<div data-role="header" data-theme="b" class="ui-corner-top">'
            + '<h3 class="l_m" style="text-align: center;">' + title + '</h3>'
            + '</div>'
            + '<div class="center-wrapper">'
            + '<div data-role="content" data-theme="d" class="ui-corner-bottom ui-content">'
            + '<h3 class="ui-title">' + message + '</h3>';
            /**
             * Add buttons
             */
            if(options && options.buttons) {
                $.each(options.buttons, function(idx, btn) {
                    popup += '<a id="btn' + idx +'" href="#" data-role="button" data-inline="true" data-rel="back" data-theme="c">' + btn.text + '</a>';
                });
            }
            popup += 	   '</div>'
            + '</div>'
            + '</div>';

            $(popup).appendTo($.mobile.pageContainer);
            /**
             * Initialize window
             */
            $("#popup").trigger(
                "create"
            ).popup({
                    positionTo: 'window',
                    shadow: true,
                    dismissible: false
                }).popup(
                "open"
            );
            $("#popup-popup").css('left',0);

            /**
             * Add button listeners
             */
            if(options && options.buttons) {
                $.each(options.buttons, function(idx, btn) {
                    $("#btn" + idx).bind("click", function(){
                        if(btn.func){
                            setTimeout(function(){
                                btn.func();
                            },50);
                        }
                    });
                });
            }
        }

    },
    confirmDialog: function(elemId, title, message, btn1Func, btn2Func) {
        this.showPopup(message, {
            'title': title,
            buttons: [
                {text: 'No', func: btn1Func},
                {text: 'Yes', func: btn2Func}
            ]
        });
    },
    badgeNumber: function(number){
        /*only works on ios*/
        if(SNApp.isIOS && SNApp.pushNotification){
            SNApp.pushNotification.setApplicationIconBadgeNumber(
                function(success){},
                function(failure){},
                number
            );
        }
    },
    /**
     * Creates the slider menu if it doesn't exist, otherwise it opens it.
     */
    sliderMenu: function() {

        var activePage = $.mobile.activePage;
        if($("#mypanel",activePage).length) {
            $("#mypanel",activePage).panel("open");
        } else {
            var lastNotebookId = SNStorage.getValue("lastNotebookId");
            var lastNotebookType = SNStorage.getValue('lastNotebookType');
            $("#mypanel",activePage).panel("open");
            SNApp.createSliderMenu(activePage, lastNotebookId, lastNotebookType);
        }
    },
    createSliderMenu: function(activePage, lastNotebookId, lastNotebookType) {
        var panel = '';
        panel += '<div data-role="panel" id="mypanel" data-position="left" data-display="push">';
        panel += '<div class="shadow"></div>';
        panel += '<p style="margin:0;">';
        url = 'homefeedback.html#dashboardSS';

        if(!SNStorage.getValue('SSUser') && !SNApp.SS_User){
            url = 'robot.html#dashboardBA';
        }
        /*case where it is a buyer user...*/
        if(!App_State.isSRUser() && !App_State.isSSUser() && !App_State.isSellerUser() ){
            url = 'notebooks.html#index';
        }

        if(App_State.isdemoUser()){
            panel += '<a href="users.html#login" rel="external" data-role="button" class="orange_button"><span class="m_m">L</span><span class="l_s">OGIN<span></a>';
        }
        if(!App_State.isSellerUser()){

            var currentPage = document.location.href.match(/[^\/]+$/)[0];
            var currentPageName = currentPage.split("#");
            if(currentPageName[1]=='dashboardSS'){
                panel += '<a href="" rel="external" data-role="button" class="Dashboard"><span class="m_m">H</span><span class="l_s" onclick="$(\'#mypanel\').panel(\'close\');">OME<span></a>';
            } else {
                panel += '<a href="'+url+'" rel="external" data-role="button" class="Dashboard"><span class="m_m">H</span><span class="l_s" onclick="console.log(1);">OME<span></a>';
            }



        }
        panel += '<a href="legal.html#notifications'+'?date=' + Date.parse(new Date()) + '" rel="external" data-role="button" class="Notifications"><span class="m_m">N</span><span class="l_s">OTIFICATIONS<span><span id="no" style="display:none;">-</span></a>';
        if(App_State.isSRUser() && !App_State.isSSUser()){
            panel += this.showing_robot_menu();
            if(!App_State.isdemoUser()){
                panel += this.homefeedback_menu();
            }
        } else {
            /*Showing Suite*/
            panel += this.homefeedback_menu();
            if(!App_State.isdemoUser()){
                /*Showing Robot*/
                panel += this.showing_robot_menu();
            }
        }
        /*Showing Note*/
        panel += '<div class="showingNote"><p onClick="SNApp.toggleSN($(this).parent());" rel="external" data-role="button" class="Title" style="background-image:none;"><span class="cross">&nbsp;</span><span class="m_m">S</span><span class="l_s">HOWING <span class="m_m">N</span>OTE</span></p>';
        subdued = !SNStorage.getValue("notebook_name") ? 'subdued sn':'';
        panel += '<a href="notebooks.html?notebookId='+SNStorage.getValue("notebookId")+'#notebookDashboard" rel="external" data-role="button" class="SN_Dashboard '+subdued+'"><span class="m_m">D</span><span class="l_s">ASHBOARD<span></a>';
        panel += '<a href="notebooks.html#index" rel="external" data-role="button" class="Notebooks"><span class="m_m">N</span><span class="l_s">OTEBOOKS</span></a>';
        panel += '<a href="notebooks.html#checkIn" rel="external" data-role="button" class="Check_In '+subdued+'"><span class="m_m">C</span><span class="l_s">HECK </span><span class="m_m">I</span><span class="l_s">N<span></a>';
        panel += '<a href="notebooks.html#myShowings" rel="external" data-role="button" class="Showings '+subdued+'"><span class="m_m">S</span><span class="l_s">HOWINGS</span></a>';
        panel += '<a href="listings.html#favorites" rel="external" data-role="button" class="Favorites '+subdued+'"><span class="m_m">F</span><span class="l_s">AVORITES</span></a>';

        panel += '<a href="users.html?date=' + Date.parse(new Date()) + '#myAccount" rel="external" data-role="button" class="SN_Account '+subdued+'"><span class="m_m">M</span><span class="l_s">Y <span><span class="m_m">A</span><span class="l_s">CCOUNT<span></a>';
        panel += '<a href="legal.html?open=showing_note#trialInfo" rel="external" data-role="button" class="More_Info"><span class="m_m">M</span><span class="l_s">ORE<span> <span class="m_m">I</span><span class="l_s">NFORMATION<span></a>';
        panel += '</div>';
        /*More*/
        panel += '<div class="More"><p onClick="SNApp.toggleMore($(this).parent());" rel="external" data-role="button" class="Title"><span class="cross">&nbsp;</span><span class="m_m">M</span><span class="l_s">ORE</p>';
        panel += '<a href="#" onclick="SNApp.emails.sendEmailType(\'invite\');" \n\
						rel="external" data-role="button" class="Invite_A_Friend"><span class="m_m">I</span><span class="l_s">NVITE<span> A <span class="m_m">F</span><span class="l_s">RIEND<span></a>';
        panel += '<a href="' + (SNApp.isIOS ? 'itms-apps://itunes.apple.com/app/id493912978' : 'market://details?id=com.ShowingSuite.mobile.agent.iPhone') + '" rel="external" data-role="button" class="Rate_This_App"><span class="m_m">R</span><span class="l_s">ATE<span> THIS <span class="m_m">A</span><span class="l_s">PP<span></a>';
        panel += '<a href="#" onclick="SNApp.emails.sendEmailType(\'report\');" \n\
						rel="external" data-role="button" class="Report_A_Problem"><span class="m_m">R</span><span class="l_s">EPORT<span> A <span class="m_m">P</span><span class="l_s">ROBLEM<span></a>';
        panel += '<a href="#" onclick="SNApp.emails.sendEmailType(\'request\')" \n\
						rel="external" data-role="button" class="Feature_Suggestion"><span class="m_m">F</span><span class="l_s">EATURE<span> <span class="m_m">S</span><span class="l_s">UGGESTION<span></a>';
        panel += '<a href="#" onClick="SNApp.logout();" rel="external" data-role="button" class="Logout"><span class="m_m">L</span><span class="l_s">OGOUT<span></a>';
        panel += '</div>';

        /*add listeners here for popups...*/
        if(App_State.isdemoUser()){
            panel += '<p rel="external" data-role="button" class="Title orange_button bottom_button"><span class="m_m">D</span><span class="l_s">EMO<span> <span class="m_m">A</span><span class="l_s">CCOUNTS</span></p>';
            if(!App_State.isSSUser()){
                panel += '<a onClick="SNApp.demo.popup(\'Listing_Agent\');" rel="external" data-role="button" class="orange_button"><span class="m_m">L</span><span class="l_s">ISTING</span><span class="m_m"> A</span><span class="l_s">GENT</span></a>';
            }
            if(!App_State.isSRUser()){
                panel += '<a onClick="SNApp.demo.popup(\'Buyer_Agent\');" rel="external" data-role="button" class="orange_button"><span class="m_m">B</span><span class="l_s">UYER</span><span class="m_m"> A</span><span class="l_s">GENT</span></a>';
            }
            if(!App_State.isSellerUser()){
                panel += '<a onClick="SNApp.demo.popup(\'Seller\');" rel="external" data-role="button" class="orange_button"><span class="m_m">S</span><span class="l_s">ELLER</span><span class="m_m"></a>';
            }
            if(App_State.isSSUser() || App_State.isSRUser() || App_State.isSellerUser()){
                panel += '<a onClick="SNApp.demo.popup(\'Buyer\');" rel="external" data-role="button" class="orange_button"><span class="m_m">B</span><span class="l_s">UYER</span></a>';
            }
        }
        panel += '<p style="margin:0;" class="all_instructions"><a href="legal.html?open=listing_agent,buyers_agent,seller,showing_note#trialInfo" rel="external" data-role="button" class="orange_button"><span class="m_m">A</span><span class="l_s">LL<span> <span class="m_m">I</span><span class="l_s">NSTRUCTIONS<span></a></p>';

        panel += '</div>';

        /*update notifcations badge*/
        this.notifications.count();

        $(panel).appendTo(activePage);

        $("#mypanel",activePage).panel({
            beforeopen: function( event, ui ) {
                activePage.unbind('click');
            }
        }).trigger("create");

        setTimeout(function(){
            $("#mypanel",activePage).panel("toggle");
        },10); /*gives the page some time to create the panel*/

        if(!App_State.isSSUser()){
            $("#mypanel .ui-panel-inner").off("click").on("click",".subdued.ss,.Title.ss",function(){
                SNApp.login_popup('Showing Suite','Email');
                $('#popup .login_id').val(SNStorage.getValue('ssUsername') ? SNStorage.getValue('ssUsername') : '');
                $('#popup .login_password').val(SNStorage.getValue('ssUsername') ? SNStorage.getValue('ssUsername') : '');
                return false;
            });
        }
        if(!App_State.isSRUser()){
            $("#mypanel .ui-panel-inner").on("click",".subdued.sr,.Title.sr",function(){
                SNApp.login_popup('Showing Robot','Phone #');
                $('#popup .login_id').val(SNStorage.getValue('srphone') ? SNStorage.getValue('srphone') : '');
                $('#popup .login_password').val(SNStorage.getValue('srpassword') ? SNStorage.getValue('srpassword') : '');
                return false;
            });
        }
        $("#mypanel .ui-panel-inner").on("click",".subdued.sn",function(){
            /*button 1: cancel- does nothing*/
            /*button 2: ok- goes to notebook page*/
            var options = {
                buttons:[
                    {idx:"1",text:"Cancel",func:function(){}},
                    {idx:"2",text:"OK",func:
                        function(){
                            SNController.goTo("notebooks.html", "index");
                        }
                    }
                ]
            };
            SNApp.showPopup('You must select a notebook first!',options);
            return false;
        });
        $("#mypanel .ui-panel-inner").on("click","a",function(){
            if(this.href == window.location.href){
                SNApp.success_login();
            }
        });

        /*expand sections as necessary*/
        if(App_State.SNOpen() || (App_State.isdemoUser() && App_State.isSNUser())){
            var container = $('#mypanel .showingNote');
            var totalHeight = container.outerHeight() * 8 - 2;
            $(container).addClass('no_show').height(totalHeight).toggleClass('active');
            setTimeout(function(){$(container).removeClass('no_show')},10);
            var temp = $('.showingNote.active .Title .cross');
            temp.length > 0 ? false : $(container).attr('style','');
        }

        if(App_State.moreOpen() && !App_State.isdemoUser()){
            var container = $('#mypanel .More');
            var totalHeight =  container.outerHeight() * 6 - 2;
            $(container).height(totalHeight).addClass('no_show').toggleClass('active').hide();
            setTimeout(function(){
                $(container).removeClass('no_show').show();
            },10);
            var temp = $('.More.active .Title .cross');
            temp.length > 0 ? false : $(container).attr('style','');
        }
    },
    toggleMore: function(container,noScroll){
        var totalHeight = 0;
        console.log(container);
        $(container).children().each(function(){
            totalHeight += $(this).outerHeight();
        });
        $(container).toggleClass('active').height(totalHeight);
        var temp = $('.More.active .Title .cross');
        temp.length > 0 ? false : $(container).attr('style','');
        if($(container).hasClass('active') && !noScroll){
            $('#mypanel').animate({scrollTop: 1000}, 800);
        }
        App_State.toggleMore();
    },
    homefeedback_menu: function(){
        var panel = '';
        if(!App_State.isSellerUser() && (App_State.isSSUser() || App_State.isSRUser() )){
            panel += '  <p rel="external" data-role="button" class="Title ss"><span class="m_m">L</span><span class="l_s">ISTING <span class="m_m">A</span>GENT</span></p>';
            var subdued = (!SNStorage.getValue('SSUser') && !SNApp.SS_User) ? 'subdued ss' : '';
            panel += '<a href="homefeedback.html#dashboardSS" rel="external" data-role="button" class="SN_Dashboard '+subdued+'"><span class="m_m">D</span><span class="l_s">ASHBOARD<span></a>';
            panel += '<a href="homefeedback.html#index" rel="external" data-role="button" class="Homefeedback '+subdued+'"><span class="m_m">M</span><span class="l_s">Y</span><span class="m_m"> L</span><span class="l_s">ISTINGS</span></a>';
            panel += '<a href="homefeedback.html#showings" rel="external" data-role="button" class="Calendar '+subdued+'"><span class="m_m">M</span><span class="l_s">Y</span><span class="m_m"> S</span><span class="l_s">HOWINGS<span></a>';
            /*moved to my showings page at the top*/
            /*panel += '<a href="homefeedback.html#newShowing" rel="external" data-role="button" class="Schlage '+subdued+'"><span class="m_m">N</span><span class="l_s">EW <span><span class="m_m">S</span><span class="l_s">HOWING</span></a>';*/
            panel += '<a href="contacts.html#index" rel="external" data-role="button" class="Contacts '+subdued+'"><span class="m_m">C</span><span class="l_s">ONTACTS<span></a>';
            panel += '<a href="homefeedback.html#lockbox" rel="external" data-role="button" class="Lockbox '+subdued+'"><span class="m_m">L</span><span class="l_s">OCKBOX<span></a>';
            panel += '<a href="homefeedback.html#settings" rel="external" data-role="button" class="My_Account '+subdued+'"><span class="m_m">S</span><span class="l_s">ETTINGS<span></a>';
            panel += '<a href="legal.html?open=listing_agent#trialInfo" rel="external" data-role="button" class="More_Info"><span class="m_m">M</span><span class="l_s">ORE<span> <span class="m_m">I</span><span class="l_s">NFORMATION<span></a>';
        } else if(App_State.isSellerUser()){
            panel += '  <p rel="external" data-role="button" class="Title"><span class="m_m">S</span><span class="l_s">ELLER</span></p>';
            panel += '<a href="seller.html#index" rel="external" data-role="button" class="SN_Dashboard '+subdued+'"><span class="m_m">D</span><span class="l_s">ASHBOARD<span></a>';
            panel += '<a href="seller.html#showings" rel="external" data-role="button" class="Schlage"><span class="m_m">S</span><span class="l_s">HOWINGS<span></a>';
            panel += '<a href="calendar.html#showings" rel="external" data-role="button" class="Calendar"><span class="m_m">C</span><span class="l_s">ALENDAR<span></a>';
            panel += '<a href="legal.html?open=seller#trialInfo" rel="external" data-role="button" class="More_Info"><span class="m_m">M</span><span class="l_s">ORE<span> <span class="m_m">I</span><span class="l_s">NFORMATION<span></a>';
        }
        return panel;
    },
    turnOnLocationServicesDialog: function () {
        var text = "ShowingNote needs to know where you are so you can check-in at this showing.";
        SNApp.showPopup(text, {"title" : "Turn on Location Services",
            "buttons" : [
                { text: 'Settings', func:
                    function() {
                        /*TODO : When is this used and why is it implemented incorrectly?!*/
                        setTimeout(function() {
                            SNController.goTo("go to settings");
                        }, 10);
                    }
                }, { text: 'Cancel', func:
                    function() {
                        setTimeout(function() {
                            this.close();
                        }, 10);
                    }
                }
            ]
        });
    },
    checkPositionChange: function(newPosition) {
        var lastCheckinPos = SNStorage.getValue('lastCheckinPos');
        if(lastCheckinPos && newPosition && SNApp.position_listener) {
            console.log('Checking position change...',newPosition);
            /*check distance from last checkin*/
            var distanceFromLastCheckIn = Functions.getDistanceFromLatLonInFeet(lastCheckinPos.lat, lastCheckinPos.lng, newPosition.coords.latitude, newPosition.coords.longitude);
            console.log('Distance from last checkin' + distanceFromLastCheckIn);
            if( distanceFromLastCheckIn >= 1000) {
                console.log('CHECKOUT CALLED!');
                navigator.geolocation.clearWatch(SNApp.position_listener);
                SNApp.position_listener = null;
                /*Should send feedback notification*/
                App_State.checked_out();
                /*remove any checkout buttons that may exist*/
                $('.checkout_button').remove();
            }
        }
    },
    positionChangeError: function(error) {
        /*throw "positionChangeError called";*/
    },

    /**
     * This object handles messages that push notifications might provide while the user has the app open
     */
    notify_user: function(message,type,listingID,notebookID){
        /*do not create popup if:
         one is already up- this could cause major bugs!
         the app is currently updating- who knows what could happen if you navigate out of an update?
         the app is offline- it could cause some stability issues or take a long time to load (slow response)
         the notebook id is wrong- sometimes the wrong notebook is sent out for a push*/
        if($('.ui-popup-active').length == 0 && !Offline_Command_Queue.is_Updating ){
            var options = {title:"Notification!",buttons:[{idx:"1",text:"VIEW LATER",func:function(){}},{idx:"2",text:"VIEW NOW",func:function(){
                /*handle url call...*/
                switch(type){
                    case "L":
                        handleOpenURL("snnotifications://listings/single_listing/go_to_listing?listing_id="+listingID+"&notebook_id="+notebookID);
                        break;
                    case "F":
                        handleOpenURL("snnotifications://listings/predefined_notes/give_feedback?listing_id="+listingID+"&notebook_id="+notebookID);
                        break;
                    case "N":
                        handleOpenURL("snnotifications://users/notifications/status_change?listing_id="+listingID+"&notebook_id="+notebookID);
                        break;
                }
            }}]};
            SNApp.showPopup(message,options);
        } else {
            console.log("Push Notification received, but could not display!");
        }
    },

    throw_error: function(e){
        var page = " Location:"+Functions.ucFirst(this.getControllerName()+" : "+SNApp.getUrlParts().hash);
        console.log('ERROR :',e);
        /*alert use of the error -*/
        // alert(e);
    }
};

function handleOpenURL(url)
{
    /*if logged in...*/
    if(SNApp.isLoggedSSUser()) {
        url = url.replace('snnotifications://',''); /*get rid of the url scheme so that we can parse the parts...*/
        var base = url.substr(0,url.indexOf("/"));
        url = url.substr(url.indexOf("/")+1,url.length);
        var page = url.substr(0,url.indexOf("/"));
        url = url.substr(url.indexOf("/")+1,url.length);
        var command = url.substr(0,url.indexOf("?"));
        if(command){
            try{
                if(url.indexOf("?")){
                    url = url.substr(url.indexOf("?")+1,url.length);
                    var variables_string = url;
                    variables = [];
                    while(variables_string.indexOf('&') != -1){
                        /*parse the variables...*/
                        temp_string = variables_string.substr(0,variables_string.indexOf('&'));
                        variables_string = variables_string.substr(variables_string.indexOf('&')+1,variables_string.length);
                        var id = temp_string.substr(0,temp_string.indexOf('='));
                        var value = temp_string.substr(temp_string.indexOf('=')+1,temp_string.length);
                        variables[id] = value;
                    }
                    /*parse the last variable (if there is at least one)...*/
                    if(variables_string.indexOf('=') != -1){
                        var id = variables_string.substr(0,variables_string.indexOf('='));
                        var value = variables_string.substr(variables_string.indexOf('=')+1,variables_string.length);
                        variables[id] = value;
                    }
                    /*execute command using variables and then go to page*/
                    execute_url_command(command,variables,base,page);
                }
                else{
                    throw "Showing Note does not recognize this url...";
                }
            }catch(e){
                SNApp.throw_error(e);
            }
        }
        else{
            if(page=="notification_settings" && base=="users"){
                var notifications = {
                    email_alert_price_change: "2",
                    email_alert_renting_sharing_req: "2",
                    email_alert_sharing_req: "2",
                    email_alert_sold: "2",
                    email_alert_under_contract: "2",
                    email_alert_back_on_market: "2"
                }
                page = "notificationsSettings";
                /*do an update...*/
                SNApi.usersSaveNotificationsSettings(notifications, function(data) {
                    SNApp.showPopup("You are now unsubscribed from emails");
                });
            }else{
                SNController.goTo(base+".html",page);
            }
        }
    }
    else{
        /*go to login page...*/
        document.location = "users.html#login";
    }
}

function execute_url_command(command,variables,base,page){
    /*Currently the different commands all redirect to the listing, no preprocessing is needed yet.*/
    switch(command){
        case 'status_change':
            console.log('status_change command called...');
            break
        case 'price_change':
            console.log('price_change command called...');
            break
        case 'view_notes':
            console.log('view_notes command called...');
            break
        case 'give_feedback':
            console.log('give_feedback command called...');
            break
        case 'go_to_listing':
            console.log('go_to_listing command called...');
            break
        default:
            alert('Showing Note does not understand this URL...');
    }
    set_listing_notebook_goto(variables['listing_id'],variables['notebook_id'],base,page);
}
/*its just safer to make sure that a notebook and listing are set when using the url handling*/
function set_listing_notebook_goto(listing_id,notebook_id,base,page){
    /*set the notebook*/
    if(notebook_id){
        notebook_id = parseInt(notebook_id, 10);
        SNApi.notebooksDetails(notebook_id, function(notebook_data) {
            SNStorage.setValue("lastNotebookId", notebook_id);
            SNStorage.setValue("notebookId", notebook_id), /*is a duplicate- need to make this universal for stability...*/
                SNStorage.setValue("lastNotebookType",notebook_data.notebook.type);
            SNStorage.setValue("notebook_name",notebook_data.notebook.name);
            if(!(notebook_data.notebook.name == 'Sample Purchase House' || notebook_data.notebook.name == 'Sample Rental')){
                App_State.view_own_notebook();
            } else {
                App_State.view_sample_notebook();
            }
            /*set the listing...*/
            if(listing_id != '-1'){
                SNApi.listingsMlsInfo(listing_id,function(listing_data){
                    SNStorage.setValue('current_listing',listing_data);
                    /*goto page...*/
                    SNController.goTo(base + '.html?listingID=' + listing_id,page);
                });
            } else { /*case where the listing id is not needed...*/
                if(notebook_data.listing && notebook_data.listing.id){
                    SNStorage.setValue('current_listing',notebooks_data.listing);
                }
            }
        });
    } else {
        SNController.goTo(base + ".html",page); /*case where no notebook id is passed*/
    }
}

var App_History = {
    is_going_back : false,

    init: function(){
        console.log('Init App_History Object');
        if(SNStorage.getValue('history_array')){
            if(!App_History.is_going_back()){
                App_History.append_history();
            }
        }
        else{
            App_History.reset();
            App_History.init();
        }
    },
    reset: function(){
        console.log('Resetting App_History...');
        SNStorage.setValue('history_array',[]);
    },
    go_back: function(){
        if(App_History.can_go_back()){
            console.log('Going Back...');
            /*pop from the history array and save it...*/
            var temp_array = SNStorage.getValue('history_array');
            temp_array.pop();
            SNStorage.setValue('history_array',temp_array);
            /*set state for navigation*/
            SNStorage.setValue('A_H_back',true);
            window.history.back(SNStorage.getValue('history_array'));
        }
        console.log();
    },
    is_going_back: function(){
        if(SNStorage.getValue('A_H_back')){
            SNStorage.setValue('A_H_back',false); /*reset value*/
            return true;
        }
        else{
            return false;
        }
    },
    append_history: function(){
        console.log('Appending current page to App_History');
        var temp_array = SNStorage.getValue('history_array');
        var url = SNApp.getUrlParts();
        temp_array.push(url.baseFileName+'#'+url.hash);
        SNStorage.setValue('history_array',temp_array);
    },
    can_go_back: function(){
        var temp_array = SNStorage.getValue('history_array');
        if(temp_array && (temp_array.length<2 && (temp_array[0]=='notebooks#index' || temp_array[0]=='homefeedback#dashboardSS' || temp_array[0]=='robot#dashboardBA' || temp_array[0]=='seller#showings' || temp_array[0]=='legal#trialInfo' || App_State.isdemoUser()))){
            return false;
        } else {
            return true;
        }
    }
}

/*android notification handler*/
function onNotificationGCM(e) {
    console.log('NOTIFICATION EVENT CALLBACK:',e);
    switch( e.event )
    {
        case 'registered':
            console.log('REGISTERED EVENT!');
            if ( e.regid.length > 0 ){
                var lastNotebookId = SNStorage.getValue('lastNotebookId');
                SNApi.usersSaveDeviceToken(e.regid, function(data){
                    if(lastNotebookId) {
                        SNController.goTo("notebooks.html?notebookId=" + lastNotebookId, "index");
                    } else {
                        SNController.goTo("notebooks.html","index");
                    }
                });
            }
            break;
        case 'message':
            /*if this flag is set, this notification happened while we were in the foreground.
             you might want to play a sound to get the user's attention, open up a dialog, etc.*/
            if (e.foreground) {
                /*if the notification contains a soundname, play it.*/
                var my_media = new Media("/android_asset/www/"+e.soundname);
                my_media.play();
            } else {
                /*otherwise we were launched because the user touched a notification in the notification tray.*/
                if (e.coldstart)
                    console.log('cold start');
                else
                    console.log('background notification');
            }
            console.log("MSG: " + e.payload.message);
            console.log("MSGCNT: " + e.payload.msgcnt);
            break;
        case 'error':
            console.log('ERR : ' + e.msg); break;

        default:
            console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
    }
}

try{
    SNApp.init();
    window.onload = function(e){
        SNApp.initController();
    }
    /*check to make sure that page shown event has been triggered- else trigger it*/
    setTimeout(function(){
        if(!SNApp.shown){
            $('.ui-page-active').trigger('pageshow');
        }
    },2000);
}catch(e){
    SNApp.throw_error(e);
}