var setupUI = (function() {
		
	var sectionHeaderTitleTables;
	var sectionFooterTables;
	
	function run() {
		addExtensionSection();
		wrapAnime();
		wrapAnimeHeadersAndFooters();
		wrapAnimeSections();
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

	function wrapAnime() {
		var animeMoreSectionTables = $('[id^="more"');
		animeMoreSectionTables.each(function(index, el) {
			var moreDiv = $(el);
			var id = moreDiv.attr('id').slice(4);
			var animeTable = moreDiv.prev();
			animeTable.wrap(function() {
				return '<div class="' + animeContainerClass + '" data-anime-id="' + id + '"></div>';
			});
			animeTable.parent().append(moreDiv);
		});
		
		$('.table_header').closest('table').wrap('<div class="' + animeSectionHeaderRowClass + '"/>');
	}
	
	function wrapAnimeHeadersAndFooters() {
		sectionHeaderTitleTables = $('table[class*=header]').wrap('<div class="mal-ext-section-header-title"/>').parent();
		for (var i = 0; i < sectionHeaderTitleTables.length; i++) {
			var header = $(sectionHeaderTitleTables[i]);
			header.find('.header_title').append('<span class="mal-ext-section-visible-count" />');
		}
		
		sectionFooterTables = $('.category_totals').closest('table').wrap('<div class="mal-ext-section-footer"/>').parent();
	}
	
	function wrapAnimeSections() {
		for (var i = 0; i < sectionHeaderTitleTables.length; i++) {
			var header = $(sectionHeaderTitleTables[i]);
			var footer = $(sectionFooterTables[i]);
			var sectionName = header.find('.header_title span').text();
			var allAnimeInSection = header.nextUntil(footer, animeContainerSelector + ',' + animeSectionHeaderRowSelector)
			
			header.wrap(function() {
				return '<div class="' + animeSectionClass + '" data-anime-section="' + sectionName + '"></div>';
			});
			
			var section = header.parent();
			section.append(allAnimeInSection);
			section.append(footer);
		}
	}
	
	return {
		run: run
	};
})();