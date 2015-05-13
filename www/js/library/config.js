var Config = {
     'environment': 'production',
    //'environment': 'development',
    'production' : {
        api_baseUrl : 'http://www.adspac.es'
    },
    'development' : {
        api_baseUrl : 'http://www.dascendis.com/services'
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