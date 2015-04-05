/**
 * Created by Dan on 31-Mar-15.
 */
var Index = $.extend(SNController,	{
	init: function() {
		console.log('init ... ');
	},
	indexAction: function() {

		SNApi.indexCategories(function(data) {
            $.each(data, function(k,v){
                console.log(11);
                console.log(v);
                $("#wrap").append(v);
            })
        });
	}
});