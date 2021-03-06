/*jslint plusplus: true, sloppy: true, vars: true, browser: true, devel: true */ /*global  $, UAParser*/
var testShortnames = { "Document should return a flow by name": "Document returns flow",
            "Element should have regionOverflow property": "Element.regionOverflow",
            "NamedFlow getContent() should return NodeList": "getContent() = NodeList",
            "NamedFlow should have getContent() function": "NamedFlow.getContent()",
            "NamedFlow should have name property": "NamedFlow.name",
            "NamedFlow should have overset property": "NamedFlow.overset",
            "regionLayoutUpdate event is thrown": "regionLayoutUpdate event",
            "Named flow - content should be pulled to a flow": "Named flow pulls content",
            "Region - should consume from flow": "Region consumes flow",
            "Region properties - region-overflow property": "Region.region-overflow exists",
            "NamedFlow should have firstEmptyRegionIndex property": "NamedFlow.firstEmptyRegionIndex",
            "NamedFlow getRegionsByContent() should return NodeList": "getRegionsByContent() = NodeList",
            "NamedFlow should have getRegionsByContent() function": "NamedFlow.getRegionsByContent()",
            "Basic @region rule support": "Basic @region support"};

var browserScopeVersions = {
        "browsers-all": {urlFlag:"3", label:"All Browsers", depth:"version"},
        "browsers-major": {urlFlag:"1", label:"Major Versions", depth:"major"},
        "browsers-family": {urlFlag:"0", label:"Browser Families", depth:"browser"}
};            

function notImplemented() {
    alert("Not implemented yet");
    return false;
}


function convertToID(str) {
    var result = str.replace(/\s+/g, '-').toLowerCase();
    result = result.replace(/\./g, "-");
    return result;
}

function convertToShortString(str) {
    return str.substring(0, 20) + "...";
}

function testSort(a, b) {
    if (a.type < b.type) {
        return -1;
    }
    if (a.type > b.type) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function browserSort(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function shortenTestName(longname) {
    var results = testShortnames[$.trim(longname)];
    if (typeof results === "undefined") {
        results = longname;
    }

    return results;
}

function drawChart(results) {
    $("#results_panel").empty();
    var htmlChart = '<div id="chart">';
    var htmlLegend = '<div id="legend">';
    var i = results.results.length;
    var index;
    var j;

    for (index in results.results) {
        var obj = results.results[index];
        var bar = '<span class="bar" id="' + convertToID(obj.name) + '"><span>' + obj.summary_score + '%</span></span>';
        htmlChart += bar;

        var legend = '<span class="legend"><span>' + obj.name + '</span></span>';
        htmlLegend += legend;
    }
    htmlChart += "</div>";
    htmlLegend += "</div>";
    $("#results_panel").prepend(htmlChart);
    $("#results_panel").append(htmlLegend);


    for (j=0; j < results.results.length; j++) {
        var obj = results.results[j];
        var id = convertToID(obj.name);
        $("#" + id).height(obj.summary_score * 2);
        $("#" + id).css("left", j * 45);
    }

}

function createTableShell() {
    var tableShell = '<table class="table table-bordered" id="bscope-results"></table>';
    $("#results_panel").append(tableShell);
}



function createTableHeader(results) {
    var i = results.results.length;
    var htmlContent = "<thead>";
    var index;

    var row = '<tr class="test-title-row"><th />';
    var columns = '<col>';
    for (index in results.results) {
        var obj = results.results[index];
        columns += '<col id="' + convertToID(obj.name) + '">';
        row += '<th><div><span style="z-index:' + i + '">' + obj.name + '</span></div></th>';
        i--;
    }

    row +=  '</tr>';
    htmlContent += row + "</thead>";
    $("#bscope-results").prepend(htmlContent);
    $("#bscope-results").prepend(columns);
}

function createTableRows(results) {
    var i = 0;
    var j = 0;
    var k = 0;
    var htmlContent = "<tbody>";

    var testArray = [];
    for (i = 0; i < results.results.length; i++) {
        var browserArray = [];
        var obj = results.results[i];

        for (j = 0; j < obj.results.length; j++) {
            var row = '<tr><th>' + shortenTestName(obj.results[j].name) + '</th>';

            for (k = 0; k < results.results.length; k++) {
                var test = results.results[k].results[j];
                var browserClass = convertToID(results.results[k].name);
                var cellClass = "blank";

                if (test.result === "1") {
                    cellClass = "success";
                }
                if (test.result === "0") {
                    cellClass = "fail";
                }

                var cell = '<td class="' + cellClass + " " + browserClass + '"><span>' + test.result + '</span></td>';
                row += cell;
            }

            row += "</tr>";
            htmlContent += row;
        }
        break;
    }
    htmlContent += "</tbody>";
    $("#bscope-results").append(htmlContent);
}

function drawTable(results) {
    $("#results_panel").empty();
    createTableShell();
    createTableHeader(results);
    createTableRows(results);
}

function getUserBrowser(depth) {
    if (typeof depth === "undefined") {
        depth = "browser";
    }
    var result = "";

    var p = new UAParser();
    var name = p.result.browser.name;
    var version = p.result.browser.version;
    var major = p.result.browser.major

    if (name === "Safari") {
        var ua = navigator.userAgent;
        var versionString = "Version/";
        var loc = ua.indexOf(versionString) + versionString.length;
    }

    var versionArray = version.split(".");
    if (versionArray.length > 3) {
        version =  versionArray[0] + "." + versionArray[1] + "." + versionArray[2];
    }

    if (depth === "browser") {
        result = name;
    } else if (depth === "major") {
        result = name + " "  + major;
    } else {
        result = name + " " + version;
    }

    return result;
}


function changeActionWell(browserVersionDepth) {
    $("#action-well").toggleClass("alert-info");

    var browserBeingUsed = getUserBrowser(browserVersionDepth);
    var browserTableID = convertToID(browserBeingUsed);

    var htmlContent = '<div id="test-results">';
    htmlContent += '<p>We think that you are using <strong>' + browserBeingUsed + '</strong> for your browser.  <a href="#">No?</a></p>';
    htmlContent += '<p id="support-results">Your Browser supports<br /> <span id="support-precentage"></span> of CSS Regions features</p>';

    if ($('#publish-results').is(':checked')) {
        htmlContent += '<p>Thank you for sharing your results</p>';
    }

    htmlContent += '</div>';
    $("#action-well").html(htmlContent);

    // Would rather do this by changing the class, but there is an issue with:
    // Changing a class on a column in a table styled by Bootstrap in Chrome. 
    // Will track down issue and report to relevant project.
    $("#" + browserTableID).css("background-color", "#fcf8e3");
    $("." + browserTableID).css("background-color", "#fcf8e3");
    $("thead th").css("background-color", "#FFF");
}

function massageTestResults(results) {
    var outputResults = {};
    var index;
    var testIndex;
    var newResults = [];

    for (index in results.results) {
        var obj = results.results[index];
        if (obj.count === "0") {
            continue;
        }

        var newSubResults = [];

        for (testIndex in obj.results) {
            var subResultsArray = [];
            var subResultsFromObj = obj.results[testIndex];
            var testTitle = testIndex.split(":");
            subResultsFromObj.name = testTitle[1];
            subResultsFromObj.type = testTitle[0];
            newSubResults.push(subResultsFromObj);
        }
        newSubResults.sort(testSort);
        obj.results = newSubResults;
        obj.name = index;
        newResults.push(obj);
    }
    newResults.sort(browserSort);
    outputResults.results = newResults;
    return outputResults;
}

function browserScopeVersionTranslate (menuselection) {
    return browserScopeVersions[menuselection].urlFlag;
}

function browserScopeLabelTranslate (menuselection) {
    return browserScopeVersions[menuselection].label;
}

function browserScopeDepthTranslate (menuselection) {
    return browserScopeVersions[menuselection].depth;
}


if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}

