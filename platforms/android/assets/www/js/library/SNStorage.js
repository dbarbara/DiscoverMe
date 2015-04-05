var SNStorage = {
	setValue: function(name, value) {
		var storageObj = {};
		storageObj.value = value;
		window.localStorage.setItem(name, JSON.stringify(storageObj));
	},
	getValue: function(name) {
		var storageValue = window.localStorage.getItem(name);
		if(typeof storageValue == 'string' && storageValue.match(/[\{\[]/)) {
			storageObj = JSON.parse(storageValue);
			storageValue = storageObj.value;
		}
		return storageValue; 
	}
};