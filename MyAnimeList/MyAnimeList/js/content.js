(function() {
	var testLimit = 5;
	var animeGroupClass = 'mal-chrome-extension-container';
	var anime = {};
		
	$(document).ready(function() {
		run();
	});

	function run() {
		wrapAnime();
		getAnime();
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
	
	function getAnime() {
		var animeDivs = $('.' + animeGroupClass);
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
		anime[id] = {
			'el': el,
			'details': details
		}
	}
	
})();