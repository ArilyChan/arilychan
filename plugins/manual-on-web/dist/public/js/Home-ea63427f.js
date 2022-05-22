import { c as createSignal, o as onMount, g as getNextElement, i as insert, t as template, a as onCleanup } from './App.js';

const _tmpl$ = /*#__PURE__*/template(`<h1>Welcome to this Simple Routing Example</h1>`),
      _tmpl$2 = /*#__PURE__*/template(`<p>Click the links in the Navigation above to load different routes.</p>`),
      _tmpl$3 = /*#__PURE__*/template(`<span></span>`);

const Home = () => {
  const [s, set] = createSignal(0);
  onMount(() => {
    const t = setInterval(() => set(s() + 1), 100);
    onCleanup(() => clearInterval(t));
  });
  return [getNextElement(_tmpl$), getNextElement(_tmpl$2), (() => {
    const _el$3 = getNextElement(_tmpl$3);

    insert(_el$3, s);

    return _el$3;
  })()];
};

export { Home as default };
