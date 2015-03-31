var Functions = {
	ucFirst: function(text) {
		return text.replace(/\b[a-z]/g, function(letter) {
		    return letter.toUpperCase();
		});
	},
	toTitleCase: function(str)
	{
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	},
    commaSeparateNumber: function(val){
        while (/(\d+)(\d{3})/.test(val.toString())){
            val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        return val;
    },
	/*geolocation functions - used for automatic checkout*/
	getDistanceFromLatLonInKm: function(lat1,lon1, lat2,lon2) {
	  var R = 6371; /*Radius of the earth in km*/
	  var dLat = Functions.deg2rad(lat2-lat1);  /*deg2rad below*/
	  var dLon = Functions.deg2rad(lon2-lon1); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(Functions.deg2rad(lat1)) * Math.cos(Functions.deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; /*Distance in km*/
	  return d;
	},
	getDistanceFromLatLonInFeet: function(lat1,lon1, lat2,lon2) {
		return Functions.getDistanceFromLatLonInKm(lat1,lon1, lat2,lon2) * 3280;
	},
	deg2rad: function (deg) {
		return deg * (Math.PI/180)
	}
};

/*
	App_State:
		-Used to keep track of the user types that are logged in, whether the user is viewing a demo account, and more.
			*if you want to do an action each time a state changes then you should implement it here.
*/
var App_State = {
	setState: function(States){
		$.each(States,function(index,value){
			console.log('Changing State: '+value);
			eval('App_State.'+value+'()');
		});
	},
	user: function(){
		return SNStorage.getValue('user');
	},
	hasOverlayed: function(){
		return SNStorage.getValue('overlay');
	},
	overlayed: function(){
		SNStorage.setValue('overlay',true);
	},
	needsOverlay: function(){
		SNStorage.setValue('overlay',false);
	},
	/*demo user state*/
	isdemoUser: function(){
		return SNStorage.getValue('demoUser');
	},
	nonDemoUser:function(){
		SNStorage.setValue('demoUser',false);
	},
	demoUser: function(){
		SNStorage.setValue('demoUser',true);
	},
	set_agent_user: function(){
		SNStorage.setValue('user', 'Agent');
	},
	set_buyer_renter_user: function(){
		SNStorage.setValue('user', 'Buyer_Renter');
	},
	SSUser: function(){
		SNStorage.setValue('SSUser',true);
	},
	nonSSUser: function(){
		SNStorage.setValue('SSUser',false);
	},
	isSSUser: function(){
		return SNStorage.getValue('SSUser');
	},
	isSREnabled: function(){
		return SNStorage.getValue('SREnabled');
	},
	SREnabled: function(){
		SNStorage.setValue('SREnabled',true);
	},
	SRDisabled: function(){
		SNStorage.setValue('SREnabled',false);
	},
	nonSNUser:function(){
		SNStorage.setValue('SNUser',false);
	},
	SNUser: function(){
		SNStorage.setValue('SNUser',true);
	},
	isSNUser: function(){
		return SNStorage.getValue('SNUser');
	},
	toggleSN: function(){
		SNStorage.setValue('SNOpenBool',!SNStorage.getValue('SNOpenBool'));
	},
	SNOpen: function(){
		return SNStorage.getValue('SNOpenBool');
	},
	toggleMore: function(){
		SNStorage.setValue('moreOpenBool',!SNStorage.getValue('moreOpenBool'));
	},
	moreOpen: function(){
		return SNStorage.getValue('moreOpenBool');
	},
	nonSRUser:function(){
		SNStorage.setValue('SRUser',false);
	},
	SRUser: function(){
		SNStorage.setValue('SRUser',true);
	},
	isSRUser: function(){
		return SNStorage.getValue('SRUser');
	},
	nonSellerUser:function(){
		SNStorage.setValue('SellerUser',false);
	},
	SellerUser: function(){
		SNStorage.setValue('SellerUser',true);
	},
	isSellerUser: function(){
		return SNStorage.getValue('SellerUser');
	},
	//*social sharing settings*: sets the current state and the cached state
	facebook_linked: function(){
		SNApp.useFB = true;
		SNStorage.setValue('fb_linked', true);
	},
	facebook_unlinked: function(){
		SNApp.useFB = false;
		SNStorage.setValue('fb_linked', false);
	},
	twitter_linked: function(){
		SNApp.useTwitter = true;
		SNStorage.setValue('twitter_linked', true);
	},
	twitter_unlinked: function(){
		SNApp.useTwitter = false;
		SNStorage.setValue('twitter_linked', false);
	},
	view_shared_listing: function(){
		SNStorage.setValue('shared', true);
	},
	is_fb_linked: function(){
		return SNStorage.getValue('fb_linked');
	},
	is_tw_linked: function(){
		return SNStorage.getValue('twitter_linked');
	},
	//*end social sharing settings*
	//view_shared_note
	view_shared_note: function(){
		SNStorage.setValue('user_type', 'temp_share');
	},
	//view_own_note
	view_own_note: function(){
		SNStorage.setValue('user_type', 'main');
	},
	view_own_listing: function(){
		SNStorage.setValue('user_type', 'main');
		SNStorage.setValue('shared', false);
	},
	//view_shared_listing
	view_sample_notebook: function(){
		SNStorage.setValue('sample_notebook', true);
	},
	view_own_notebook: function(){
		SNStorage.setValue('sample_notebook', false);
	},
	skip_create_notebook: function(){
		SNStorage.setValue('skip', true);
	},
	is_sample_notebook: function(){
		return SNStorage.getValue('sample_notebook');
	},
	is_shared_note: function(){
		return "temp_share"==SNStorage.getValue('user_type');
	},
	is_skipping_createnotebook: function(){
		return SNStorage.getValue('skip');
	},
	is_checked_in: function(){
		/*
			checks to make:
				1) Were they checked in last time we checked?
				2) Has it been more than 2 hours?
				3) Are they out of the distance allowed?
		*/
		if(SNStorage.getValue('isUserCheckedIn')){
			var now = new Date();
			try{
				var then = new Date(SNStorage.getValue('checkinTime'));
				then.setHours(then.getHours() + 2);
				if(then < now){
					/*unset the variables*/
					SNStorage.setValue('isUserCheckedIn',false);
					window.localStorage.removeItem("checkedInListing");
					window.localStorage.removeItem("checkinTime");
					return false;
				} else {
					return true;
				}
			} catch(e) {
				return false;
			}
		}
		return false;
	},
	isCheckinListingID: function(id){
		var listing = SNStorage.getValue('checkedInListing');
		console.log('listing:',listing);
		console.log('id:',id);
		if(listing && listing.listing_id == id){
			return true;
		} else {
			return false;
		}
	},
	checked_in: function(listing){
		/*minimum requirement of a listing: listing_id exists*/
		console.log('checked in:',listing);
		if(listing){
			console.log('saving it!');
			SNStorage.setValue('checkedInListing',listing);
			SNStorage.setValue('isUserCheckedIn',true);
			SNStorage.setValue('checkinTime',(new Date()));
            
		}
	},
	checked_out: function(){
		/*do a check to see if the showing is still saved...*/
        
        var params = SNController.getParams();
        var listingId = params["listingID"];
        
        SNStorage.setValue('isUserCheckedIn',false);
        var showing = SNStorage.getValue('checkedInListing');
		if(showing && showing.id){
            
            SNApi.listingsCheckoutShowing(showing.id,function(data){
 				/*Do a popup- */
				var options = {
					title:"Checked Out",
					buttons:[
						{
							text:"Skip",
							func:function(){
								window.localStorage.removeItem("checkedInListing");
								window.localStorage.removeItem("checkinTime");
							}
						}
					]
				};
				var body = '<div class="checkout_alert">'
					+ '<div style="margin-bottom:15px;width:100%">You have been checked out of ' + showing.address + ', was it a good or a bad showing?</div>'
					+ '<div class="bad"><img src="img/reddit/downvote-selected.png"/><div>Bad</div></div>'
					+ '<div class="good"><img src="img/reddit/upvote-selected.png"/><div>Good</div></div>'
				+ '</div>';
				SNApp.showPopup(body,options);
   
                
				/*downvote listener...*/
				$('#popup .bad').off('click').on('click',function(){
                    SNApi.listingsMoveToDogHouse(listingId, function(data){
                        //$('#popup #btn0').click(); //remove popup
                        window.localStorage.removeItem("checkedInListing");
            			window.localStorage.removeItem("checkinTime");
                        SNController.goTo("notebooks.html?notebookId=" + SNStorage.getValue('checkinNewnotebookId') + "&notebookType=" + SNStorage.getValue('checkinNewnotebookType') + "&zip_code=" + SNStorage.getValue('checkinNewzipCode'),"checkIn");
					});
                    
                    
					return false;
				});
				/*upvote listener...*/
				$('#popup .good').off('click').on('click',function(){
					SNApi.notebooksSaveFavorite(SNStorage.getValue("notebookId"),listingId, "1", function(data) {  
                        //$('#popup #btn0').click(); //remove popup
                        window.localStorage.removeItem("checkedInListing");
            			window.localStorage.removeItem("checkinTime");
                        SNController.goTo("notebooks.html?notebookId=" + SNStorage.getValue('checkinNewnotebookId') + "&notebookType=" + SNStorage.getValue('checkinNewnotebookType') + "&zip_code=" + SNStorage.getValue('checkinNewzipCode'),"checkIn"); 
					});
                    
        			      
					return false;
				});;
			});
		} else {
			window.localStorage.removeItem("checkedInListing");
			window.localStorage.removeItem("checkinTime");
		}
	},
};