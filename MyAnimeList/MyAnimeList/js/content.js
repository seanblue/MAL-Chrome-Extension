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
		wrapAnime();
		loadAnime();
		setupInfoDiv();
		addInfoIcons();
		addInfoClickEvent();
		addPopoverCloseEvent();
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
	
	function setupInfoDiv() {
		animeInfoDiv = $('<div class="mal-ext-popover" />');
		animeInfoDiv.prependTo('body');
		
		var animePaddedDiv = $('<div class="mal-ext-popover-inner" />');
		animeInfoDiv.append(animePaddedDiv);
		setupInfoDivContent(animePaddedDiv);		
	}
	
	function setupInfoDivContent(animePaddedDiv) {
		var closeIconPath = chrome.extension.getURL('icons/close.png');
		animePaddedDiv.append('<span class="mal-ext-close-popover"><img src="' + closeIconPath + '" height="12" width="12" /></span>');
		
		animePaddedDiv.append(getContentDiv('Title', 'title'));
		animePaddedDiv.append(getContentDiv('Average Score', 'average'));
		animePaddedDiv.append(getContentDiv('Rank: ', 'rank'));
		animePaddedDiv.append(getContentDiv('Popularity: ', 'popularity'));
		animePaddedDiv.append(getContentDiv('Genres: ', 'genres'));
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
			var el = $(this).closest(animeGroupSelector);
			var id = getId(el);
			var anime = animeData[id];
			if (typeof anime === 'undefined') {
				return;
			}
			
			var details = anime.details;
			
			var x = event.pageX;
			var y = event.pageY;
			
			animeInfoDiv.css({
				'left': x,
				'top': y
			});
			
			$('.mal-ext-popover-title').text(details.title);
			$('.mal-ext-popover-average').text(details.members_score);
			$('.mal-ext-popover-rank').text(details.rank);
			$('.mal-ext-popover-popularity').text(details.popularity_rank);
			
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
	
})();