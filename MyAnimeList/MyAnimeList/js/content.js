(function() {
	var animeContainerClass = 'mal-ext-anime-container';
	var animeContainerSelector = '.' + animeContainerClass;
	var animeSectionHeaderRowClass = 'mal-ext-section-header-table';
	var animeSectionHeaderRowSelector = '.' + animeSectionHeaderRowClass;
	var animeSectionClass = 'mal-ext-anime-section';
	var animeSectionSelector = '.' + animeSectionClass;
	
	var sectionHeaderTitleTables;
	var sectionHeaderRowTables;
	var sectionFooterTables;
	
	var animeData = {};
	var animeDataBySection = {};
	var animeDivs;
	var animeMoreSectionTables;
	var animeInfoDiv;
	var activeFilterClass = 'mal-ext-active-filter';
	
	var filterTypes = ['None', 'Type', 'Genre', 'Rating'];
	var mediaTypes = ['All', 'TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'];
	var genres = ['All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids', 'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'];
	var ratingsValues = ['All', 'G - All Ages', 'PG - Children', 'PG-13 - Teens 13 or older', 'R - 17+ (violence & profanity)', 'R+ - Mild Nudity', 'Rx - Hentai']
	var ratingsTexts = ['All', 'G', 'PG', 'PG-13', 'R', 'R+', 'Rx'];
	
	$(document).ready(function() {
		run();
	});

	function run() {
		runPreprocessing();
		runAnimeInfo();
		runFiltering();
	}
	
	function runPreprocessing() {
		wrapAnime();
		wrapAnimeHeadersAndFooters();
		wrapAnimeSections();
		loadAnime();
	}

	function wrapAnime() {
		animeMoreSectionTables = $('[id^="more"');
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
			var id = getId(container);
			
			var sectionName = getSectionName(el);
			animeDataBySection[sectionName].order.push(id);
			
			loadAnimeDetails(id, container);
		});
	}
	
	function getTestLimit() {
		return localStorage.testLimit;
	}
	
	function getId(container) {
		return container.data('anime-id');
	}
	
	function loadAnimeDetails(id, container) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', getApiUrl(id), true);
		xhr.onreadystatechange = function(event) {
			if (xhr.readyState == 4) {
				var animeDetails = JSON.parse(event.target.response);
				saveAnimeDetails(id, container, animeDetails);
			}
		}
		xhr.send();
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
	
	function runAnimeInfo() {
		insertInfoDiv();
		addInfoIcons();
		shiftNonAnimeTables();
		addInfoClickEvent();
		addPopoverCloseEvent();
	}
	
	function insertInfoDiv() {
		animeInfoDiv = $('<div class="mal-ext-popover" />');
		animeInfoDiv.prependTo('body');
		
		var animePaddedDiv = $('<div class="mal-ext-popover-inner" />');
		animeInfoDiv.append(animePaddedDiv);
		insertInfoDivContent(animePaddedDiv);		
	}
	
	function insertInfoDivContent(animePaddedDiv) {
		var closeIconPath = chrome.extension.getURL('icons/close.png');
		animePaddedDiv.append('<span class="mal-ext-close-popover-span"><img class="mal-ext-close-popover" src="' + closeIconPath + '" height="12" width="12" /></span>');
		
		animePaddedDiv.append(getContentDiv('Title', 'title'));
		animePaddedDiv.append(getContentDiv('Average Score', 'average'));
		animePaddedDiv.append(getContentDiv('Rank', 'rank'));
		animePaddedDiv.append(getContentDiv('Popularity', 'popularity'));
		animePaddedDiv.append(getContentDiv('Favorited', 'favorited'));
		animePaddedDiv.append(getContentDiv('Genres', 'genres'));
	}
	
	function getContentDiv(title, contentClass) {
		return '<div class="mal-ext-popover-content"><span class="mal-ext-popover-header">' + title + ': </span><span class="mal-ext-popover-' + contentClass + '" /></div>';
	}
	
	function addInfoIcons() {
		var infoIconPath = chrome.extension.getURL('icons/info.png');
		
		var animeHeaderTables = $('.table_header').closest('tr')
		animeHeaderTables.each(function(index, el) {
			$(el).prepend(getInfoTd());
		});
		
		animeDivs.each(function(index, el) {
			$(el).find('table tbody tr').prepend(getInfoTd().append('<img class="mal-ext-info" src="' + infoIconPath + '" height="16" width="16" />'));
		});
	}
	
	function getInfoTd() {
		return $('<td class="mal-ext-info-col" width="20" />');
	}
	
	function shiftNonAnimeTables() {
		var headerTables = $('table[class^=header]');
		var categoryTotalTables = $('.category_totals').closest('table')
		headerTables.add(categoryTotalTables).css({
			'marginLeft': '20px',
			'width': 'calc(100% - 20px)'
		});
	}
	
	function addInfoClickEvent() {
		$('.mal-ext-info').on('click', function(event) {
			var img = $(this);
			var el = img.closest(animeContainerSelector);
			var id = getId(el);
			var anime = animeData[id];
			if (typeof anime === 'undefined') {
				return;
			}
			
			var details = anime.details;
			
			var position = img.position();
			var x = position.left + 16;
			var y = position.top + 8;
			
			animeInfoDiv.css({
				'left': x,
				'top': y
			});
			
			$('.mal-ext-popover-title').text(details.title);
			$('.mal-ext-popover-average').text(details.members_score.toFixed(2));
			$('.mal-ext-popover-rank').text(details.rank.toLocaleString());
			$('.mal-ext-popover-popularity').text(details.popularity_rank.toLocaleString());
			$('.mal-ext-popover-favorited').text(details.favorited_count.toLocaleString());
			
			var genres = details.genres.join(', ');
			$('.mal-ext-popover-genres').text(genres);
			
			animeInfoDiv.show();
		});
	}
	
	function addPopoverCloseEvent() {
		$('.mal-ext-close-popover').on('click', function() {
			closeInfoPopover();
		});
	}
	
	function closeInfoPopover() {
		animeInfoDiv.hide();
	}
	
	function runFiltering() {
		insertFilterElements();
		addFilterEvents();
	}

	function insertFilterElements() {
		var existingTd = $('#mal_cs_otherlinks');
		existingTd.css({'width': '325px'});
		
		var mainFilterSelect = getFilterSelect('mal-ext-content-main-filter');
		addOptions(mainFilterSelect, filterTypes);
		
		var contentTypeFilterSelect = getFilterSelect('mal-ext-content-type-filter');
		addOptions(contentTypeFilterSelect, mediaTypes);
		
		var genreFilterSelect = getFilterSelect('mal-ext-content-genre-filter');
		addOptions(genreFilterSelect, genres);
		
		var ratingFilterSelect = getFilterSelect('mal-ext-content-rating-filter');
		addOptions(ratingFilterSelect, ratingsValues, ratingsTexts);
		
		var filterSection = $('<td class="mal-ext-filter-section" />');
		var contentTypeFilter = $('<span>Filter: </span>');
		filterSection.append(contentTypeFilter);
		
		contentTypeFilter.append(getFilterContainer().append(mainFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(contentTypeFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(genreFilterSelect));
		contentTypeFilter.append(getHiddenFilterContainer().append(ratingFilterSelect));
		existingTd.after(filterSection);
	}
	
	function getHiddenFilterContainer() {
		return getFilterContainer().addClass('mal-ext-hidden');
	}
	
	function getFilterContainer() {
		return $('<span class="mal-ext-filter-container" />');
	}
	
	function getFilterSelect(className) {
		return $('<select class="' + className + '" />');
	}
	
	function addOptions(select, values, texts) {
		if (typeof texts === 'undefined') {
			texts = values;
		}
		
		for (var i = 0; i < values.length; i++) {
			select.append(getOptionTag(values[i], texts[i]));
		}
	}
	
	function getOptionTag(value, text) {
		return '<option value="' + value + '">' + text + '</option>';
	}
	
	function addFilterEvents() {
		var mainSelect = $('.mal-ext-content-main-filter');
		var typeSelect = $('.mal-ext-content-type-filter');
		var genreSelect = $('.mal-ext-content-genre-filter');
		var ratingSelect = $('.mal-ext-content-rating-filter');
		
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
	}
	
	function hideAndUpdateVisibleFilters() {
		$('.' + activeFilterClass).removeClass(activeFilterClass).children('select').val('All').trigger('change');
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
	
	function filterAnime(field, val, showIfTrueFunction) {
		if (val === 'All') {
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
				
				if (showIfTrueFunction(anime.details[field]) === true) {
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
	
	function updateRowColor(container, rowColorNumber) {
		var classStart = 'mal-ext-row-color';
		container.removeClass(classStart + '1' + ' ' + classStart + '2').addClass(classStart + rowColorNumber);
	}
	
	function getRowColorNumber(current) {
		if (current === '1') {
			return '2';
		}
		
		return '1';
	}
	
})();