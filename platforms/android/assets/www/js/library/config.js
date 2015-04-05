/**
 * Created by Dan on 31-Mar-15.
 */
var Config = {
       // 'environment': 'production',
        'environment': 'development',
		'production' : {
			snapi_baseUrl : 'http://www.dascendis.com',
		},
		'development' : {
			snapi_baseUrl : 'http://www.dascendis.com',
		},
		get: function() {
			return this.getForEnv(this.environment);
		},
		getForEnv: function(env) {
			if(this.hasOwnProperty(env)) {
				return Config[env];
			} else {
				return Config['production'];
			}
		}
};