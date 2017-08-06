var animeContainerClass = 'mal-ext-anime-container';
var animeContainerSelector = '.' + animeContainerClass;
var animeSectionHeaderRowClass = 'mal-ext-section-header-table';
var animeSectionHeaderRowSelector = '.' + animeSectionHeaderRowClass;
var filteringSectionClass = 'mal-ext-filter-section';
var filteringSectionSelector = '.' + filteringSectionClass;
var sortingSectionClass = 'mal-ext-sorting-section';
var sortingSectionSelector = '.' + sortingSectionClass;
var loadingSectionClass = 'mal-ext-loading-section';
var loadingSectionSelector = '.' + loadingSectionClass;
var loadingStatusClass = 'mal-ext-loading-status';
var loadingStatusSelector = '.' + loadingStatusClass;
var animeSectionClass = 'mal-ext-anime-section';
var animeSectionSelector = '.' + animeSectionClass;

// FIELDS
var fieldMainTitle = 'title';
var fieldCaseInsensitiveTitle = 'case_insensitive_title';
var fieldEnglishTitle = 'english_title';
var fieldAllTitles = 'all_titles';

var fieldAnimeType = 'type';
var fieldGenres = 'genres';
var fieldClassification = 'classification';
var fieldStatus = 'status';
var fieldSynopsis = 'synopsis';
var fieldMemberScore = 'members_score';
var fieldNumberOfVotes = 'number_of_votes';
var fieldRank = 'rank';
var fieldPopularityRank = 'popularity_rank';
var fieldFavoritedCount = 'favorited_count';
var fieldEpisodeCount = 'episode_count';
var fieldStudios = 'studio_list';

var fieldUserTags = 'user_tags';
var fieldStartDate = 'start_date_data';
var fieldEndDate = 'end_date_data';
var fieldUserPriority = 'user_priority';
// END FIELDS

var actualRatings = ['G - All Ages', 'PG - Children', 'PG-13 - Teens 13 or older', 'R - 17+ (violence & profanity)', 'R+ - Mild Nudity', 'Rx - Hentai'];

var animeData = {};
var animeDataBySection = {};
var animeDivs;
var animeInfoDiv;

var apiTestPromise;
var loadAnimePromises = [];

var hasTagsColumn = false;
var hasPriorityColumn = false;

var apiIsAvailable = false;
var animeFailedToLoad = 0;

var popoverAnimeId = null;

function allAnimeSuccessfullyLoaded() {
	return apiIsAvailable && animeFailedToLoad === 0;
}

function getAnimeId(container) {
	return $(container).closest(animeContainerSelector).data('anime-id');
}

function closeInfoPopover() {
	animeInfoDiv.hide();
	popoverAnimeId = null;
}

function getSelect(className) {
	return $('<select class="' + className + '" />');
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

function updateRowNumber(td, val) {
	td.text(val);
}

function updateAllSectionCounts() {
	for (var section in animeDataBySection) {
		var sectionData = animeDataBySection[section];
		updateSectionCount(sectionData);
	}
}

function updateSectionCount(sectionData) {
	var sectionCountEl = sectionData.el.find('.mal-ext-section-visible-count');
	var sectionTotalCount = sectionData.originalOrder.length;
	var sectionVisibleCount = sectionTotalCount - sectionData.totalHidden;
	sectionCountEl.text('(showing ' + sectionVisibleCount + ' of ' + sectionTotalCount + ')');
}

function runAfterAllAnimeDataSuccessfullyLoaded(callback) {
	apiTestPromise.always(function() {
		$.when.apply(undefined, loadAnimePromises).always(function() {
			if (allAnimeSuccessfullyLoaded())
				callback();
		});
	});
}