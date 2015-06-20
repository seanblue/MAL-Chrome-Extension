(function() {
	var testLimit = 5;
	var animeGroupClass = 'mal-chrome-extension-container';
	var anime = {};
		
	$(document).ready(function() {
		run();
	});

	function run() {
		console.log('start');
		wrapAnime();
		getAnime();
		console.log('end');
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
		$.ajax({
			url: getApiUrl(id),
			dataType: 'jsonp',
			success: function(details) {
				console.log(details);
				saveAnimeDetails(id, container, details);
			}
		});
	}
	
	function getApiUrl(id) {
		return 'http://umal-api.coreyjustinroberts.com/1.1/anime/' + id;
	}
	
	function saveAnimeDetails(id, container, details) {
		anime[id] = {
			'container': container,
			'details': details
		}
	}
	
})();