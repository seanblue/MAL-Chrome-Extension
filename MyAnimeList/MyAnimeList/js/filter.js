var filtering = (function() {
	var activeFilterClass = 'mal-ext-active-filter';
	var activeFilterSelector = '.' + activeFilterClass;
	
	var userTagsField = 'mal_ext_user_tags';

	var filterTypes = ['None', 'Type', 'Genre', 'Rating', 'Title', 'Tag'];
	var mediaTypes = ['All', 'TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'];
	var genres = ['All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids', 'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'];
	var ratingsValues = ['All'].concat(actualRatings);
	var ratingsTexts = ['All', 'G', 'PG', 'PG-13', 'R', 'R+', 'Rx'];
	
	function run() {
		$.when.apply(undefined, loadAnimePromises).always(function() {
			addTagsToAnimeDetails();
			insertFilterElements();
			addFilterEvents();
		});
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
		animeData[id].details[userTagsField] = tags;
	}
	
	function insertFilterElements() {
		var existingTd = $('#mal_cs_otherlinks');
		
		var mainFilterSelect = getSelect('mal-ext-content-main-filter');
		addOptions(mainFilterSelect, filterTypes);
		
		var contentTypeFilterSelect = getSelect('mal-ext-content-type-filter');
		addOptions(contentTypeFilterSelect, mediaTypes);
		
		var genreFilterSelect = getSelect('mal-ext-content-genre-filter');
		addOptions(genreFilterSelect, genres);
		
		var ratingFilterSelect = getSelect('mal-ext-content-rating-filter');
		addOptions(ratingFilterSelect, ratingsValues, ratingsTexts);
		
		var titleFilterInput = getInput('mal-ext-content-title-filter');
		
		var userTagsFilterInput = getInput('mal-ext-content-user-tags-filter');
		
		var filterSection = $('<td class="' + filteringSectionClass + '" />');
		var contentTypeFilter = $('<span>Filter: </span>');
		filterSection.append(contentTypeFilter);
		
		contentTypeFilter.append(getFilterContainer().append(mainFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(contentTypeFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(genreFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(ratingFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(titleFilterInput));
		contentTypeFilter.append(getHiddenFilterContainer().append(userTagsFilterInput));
		existingTd.after(filterSection);
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
		var titleInput = $('.mal-ext-content-title-filter');
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
			else if (val === 'Title') {
				showSelectedFilter(titleInput)
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
	
		setupTitleFilterEvent(titleInput);
		setupUserTagsFilterEvent(userTagsInput);
	}
	
	function setupTitleFilterEvent(titleInput) {
		var filterTimeout;
		titleInput.on('keyup', function(event) {
			closeInfoPopover();
			
			var inputVal = $(this).val();
			clearTimeout(filterTimeout);
			filterTimeout = setTimeout(function() {
				filterAnimeByTitle(inputVal);
			}, 500);
		});
	}
	
	function setupUserTagsFilterEvent(userTagsInput) {
		var filterTimeout;
		userTagsInput.on('keyup', function(event) {
			closeInfoPopover();
			
			var inputVal = $(this).val();
			clearTimeout(filterTimeout);
			filterTimeout = setTimeout(function() {
				filterAnimeByUserTag(inputVal);
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
		var showIfTrueFunction = function(type) {
			return type === val;
		}
		
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
		var showIfTrueFunction = function(rating) {
			return rating === val;
		}
		
		filterAnime(field, val, showIfTrueFunction);
	}
	
	function filterAnimeByTitle(val) {
		val = val.trim().toLowerCase();
		
		var showIfTrueFunction = function(allTitles) {
			return allTitles.some(function(title) {
				return title.toLowerCase().indexOf(val) !== -1;
			});
		}
		
		filterAnime(allTitlesField, val, showIfTrueFunction, '');
	}
	
	function filterAnimeByUserTag(val) {
		val = val.trim().toLowerCase();
		
		var showIfTrueFunction = function(userTags) {
			return userTags.some(function(tag) {
				return tag.toLowerCase().indexOf(val) !== -1;
			});
		}
		
		filterAnime(userTagsField, val, showIfTrueFunction, '');
	}
	
	function filterAnime(field, val, showIfTrueFunction, showAllValue) {
		if (typeof showAllValue === 'undefined') {
			showAllValue = 'All';
		}
		
		if (val === showAllValue) {
			showIfTrueFunction = function() {
				return true;
			}
		}
		
		for (var section in animeDataBySection) {
			var rowColorNumber = getRowColorNumber();
			var sectionData = animeDataBySection[section];
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
					anime.el.show();
					rowColorNumber = getRowColorNumber(rowColorNumber);
				}
				else {
					anime.el.hide();
				}
			}
		}
	}
	
	return {
		run: run
	};
})();