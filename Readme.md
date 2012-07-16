
 ![UIKit JavaScript component framework](http://f.cl.ly/items/2j0m3D1l1T041S1k463L/Grab.png)

  UIKit is a small (4kb minified / gzipped) collection of flexible, cohesive, decoupled components for the modern web. With an emphasis on structure-only styling making it simple to apply application specific styling. UIKit is _not_ a replacement for larger UI frameworks, nor is it a CSS framework such as Bootstrap. UIKit is still a work in progress, check the [Issues](https://github.com/visionmedia/uikit/issues).

You are now viewing the BlogFrog fork of uikit, which adds the following:

## Components

  - [ui.Alert](https://github.com/blogfrog/uikit/tree/master/lib/components/alert/alert.js) a simple tab interface (requires HTML)
  - [ui.Tabs](https://github.com/blogfrog/uikit/tree/master/lib/components/tabs/tabs.js) a simple tab interface (requires HTML)
  - [ui.InteractiveDialog](https://github.com/blogfrog/uikit/tree/master/lib/components/interactivedialog/interactivedialog.js) a wrapper for a higher level (and larger) dialog

## Features

  - Set emitter context.  ie. `dialog.context(whatever)` means `dialog.on('event', function() { /* this === whatever */ })`
  - uikit wraped in module.exports for use in CommonJS applications

## Custom builds

  Each release includes a pre-built `./build` directory containing _ui.js_ and _ui.css_,
  however if you wish you may re-build with `make`, by default including all components:

  ![UIKit build](http://f.cl.ly/items/0Z040x2E2g2v2E1M2l38/Grab.png)

  You may specify the list of components to build, and their markup, styles, and javascript will be added to `./build/ui.{js,css}`:

  ![UIKit custom build](http://f.cl.ly/items/1B3C3g293y03372I1q1b/Grab.png)

## Running tests

  Tests are run with Mocha, first install the node.js deps:

      $ npm install

  Then run the tests:

      $ make test

## Tabs HTML

The Tabs component requires a small bit of markup.

#### Tabs

    <ul>
      <li href="#tab1">Tab Item 1</li>
      <li data-tab-target=".second-tab">Tab Item 1</li>
    </ul>

#### Tab Containers

    <div id="tab1"></div>
    <div class="second-tab"></div>
