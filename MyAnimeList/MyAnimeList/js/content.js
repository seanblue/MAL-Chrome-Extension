(function() {
	var testLimit = 5;
	var animeGroupClass = 'mal-ext-anime-container';
	var animeGroupSelector = '.' + animeGroupClass;
	var animeData = {};
	var animeDivs;
	var animeHeaderTables;
	var animeMoreSectionTables;
	var animeInfoDiv;
	var activeFilterClass = 'mal-ext-active-filter';
	var filterTypes = ['None', 'Type', 'Genre'];
	var mediaTypes = ['All', 'TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'];
	var genres = ['All', 'Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids', 'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai', 'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'];
		
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
		loadAnime();
	}

	function wrapAnime() {
		animeMoreSectionTables = $('[id^="more"');
		animeMoreSectionTables.each(function(index, el) {
			var moreDiv = $(el);
			var id = moreDiv.attr('id').slice(4);
			var animeTable = moreDiv.prev();
			animeTable.wrap(function() {
				return '<div class="' + animeGroupClass + '" data-anime-id="' + id + '"></div>';
			});
			animeTable.parent().append(moreDiv);
		});
	}
	
	function loadAnime() {
		animeDivs = $(animeGroupSelector);
		animeDivs.slice(0, testLimit).each(function(index, el) {
			var container = $(el);
			var id = getId(container);
			loadAnimeDetails(id, container);
		});
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
		animeData[id] = {
			'el': el,
			'details': details
		}
	}
	
	function runAnimeInfo() {
		insertInfoDiv();
		addInfoIcons();
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
		
		animeHeaderTables = $('.table_header').closest('tr')
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
	
	function addInfoClickEvent() {
		$('.mal-ext-info').on('click', function(event) {
			var img = $(this);
			var el = img.closest(animeGroupSelector);
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
			$('.mal-ext-popover-average').text(details.members_score);
			$('.mal-ext-popover-rank').text(details.rank);
			$('.mal-ext-popover-popularity').text(details.popularity_rank);
			$('.mal-ext-popover-favorited').text(details.favorited_count);
			
			var genres = details.genres.join(', ');
			$('.mal-ext-popover-genres').text(genres);
			
			animeInfoDiv.show();
		});
	}
	
	function addPopoverCloseEvent() {
		$('.mal-ext-close-popover').on('click', function() {
			animeInfoDiv.hide();
		});
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
		
		var filterSection = $('<td class="mal-ext-filter-section" />');
		var contentTypeFilter = $('<span>Filter Type: </span>');
		filterSection.append(contentTypeFilter);
		
		contentTypeFilter.append(getFilterContainer().append(mainFilterSelect));
		contentTypeFilter.append(getFilterContainer().addClass('mal-ext-hidden').append(contentTypeFilterSelect));
		contentTypeFilter.append(getFilterContainer().addClass('mal-ext-hidden').append(genreFilterSelect));
		existingTd.after(filterSection);
	}
	
	function getFilterContainer() {
		return $('<span class="mal-ext-filter-container" />');
	}
	
	function getFilterSelect(className) {
		return $('<select class="' + className + '" />');
	}
	
	function addOptions(select, options) {
		for (var i = 0; i < options.length; i++) {
			select.append(getOptionTag(options[i]));
		}
	}
	
	function getOptionTag(value) {
		return '<option value="' + value + '">' + value + '</option>';
	}
	
	function addFilterEvents() {
		var mainSelect = $('.mal-ext-content-main-filter');
		var typeSelect = $('.mal-ext-content-type-filter');
		var genreSelect = $('.mal-ext-content-genre-filter');
		
		mainSelect.on('change', function(event) {
			hideAndUpdateVisibleFilters();
			
			var val = $(this).val();
			if (val === 'Type') {
				showSelectedFilter(typeSelect)
			}
			else if (val === 'Genre') {
				showSelectedFilter(genreSelect)
			}
		});
		
		typeSelect.on('change', function(event) {
			filterAnimeByType($(this).val());
		});
		
		genreSelect.on('change', function(event) {
			filterAnimeByGenre($(this).val());
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
	
	function filterAnime(field, val, showIfTrueFunction) {
		if (val === 'All') {
			$(animeGroupSelector).show();
			return;
		}
		
		for (var key in animeData) {
			var anime = animeData[key];
			if (showIfTrueFunction(anime.details[field]) === true) {
				anime.el.show();
			}
			else {
				anime.el.hide();
			}
		}
	}
	
})();