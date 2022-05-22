import { g as getNextElement, f as getNextMarker, i as insert, h as createComponent, F as For, S as Suspense, t as template } from './App.js';

const _tmpl$ = /*#__PURE__*/template(`<h1><!#><!/>'s Profile</h1>`),
      _tmpl$2 = /*#__PURE__*/template(`<p>This section could be about you.</p>`),
      _tmpl$3 = /*#__PURE__*/template(`<ul></ul>`),
      _tmpl$4 = /*#__PURE__*/template(`<span class="loader">Loading Info...</span>`),
      _tmpl$5 = /*#__PURE__*/template(`<li></li>`);

const Profile = props => [(() => {
  const _el$ = getNextElement(_tmpl$),
        _el$3 = _el$.firstChild,
        [_el$4, _co$] = getNextMarker(_el$3.nextSibling);
        _el$4.nextSibling;

  insert(_el$, () => props.user?.firstName, _el$4, _co$);

  return _el$;
})(), getNextElement(_tmpl$2), createComponent(Suspense, {
  get fallback() {
    return getNextElement(_tmpl$4);
  },

  get children() {
    const _el$6 = getNextElement(_tmpl$3);

    insert(_el$6, createComponent(For, {
      get each() {
        return props.info;
      },

      children: fact => (() => {
        const _el$8 = getNextElement(_tmpl$5);

        insert(_el$8, fact);

        return _el$8;
      })()
    }));

    return _el$6;
  }

})];

export { Profile as default };
