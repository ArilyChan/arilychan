import { c as createSignal, b as createUniqueId, g as getNextElement, s as setAttribute, d as createRenderEffect, r as runHydrationEvents, i as insert, e as delegateEvents, t as template } from './client.js';

const _tmpl$ = /*#__PURE__*/template(`<h1>Settings</h1>`),
      _tmpl$2 = /*#__PURE__*/template(`<p>All that configuration you never really ever want to look at.</p>`),
      _tmpl$3 = /*#__PURE__*/template(`<label>Write:</label>`),
      _tmpl$4 = /*#__PURE__*/template(`<input type="text">`),
      _tmpl$5 = /*#__PURE__*/template(`<p></p>`);

const Settings = () => {
  const [text, setText] = createSignal("Hi");
  const id = createUniqueId();
  return [getNextElement(_tmpl$), getNextElement(_tmpl$2), (() => {
    const _el$3 = getNextElement(_tmpl$3);

    setAttribute(_el$3, "for", id);

    return _el$3;
  })(), (() => {
    const _el$4 = getNextElement(_tmpl$4);

    _el$4.$$input = e => setText(e.currentTarget.value);

    setAttribute(_el$4, "id", id);

    createRenderEffect(() => _el$4.value = text());

    runHydrationEvents();

    return _el$4;
  })(), (() => {
    const _el$5 = getNextElement(_tmpl$5);

    insert(_el$5, text);

    return _el$5;
  })()];
};

delegateEvents(["input"]);

export { Settings as default };
