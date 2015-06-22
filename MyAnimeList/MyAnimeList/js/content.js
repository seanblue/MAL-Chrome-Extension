(function() {
	var testLimit = 5;
	var animeGroupClass = 'mal-ext-container';
	var animeGroupSelector = '.' + animeGroupClass;
	var animeData = {};
	var animeDivs;
	var animeHeaderTables;
	var animeMoreSectionTables;
	var animeInfoDiv;
		
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
		addFilterClickEvents();
	}

	function insertFilterElements() {
		var existingTd = $('#mal_cs_otherlinks');
		existingTd.css({'width': '325px'});
		
		var contentTypeFilterSelect = $('<select class="mal-ext-content-type-filter" />');
		contentTypeFilterSelect.append(getOptionTag('All'));
		contentTypeFilterSelect.append(getOptionTag('TV'));
		contentTypeFilterSelect.append(getOptionTag('OVA'));
		contentTypeFilterSelect.append(getOptionTag('Movie'));
		contentTypeFilterSelect.append(getOptionTag('Special'));
		contentTypeFilterSelect.append(getOptionTag('ONA'));
		contentTypeFilterSelect.append(getOptionTag('Music'));
		
		var filterSection = $('<td class="mal-ext-filter-section" />');
		var contentTypeFilter = $('<span>Filter Type: </span>');
		filterSection.append(contentTypeFilter);
		contentTypeFilter.append(contentTypeFilterSelect);
		existingTd.after(filterSection);
	}
	
	function getOptionTag(value) {
		return '<option value="' + value + '">' + value + '</option>';
	}
	
	function addFilterClickEvents() {
		$('.mal-ext-content-type-filter').on('change', function(event) {
			console.log('filtering');
		});
	}
	
})();