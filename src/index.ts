export interface ElfsquadShowroomOptions {
  /**
   * The container to render the iframe element in. Accepts a HTMLElement or a query selector.
   **/
  container: HTMLElement | string;

  /**
   * The URL of the Elfsquad showroom, either to the showroom itself or to a specific product.
  **/
  url: string;
}


export type ScreenshotCallback = (data: { image: string }) => void;
export type RequestQuoteCallback = (data: { configurationId: string }) => void;


export enum ViewerEvent {
  ScreenshotTaken = 'elfsquad.visualization.screenshotTaken',
  RequestQuote = 'custom:REQUEST_QUOTE',
}


export class ElfsquadShowroom {
  private readonly nativeElement: HTMLIFrameElement;
  private container: HTMLElement;

  private readonly callbacks: { [key: string]: ((data: any) => void)[] } = {};

  constructor(options: ElfsquadShowroomOptions) {
    this.container = this.getContainer(options);
    this.nativeElement = this.render(options);

    this.registerEventListeners();
  }

  /**
   * Get the native iframe element.
   * @returns {HTMLIFrameElement} the native iframe element.
   * */
  public getNativeElement(): HTMLIFrameElement {
    return this.nativeElement;
  }

  /**
   * Resets the viewer to the home camera position.
   * @returns {void}
   * */
  public home(): void {
    this.sendMessage({ name: 'elfsquad.visualization.home' });
  }

  /**
   * Toggles the visibility of the footprint.
   * @returns {void}
   * */
  public toggleFootprint(): void {
    this.sendMessage({ name: 'elfsquad.visualization.toggleFootprint' });
  }

  /**
   * Trigger a screenshot of the current view. The screenshot will be returned in the onScreenshot callback.
   * @returns {void}
   * */
  public screenshot(): void {
    this.sendMessage({ name: 'elfsquad.visualization.screenshot' });
  }

  /**
   * Register a callback function to be called when a screenshot is taken.
   * @param {(data: { image: string })} callback - The callback function to be called when a screenshot is taken.
   * @returns {void}
   * */
  public onScreenshot(callback: ScreenshotCallback): void {
    this.addCallback(ViewerEvent.ScreenshotTaken, callback);
  }

  /**
   * Register a callback function to be called when a quote is requested.
   * @param {(data: { configurationId: string })} callback - The callback function to be called when a quote is requested.
   * @returns {void}
   * */
  public onRequestQuote(callback: RequestQuoteCallback): void {
    this.addCallback(ViewerEvent.RequestQuote, callback);
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

    window.addEventListener('message', (event: MessageEvent) => {
      try {
        const json = JSON.parse(event.data);
        if (json.action !== "createQuotation")
          return;

        const configurationId = json.argument;
        this.executeCallbacks(ViewerEvent.RequestQuote, { configurationId });
      } catch (e) {
        return;
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

  private getContainer(options: ElfsquadShowroomOptions): HTMLElement {
    if (typeof options.container === 'string') {
      const ret = document.querySelector(options.container);
      if (ret === null)
        throw new Error('Container not found');
      if (!(ret instanceof HTMLElement))
        throw new Error('Container must be an HTMLElement');
      return ret;
    }
    return options.container;
  }
}

