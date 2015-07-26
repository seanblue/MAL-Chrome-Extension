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
		var tds = $(getSectionCells());
		var tr = $('<tr />').append(tds);
		var tbody = $('<tbody />').append(tr);
		
		return $('<table id="mal-ext-main-content" />').append(tbody);
	}
	
	function getSectionCells() {
		return '<td class="' + filteringSectionClass + '" /><td class="' + sortingSectionClass + '" /><td>';
	}

	return {
		run: run
	};
})();