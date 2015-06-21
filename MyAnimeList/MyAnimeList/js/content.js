(function() {
	var testLimit = 5;
	var animeGroupClass = 'mal-ext-container';
	var animeGroupSelector = '.' + animeGroupClass;
	var animeData = {};
	var animeDivs;
	var animeInfoDiv;
		
	$(document).ready(function() {
		run();
	});

	function run() {
		wrapAnime();
		loadAnime();
		setupInfoDiv();
		addEventHandlers();
	}

	function wrapAnime() {
		$('[id^="more"').slice(0, testLimit).each(function(index, el) {
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
		animeDivs.each(function(index, el) {
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
		animeInfoDiv = $('<div class="mal-ext-info" />');
		animeInfoDiv.prependTo('body');
		
		var animePaddedDiv = $('<div class="mal-ext-info-inner" />');
		animeInfoDiv.append(animePaddedDiv);
		setupInfoDivContent(animePaddedDiv);		
	}
	
	function setupInfoDivContent(animePaddedDiv) {
		animePaddedDiv.append(getContentDiv('Title', 'title'));
		animePaddedDiv.append(getContentDiv('Average Score', 'average'));
		animePaddedDiv.append(getContentDiv('Rank: ', 'rank'));
		animePaddedDiv.append(getContentDiv('Popularity: ', 'popularity'));
		animePaddedDiv.append(getContentDiv('Genres: ', 'genres'));
	}
	
	function getContentDiv(title, contentClass) {
		return '<div class="mal-ext-info-content"><span class="mal-ext-info-header">' + title + ': </span><span class="mal-ext-info-' + contentClass + '" /></div>';
	}

	function addEventHandlers() {
		animeDivs.on('click', function(event) {
			var el = $(this);
			var id = getId(el);
				
			var x = event.pageX;
			var y = event.pageY;
			
			animeInfoDiv.css({
				'left': x,
				'top': y
			});
			
			var anime = animeData[id].details;
						
			$('.mal-ext-info-title').text(anime.title);
			$('.mal-ext-info-average').text(anime.members_score);
			$('.mal-ext-info-rank').text(anime.rank);
			$('.mal-ext-info-popularity').text(anime.popularity_rank);
			
			var genres = anime.genres.join(', ');
			$('.mal-ext-info-genres').text(genres);
			
			animeInfoDiv.show();
		});
	}
	
})();