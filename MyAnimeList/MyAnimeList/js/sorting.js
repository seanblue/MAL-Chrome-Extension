var sorting = (function() {
	var sortingTypes = ['Default', 'Title', 'Average Score', 'Rank', 'Popularity', 'Favorited', 'Rating', 'Episodes', 'Start Date', 'End Date'];
	var ratings = actualRatings.concat(['None']);
	var mainSortingSelect;
	var mainSortingReverseCheckbox;
	var reverseSortingSpan;
	
	function run() {
		runAfterAllAnimeDataSuccessfullyLoaded(function() {
			insertSortingElements();
			addSortingEvents();
		});
	}
	
	function insertSortingElements() {
		var sortingSection = $(sortingSectionSelector);
		
		mainSortingSelect = getSelect('mal-ext-content-main-sorting');
		addOptions(mainSortingSelect, sortingTypes);
		
		var sortingSpan = getSortingContainer('Sort: ');
		sortingSection.append(sortingSpan);
		sortingSpan.append(mainSortingSelect);
		
		mainSortingReverseCheckbox = $('<input type="checkbox" />');
		reverseSortingSpan = getSortingContainer('Reverse Sort?: ').hide();
		sortingSection.append(reverseSortingSpan);
		reverseSortingSpan.append(mainSortingReverseCheckbox);
	}
	
	function getSortingContainer(text) {
		return $('<span class="mal-ext-sorting-container">' + text + '</span>');
	}
	
	function hideReverseSorting() {
		reverseSortingSpan.hide();
	}
	
	function showReverseSorting() {
		reverseSortingSpan.show();
	}
	
	function addSortingEvents() {
		mainSortingSelect.add(mainSortingReverseCheckbox).on('change', function() {
			closeInfoPopover();
			
			var val = mainSortingSelect.val();
			if (val === 'Default') {
				hideReverseSorting()
				sortWithInitialOrder();
			}
			if (val === 'Title') {
				showReverseSorting();
				sortAnimeByTitle()
			}
			if (val === 'Average Score') {
				showReverseSorting();
				sortAnimeByAverageScore()
			}
			else if (val === 'Rank') {
				showReverseSorting();
				sortAnimeByRank()
			}
			else if (val === 'Popularity') {
				showReverseSorting();
				sortAnimeByPopularity()
			}
			else if (val === 'Favorited') {
				showReverseSorting();
				sortAnimeByFavorited()
			}
			else if (val === 'Rating') {
				showReverseSorting();
				sortAnimeByRating();
			}
			else if (val === 'Episodes') {
				showReverseSorting();
				sortAnimeByNumberOfEpisodes();
			}
			else if (val === 'Start Date') {
				showReverseSorting();
				sortAnimeByStartDate();
			}
			else if (val === 'End Date') {
				showReverseSorting();
				sortAnimeByEndDate();
			}
		});
	}
	
	function getReverseSort() {
		return mainSortingReverseCheckbox.is(':checked');
	}
	
	function sortWithInitialOrder() {
		sortAnime(function(sectionData) {
			return sectionData.originalOrder.slice();
		});
	}
	
	function sortAnimeByTitle() {
		var field = fieldCaseInsensitiveTitle;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field);
		});
	}
	
	function sortAnimeByAverageScore() {
		var field = fieldMemberScore;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field);
		});
	}
	
	function sortAnimeByRank() {
		var field = fieldRank;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field);
		});
	}
	
	function sortAnimeByPopularity() {
		var field = fieldPopularityRank;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field);
		});
	}
	
	function sortAnimeByFavorited() {
		var field = fieldFavoritedCount;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field);
		});
	}
	
	function sortAnimeByRating() {
		var field = fieldClassification;
		
		var getValueMethod = function(val) {
			return ratings.indexOf(val);
		};
		
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, getValueMethod);
		});
	}
	
	function sortAnimeByNumberOfEpisodes() {
		var field = fieldEpisodeCount;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field);
		});
	}
	
	function sortAnimeByStartDate() {
		sortAnimeByDate(fieldStartDate);
	}
	
	function sortAnimeByEndDate() {
		sortAnimeByDate(fieldEndDate);
	}
	
	function sortAnimeByDate(field) {
		var getValueMethod = function(dateObj) {
			return dateObj.sort_value;
		};
		
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, getValueMethod);
		});
	}
	
	function sortAnime(sortMethod) {
		for (var section in animeDataBySection) {
			var rowColorNumber = getRowColorNumber();
			var sectionData = animeDataBySection[section];
			var sectionHeader = sectionData.el.find(animeSectionHeaderRowSelector);
			
			sectionData.order =  sortMethod(sectionData);
			var orderNumber = 1;
			for (var i = 0; i < sectionData.order.length; i++) {
				var id = sectionData.order[i];
				var anime = sectionData.data[id];

				sectionHeader.append(anime.el);
				
				if (anime.visible) {
					updateRowColor(anime.el, rowColorNumber);
					updateRowNumber(anime.orderTd, orderNumber);
					
					rowColorNumber = getRowColorNumber(rowColorNumber);
					orderNumber++;
				}
			}
		}
	}
	
	function getSortedOrder(sectionData, field, getValueMethod) {
		getValueMethod = getValueMethod || function(val) {
			return val;
		};
		
		var reverseSort = getReverseSort();
		
		var sortBeforeMethod = getSortBeforeMethod(reverseSort);
		var sortAfterMethod = getSortAfterMethod(reverseSort);
		
		var tieBreakField = fieldCaseInsensitiveTitle;
		sectionData.order.sort(function(id1, id2) {
			var anime1 = sectionData.data[id1].details;
			var anime2 = sectionData.data[id2].details;
			
			if (sortBeforeMethod(anime1, anime2, field, getValueMethod)) {
				return -1;
			}
			
			if (sortAfterMethod(anime1, anime2, field, getValueMethod)) {
				return 1;
			}
			
			if (anime1[tieBreakField] < anime2[tieBreakField]) {
				return -1;
			}
			
			if (anime1[tieBreakField] > anime2[tieBreakField]) {
				return 1;
			}
			
			return 0;
		});
		
		return sectionData.order;
	}
	
	function getSortBeforeMethod(reverseSort) {
		return reverseSort ? sortAfterMethodNormal : sortBeforeMethodNormal;
	}
	
	function getSortAfterMethod(reverseSort) {
		return reverseSort ? sortBeforeMethodNormal : sortAfterMethodNormal;
	}
	
	function sortBeforeMethodNormal(anime1, anime2, field, getValueMethod) {
		return getValueMethod(anime1[field]) < getValueMethod(anime2[field]);
	}
	
	function sortAfterMethodNormal(anime1, anime2, field, getValueMethod) {
		return getValueMethod(anime1[field]) > getValueMethod(anime2[field]);
	}
	
	return {
		run: run
	};
})();