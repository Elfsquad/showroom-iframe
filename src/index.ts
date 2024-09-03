/**
 * Options for initializing the Elfsquad Showroom.
 */
export interface ElfsquadShowroomOptions {
  /**
   * The container to render the iframe element in. Accepts either a HTMLElement or a query selector string.
   */
  container: HTMLElement | string;

  /**
   * The URL of the Elfsquad showroom, which could be a general showroom URL or a specific product URL.
   */
  url: string;
}

/**
 * Type definition for the screenshot callback function.
 */
export type ScreenshotCallback = (data: { image: string }) => void;

/**
 * Type definition for the request quote callback function.
 */
export type RequestQuoteCallback = (data: { configurationId: string }) => void;

/**
 * Type definition for the configuration update callback function.
 */
export type ConfigurationUpdateCallback = (data: any) => void;

/**
 * Enum representing different viewer events within the Elfsquad Showroom.
 */
export enum ViewerEvent {
  ScreenshotTaken = 'elfsquad.visualization.screenshotTaken',
  ConfigurationUpdated = 'elfsquad.configurationUpdated',
  RequestQuote = 'custom:REQUEST_QUOTE',
}

/**
 * Class representing an Elfsquad Showroom instance.
 */
export class ElfsquadShowroom {
  private readonly nativeElement: HTMLIFrameElement;
  private container: HTMLElement;

  private readonly callbacks: { [key: string]: ((data: any) => void)[] } = {};

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
  constructor(options: ElfsquadShowroomOptions) {
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
  public getNativeElement(): HTMLIFrameElement {
    return this.nativeElement;
  }

  /**
   * Resets the viewer to the home camera position.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.home();
   * ```
   */
  public home(): void {
    this.sendMessage({ name: 'elfsquad.visualization.home' });
  }

  /**
   * Toggles the visibility of the footprint.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.toggleFootprint();
   * ```
   */
  public toggleFootprint(): void {
    this.sendMessage({ name: 'elfsquad.visualization.toggleFootprint' });
  }

  /**
   * Change the language of the showroom & configuration to the
   * specified language ISO code.
   *
   * Please note that the language must be enabled and available in the
   * Elfsquad environment.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.changeLanguage('en');
   * ```
   *
   * @param languageIso - The ISO code of the language to change to.
   */
  public changeLanguage(languageIso: string): void {
    this.sendMessage({ name: 'elfsquad.localization.changeLanguage', args: { languageIso } });
  }


  /**
   * Initiates a screenshot of the current view. The screenshot data is returned via the `onScreenshot` callback.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.screenshot();
   * ```
   */
  public screenshot(): void {
    this.sendMessage({ name: 'elfsquad.visualization.screenshot' });
  }

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
  public onScreenshot(callback: ScreenshotCallback): void {
    this.addCallback(ViewerEvent.ScreenshotTaken, callback);
  }

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
  public onRequestQuote(callback: RequestQuoteCallback): void {
    this.addCallback(ViewerEvent.RequestQuote, callback);
  }

  /**
   * Enables receiving real-time configuration updates, whenever the
   * configuration is changed in the showroom.
   *
   * This will trigger the `onConfigurationUpdate` callback with the 
   * updated configuration.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.enableConfigurationUpdates();
   * showroom.onConfigurationUpdate(data => {
   *    console.log('updated configuration:', data);
   * });
   * ```
  */
  public enableConfigurationUpdates(): void {
    this.sendMessage({ name: 'elfsquad.enableConfigurationUpdates' });
  }

  /**
   * Disables receiving real-time configuration updates.
   *
   * This will stop triggering the `onConfigurationUpdate` callback.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.disableConfigurationUpdates();
   * ```
  */
  public disableConfigurationUpdates(): void {
    this.sendMessage({ name: 'elfsquad.disableConfigurationUpdates' });
  }

  /**
   * Registers a callback function to be invoked when the configuration 
   * is updated.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.enableConfigurationUpdates();
   * showroom.onConfigurationUpdate(data => {
   *    console.log('updated configuration:', data);
   * });
   * ```
   *
   * @param callback - The callback function to be called upon configuration update.
  */
  public onConfigurationUpdate(callback: ConfigurationUpdateCallback): void {
    this.addCallback(ViewerEvent.ConfigurationUpdated, callback);
  }

  /**
   * Navigates to the specified URL within the showroom iframe.
   *
   * @example
   * ```typescript
   * const showroom = new ElfsquadShowroom({ container: '#showroom', url: 'https://automotive.elfsquad.io' });
   * showroom.navigateTo('products');
   * showroom.navigateTo('configure/featureModelName');
   * showroom.navigateTo('checkout');
   * ```
   *
   * @param url - The URL to navigate to within the showroom iframe.
   */
  public navigateTo(url: string): void {
    this.sendMessage({ name: 'elfsquad.navigation.navigateTo', args: { url } });
  }

  private addCallback(key: ViewerEvent, callback: (data: any) => void): void {
    if (!this.callbacks[key])
      this.callbacks[key] = [];
    this.callbacks[key].push(callback);
  }

  private sendMessage(data: any): void {
    if (!this.nativeElement.contentWindow)
      throw new Error('Native element does not have a content window');

    this.nativeElement.contentWindow.postMessage(data, '*');
  }

  private registerEventListeners(): void {
    this.registerEventListener('elfsquad.visualization.screenshotTaken', (event: MessageEvent) => {
      this.executeCallbacks(ViewerEvent.ScreenshotTaken, event.data.args);
    });

    this.registerEventListener('elfsquad.configurationUpdated', (event: MessageEvent) => {
      this.executeCallbacks(ViewerEvent.ConfigurationUpdated, event.data.args);
    });

    window.addEventListener('message', (event: MessageEvent) => {
      try {
        const json = JSON.parse(event.data);
        if (json.action !== "createQuotation")
          return;

        const configurationId = json.argument;
        this.executeCallbacks(ViewerEvent.RequestQuote, { configurationId });
      } catch (e) {
        // Ignore errors.
      }
    });
  }

  private registerEventListener(key: string, callback: (data: MessageEvent) => void): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.data?.name === key)
        callback(event);
    });
  }

  private executeCallbacks(key: ViewerEvent, data: any): void {
    if (!this.callbacks[key])
      return;

    this.callbacks[key].forEach(callback => {
      callback(data);
    });
  }

  private render(options: ElfsquadShowroomOptions): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.src = options.url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.display = 'block';
    this.container.appendChild(iframe);
    return iframe;
  }

  /**
   * Determines the appropriate container for the iframe based on the provided options.
   * @param options - The options used to initialize the showroom, including the container specification.
   * @returns The resolved HTMLElement to use as the container.
   * @throws Will throw an error if the specified container is not found or is not an HTMLElement.
   */
  private getContainer(options: ElfsquadShowroomOptions): HTMLElement {
    if (typeof options.container === 'string') {
      const element = document.querySelector(options.container);
      if (!element) {
        throw new Error('Container not found');
      }
      if (!(element instanceof HTMLElement)) {
        throw new Error('Container must be an HTMLElement');
      }
      return element;
    }
    return options.container;
  }
}

