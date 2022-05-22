'use strict';

var web = require('solid-js/web');
var solidJs = require('solid-js');

const _tmpl$ = ["<h1", ">Welcome to this Simple Routing Example</h1>"],
      _tmpl$2 = ["<p", ">Click the links in the Navigation above to load different routes.</p>"],
      _tmpl$3 = ["<span", ">", "</span>"];

const Home = () => {
  const [s, set] = solidJs.createSignal(0);
  solidJs.onMount(() => {
    const t = setInterval(() => set(s() + 1), 100);
    solidJs.onCleanup(() => clearInterval(t));
  });
  return [web.ssr(_tmpl$, web.ssrHydrationKey()), web.ssr(_tmpl$2, web.ssrHydrationKey()), web.ssr(_tmpl$3, web.ssrHydrationKey(), web.escape(s()))];
};

exports["default"] = Home;
