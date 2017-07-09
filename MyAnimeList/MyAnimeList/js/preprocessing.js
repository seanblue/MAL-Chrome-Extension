var preprocessing = (function() {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	var limitedAnimeDivs;
	var totalAnimeToLoad;
	var animeLoadedSoFar = 0;
	var loadingInterval;
	var maxLoadRetries = 9;
	
	function run() {
		setupAnimeDataSections();
		setAnimeDivsAndCount();
		loadAnimeIfPossible();
		
		runAfterAllAnimeDataSuccessfullyLoaded(function() {
			addUIDataToAnimeDetails();
			updateAllSectionCounts();
		});
	}
	
	function setupAnimeDataSections() {
		hasTagsColumn = false;
		hasPriorityColumn = false;
		
		$(animeSectionSelector).each(function (index, el) {
			var section = $(el);
			var sectionName = section.data('anime-section');
			var header = section.find(animeSectionHeaderRowSelector);
			var tagsColumnIndex = getColumnHeaderIndex(header, 'Tags');
			var priorityColumnIndex = getColumnHeaderIndex(header, 'Priority');
			
			hasTagsColumn = hasTagsColumn || (tagsColumnIndex > 0)
			hasPriorityColumn = hasPriorityColumn || (priorityColumnIndex > 0)
			
			animeDataBySection[sectionName] = {
				order: [],
				originalOrder: [],
				data: {},
				el: section,
				tagsColumnIndex: tagsColumnIndex,
				priorityColumnIndex: priorityColumnIndex,
				totalHidden: 0
			};
		});
	}

	function getColumnHeaderIndex(header, columnName) {
		var allTd = header.find('td');
		var columnTd = header.find('td:contains("' + columnName + '")');
		
		return allTd.index(columnTd) + 1;
	}
	
	function addUIDataToAnimeDetails() {
		animeDivs.each(function(index, el) {
			var sectionName = getSectionName(el);
			var sectionData = animeDataBySection[sectionName];
			
			addTagsToAnimeDetailsForAnime(el, sectionData.tagsColumnIndex);
			addPriorityToAnimeDetailsForAnime(el, sectionData.priorityColumnIndex);			
		});
	}
	
	function addTagsToAnimeDetailsForAnime(animeEl, tagsColumnIndex) {
		if (!hasTagsColumn) {
			return;
		}
		
		var id = getAnimeId(animeEl);
		var anime = animeData[id];
		if (typeof anime === 'undefined') {
			// If not within test limit, no data is loaded.
			return;
		}
		
		var td = getTdForColumnIndex(animeEl, tagsColumnIndex);
		var tags = td.find('[id^=tagLinks]').text().split(',');
		tags = $.map(tags, function(el) {
			return el.trim();
		});
		
		anime.details[userTagsField] = tags;
	}
	
	function addPriorityToAnimeDetailsForAnime(animeEl, priorityColumnIndex) {
		if (!hasPriorityColumn) {
			return;
		}
		
		var id = getAnimeId(animeEl);
		var anime = animeData[id];
		if (typeof anime === 'undefined') {
			// If not within test limit, no data is loaded.
			return;
		}
		
		var td = getTdForColumnIndex(animeEl, priorityColumnIndex);
		var priority = td.text().trim();
		
		anime.details[priorityField] = priority;
	}
	
	function getTdForColumnIndex(animeEl, columnIndex) {
		return $(animeEl).find('table:first td:eq(' + columnIndex + ')');
	}
	
	function setAnimeDivsAndCount() {
		animeDivs = $(animeContainerSelector);
		limitedAnimeDivs = animeDivs.slice(0, getTestLimit());
		totalAnimeToLoad = limitedAnimeDivs.length;
	}
	
	function loadAnimeIfPossible() {
		apiTestPromise = runApiTest();
		
		apiTestPromise.done(function() {
			apiIsAvailable = true;
			
			handleLoadingStatus();
			loadAnime();
			handleClearLoadingStatus();
		}).fail(function() {
			handleApiUnavailable();
		});
	}
	
	function runApiTest() {
		var deferred = $.Deferred();
		makeApiCall(1, apiTestCallback, deferred);
		
		return deferred.promise();
	}
	
	function apiTestCallback(deferred, apiResponse) {
		if (apiResponse.success) {
			deferred.resolve();
		}
		else {
			deferred.reject();
		}
	}
	
	function makeApiCall(id, onReadyCallback, deferred, attemptNumber) {
		attemptNumber = attemptNumber || 1;
		
		chrome.runtime.sendMessage({
			type: 'apirequest',
			id: id
		},
		function(apiResponse) {
			onReadyCallback(deferred, apiResponse, attemptNumber);
		});
	}
	
	function handleApiUnavailable() {
		$(loadingSectionSelector).html('<span>Anime data could not be updated</span>');
	}

	function handleLoadingStatus() {
		loadingInterval = setInterval(function() {
			updateLoadedStatus();
		}, 1000);
	}
	
	function handleClearLoadingStatus() {
		$.when.apply(undefined, loadAnimePromises).always(function() {
			clearInterval(loadingInterval);
			
			if (allAnimeSuccessfullyLoaded()) {
				var now = new Date();
				$(loadingSectionSelector).html('<span>Last updated ' + now.toLocaleDateString() + ' at ' + now.toLocaleTimeString() + '</span>');
			}
			else {
				$(loadingSectionSelector).html('<span>Failed to load ' + animeFailedToLoad + ' anime. Try to reload the page.</span>');
			}
		});
	}
	
	function updateLoadedStatus() {
		var loadingStatusEl = $(loadingStatusSelector);
		loadingStatusEl.text(animeLoadedSoFar + '/' + totalAnimeToLoad);
	}

	function loadAnime() {
		limitedAnimeDivs.each(function(index, el) {
			var container = $(el);
			var id = getAnimeId(container);
			
			var sectionName = getSectionName(el);
			var sectionData = animeDataBySection[sectionName];
			sectionData.order.push(id);
			sectionData.originalOrder.push(id);
			
			var promise = loadAnimeDetails(id, container, index);
			loadAnimePromises.push(promise);
		});
	}
	
	function getTestLimit() {
		return localStorage.testLimit;
	}
	
	function loadAnimeDetails(id, container, requestNumber) {
		var loadAnimeDetailsCallback = function(deferred, apiResponse, attemptNumber) {
			if (apiResponse.success) {
				loadAnimeDetailsSuccessCallback(deferred, apiResponse, id, container);
			}
			else {
				loadAnimeDetailsFailureCallback(deferred, id, attemptNumber, loadAnimeDetailsCallback);
			}
		};
		
		var deferred = $.Deferred();
		
		setTimeout(function() {
			makeApiCall(id, loadAnimeDetailsCallback, deferred);
		}, 100 * requestNumber);
		
		return deferred.promise();
	}
	
	function loadAnimeDetailsSuccessCallback(deferred, apiResponse, id, container) {
		var animeDetails = apiResponse.response;
		saveAnimeDetails(id, container, animeDetails);
		
		animeLoadedSoFar++;
		deferred.resolve();
	}
	
	function loadAnimeDetailsFailureCallback(deferred, id, attemptNumber, loadAnimeDetailsCallback) {
		if (attemptNumber <= maxLoadRetries) {
			setTimeout(function() {
				// Timeout to reduce throttling.
				makeApiCall(id, loadAnimeDetailsCallback, deferred, attemptNumber + 1);
			}, getRetryTimeoutTime(attemptNumber));
		}
		else {
			animeFailedToLoad++;
			deferred.resolve();
		}
	}
	
	// 1 => 2750
	// 2 => 3000
	// 3 => 3500
	// 4 => 4500
	// 5 => 6500
	// 6 => 10500
	// 7 => 18500
	// 8 => 34500
	// 9 => 66500
	function getRetryTimeoutTime(attemptNumber) {
		return (2500 + 250*(2^(attemptNumber-1))) * getRetryRandomFactor(0.9, 1.1);
	}
	
	function getRetryRandomFactor(min, max) {
		// Used to fluctuate the random factor to decrease consecutive failures by the same request.
		return Math.random() * (max - min) + min;
	}
	
	function saveAnimeDetails(id, el, apiDetails) {
		var localDetails = mapApiToLocalDetails(apiDetails);
		
		var orderTd = $(el.find('td')[1]);
		var data = {
			'el': el,
			'orderTd': orderTd,
			'details': localDetails,
			'visible': true
		};
		
		animeData[id] = data
		
		var sectionName = getSectionName(el);
		animeDataBySection[sectionName].data[id] = data;
	}
	
	function getSectionName(el) {
		return $(el).closest(animeSectionSelector).data('anime-section');
	}
	
	function mapApiToLocalDetails(apiDetails) {
		var localDetails = {};
		localDetails['type'] = getType(apiDetails);
		localDetails['genres'] = getGenres(apiDetails);
		localDetails['classification'] = getClassification(apiDetails);
		localDetails['status'] = getStatus(apiDetails);
		localDetails['synopsis'] = getSynopsis(apiDetails);
		localDetails['members_score'] = getMembersScore(apiDetails);
		localDetails['rank'] = getRank(apiDetails);
		localDetails['popularity_rank'] = getPopularityRank(apiDetails);
		localDetails['favorited_count'] = getFavoritedCount(apiDetails);
		localDetails['episodes'] = getEpisodeCount(apiDetails);
		
		setTitleDetails(localDetails, apiDetails);
		
		localDetails[parsedStartDateField] = getStartDate(apiDetails);
		localDetails[parsedEndDateField] = getEndDate(apiDetails);
		
		return localDetails;
	}
	
	function setTitleDetails(localDetails, apiDetails) {
		var mainTitle = apiDetails.title;
		var otherTitles = apiDetails.other_titles;
		
		localDetails[fieldMainTitle] = mainTitle;
		localDetails[fieldCaseInsensitiveTitle] = getCaseInsensitiveTitle(mainTitle);
		localDetails[fieldEnglishTitle] = getEnglishTitle(mainTitle, otherTitles);
		localDetails[fieldAllTitles] = getTitlesList(mainTitle, otherTitles);
	}
	
	function getCaseInsensitiveTitle(mainTitle) {
		return (typeof mainTitle === 'undefined') ? '' : mainTitle.toLowerCase();
	}
	
	function getTitlesList(mainTitle, otherTitles) {
		var otherTitlesList = otherTitles || {};
		otherTitlesList = $.map(otherTitlesList, function(item) {
			return item;
		});
		
		return [mainTitle].concat(otherTitlesList);
	}
	
	function getEnglishTitle(mainTitle, otherTitles) {
		var englishTitles = otherTitles.english
		if (typeof englishTitles === 'undefined' || englishTitles.length === 0) {
			// Doesn't exist.
			return null;
		}

		var englishTitle = englishTitles[0];
		if (englishTitle === mainTitle) {
			// Not unique.
			return null;
		}
		
		return englishTitle;
	}
	
	function getType(apiDetails) {
		return apiDetails['type'] || '';
	}
	
	function getGenres(apiDetails) {
		return apiDetails['genres'];
	}
	
	function getClassification(apiDetails) {
		return apiDetails['classification'];
	}
	
	function getStatus(apiDetails) {
		return apiDetails['status'];
	}
	
	function getSynopsis(apiDetails) {
		return apiDetails['synopsis'];
	}
	
	function getMembersScore(apiDetails) {
		return apiDetails['members_score'];
	}
	
	function getRank(apiDetails) {
		return apiDetails['rank'];
	}
	
	function getPopularityRank(apiDetails) {
		return apiDetails['popularity_rank'];
	}
	
	function getFavoritedCount(apiDetails) {
		return apiDetails['favorited_count'];
	}
	
	function getEpisodeCount(apiDetails) {
		return apiDetails['episodes'];
	}
	
	function getStartDate(apiDetails) {
		return getParsedAiredDateDetails(apiDetails.start_date);
	}
	
	function getEndDate(apiDetails) {
		return getParsedAiredDateDetails(apiDetails.end_date);
	}
	
	function getParsedAiredDateDetails(dateStr) {
		var displayField = 'display_name';
		var sortField = 'sort_value';
		var dateDetails = {};
		
		if (!dateStr) {
			// Unknown air date.
			dateDetails[displayField] = '?'
			dateDetails[sortField] = '9999-99-99'
		}
		else if (dateStr.length === 4 && (dateStr.startsWith('19') || dateStr.startsWith('20'))) {
			// Only a year.
			dateDetails[displayField] = dateStr;
			dateDetails[sortField] = dateStr + '-99-99'
		}
		else {
			var date = new Date(dateStr);
			var month = date.getMonth(); // zero-based
			var day = date.getDate();
			var year = date.getFullYear();
			
			dateDetails[displayField] = months[month] + ' ' + day + ', ' + year;
			dateDetails[sortField] = year + '-' + padDate(month + 1) + '-' + padDate(day);
		}
		
		return dateDetails;
	}
	
	function padDate(value) {
		if (value < 10) {
			return '0' + value;
		}
		
		return value;
	}
	
	return {
		run: run
	};
})();
