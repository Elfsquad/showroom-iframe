"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElfsquadShowroom = exports.ViewerEvent = void 0;
/**
 * Enum representing different viewer events within the Elfsquad Showroom.
 */
var ViewerEvent;
(function (ViewerEvent) {
    ViewerEvent["ScreenshotTaken"] = "elfsquad.visualization.screenshotTaken";
    ViewerEvent["RequestQuote"] = "custom:REQUEST_QUOTE";
})(ViewerEvent || (exports.ViewerEvent = ViewerEvent = {}));
/**
 * Class representing an Elfsquad Showroom instance.
 */
var ElfsquadShowroom = /** @class */ (function () {
    /**
     * Initializes a new instance of the Elfsquad Showroom.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * ```
     *
     * @param options - The options used to initialize the showroom.
     * @throws Will throw an error if the specified container is not found or is not an HTMLElement.
     * @throws Will throw an error if the native iframe element does not have a content window.
     * @returns A new instance of the Elfsquad Showroom.
     */
    function ElfsquadShowroom(options) {
        this.callbacks = {};
        this.container = this.getContainer(options);
        this.nativeElement = this.render(options);
        this.registerEventListeners();
    }
    /**
     * Retrieves the native iframe element.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * const iframe = showroom.getNativeElement();
     * ```
     *
     * @returns The native iframe element.
     */
    ElfsquadShowroom.prototype.getNativeElement = function () {
        return this.nativeElement;
    };
    /**
     * Resets the viewer to the home camera position.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * showroom.home();
     * ```
     */
    ElfsquadShowroom.prototype.home = function () {
        this.sendMessage({ name: 'elfsquad.visualization.home' });
    };
    /**
     * Toggles the visibility of the footprint.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * showroom.toggleFootprint();
     * ```
     */
    ElfsquadShowroom.prototype.toggleFootprint = function () {
        this.sendMessage({ name: 'elfsquad.visualization.toggleFootprint' });
    };
    /**
     * Initiates a screenshot of the current view. The screenshot data is returned via the `onScreenshot` callback.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * showroom.screenshot();
     * ```
     */
    ElfsquadShowroom.prototype.screenshot = function () {
        this.sendMessage({ name: 'elfsquad.visualization.screenshot' });
    };
    /**
     * Registers a callback function to be invoked when a screenshot is taken.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * showroom.onScreenshot(data => {
     *  console.log(data.image);
     * });
     * ```
     *
     * @param callback - The callback function to be called upon screenshot capture.
     */
    ElfsquadShowroom.prototype.onScreenshot = function (callback) {
        this.addCallback(ViewerEvent.ScreenshotTaken, callback);
    };
    /**
     * Registers a callback function to be invoked when a quote is requested.
     *
     * @example
     * ```typescript
     * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
     * showroom.onRequestQuote(data => {
     *  console.log(data.configurationId);
     * });
     * ```
     *
     * @param callback - The callback function to be called upon quote request.
     */
    ElfsquadShowroom.prototype.onRequestQuote = function (callback) {
        this.addCallback(ViewerEvent.RequestQuote, callback);
    };
    ElfsquadShowroom.prototype.addCallback = function (key, callback) {
        if (!this.callbacks[key])
            this.callbacks[key] = [];
        this.callbacks[key].push(callback);
    };
    ElfsquadShowroom.prototype.sendMessage = function (data) {
        if (!this.nativeElement.contentWindow)
            throw new Error('Native element does not have a content window');
        this.nativeElement.contentWindow.postMessage(data, '*');
    };
    ElfsquadShowroom.prototype.registerEventListeners = function () {
        var _this = this;
        this.registerEventListener('elfsquad.visualization.screenshotTaken', function (event) {
            _this.executeCallbacks(ViewerEvent.ScreenshotTaken, event.data.args);
        });
        window.addEventListener('message', function (event) {
            try {
                var json = JSON.parse(event.data);
                if (json.action !== "createQuotation")
                    return;
                var configurationId = json.argument;
                _this.executeCallbacks(ViewerEvent.RequestQuote, { configurationId: configurationId });
            }
            catch (e) {
                // Ignore errors.
            }
        });
    };
    ElfsquadShowroom.prototype.registerEventListener = function (key, callback) {
        window.addEventListener('message', function (event) {
            var _a;
            if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.name) === key)
                callback(event);
        });
    };
    ElfsquadShowroom.prototype.executeCallbacks = function (key, data) {
        if (!this.callbacks[key])
            return;
        this.callbacks[key].forEach(function (callback) {
            callback(data);
        });
    };
    ElfsquadShowroom.prototype.render = function (options) {
        var iframe = document.createElement('iframe');
        iframe.src = options.url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.style.display = 'block';
        this.container.appendChild(iframe);
        return iframe;
    };
    /**
     * Determines the appropriate container for the iframe based on the provided options.
     * @param options - The options used to initialize the showroom, including the container specification.
     * @returns The resolved HTMLElement to use as the container.
     * @throws Will throw an error if the specified container is not found or is not an HTMLElement.
     */
    ElfsquadShowroom.prototype.getContainer = function (options) {
        if (typeof options.container === 'string') {
            var element = document.querySelector(options.container);
            if (!element) {
                throw new Error('Container not found');
            }
            if (!(element instanceof HTMLElement)) {
                throw new Error('Container must be an HTMLElement');
            }
            return element;
        }
        return options.container;
    };
    return ElfsquadShowroom;
}());
exports.ElfsquadShowroom = ElfsquadShowroom;
