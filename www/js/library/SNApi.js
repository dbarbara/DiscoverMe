var SNApi = {
	baseUrl		: Config.get().snapi_baseUrl,
	requestData : null,
	blocking	: false,
	/**
	 * synchronous service call 
	 */
	callServiceSync: function(controller, action, params) {
		return this.callService(controller, action, params, {async: false, doneFunction: function(data){ 
			SNApi.requestData = data;
		}});
	},
	/**
	 * asynchronous service call with success function given as parameter 
	 */
	callServiceAsync: function(controller, action, params, successFunction) {
		$.mobile.loading( 'show', {});
		return this.callService(controller, action, params, {async: true, doneFunction: function(data){
			/*save data to cache*/
			successFunction(data);
			$.mobile.loading( 'hide', {});	
		}});
	},
	callService: function(controller, action, params, options) {
		var serviceUrl = this.baseUrl + "/" + controller;
		var retData = null;
		var doneFunction = (options && options.doneFunction) ? options.doneFunction : function(){ $.mobile.loading( 'hide', {}); };
		var failFunction = (options && options.failFunction) ? options.failFunction : function(failData){
			setTimeout(function(){
				$.mobile.loading( 'hide', {});
				/*do a check to see if upload is in progress...*/
				if(upload_progress_bar && upload_progress_bar.is_open){
					upload_progress_bar.destroy(true);
					SNApi.blocking = false;
				} /*destroy loader because it will block the popup...*/
				else{
				   SNApp.showDialog('Request to service has failed.');
				}
			},1000);	
			console.log(failData);
		};
		var alwaysFunction = (options && options.alwaysFunction) ? options.alwaysFunction : function(data){                      
		};
		
		/*add the username / pass params or a login token*/
		var authKey = SNStorage.getValue('authKey');
		var authId = SNStorage.getValue('authId');
		/*if not debug or not simulating a scenario...*/
		$.ajax({
			url: serviceUrl,
			type: 'POST',
			async: options.async,
			dataType: 'json',
			data: JSON.stringify({ 
				'jsonrpc' : '2.0',
				'id' : 'SNApp.0.1',
				'authKey': authKey,
				'authId': authId,
				'method' : action,
				'params': params})
		})
		.done(function(data){
			try{
				if(data && data.result) {
					doneFunction(data.result);
				} else {
					doneFunction(false);
				}
			} catch(e){
				SNApp.throw_error(e);
			}
		})
		.fail(failFunction)
		.always(alwaysFunction);
		if(options && !options.async) {
			return this.requestData;
		}
	},
	
	/**
	 * Users controller API calls. All methods should start with the text users
	 */
	usersLogin: function(email, password, successFunction) {
		this.callServiceAsync('users','login', {'email': email, 'password' : password, 'version' : '1.1.0'}, successFunction);
	},
	usersFBLogin: function(email, fbToken, successFunction) {
		this.callServiceAsync('users','fbLogin', {'email': email, 'token' : fbToken, 'version' : '1.1.0'}, successFunction);
	},
	usersRegister: function(name, email, password, type, successfunction) {
		this.callServiceAsync('users','register', {
			'name' : name,  
			'email': email, 
			'password' : password,
			'type' : type
		}, successfunction);
	},
	usersFBRegister: function(name, email, fbToken, type, successfunction) {
		this.callServiceAsync('users','fbRegister', {
			'name' : name,  
			'email': email, 
			'token' : fbToken,
			'type' : type
		}, successfunction);
	}, 
	usersForgotPassword: function(email, successFunction) {
		this.callServiceAsync('users', 'forgotpass', { 'email': email}, successFunction);
	},
	
	usersSaveNotificationsSettings: function(params, successFunction) {
		this.callServiceAsync('users','saveNotificationSettings', {'notificationSettings' : JSON.stringify(params)}, successFunction);
	},
	usersSaveSharingSettings: function(params, successFunction) {
		this.callServiceAsync('users','saveSharingSettings', {'sharingSettings' : JSON.stringify(params)}, successFunction);
	},
	usersNotificationSettings: function(successFunction) {
		this.callServiceAsync('users','getNotificationsSettings', {}, successFunction);
	},
	/**
	 * Use the get count param to only get the count
	 * If set to false, will return all notifications
	 */
	usersNotifications: function(getCount, successFunction) {
		this.callServiceAsync('users','notifications', {
			'getCount' : getCount
		}, successFunction);
	},
	usersAllNotifications: function(successFunction) {
		this.callServiceAsync('users','allNotifications', {}, successFunction);
	},
	usersSaveShareRequest: function(shareId, acceptDeny, successFunction) {
		this.callServiceAsync('users','saveShareRequest', {
			'shareId': shareId,
			'accept' : acceptDeny
		}, successFunction);
	},
	usersGetSharings: function(successFunction) {
		this.callServiceAsync('users','getSharings', {}, successFunction);
	},
    usersSaveDeviceToken: function(token, successFunction) {
        var deviceType = '';
        if(device && device.platform)
            deviceType = device.platform;
        this.callServiceAsync('users','saveDeviceToken', {
			token: token,
			type: deviceType,
        }, successFunction);
    },
    usersCheckUpgrade: function(successFunction) {
    	this.callServiceAsync('users','checkUpgrade', {}, successFunction);
    },
    usersSetViewedNotification: function(notId, successFunction) {
    	this.callServiceAsync('users','setViewedNotification', {
    		'id' : notId
    	}, successFunction);
    },
    usersSetPremium: function(email, isPremium, successFunction) {
    	this.callServiceAsync('users','setPremiumUser', {
    		'email': email,
    		'isPremium' : isPremium
    	}, successFunction);
    },
	userHasSSAccountByEmail: function(email, successFunction) {
    	this.callServiceAsync('users','checkSSUser', {
    		'email': email
    	}, successFunction);
    },
    usersChangeToBuyerRenter: function(successFunction) {
    	this.callServiceAsync('users','changeToBuyerRenter', {}, successFunction);
    },
    usersChangeToAgent: function(successFunction) {
    	this.callServiceAsync('users','changeToAgent', {}, successFunction);
    },
    usersGetAgentInfo: function(agentEmail, successFunction) {
    	this.callServiceAsync('users','getAgentInfo', {
    		'email' : agentEmail
    	}, successFunction);
    },
    usersInviteBuyer: function(buyerEmail, successFunction) {
    	this.callServiceAsync('users','inviteBuyer', {
    		'email' : buyerEmail
    	}, successFunction);
    },
    usersAcceptBuyerInvite: function(inviteId, successFunction) {
    	this.callServiceAsync('users','acceptDenyBuyerInvite', {
    		'id' : inviteId,
    		'acceptDeny' : 1
    	}, successFunction);
    },
    usersDenyBuyerInvite: function(inviteId, successFunction) {
    	this.callServiceAsync('users','acceptDenyBuyerInvite', {
    		'id' : inviteId,
    		'acceptDeny' : 2
    	}, successFunction);
    },
	/**
	 * Notebooks controller API calls. All methods should start with the text notebooks
	 */
	notebooksCreate: function(name, isRental, colaboratorsArray, successFunction) {
		this.callServiceAsync('notebooks','create', {
			'name' : name,
			'isRental': isRental,
			'sharingColaborators' : JSON.stringify(colaboratorsArray)
		}, successFunction);
	},
	notebooksDelete: function(id, successFunction) {
		this.callServiceAsync('notebooks','delete', {
			'id' : id,
		}, successFunction);
	},
	notebooksList: function(successFunction) {
		this.callServiceAsync('notebooks','getList', {}, successFunction);
	},
	notebooksDetails: function(notebookId, successFunction) {
		this.callServiceAsync('notebooks','notebookDetails', {
			'id': notebookId
		}, successFunction);
	},
	notebooksMyShowings: function(notebookId, successFunction) {
		this.callServiceAsync('notebooks','myShowings', {
			'id': notebookId
		}, successFunction);
	},
	/***this call is never used...***/
	notebooksSaveOrder: function(orderedIds, successFunction) {
		this.callServiceAsync('notebooks','saveOrder', {
			'orderedIds': orderedIds
		}, successFunction);
	},
	notebooksSaveFavorite: function(notebookId, listingId, isFavorite, successFunction) {
		this.callServiceAsync('notebooks','saveFavorite', {
			'id': notebookId,
			'lId': listingId,
			'isFavorite' : isFavorite
		}, successFunction);
	},
	notebooksSetAgent: function(notebookId, agentEmail, successFunction) {
		this.callServiceAsync('notebooks','saveUserAgent', {
    		'notebookId' :notebookId, 
    		'agentEmail' : agentEmail
    	}, successFunction);
    },
	
	/**
	 * Listings controller API calls. All methods should start with the text listings
	 */
	listingsFavorites: function(notebookId, successFunction) {
		this.callServiceAsync('listings','favorites', {
			'id' : notebookId
		}, successFunction);
	},
	listingsMlsInfo: function(listingId, successFunction) {
		this.callServiceAsync('listings','mlsInfo', {
			'id': listingId
		}, successFunction);
	},
	/**this call is never used...**/
	listingsMediaList: function(listingId, successFunction) {
		/*if not listing media flag...*/
		this.callServiceAsync('listings','mediaList', {
			'id': listingId
		}, successFunction);
	},
	listingsMoveToDogHouse: function(listingId, successFunction) {
		this.callServiceAsync('listings', 'toDoghouse', {
			'id': listingId
		}, successFunction);
	},
	listingsClearDogHouse: function(listingId, successFunction) {
		this.callServiceAsync('listings', 'clearDoghouse', {
			'id': listingId
		}, successFunction);
	},
	/**to do** call never used*/
	listingsGetMediaFileInfo: function(mediaId, successFunction) {
		this.callServiceAsync('listings','mediaInfo', {
			'id': mediaId
		}, successFunction);
	},
	/**to do** call never used*/
	listingsDeleteMediaFile: function(mediaId, successFunction) {
		this.callServiceAsync('listings','deleteMedia', {
			'id': mediaId
		}, successFunction);
	},
	listingsNotes: function(listingId, notebookId, successFunction) {
		this.callServiceAsync('listings', 'notes', {
			'notebookId' : notebookId,
			'id' : listingId
		}, successFunction);
	},
	listingsSaveOrder: function(notebookId, orderedIds, successFunction) {
		this.callServiceAsync('listings','saveOrder', {
			'id': notebookId,
			'orderedIds': orderedIds 
		}, successFunction);
	},
	/**
	 * Create or save listing notes
	 */
	listingsSaveNote: function(listingId, showingId, noteId, notebookId, text, caption, successFunction) {
		this.callServiceAsync('listings', 'saveNote', {
			'id' : showingId,
			'noteId' : noteId,
			'text': text,
			'caption' : caption,
			'listingId' : listingId,
			'notebookId' : notebookId
		}, successFunction);
	},
	/**
	 * Save predefined notes set at screen 13.1
	 * options param is an object of form
	 * {
		 showingId: 1,
		 listingId: 1,
		 notes: [
			 {id: 0, type: 1, text:"Liked Most Note"},
			 {id: 0, type: 2, text:"Liked Least Note"},
			 {id: 0, type: 3, text:"Price Opinion Note"},
			 {id: 0, type: 4, text:"Overall Opinion Note"},
			 {id: 0, type: 10, text:"Rent Note"},
			 {id: 0, type: 11, text:"Lease term Note"},
			 {id: 0, type: 12, text:"What's included Note"},
			 {id: 0, type: 13, text:"Amenities Note"},
			 {id: 0, type: 14, text:"Pets Note"}
		 ]
		}
	 *	You should send at least one id showing or listing for the api call to be successfull.
	 */
	listingsSavePredefinedNotes: function(options, successFunction) {
		this.callServiceAsync('listings', 'savePredefinedNotes', {
			'options' : JSON.stringify(options)
		}, successFunction);
	},
	listingsDeleteNote: function(noteId, successFunction) {
		this.callServiceAsync('listings', 'deleteNote', {
			'id' : noteId
		}, successFunction);
	},
	/**
	 * Set / unset favorite listing
	 * Use the isFavorite param = true | false to send the appropriate favorite value
	 */
	 /***Not used anymore?***/
	listingsSetFavorite: function(listingId, isFavorite, notebookId, successFunction) {
		/*trigger notebook changed flag*/
		this.callServiceAsync('listings', 'setFavorite', {
			'id' : listingId,
			'notebookId': notebookId,
			'isFavorite' : isFavorite
		}, successFunction);
	},
	listingsNewPic: function(pic, showingId, listingId, successFunction) {
		this.callServiceAsync('listings', 'newPic', {
			'id' : showingId,
			'pic' : pic,
			'listingId' : listingId
		}, successFunction);
	},
	/***this is never used***/
	listingsNewVideo: function(video, showingId, listingId, successFunction) {
		this.callServiceAsync('listings', 'newVideo', {
			'id' : showingId,
			'video' : video,
			'listingId' : listingId
		}, successFunction);
	},
	/***this is never used...***/
	listingsSaveMediaNotes: function(mediaId, caption, text, successFunction) {
		this.callServiceAsync('listings', 'saveMediaNote', {
			'id' : mediaId,
			'caption': caption,
			'text': text
		}, successFunction);
	},
	listingsSaveMediaForNote: function(noteId, mediaType, media, successFunction) {
		this.callServiceAsync('listings', 'saveMediaForNote', {
			'id' : noteId,
			'mediaUrl' : media,
			'mediaType': mediaType,
		}, successFunction);
	},
	listingsGetForZipCode: function(zipCode, successFunction) {
		this.callServiceAsync('listings', 'getByZip', {
			'zip' : zipCode
		}, successFunction);
	},
	listingsGetForZipCodeAndType: function(zipCode, type, successFunction) {
		this.callServiceAsync('listings', 'getByZipAndType', {
			'zip' : zipCode,
			'type' : type
		}, successFunction);
	},
	listingsGetLastVisitAndShowingsCount: function(listingId, notebookId, successFunction) {
		this.callServiceAsync('listings', 'getLastVisitAndShowingsCount', {
			'listingId' : listingId,
			'notebookId' : notebookId,
		}, successFunction);
	},
	listingsSaveCheckIn: function(listingId, notebookId, area, rent, successFunction) {
		this.callServiceAsync('listings', 'saveCheckIn', {
			'id' : listingId,
			'ntbkId' : notebookId,
			'area' : area,
			'rent' : rent
		}, successFunction);
	},
	listingsCreateNew: function(streetNumber, streetName, area, successFunction) {
		this.callServiceAsync('listings', 'create', {
			'streetNumber' : streetNumber,
			'streetName' : streetName,
			'area': area
		}, successFunction);
	},
	listingsMakeNb1: function(listingId, notebookId, successFunction) {
		this.callServiceAsync('listings', 'nb1', {
			'id' : listingId,
			'notebookId': notebookId
		}, successFunction);
	},
	listingsDelete: function(listingId, successFunction) {
		this.callServiceAsync('listings', 'delete', {
			'listingId' : listingId
		}, successFunction);
	},
    listingsCheckResponses: function(listingId, successFunction) {
		this.callServiceAsync('listings', 'hasShowingWithNoFeedback', {
			'listingId' : listingId
		}, successFunction);
	},
	listingsSendFeedback: function(listingId, showingId, feedbackData, successFunction) {
		this.callServiceAsync('listings', 'sendFeedback', {
			'id' : listingId,
			'sId': showingId,  
			'feedbackData' : JSON.stringify(feedbackData)
		}, successFunction);
	},
	listingsGetFeedbackCount: function(listingId, successFunction) {
		this.callServiceAsync('listings', 'getFeedbackCount', {
			'id' : listingId
		}, successFunction);
	},
	listingsCheckoutShowing: function(showingId, successFunction) {
		this.callServiceAsync('listings', 'checkoutShowing', {id: showingId}, successFunction);
	},
	listingsRegisterLHEvent: function(listingsLhKey, event, timestamp, ip, userAgent, referrer, successFunction) {
		this.callServiceAsync('listings', 'registerLhMetricsEvent', {
			'lhListingsKey' : listingsLhKey,
			'event' : event,
			'timestamp' : timestamp, 
			'ip' : ip, 
			'userAgent' : userAgent, 
			'referrer' : referrer
		}, successFunction);
	},
	uploadGenericPic: function(listingID,successFunction){
		Upload.upload_generic(listingID,successFunction);
	},
	listingsGetSurveyQuestions: function(mlsId, agentEmail, successFunction) {
		this.callServiceAsync('listings', 'surveyQuestions', {mls: mlsId, agentEmail: agentEmail }, successFunction);
	},
	listingsImportSsListing: function(listing, successFunction) {
		this.callServiceAsync('listings', 'listingsImportSsListing', {
			listing: listing, 
		}, successFunction);
	}
};