var infoPopover = (function() {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	function run() {
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
		animePaddedDiv.append(getContentDiv('English Title', 'english-title'));
		animePaddedDiv.append(getContentDiv('Aired', 'aired'));
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
			
			$('.mal-ext-popover-title').html(details.title);
			updateEnglishTitle(details);
			$('.mal-ext-popover-aired').text(getFullAiredDate(details.start_date, details.end_date));
			$('.mal-ext-popover-average').text(details.members_score.toFixed(2));
			$('.mal-ext-popover-rank').text(details.rank.toLocaleString());
			$('.mal-ext-popover-popularity').text(details.popularity_rank.toLocaleString());
			$('.mal-ext-popover-favorited').text(details.favorited_count.toLocaleString());
			
			var genres = details.genres.join(', ');
			$('.mal-ext-popover-genres').text(genres);
			
			animeInfoDiv.show();
		});
	}
	
	function updateEnglishTitle(details) {
		var mainTitle = details.title;
		var otherTitles = details.other_titles;
		
		var section = $('.mal-ext-popover-english-title');
		var container = section.parent();
		if (typeof otherTitles === 'undefined' || typeof otherTitles.english === 'undefined' || otherTitles.english.length === 0 || otherTitles.english[0] === mainTitle) {
			container.hide();
		}
		else {
			section.text(otherTitles.english[0]);
			container.show();
		}
	}
	
	function getFullAiredDate(startDate, endDate) {
		if (startDate === endDate) {
			// Movie, etc.
			return getAiredDateString(startDate);
		}
		
		return getAiredDateString(startDate) + ' to ' + getAiredDateString(endDate);
	}
	
	function getAiredDateString(dateStr) {
		if (!dateStr) {
			// Unknown air date.
			return '?';
		}
		else if (dateStr.length === 4 && (dateStr.startsWith('19') || dateStr.startsWith('20'))) {
			// Only a year.
			return dateStr;
		}
		
		var date = new Date(dateStr);
		return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
	}
	
	function addPopoverCloseEvent() {
		$('.mal-ext-close-popover').on('click', function() {
			closeInfoPopover();
		});
	}
	
	return {
		run: run
	};
})();