var filtering = (function() {
	var activeFilterClass = 'mal-ext-active-filter';
	var activeFilterSelector = '.' + activeFilterClass;
	
	var filterTypes = ['None', 'Type', 'Genre', 'Rating', 'Status', 'Priority', 'Title', 'Synopsis', 'Tag', 'Date'];
	var mediaTypes = ['All', 'TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'];
	var genres = ['All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids', 'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'];
	var ratingsValues = ['All'].concat(actualRatings);
	var ratingsTexts = ['All', 'G', 'PG', 'PG-13', 'R', 'R+', 'Rx'];
	var statusOptions = ['All', 'Finished Airing', 'Currently Airing', 'Not yet aired'];
	var priorityOptions = ['All', 'Low', 'Medium', 'High'];
	
	var startDateInput;
	var endDateInput;
	
	function run() {
		runAfterAllAnimeDataSuccessfullyLoaded(function() {
			updateFilterTypes();
			insertFilterElements();
			addFilterEvents();
		});
	}
	
	function updateFilterTypes() {
		if (!hasTagsColumn) {
			removeFilterType('Tag');
		}
		
		if (!hasPriorityColumn) {
			removeFilterType('Priority');
		}
	}
	
	function removeFilterType(name) {
		filterTypes.splice(filterTypes.indexOf(name), 1);
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
		
		var priorityFilterSelect = getSelect('mal-ext-content-priority-filter');
		addOptions(priorityFilterSelect, priorityOptions);
		
		var titleFilterInput = getInput('mal-ext-content-title-filter');
		
		var synopsisFilterInput = getInput('mal-ext-content-synopsis-filter');
		
		var userTagsFilterInput = getInput('mal-ext-content-user-tags-filter');
		
		var dateInputSection = getDateInputSection();
		
		var filterSection = $(filteringSectionSelector);
		var contentTypeFilter = $('<span>Filter: </span>');
		filterSection.append(contentTypeFilter);
		
		contentTypeFilter.append(getFilterContainer().append(mainFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(contentTypeFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(genreFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(ratingFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(statusFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(priorityFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(titleFilterInput));
		contentTypeFilter.append(getHiddenFilterContainer().append(synopsisFilterInput));
		contentTypeFilter.append(getHiddenFilterContainer().append(userTagsFilterInput));
		contentTypeFilter.append(getHiddenFilterContainer().append(dateInputSection));
	}
		
	function getInput(className, inputType) {
		inputType = inputType || 'text'
		return $('<input type="' + inputType + '" class="' + className + '" size="15" />');
	}

	function getDateInput(className) {
		return getInput(className, 'date');
	}
	
	function getDateInputSection() {
		startDateInput = getDateInput('mal-ext-content-start-date-filter');
		endDateInput = getDateInput('mal-ext-content-end-date-filter');
		
		return $('<span />')
			.addClass('mal-ext-content-date-filter-section')
			.append(startDateInput)
			.append('<span> – </span>')
			.append(endDateInput);
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
		var prioritySelect = $('.mal-ext-content-priority-filter');
		var titleInput = $('.mal-ext-content-title-filter');
		var synopsisInput = $('.mal-ext-content-synopsis-filter');
		var userTagsInput = $('.mal-ext-content-user-tags-filter');
		var dateInputSection = $('.mal-ext-content-date-filter-section');
		
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
			else if (val === 'Priority') {
				showSelectedFilter(prioritySelect)
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
			else if (val === 'Date') {
				showSelectedFilter(dateInputSection)
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
	
		prioritySelect.on('change', function(event) {
			closeInfoPopover();
			filterAnimeByPriority($(this).val());
		});
	
		setupTitleFilterEvent(titleInput);
		setupSynopsisFilterEvent(synopsisInput);
		setupUserTagsFilterEvent(userTagsInput);
		setupDateFilterEvent();
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
	
	function setupDateFilterEvent() {
		var eventType = 'change';
		setupInputFilterEvent(startDateInput, filterAnimeByDate, eventType);
		setupInputFilterEvent(endDateInput, filterAnimeByDate, eventType);
	}
	
	function setupInputFilterEvent(input, callback, eventType) {
		eventType = eventType || 'keyup'
		var filterTimeout;
		input.on(eventType, function(event) {
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
		filter.find('select').val('All').trigger('change');
		filter.find('input').val('').trigger('keyup').trigger('change');
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
	
	function filterAnimeByPriority(val) {
		var showIfTrueFunction = getShowIfTrueValueIsEqualFunction(val);
		filterAnime(priorityField, val, showIfTrueFunction);
	}
	
	function filterAnimeByTitle(val) {
		var showIfTrueFunction = getShowIfTrueAnyValueInListIsLikeAnyFunction(val);
		filterAnime(fieldAllTitles, val, showIfTrueFunction, '');
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
	
	function filterAnimeByDate() {
		var startDateInputVal = startDateInput.val();
		var endDateInputVal = endDateInput.val();
		
		var testFunction = getDateFilterTestFunction(startDateInputVal, endDateInputVal);
		
		var showIfTrueFunction = function(startDateTestValGroup, endDateTestValGroup) {
			var startDateTestVal = startDateTestValGroup.sort_value;
			var endDateTestVal = endDateTestValGroup.sort_value;
			
			return testFunction(startDateTestVal, endDateTestVal);
		};
		
		filterAnime([parsedStartDateField, parsedEndDateField], [startDateInputVal, endDateInputVal], showIfTrueFunction, '');
	}
	
	function getDateFilterTestFunction(startDateInputVal, endDateInputVal) {
		if (startDateInputVal === '' && endDateInputVal === '') {
			return function() {
				return true;
			};
		}
		
		var startDateTestFunction = function(startDateTestVal, endDateTestVal) {
			return endDateTestVal >= startDateInputVal;
		};
	
		var endDateTestFunction = function(startDateTestVal, endDateTestVal) {
			return startDateTestVal <= endDateInputVal;
		};
		
		if (startDateInputVal === '') {
			return endDateTestFunction;
		}
	
		if (endDateInputVal === '') {
			return startDateTestFunction;
		}
		
		if (startDateInputVal > endDateInputVal) {
			// Both dates are set and start date is after end date.
			return function() {
				return false;
			};
		}
		
		return function(startDateTestVal, endDateTestVal) {
			return startDateTestFunction(startDateTestVal, endDateTestVal) && endDateTestFunction(startDateTestVal, endDateTestVal);
		};
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
	
	function filterAnime(fields, inputVals, showIfTrueFunction, showAllValue) {
		if (typeof fields === 'string') {
			fields = [fields];
		}
		
		if (typeof inputVals === 'string') {
			inputVals = [inputVals];
		}
		
		if (typeof showAllValue === 'undefined') {
			showAllValue = 'All';
		}
		
		if (everyEqualsVal(inputVals, showAllValue)) {
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
				
				var fieldValues = fields.map(function(field) {
					return anime.details[field];
				});
				
				var isVisible = showIfTrueFunction.apply(null, fieldValues);
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
	
	function everyEqualsVal(valList, compareVal) {
		return valList.every(function(val) {
			return val.trim() === compareVal;
		});
	}
	
	return {
		run: run
	};
})();