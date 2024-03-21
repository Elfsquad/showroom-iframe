= 🦖 Docusaurus Codedoc Plugin 📚 
:toc: macro
:toc-title:
:toclevels: 3

toc::[]

A plugin for Docusaurus that lets you 📝 write guides on larger chunks of code and highlights 🌟 the relevant parts.

image:assets/example.gif[]

== 💾 Installation 

```bash
npm install --save @elfsquad/showroom-iframe
```

```js
<script type="importmap>
{
  "imports": {
    "@elfsquad/showroom-iframe": "https://cdn.skypack.dev/@elfsquad/showroom-iframe@1.0.0"
  }
}
</script>
```

== 🛠️ Usage 
This package exposes the `ElfsquadShowroom` class. This class can be
used for creating & communicating with the iframe.

Example:

```ts
import { ElfsquadShowroom } from "@elfsquad/showroom-iframe";
const container = document.createElement("div");
document.body.appendChild(container);

const elfsquad = new ElfsquadShowroom({
  container: container,
  url: "https://automotive.elfsquad.io/configure/Elfsquad%20carrosserie"
});
```

=== Trigger a screenshot
```ts
elfsquad.screenshot();
```

=== Reset the camera position
```ts
elfsquad.home()
```

=== Toggle the footprint visibility
```ts
elfsquad.toggleFootprint();
```

=== Handle screenshot event
```ts
import { ScreenshotCallback } from "@elfsquad/showroom-iframe";
const callback: ScreenshotCallback = ({image}) => {
    console.log('image: ', image);
}
elfsquad.onScreenshot(callback);
```

=== Handle quotation request event
```ts
import { RequestQuoteCallback } from "@elfsquad/showroom-iframe";
const callback: RequestQuoteCallback = ({configurationId}) => {
    console.log('configurationId: ', configurationId);
}
elfsquad.onRequestQuote(callback);
```

== 🤝 Support

If you're having a bumpy ride 🎢 or just want to share some love ❤️, visit the GitHub repository:

- https://github.com/Elfsquad/showroom-iframe

== 🌱 Contributing

Got a cool idea or a bug fix? Contributions are more than welcome! Feel free to fork the repo, make your changes, and submit a pull request 🤲.

== 📄 License

This project struts under the MIT license - because sharing is caring 💖.
