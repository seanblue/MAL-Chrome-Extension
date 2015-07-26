var preprocessing = (function() {
	var animeSectionClass = 'mal-ext-anime-section';
	var animeSectionSelector = '.' + animeSectionClass;

	var sectionHeaderTitleTables;
	var sectionFooterTables;
	var limitedAnimeDivs;
	var totalAnimeToLoad;
	var animeLoadedSoFar = 0;
	var loadingInterval;
	
	function run() {
		wrapAnime();
		wrapAnimeHeadersAndFooters();
		wrapAnimeSections();
		setAnimeDivsAndCount();
		handleLoadingStatus();
		loadAnime();
		handleClearLoadingStatus();
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
				original_order: [],
				data: {},
				el: section
			};
		}
	}
	
	function handleLoadingStatus() {
		loadingInterval = setInterval(function() {
			updateLoadedStatus();
		}, 1000);
	}
	
	function handleClearLoadingStatus() {
		$.when.apply(undefined, loadAnimePromises).always(function() {
			clearInterval(loadingInterval);
			$(loadingSectionSelector).children().hide();
		});
	}
	
	function updateLoadedStatus() {
		var loadingStatusEl = $(loadingStatusSelector);
		loadingStatusEl.text(animeLoadedSoFar + '/' + totalAnimeToLoad);
	}

	function setAnimeDivsAndCount() {
		animeDivs = $(animeContainerSelector);
		limitedAnimeDivs = animeDivs.slice(0, getTestLimit());
		totalAnimeToLoad = limitedAnimeDivs.length;
	}

	function loadAnime() {
		limitedAnimeDivs.each(function(index, el) {
			var container = $(el);
			var id = getAnimeId(container);
			
			var sectionName = getSectionName(el);
			var sectionData = animeDataBySection[sectionName];
			sectionData.order.push(id);
			sectionData.original_order.push(id);
			
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
				
				animeLoadedSoFar++;
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
		addAdditionalDetails(details);
		var data = {
			'el': el,
			'details': details,
			'visible': true
		};
		
		animeData[id] = data
		
		var sectionName = getSectionName(el);
		animeDataBySection[sectionName].data[id] = data;
	}
	
	function addAdditionalDetails(details) {
		var mainTitle = details.title;
		var otherTitles = details.other_titles || {};
		otherTitles = $.map(otherTitles, function(item) {
			return item;
		});
		
		details[allTitlesField] = [mainTitle].concat(otherTitles);
	}
	
	function getSectionName(el) {
		return $(el).closest(animeSectionSelector).data('anime-section');
	}
	
	return {
		run: run
	};
})();
