# yapa.js
*Yet another particle animation*

*https://yapa.tmsmr.de*

### General
There are multiple great JS libraries that render (interactive) particle animations in a `<canvas>`. This implementation adds 'Transmissions' to visualize traffic between the particles.

### Usage
- The library is available as a simple, plain JS file, available at https://github.com/tmsmr/yapa/tree/main/docs/versions
- To use it, simply define a wrapper element and hand it over to the `Yapa` class. Minimal example:

```html
<div id="yapa"></div>
<script src="https://yapa.tmsmr.de/versions/yapa-0.9.1.js"
	integrity="sha384-mxa2kC7J33fN+0TUBOIi4nAehBtMGrILGkhs2c5BFnmV4qBLA2Qpj1XpIxs7sLH9"
	crossorigin="anonymous"
></script>
<script type="text/javascript">
	new Yapa(document.getElementById("yapa"), new YapaConfig()).start();
</script>
```

### Demo / Configuration
- To see the library in action and/or build a more advanced configuration, check out https://yapa.tmsmr.de
