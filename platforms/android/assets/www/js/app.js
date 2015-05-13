/**
 * Created by Dan on 31-Mar-15.
 */

var app = {
    /**
     * Application Constructor
     */
    initialize: function() {
        console.log("Initializing ...");
        //Load specific js files
        this.loadScriptFileSyncronous('js/jquery/jquery.mobile-1.4.5.js', 'js');
        this.loadScriptFileSyncronous('js/jquery/jquery-ui.min.js', 'js');

        this.loadScriptFileSyncronous('js/library/actions.js', 'js');

        this.loadScriptFileSyncronous('js/library/config.js', 'js');
        this.loadScriptFileSyncronous('js/library/functions.js', 'js');

        this.loadScriptFileSyncronous('css/library/jquery.mobile-1.4.5.min.css', 'css');
        this.loadScriptFileSyncronous('css/library/jquery-ui.min.css', 'css');

        this.bindEvents();
    },

    /**
     * Load script files
     */
    loadScriptFileSyncronous: function(filename, filetype) {
        console.log("Loading files...");
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

    /**
     * Bind Event Listeners
     * Bind any events that are required on startup. Common events are:
     * 'load', 'deviceready', 'offline', and 'online'
     */
    bindEvents: function() {
        //TODO ~ comment this when testing on device
        this.onDeviceReady();
        //document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    /**
     * Deviceready Event Handler
     */
    onDeviceReady: function() {

        //Get the Geolocation
        functions.getGeoLocation();

        console.log("Reading Url parts ...")
        //Get the page name to be able to execute corresponding action
        var UrlParts = functions.getUrlParts();
        var baseFileName = UrlParts.baseFileName;
        var params = UrlParts.params;

        //Call page specific action
        console.log("Calling page specific action ...");
        actions[baseFileName]();
    }
};
