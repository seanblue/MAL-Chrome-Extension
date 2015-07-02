var preprocessing = (function() {
	var animeSectionClass = 'mal-ext-anime-section';
	var animeSectionSelector = '.' + animeSectionClass;

	var sectionHeaderTitleTables;
	var sectionFooterTables;
	
	function run() {
		wrapAnime();
		wrapAnimeHeadersAndFooters();
		wrapAnimeSections();
		loadAnime();
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
			
			animeDataBySection[sectionName] = {
				order: [],
				data: {}
			};
		}
	}

	function loadAnime() {
		animeDivs = $(animeContainerSelector);
		animeDivs.slice(0, getTestLimit()).each(function(index, el) {
			var container = $(el);
			var id = getAnimeId(container);
			
			var sectionName = getSectionName(el);
			animeDataBySection[sectionName].order.push(id);
			
			var promise = loadAnimeDetails(id, container);
			loadAnimePromises.push(promise);
		});
	}
	
	function getTestLimit() {
		return localStorage.testLimit;
	}
	
	function loadAnimeDetails(id, container) {
		var deferred = $.Deferred();
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', getApiUrl(id), true);
		xhr.onreadystatechange = function(event) {
			if (xhr.readyState == 4) {
				var animeDetails = JSON.parse(event.target.response);
				saveAnimeDetails(id, container, animeDetails);
				
				deferred.resolve();
			}
		}
		xhr.send();
		
		return deferred.promise();
	}
	
	function getApiUrl(id) {
		return 'http://umal-api.coreyjustinroberts.com/1.1/anime/' + id;
	}
	
	function saveAnimeDetails(id, el, details) {
		var sectionName = getSectionName(el);
		var data = {
			'el': el,
			'details': details
		};
		
		animeData[id] = data
		animeDataBySection[sectionName].data[id] = data;
	}
	
	function getSectionName(el) {
		return $(el).closest(animeSectionSelector).data('anime-section');
	}
	
	return {
		run: run
	};
})();
