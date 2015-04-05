/**
 * Created by Dan on 31-Mar-15.
 */
var Index = $.extend(SNController,	{
	init: function() {
		console.log('init ... ');
	},
	indexAction: function() {
	console.log('index');
		SNApi.indexCategories(function(data) {
                console.log(data);
            });
	}
});