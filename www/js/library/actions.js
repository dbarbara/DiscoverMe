/**
 * Created by Dan on 07-Apr-15.
 */
/**
 * Create the actions for each individual page of the application
 */
var actions = {
    /**
     * index.html
     */
    index: function() {


        //Go to next page
        $('#home').unbind("click").click(function(event){
            functions.goTo("catSelectPrev.html");
            return false;
        });
    },
    catSelectPrev: function() {
        //Swipe / Click events

        $('#ui-overlay-a').bind('swipeleft',showNext);
        $('#ui-overlay-a').bind('swiperight',showPrev);

        $('.left-acc').unbind("click").click(function(event){
            showNext();
            return false;
        });
        $('.right-decline').unbind("click").click(function(event){
            showPrev();
            return false;
        });

        function showNext(){
            functions.goTo("category.html");
            return false;
        }

        function showPrev(){
            functions.goTo("index.html");
            return false;
        }
    },
    category: function(){

        functions.apicall("api","category",function(result) {

            $('#content-container').empty();

            var html='';
            html += '<input type="hidden" id="categoryId" />';

            $.each(result,function(k,v){
                html += '<a href="#" onclick="$(\'#categoryId\').val($(\'#categoryId\').val() + \',\' + ' + v.category + ');" class="left icon-small ' + v.name + '">' + v.name + '</a>';
            });
            html += '<input type="button" class="theNext" onclick="functions.goTo(\'shopSelectPrev.html?category=\' + functions.getCatsIds());" value="Next"/>';

            $('#content-container').append(html);
        });

    },
    shopSelectPrev: function(){
        //Swipe / Click events


        var UrlParts = functions.getUrlParts();
        var params = UrlParts.params;
        var nextParamsl;


        $.each(params,function(k,v){
            nextParams = "?" + k + "=" + v;
        });

        $('#list-shops').bind('swipeleft',showNext);
        $('#list-shops').bind('swiperight',showPrev);

        $('.left-acc').unbind("click").click(function(event){
            showNext();
            return false;
        });
        $('.right-decline').unbind("click").click(function(event){
            showPrev();
            return false;
        });

        function showNext(){
            functions.goTo("shops.html?"+nextParams);
            return false;
        }

        function showPrev(){
            functions.goTo("category.html");
            return false;
        }
    },
    shops: function(){

        var UrlParts = functions.getUrlParts();
        var params = UrlParts.params;
        var nextParams;
        var deviceId =  '';

        deviceId = '123456';
        //deviceId = device.uuid;


        $.each(params,function(k,v){
            nextParams =  v;
        });

        if(!nextParams){
            var categories = window.localStorage.getItem("category");
            if(!categories){
                functions.goTo("category.html");
            } else {
                nextParams = categories;
            }
        } else {
            window.localStorage.setItem("category", "" + nextParams + "");
        }

        functions.apicall("api","shops&category="+nextParams+"&deviceId="+deviceId+"&latitude=145.109312&longitude=-22.265021",function(result) {

            $('#content-container').empty();

            var html='';
            var locations = [];

            $.each(result,function(k,v){
                html += '<div class="list-box"><div class="list-img left"><img src="' + v.logoUrl + '" /></div><div class="list-right-holder left"><div class="left title-shop"><h1>' + v.name + '</h1></div><div class="left list-description">' + v.description + '</div></div><div class="left list-description-icon"><img src="img/white-house.png" alt="white-house" /></div><a class="overlay" href="#overlay1" onclick=\'functions.goTo("shop.html?shop='+ v.shopId+'");\'></a></div>';

                var location = {"latitude": v.location.latitude ,"longitude":v.location.longitude};
                locations.push(location);

                var localData = JSON.stringify(locations);
                window.localStorage.setItem('locations', localData);

            });

            $('#content-container').append(html);
        });
    },
    shop: function(){
        var UrlParts = functions.getUrlParts();
        var params = UrlParts.params;
        var nextParamsl;

        $.each(params,function(k,v){
            nextParams =  v;
        });

        functions.apicall("api","shop&shop="+nextParams,function(result) {

            $('#content-container').empty();

            var html='';

            $.each(result,function(k,v){
                html += '<div class="list-box clearfix"><div class="list-img left"><img src="' + v.logoUrl + '" /></div><div class="list-right-holder left"><div class="left title-shop"><h1>' + v.name + '</h1></div><div class="left list-description">' + v.longDescription + '</div></div><div class="left list-description-icon"><img src="img/white-house.png" alt="white-house" /></div><a class="overlay" href="#"></a></div><div class="list-box-advert clearfix"><div class="left title-shop-advert"><h1>ADVERT DESCRIPTION</h1></div><div class="list-right-holder-advert left"><div class="list-img-advert left"><img src="img/big-black-box.png" /></div></div><div class="left list-description-advert">' + v.description + '</div></div><div class="list-advert-btns"><div class="check-map-btn"><span class="left middle-globe"><img src="img/blue-globe.png" /></span><span class="left middle"><h1>CHECK MAP</h1></span><a class="overlay" href="map.html?latitude='+ v.location.latitude+'&longitude='+ v.location.longitude+'" onclick=\'functions.goTo("map.html?latitude='+ v.location.latitude+'&longitude='+ v.location.longitude+'");return false;\'></a></div><div class="arrows-map-btn"><span class="middle-arrows"><img src="img/3-arrows.png" /></span><a class="overlay" href="#overlayy"></a></div><div class="arrows-map-btn"><span class="middle-arrows"><img src="img/blue-heart.png" /></span><a class="overlay" href="directions.html"></a></div></div>';
            });

            $('#content-container').append(html);
        });
    },
    map: function(){
        var UrlParts = functions.getUrlParts();
        var params = UrlParts.params;
        var nextParams;
        var deviceId =  '';

        deviceId = '123456';
        //deviceId = device.uuid;

        var categories = window.localStorage.getItem("category");
        if(!categories){
            functions.goTo("category.html");
        }
    },
    maps: function(){

    },
    directions: function(){

    }
}