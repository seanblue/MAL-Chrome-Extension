chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	var xhr = new XMLHttpRequest();

	xhr.open('GET', request.url, true);
	
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
});