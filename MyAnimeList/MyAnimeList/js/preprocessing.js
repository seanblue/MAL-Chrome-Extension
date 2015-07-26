var preprocessing = (function() {
	var limitedAnimeDivs;
	var totalAnimeToLoad;
	var animeLoadedSoFar = 0;
	var loadingInterval;
	
	function run() {
		setupAnimeDataSections();
		setAnimeDivsAndCount();
		handleLoadingStatus();
		loadAnime();
		handleClearLoadingStatus();
		
		$.when.apply(undefined, loadAnimePromises).always(function() {
			addTagsToAnimeDetails();
		});
	}
	
	function setupAnimeDataSections() {
		$(animeSectionSelector).each(function (index, el) {
			var section = $(el);
			var sectionName = section.data('anime-section');
			
			animeDataBySection[sectionName] = {
				order: [],
				original_order: [],
				data: {},
				el: section
			};
		});
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

	function addTagsToAnimeDetails() {
		var header = $(animeSectionHeaderRowSelector + ':first');
		var allTd = header.find('td');
		var tagsTd = header.find('td:contains("Tags")');
		
		var tagsColumnIndex = allTd.index(tagsTd);
		if (tagsColumnIndex === -1) {
			return;
		}
		
		animeDivs.each(function(index, el) {
			addTagsToAnimeDetailsForAnime(el, tagsColumnIndex);			
		});
	}
	
	function addTagsToAnimeDetailsForAnime(animeEl, tagsColumnIndex) {
		var td = $(animeEl).find('table:first td:eq(' + tagsColumnIndex + ')');
		var tags = td.find('[id^=tagLinks]').text().split(',');
		tags = $.map(tags, function(el) {
			return el.trim();
		});
		
		var id = getAnimeId(animeEl);
		var anime = animeData[id];
		if (typeof anime === 'undefined') {
			// If not within test limit, no data is loaded.
			return;
		}
		
		anime.details[userTagsField] = tags;
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
