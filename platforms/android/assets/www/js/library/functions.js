var functions = {

    getUrlParts: function () {
        var urlParsed = $.mobile.path.parseUrl(window.location.href);

        var baseFileHtml = urlParsed.filename;
        var hash = urlParsed.hash.replace("#", "");
        var urlMatches = window.location.href.match(/([a-z0-9]+)\.([a-z]{2,4})(.*)/gi);
        var params = {};

        var urlNoHash = urlParsed.hrefNoHash;
        if (urlMatches[0].match(/#/)) {
            var hashes = urlMatches[0].split('#');
            if (hashes.length > 1) {
                urlNoHash = hashes[0];
                hash = hashes[1];
            }
        }
        if (urlParsed.search) {
            /*we have params*/
            var paramParts = urlParsed.search.replace('?', '').split('&');
            for (var i = 0; i < paramParts.length; i++) {
                var y = paramParts[i].split("=");
                if (y.length > 1) {
                    params[y[0]] = y[1];
                }
            }
        }
        var xx = baseFileHtml.split('.');
        var baseFileName = xx[0];
        var baseFileExtension = xx[1];
        return {
            "baseFileName": baseFileName,
            "baseFileExtension": baseFileExtension,
            "baseFileHtml": baseFileHtml,
            "params": params,
            "hash": hash
        };
    },

    /**
     * Get the geolocation of the device
     */
    getGeoLocation: function(){
        /**
         * Check the geolocation service
         */

        if ("geolocation" in navigator) {
            var watchID = null;
            // Throw an error if no update is received every 30 seconds
            var options = { timeout: 30,enableHighAccuracy: true };

            console.log("Checking if the Location Service is on ...");
            watchID = navigator.geolocation.watchPosition(
                                                            // onSuccess Geolocation
                                                            function onSuccess(data) {
                                                                console.log("Location Service is on -> save geolocation to local storage.");
                                                                window.localStorage.setItem("geolocation", {"lat":data.coords.latitude,"long":data.coords.longitude});
                                                            },
                                                            function onError(data) {},
                                                            options
                                                            );

        } else {
            console.log("Location Service is off -> notify the user to turn on his Location Service");
            var text = "DiscoverMe needs to know where you are so you can get the shops that are near you.";
            functions.showPopup(text, {"title" : "Turn on Location Services",
                "buttons" : [
                    { text: 'OK', func:
                        function() {
                            this.close();
                        }
                    }
                ]
            });
        }

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
    goTo: function(htmlPage) {
        var newUrl = htmlPage;
        /*look into implementing page transitions*/
        //$.mobile.changePage( "#index", { transition: "slideup", changeHash:true }, true);
        $.mobile.changePage( newUrl, { transition: "slide", changeHash:true,reloadPage:true }, true);

        //window.document.location = newUrl;
    },
    apicall: function(controller,params,callback){
        var serviceUrl = Config.get().api_baseUrl + "/" + controller + '.php?action=' + params;
        $.ajax({
            url: serviceUrl,
            success: function(response) {
                callback(JSON.parse(response));
            }
        });
    },
    getCatsIds: function(){
        var CatsIds =  $("#categoryId").val();
        CatsIds =  CatsIds.substring(1, CatsIds.length);
        functions.goTo("shopSelectPrev.html?category=" + CatsIds);
    }
}