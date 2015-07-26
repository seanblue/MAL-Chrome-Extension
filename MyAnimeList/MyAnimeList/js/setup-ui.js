var setupUI = (function() {
		
	function run() {
		addExtensionSection();
	}
	
	function addExtensionSection() {
		var contentStrip = $('#mal_control_strip');
		var extMainContent = getExtMainContent();
		contentStrip.after(extMainContent);
	}
	
	function getExtMainContent() {
		var tr = $('<tr />').append(getFilteringTd()).append(getSortingTd()).append(getLoadingTd());
		var tbody = $('<tbody />').append(tr);
		
		return $('<table id="mal-ext-main-content" />').append(tbody);
	}
	
	function getFilteringTd() {
		return $('<td class="' + filteringSectionClass + '" />');
	}
	
	function getSortingTd() {
		return $('<td class="' + sortingSectionClass + '" />');
	}
	
	function getLoadingTd() {
		return $('<td class="' + loadingSectionClass + '" />').append('<span>Loading anime... </span>').append('<span class="' + loadingStatusClass + '" />');
	}

	return {
		run: run
	};
})();