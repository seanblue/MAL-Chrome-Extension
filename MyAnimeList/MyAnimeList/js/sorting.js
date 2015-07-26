var sorting = (function() {
	var sortingTypes = ['Default', 'Average Score', 'Rank', 'Popularity', 'Favorited', 'Rating', 'Episodes'];
	var ratings = actualRatings.concat(['None']);
	var mainSortingSelect;
	
	function run() {
		$.when.apply(undefined, loadAnimePromises).always(function() {
			insertSortingElements();
			addSortingEvents();
		});
	}
	
	function insertSortingElements() {
		mainSortingSelect = getSelect('mal-ext-content-main-sorting');
		addOptions(mainSortingSelect, sortingTypes);
		
		var sortingSection = $(sortingSectionSelector);
		var sortingSpan = $('<span>Sort: </span>');
		sortingSection.append(sortingSpan);
		
		sortingSpan.append(getSortingContainer().append(mainSortingSelect));
	}
	
	function getSortingContainer() {
		return $('<span class="mal-ext-sorting-container" />');
	}
	
	function addSortingEvents() {
		mainSortingSelect.on('change', function() {
			closeInfoPopover();
			
			var val = $(this).val();
			if (val === 'Default') {
				sortWithInitialOrder();
			}
			if (val === 'Average Score') {
				sortAnimeByAverageScore()
			}
			else if (val === 'Rank') {
				sortAnimeByRank()
			}
			else if (val === 'Popularity') {
				sortAnimeByPopularity()
			}
			else if (val === 'Favorited') {
				sortAnimeByFavorited()
			}
			else if (val === 'Rating') {
				sortAnimeByRating();
			}
			else if (val === 'Episodes') {
				sortAnimeByNumberOfEpisodes();
			}
		});
	}
	
	function sortWithInitialOrder() {
		sortAnime(function(sectionData) {
			return sectionData.original_order.slice();
		});
	}
	
	function sortAnimeByAverageScore() {
		var field = 'members_score';
		var sortDescending = true;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, sortDescending);
		});
	}
	
	function sortAnimeByRank() {
		var field = 'rank';
		var sortDescending = false;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, sortDescending);
		});
	}
	
	function sortAnimeByPopularity() {
		var field = 'popularity_rank';
		var sortDescending = false;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, sortDescending);
		});
	}
	
	function sortAnimeByFavorited() {
		var field = 'favorited_count';
		var sortDescending = true;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, sortDescending);
		});
	}
	
	function sortAnimeByRating() {
		var field = 'classification';
		var sortDescending = false;
		
		var getValueMethod = function(val) {
			return ratings.indexOf(val);
		};
		
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, sortDescending, getValueMethod);
		});
	}
	
	function sortAnimeByNumberOfEpisodes() {
		var field = 'episodes';
		var sortDescending = true;
		sortAnime(function(sectionData) {
			return getSortedOrder(sectionData, field, sortDescending);
		});
	}
	
	function sortAnime(sortMethod) {
		for (var section in animeDataBySection) {
			var rowColorNumber = getRowColorNumber();
			var sectionData = animeDataBySection[section];
			var sectionHeader = sectionData.el.find(animeSectionHeaderRowSelector);
			
			sectionData.order =  sortMethod(sectionData);
			for (var i = 0; i < sectionData.order.length; i++) {
				var id = sectionData.order[i];
				var anime = sectionData.data[id];

				sectionHeader.append(anime.el);
				
				if (anime.visible) {
					updateRowColor(anime.el, rowColorNumber);
					rowColorNumber = getRowColorNumber(rowColorNumber);
				}
			}
		}
	}
	
	function getSortedOrder(sectionData, field, reverseSort, getValueMethod) {
		getValueMethod = getValueMethod || function(val) {
			return val;
		};
		
		var sortBeforeMethod = getSortBeforeMethod(reverseSort);
		var sortAfterMethod = getSortAfterMethod(reverseSort);
		
		sectionData.order.sort(function(id1, id2) {
			var anime1 = sectionData.data[id1].details;
			var anime2 = sectionData.data[id2].details;
			
			if (sortBeforeMethod(anime1, anime2, field, getValueMethod)) {
				return -1;
			}
			
			if (sortAfterMethod(anime1, anime2, field, getValueMethod)) {
				return 1;
			}
			
			if (anime1.title < anime2.title) {
				return -1;
			}
			
			if (anime1.title > anime2.title) {
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