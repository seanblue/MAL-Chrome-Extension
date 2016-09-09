(function() {
	chrome.runtime.onMessage.addListener(function(request, sender, callback) {
		if (request.type === 'apirequest')
			return makeApiRequest(request, callback);
	});
	
	function makeApiRequest(request, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', getApiUrl(request.id), true);
		
		xhr.onreadystatechange = function(event) {
			if (xhr.readyState == 4) {
				callback({
					target: {
						status: event.target.status,
						response: event.target.response
					}
				});
			}
		}
		
		xhr.send();
		return true; // prevents the callback from being called too early on return
	}
	
	function getApiUrl(id) {
		return 'http://umal-api.coreyjustinroberts.com/1.1/anime/' + id;
	}
})();