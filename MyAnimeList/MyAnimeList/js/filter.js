var filtering = (function() {
	var activeFilterClass = 'mal-ext-active-filter';
	var activeFilterSelector = '.' + activeFilterClass;
	
	var filterTypes = ['None', 'Type', 'Genre', 'Rating', 'Status', 'Title', 'Synopsis', 'Tag'];
	var mediaTypes = ['All', 'TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'];
	var genres = ['All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids', 'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'];
	var ratingsValues = ['All'].concat(actualRatings);
	var ratingsTexts = ['All', 'G', 'PG', 'PG-13', 'R', 'R+', 'Rx'];
	var statusOptions = ['All', 'Finished Airing', 'Currently Airing', 'Not yet aired'];
	
	function run() {
		apiTestPromise.always(function() {
			$.when.apply(undefined, loadAnimePromises).always(function() {
				updateFilterTypes();
				insertFilterElements();
				addFilterEvents();
			});
		});
	}
	
	function updateFilterTypes() {
		if (!hasTagsColumn) {
			filterTypes = filterTypes.splice(0, filterTypes.indexOf('Tag'));
		}
	}
	
	function insertFilterElements() {
		var mainFilterSelect = getSelect('mal-ext-content-main-filter');
		addOptions(mainFilterSelect, filterTypes);
		
		var contentTypeFilterSelect = getSelect('mal-ext-content-type-filter');
		addOptions(contentTypeFilterSelect, mediaTypes);
		
		var genreFilterSelect = getSelect('mal-ext-content-genre-filter');
		addOptions(genreFilterSelect, genres);
		
		var ratingFilterSelect = getSelect('mal-ext-content-rating-filter');
		addOptions(ratingFilterSelect, ratingsValues, ratingsTexts);
		
		var statusFilterSelect = getSelect('mal-ext-content-status-filter');
		addOptions(statusFilterSelect, statusOptions);
		
		var titleFilterInput = getInput('mal-ext-content-title-filter');
		
		var synopsisFilterInput = getInput('mal-ext-content-synopsis-filter');
		
		var userTagsFilterInput = getInput('mal-ext-content-user-tags-filter');
		
		var filterSection = $(filteringSectionSelector);
		var contentTypeFilter = $('<span>Filter: </span>');
		filterSection.append(contentTypeFilter);
		
		contentTypeFilter.append(getFilterContainer().append(mainFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(contentTypeFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(genreFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(ratingFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(statusFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(titleFilterInput));
		contentTypeFilter.append(getHiddenFilterContainer().append(synopsisFilterInput));
		contentTypeFilter.append(getHiddenFilterContainer().append(userTagsFilterInput));
	}
	
	function getHiddenFilterContainer() {
		return getFilterContainer().addClass('mal-ext-hidden');
	}
	
	function getFilterContainer() {
		return $('<span class="mal-ext-filter-container" />');
	}
	
	function addFilterEvents() {
		var mainSelect = $('.mal-ext-content-main-filter');
		var typeSelect = $('.mal-ext-content-type-filter');
		var genreSelect = $('.mal-ext-content-genre-filter');
		var ratingSelect = $('.mal-ext-content-rating-filter');
		var statusSelect = $('.mal-ext-content-status-filter');
		var titleInput = $('.mal-ext-content-title-filter');
		var synopsisInput = $('.mal-ext-content-synopsis-filter');
		var userTagsInput = $('.mal-ext-content-user-tags-filter');
		
		mainSelect.on('change', function(event) {
			closeInfoPopover();
			hideAndUpdateVisibleFilters();
			
			var val = $(this).val();
			if (val === 'Type') {
				showSelectedFilter(typeSelect)
			}
			else if (val === 'Genre') {
				showSelectedFilter(genreSelect)
			}
			else if (val === 'Rating') {
				showSelectedFilter(ratingSelect)
			}
			else if (val === 'Status') {
				showSelectedFilter(statusSelect)
			}
			else if (val === 'Title') {
				showSelectedFilter(titleInput)
			}
			else if (val === 'Synopsis') {
				showSelectedFilter(synopsisInput)
			}
			else if (val === 'Tag') {
				showSelectedFilter(userTagsInput)
			}
		});
		
		typeSelect.on('change', function(event) {
			closeInfoPopover();
			filterAnimeByType($(this).val());
		});
		
		genreSelect.on('change', function(event) {
			closeInfoPopover();
			filterAnimeByGenre($(this).val());
		});
	
		ratingSelect.on('change', function(event) {
			closeInfoPopover();
			filterAnimeByRating($(this).val());
		});
	
		statusSelect.on('change', function(event) {
			closeInfoPopover();
			filterAnimeByStatus($(this).val());
		});
	
		setupTitleFilterEvent(titleInput);
		setupSynopsisFilterEvent(synopsisInput);
		setupUserTagsFilterEvent(userTagsInput);
	}
	
	function setupTitleFilterEvent(titleInput) {
		setupInputFilterEvent(titleInput, filterAnimeByTitle);
	}
	
	function setupSynopsisFilterEvent(synopsisInput) {
		setupInputFilterEvent(synopsisInput, filterAnimeBySynopsis);
	}
	
	function setupUserTagsFilterEvent(userTagsInput) {
		setupInputFilterEvent(userTagsInput, filterAnimeByUserTag);
	}
	
	function setupInputFilterEvent(input, callback) {
		var filterTimeout;
		input.on('keyup', function(event) {
			closeInfoPopover();
			
			var inputVal = $(this).val();
			clearTimeout(filterTimeout);
			filterTimeout = setTimeout(function() {
				callback(inputVal);
			}, 500);
		});
	}
	
	function hideAndUpdateVisibleFilters() {
		var filter = $(activeFilterSelector).removeClass(activeFilterClass);
		filter.children('select').val('All').trigger('change');
		filter.children('input').val('').trigger('keyup');
	}
	
	function showSelectedFilter(select) {
		select.parent().addClass(activeFilterClass);
	}
	
	function filterAnimeByType(val) {
		var field = 'type';
		var showIfTrueFunction = getShowIfTrueValueIsEqualFunction(val);
		filterAnime(field, val, showIfTrueFunction);
	}
	
	function filterAnimeByGenre(val) {
		var field = 'genres';
		var showIfTrueFunction = function(genres) {
			return genres.indexOf(val) !== -1;
		}
		
		filterAnime(field, val, showIfTrueFunction);
	}
	
	function filterAnimeByRating(val) {
		var field = 'classification';
		var showIfTrueFunction = getShowIfTrueValueIsEqualFunction(val);
		filterAnime(field, val, showIfTrueFunction);
	}
	
	function filterAnimeByStatus(val) {
		var field = 'status';
		var showIfTrueFunction = getShowIfTrueValueIsEqualFunction(val);
		filterAnime(field, val, showIfTrueFunction);
	}
	
	function filterAnimeByTitle(val) {
		var showIfTrueFunction = getShowIfTrueAnyValueInListIsLikeAnyFunction(val);
		filterAnime(allTitlesField, val, showIfTrueFunction, '');
	}
	
	function filterAnimeBySynopsis(val) {
		var field = 'synopsis';
		var showIfTrueFunction = getShowIfTrueValueIsLikeFunction(val);
		filterAnime(field, val, showIfTrueFunction, '');
	}
	
	function filterAnimeByUserTag(val) {
		var showIfTrueFunction = getShowIfTrueAnyValueInListIsLikeAnyFunction(val);
		filterAnime(userTagsField, val, showIfTrueFunction, '');
	}
	
	function getShowIfTrueValueIsEqualFunction(inputVal) {
		var lowerInputVal = inputVal.toLowerCase();
		return function(testVal) {
			return testVal.toLowerCase() === lowerInputVal;
		};
	}
	
	function getShowIfTrueValueIsLikeFunction(inputVal) {
		var lowerInputVal = inputVal.toLowerCase();
		return function(testVal) {
			return testVal.toLowerCase().indexOf(lowerInputVal) !== -1;
		};
	}
	
	function getShowIfTrueValueIsLikeAnyFunction(inputVal) {
		var lowerInputVal = inputVal.trim().toLowerCase();
		return function(allTestVals) {
			return allTestVals.some(function(testVal) {
				return testVal.toLowerCase().indexOf(lowerInputVal) !== -1;
			});
		};
	}
	
	function getShowIfTrueAnyValueInListIsLikeAnyFunction(inputVal) {
		var valList = getListFromValue(inputVal);
		
		// Get test functions for every one of the possible values.
		var funcs = $.map(valList, function(val) {
			return getShowIfTrueValueIsLikeAnyFunction(val);
		});
		
		return function(allTestVals) {
			// Test each of the functions against the given test values.
			return funcs.some(function(func) {
				return func(allTestVals);
			});
		};
	}
	
	function getListFromValue(val) {
		var valList = val.split(',');
		return $.grep(valList, function(item) {
			return item.trim() !== '';
		});
	}
	
	function filterAnime(field, val, showIfTrueFunction, showAllValue) {
		if (typeof showAllValue === 'undefined') {
			showAllValue = 'All';
		}
		
		if (val.trim() === showAllValue) {
			showIfTrueFunction = function() {
				return true;
			}
		}
		
		for (var section in animeDataBySection) {
			var rowColorNumber = getRowColorNumber();
			var sectionData = animeDataBySection[section];
			
			var sectionHiddenCount = 0;
			var orderNumber = 1;
			for (var i = 0; i < sectionData.order.length; i++) {
				var id = sectionData.order[i];
				var anime = sectionData.data[id];
				if (typeof anime === 'undefined') {
					continue;
				}
				
				var isVisible = showIfTrueFunction(anime.details[field]);
				anime.visible = isVisible;
				if (isVisible) {
					updateRowColor(anime.el, rowColorNumber);
					updateRowNumber(anime.orderTd, orderNumber);
					anime.el.show();
					
					rowColorNumber = getRowColorNumber(rowColorNumber);
					orderNumber++;
				}
				else {
					sectionHiddenCount++;
					anime.el.hide();
				}
			}
			
			sectionData.totalHidden = sectionHiddenCount;
		}
		
		updateAllSectionCounts();
	}
	
	return {
		run: run
	};
})();