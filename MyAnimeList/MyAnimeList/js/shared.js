var animeContainerClass = 'mal-ext-anime-container';
var animeContainerSelector = '.' + animeContainerClass;
var animeSectionHeaderRowClass = 'mal-ext-section-header-table';
var animeSectionHeaderRowSelector = '.' + animeSectionHeaderRowClass;
var filteringSectionClass = 'mal-ext-filter-section';
var filteringSectionSelector = '.' + filteringSectionClass;
var sortingSectionClass = 'mal-ext-sorting-section';
var sortingSectionSelector = '.' + sortingSectionClass;

var allTitlesField = 'mal_ext_all_titles';

var actualRatings = ['G - All Ages', 'PG - Children', 'PG-13 - Teens 13 or older', 'R - 17+ (violence & profanity)', 'R+ - Mild Nudity', 'Rx - Hentai'];

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

function getSelect(className) {
	return $('<select class="' + className + '" />');
}

function getInput(className) {
	return $('<input class="' + className + '" size="15" />');
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