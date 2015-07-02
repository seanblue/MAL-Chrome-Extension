var animeContainerClass = 'mal-ext-anime-container';
var animeContainerSelector = '.' + animeContainerClass;
var animeSectionHeaderRowClass = 'mal-ext-section-header-table';
var animeSectionHeaderRowSelector = '.' + animeSectionHeaderRowClass;

var allTitlesField = 'mal_ext_all_titles';

var animeData = {};
var animeDataBySection = {};
var animeDivs;
var animeInfoDiv;
var loadAnimePromises = [];

function getAnimeId(container) {
	return $(container).closest(animeContainerSelector).data('anime-id');
}

function closeInfoPopover() {
	animeInfoDiv.hide();
}