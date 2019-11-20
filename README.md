# flatout

Lightweight Single-Page-Application framework for JavaScript

## Concepts

- Built by pure JavaScript/ECMAScript
- Supports only latest browsers
- Not require compilation
- Not use Virtual DOM
- Keeping minimized size less than 16KB

## Provides Classes

- Core
- Http
- View
- ListView
- FormView
- Page
- Item
- List
- App
- Router

## Document

https://tilfin.github.io/flatout/

## Setup

```
$ npm install -save @tilfin/flatout
```

## Generate documents

```
$ npm run doc
```

## Start example apps

```
$ npm run example
```

## Routing

Support 2 type

* hash mode (hash path with Static Web server)
* history mode (HTML5 history API with Web App server)

## Plain data or event handling

### Plain data
Plain data is an Object or an Array.

### Data with binding views

* An Object is an Item that you can `add`, `update` or `destroy` itself.
* An Array is a Collection that you can `add`, `update` or `remove` item and `reset` itself.

## Use Application

### History mode

```html
<!DOCTYPE html>
<html>
<head>
<title>History mode</title>
<base href="/app/"
</head>
<body>
<nav><a href="about">About</a></nav>
<main id="frame">
<!-- content area -->
</main>
<script type="module">
import { App, Page, View } from 'flatout.js'

class MainView extends View {
  constructor() {
    super(document.body, { container: 'frame' })
  }
}

const routeMap = {
  index: HomeView,   // /
  about: AboutView,  // /about
  ':userId': UserView  // /:userId
}

App.activate(MainView, routeMap, { mode: 'HISTORY '})
</script>
</body>
</html>
```

### Hash mode

```html
<!DOCTYPE html>
<html>
<head>
<title>Hash mode</title>
</head>
<body>
<nav><a href="#!/about">About</a></nav>
<main id="frame">
<!-- content area -->
</main>
<script type="module">
import { App, Page, View } from 'flatout.js'

class MainView extends View {
  constructor() {
    super(document.body, { container: 'frame' })
  }
}

const routeMap = {
  index: HomeView,       // /
  about: AboutView,      // /about
  books: {
    index: BookListView, // /books/
    ':bookId': BookView, // /books/:bookId
  }
}

App.activate(MainView, routeMap, { mode: 'HASH '})
</script>
</body>
</html>
```
