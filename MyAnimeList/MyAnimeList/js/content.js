(function() {
	var animeSectionClass = 'mal-ext-anime-section';
	var animeSectionSelector = '.' + animeSectionClass;

	var sectionHeaderTitleTables;
	var sectionFooterTables;

	$(document).ready(function() {
		run();
	});

	function run() {
		runPreprocessing();
		runAnimeInfo();
		filtering.run();
	}
	
	function runPreprocessing() {
		wrapAnime();
		wrapAnimeHeadersAndFooters();
		wrapAnimeSections();
		loadAnime();
	}

	function wrapAnime() {
		var animeMoreSectionTables = $('[id^="more"');
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
			var id = getAnimeId(container);
			
			var sectionName = getSectionName(el);
			animeDataBySection[sectionName].order.push(id);
			
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
			var id = getAnimeId(img);
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
})();