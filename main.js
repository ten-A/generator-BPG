(function () {
    "use strict";

    var PLUGIN_ID = require("./package.json").name,
        MENU_ID = "BPG",
        MENU_LABEL = "$$$/JavaScripts/Generator/BPG/Menu=BPG";

    var _document = null;

    var _generator = null,
        _currentDocumentId = null,
        _config = null;

    var fs = require('fs'),
        path = require('path'),
        Encoder = require('bpg-stream');

    /*********** INIT ***********/

    function init(generator, config) {
        _generator = generator;
        _config = config;

        console.log("initializing generator bitmaps tutorial with config %j", _config);

        _generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(
            function () {
                console.log("Menu created", MENU_ID);
            },
            function () {
                console.error("Menu creation failed", MENU_ID);
            }
        );
        _generator.onPhotoshopEvent("generatorMenuChanged", handleGeneratorMenuClicked);

        function initLater() {
            requestEntireDocument();
        }
        process.nextTick(initLater);

    }

    /*********** EVENTS ***********/

    function handleGeneratorMenuClicked(event) {
        // Ignore changes to other menus
        var menu = event.generatorMenuChanged;
        if (!menu || menu.name !== MENU_ID) {
            return;
        }

        requestEntireDocument();

        var startingMenuState = _generator.getMenuState(menu.name);
        console.log("Menu event %s, starting state %s", stringify(event), stringify(startingMenuState));
    }

    /*********** CALLS ***********/

    function requestEntireDocument(documentId) {
        if (!documentId) {
            console.log("Determining the current document ID");
        }
        _generator.getDocumentInfo(documentId).then(
            function (document) {
                console.log(document.file);
                var svName = document.file.replace(".jpg", ".bpg");
                fs.createReadStream(document.file)
                .pipe(new Encoder())
                .pipe(fs.createWriteStream(svName)).on("close", function(){
                console.log("BPG created...");
                });
            },
            function (err) {
                console.error("[Tutorial] Error in getDocumentInfo:", err);
            }
        ).done();
    }


    function sendJavascript(str) {
        _generator.evaluateJSXString(str).then(
            function (result) {
                console.log(result);
            },
            function (err) {
                console.log(err);
            });
    }

    function setCurrentDocumentId(id) {
        if (_currentDocumentId === id) {
            return;
        }
        console.log("Current document ID:", id);
        _currentDocumentId = id;
    }

    function stringify(object) {
        try {
            return JSON.stringify(object, null, "    ");
        } catch (e) {
            console.error(e);
        }
        return String(object);
    }

    exports.init = init;

    // Unit test function exports
    exports._setConfig = function (config) {
        _config = config;
    };

}());