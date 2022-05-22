'use strict';

var web = require('solid-js/web');

const _tmpl$ = ["<h1", "><!--#-->", "<!--/-->'s Profile</h1>"],
      _tmpl$2 = ["<p", ">This section could be about you.</p>"],
      _tmpl$3 = ["<ul", ">", "</ul>"],
      _tmpl$4 = ["<span", " class=\"loader\">Loading Info...</span>"],
      _tmpl$5 = ["<li", ">", "</li>"];

const Profile = props => [web.ssr(_tmpl$, web.ssrHydrationKey(), web.escape(props.user?.firstName)), web.ssr(_tmpl$2, web.ssrHydrationKey()), web.createComponent(web.Suspense, {
  get fallback() {
    return web.ssr(_tmpl$4, web.ssrHydrationKey());
  },

  get children() {
    return web.ssr(_tmpl$3, web.ssrHydrationKey(), web.escape(web.createComponent(web.For, {
      get each() {
        return props.info;
      },

      children: fact => web.ssr(_tmpl$5, web.ssrHydrationKey(), web.escape(fact))
    })));
  }

})];

exports["default"] = Profile;
