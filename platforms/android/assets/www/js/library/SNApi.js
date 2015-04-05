var SNApi = {
	baseUrl		: Config.get().snapi_baseUrl,
	requestData : null,
	blocking	: false,
	/**
	 * synchronous service call 
	 */
	callServiceSync: function(controller, params) {
		return this.callService(controller, params, {async: false, doneFunction: function(data){ 
			SNApi.requestData = data;
		}});
	},
	/**
	 * asynchronous service call with success function given as parameter 
	 */
	callServiceAsync: function(controller, params, successFunction) {
		$.mobile.loading( 'show', {});
		return this.callService(controller, params, {async: true, doneFunction: function(data){
			/*save data to cache*/
			successFunction(data);
			$.mobile.loading( 'hide', {});	
		}});
	},
	callService: function(controller, params, options) {
		var serviceUrl = this.baseUrl + "/" + controller + '.php';
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
				'id' : 'DiscoverMe1.0.0',
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

	indexCategories: function(successFunction) {
		this.callServiceAsync('category', {"test":"test"}, successFunction);
	}
};