const sharedConfig = {};

function setHydrateContext(context) {
  sharedConfig.context = context;
}

function nextHydrateContext() {
  return { ...sharedConfig.context,
    id: `${sharedConfig.context.id}${sharedConfig.context.count++}-`,
    count: 0
  };
}

const equalFn = (a, b) => a === b;
const $TRACK = Symbol("solid-track");
const signalOptions = {
  equals: equalFn
};
let ERROR = null;
let runEffects = runQueue;
const NOTPENDING = {};
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
const [transPending, setTransPending] = /*@__PURE__*/createSignal(false);
var Owner = null;
let Transition = null;
let Listener = null;
let Pending = null;
let Updates = null;
let Effects = null;
let ExecCount = 0;

function createRoot(fn, detachedOwner) {
  const listener = Listener,
        owner = Owner,
        root = fn.length === 0 && !false ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: null,
    owner: detachedOwner || owner
  };
  Owner = root;
  Listener = null;

  try {
    return runUpdates(() => fn(() => cleanNode(root)), true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}

function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    pending: NOTPENDING,
    comparator: options.equals || undefined
  };

  const setter = value => {
    if (typeof value === "function") {
      if (Transition && Transition.running && Transition.sources.has(s)) value = value(s.pending !== NOTPENDING ? s.pending : s.tValue);else value = value(s.pending !== NOTPENDING ? s.pending : s.value);
    }

    return writeSignal(s, value);
  };

  return [readSignal.bind(s), setter];
}

function createComputed(fn, value, options) {
  const c = createComputation(fn, value, true, STALE);
  updateComputation(c);
}

function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  updateComputation(c);
}

function createEffect(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE),
        s = SuspenseContext && lookup(Owner, SuspenseContext.id);
  if (s) c.suspense = s;
  c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
}

function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.pending = NOTPENDING;
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || undefined;

  updateComputation(c);

  return readSignal.bind(c);
}

function createResource(source, fetcher, options) {
  if (arguments.length === 2) {
    if (typeof fetcher === "object") {
      options = fetcher;
      fetcher = source;
      source = true;
    }
  } else if (arguments.length === 1) {
    fetcher = source;
    source = true;
  }

  options || (options = {});
  const contexts = new Set(),
        [value, setValue] = createSignal(options.initialValue),
        [track, trigger] = createSignal(undefined, {
    equals: false
  }),
        [loading, setLoading] = createSignal(false),
        [error, setError] = createSignal();
  let err = undefined,
      pr = null,
      initP = null,
      id = null,
      loadedUnderTransition = false,
      scheduled = false,
      resolved = ("initialValue" in options),
      dynamic = typeof source === "function" && createMemo(source);

  if (sharedConfig.context) {
    id = `${sharedConfig.context.id}${sharedConfig.context.count++}`;
    if (sharedConfig.load) initP = sharedConfig.load(id);
  }

  function loadEnd(p, v, e, key) {
    if (pr === p) {
      pr = null;
      resolved = true;
      if (initP && (p === initP || v === initP) && options.onHydrated) queueMicrotask(() => options.onHydrated(key, {
        value: v
      }));
      initP = null;
      setError(err = e);

      if (Transition && p && loadedUnderTransition) {
        Transition.promises.delete(p);
        loadedUnderTransition = false;
        runUpdates(() => {
          Transition.running = true;

          if (!Transition.promises.size) {
            Effects.push.apply(Effects, Transition.effects);
            Transition.effects = [];
          }

          completeLoad(v);
        }, false);
      } else completeLoad(v);
    }

    return v;
  }

  function completeLoad(v) {
    batch(() => {
      setValue(() => v);
      setLoading(false);

      for (const c of contexts.keys()) c.decrement();

      contexts.clear();
    });
  }

  function read() {
    const c = SuspenseContext && lookup(Owner, SuspenseContext.id),
          v = value();
    if (err) throw err;

    if (Listener && !Listener.user && c) {
      createComputed(() => {
        track();

        if (pr) {
          if (c.resolved && Transition) Transition.promises.add(pr);else if (!contexts.has(c)) {
            c.increment();
            contexts.add(c);
          }
        }
      });
    }

    return v;
  }

  function load(refetching = true) {
    if (refetching && scheduled) return;
    scheduled = false;
    setError(err = undefined);
    const lookup = dynamic ? dynamic() : source;
    loadedUnderTransition = Transition && Transition.running;

    if (lookup == null || lookup === false) {
      loadEnd(pr, untrack(value));
      return;
    }

    if (Transition && pr) Transition.promises.delete(pr);
    const p = initP || untrack(() => fetcher(lookup, {
      value: value(),
      refetching
    }));

    if (typeof p !== "object" || !("then" in p)) {
      loadEnd(pr, p);
      return p;
    }

    pr = p;
    scheduled = true;
    queueMicrotask(() => scheduled = false);
    batch(() => {
      setLoading(true);
      trigger();
    });
    return p.then(v => loadEnd(p, v, undefined, lookup), e => loadEnd(p, e, e));
  }

  Object.defineProperties(read, {
    loading: {
      get() {
        return loading();
      }

    },
    error: {
      get() {
        return error();
      }

    },
    latest: {
      get() {
        if (!resolved) return read();
        if (err) throw err;
        return value();
      }

    }
  });
  if (dynamic) createComputed(() => load(false));else load(false);
  return [read, {
    refetch: load,
    mutate: setValue
  }];
}

function batch(fn) {
  if (Pending) return fn();
  let result;
  const q = Pending = [];

  try {
    result = fn();
  } finally {
    Pending = null;
  }

  runUpdates(() => {
    for (let i = 0; i < q.length; i += 1) {
      const data = q[i];

      if (data.pending !== NOTPENDING) {
        const pending = data.pending;
        data.pending = NOTPENDING;
        writeSignal(data, pending);
      }
    }
  }, false);
  return result;
}

function untrack(fn) {
  let result,
      listener = Listener;
  Listener = null;
  result = fn();
  Listener = listener;
  return result;
}

function onMount(fn) {
  createEffect(() => untrack(fn));
}

function onCleanup(fn) {
  if (Owner === null) ;else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}

function onError(fn) {
  ERROR || (ERROR = Symbol("error"));
  if (Owner === null) ;else if (Owner.context === null) Owner.context = {
    [ERROR]: [fn]
  };else if (!Owner.context[ERROR]) Owner.context[ERROR] = [fn];else Owner.context[ERROR].push(fn);
}

function getOwner() {
  return Owner;
}

function startTransition(fn) {
  if (Transition && Transition.running) {
    fn();
    return Transition.done;
  }

  const l = Listener;
  const o = Owner;
  return Promise.resolve().then(() => {
    Listener = l;
    Owner = o;
    let t;

    if (SuspenseContext) {
      t = Transition || (Transition = {
        sources: new Set(),
        effects: [],
        promises: new Set(),
        disposed: new Set(),
        queue: new Set(),
        running: true
      });
      t.done || (t.done = new Promise(res => t.resolve = res));
      t.running = true;
    }

    batch(fn);
    Listener = Owner = null;
    return t ? t.done : undefined;
  });
}

function useTransition() {
  return [transPending, startTransition];
}

function resumeEffects(e) {
  Effects.push.apply(Effects, e);
  e.length = 0;
}

function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}

function useContext(context) {
  let ctx;
  return (ctx = lookup(Owner, context.id)) !== undefined ? ctx : context.defaultValue;
}

function children(fn) {
  const children = createMemo(fn);
  return createMemo(() => resolveChildren(children()));
}

let SuspenseContext;

function getSuspenseContext() {
  return SuspenseContext || (SuspenseContext = createContext({}));
}

function readSignal() {
  const runningTransition = Transition && Transition.running;

  if (this.sources && (!runningTransition && this.state || runningTransition && this.tState)) {
    const updates = Updates;
    Updates = null;
    !runningTransition && this.state === STALE || runningTransition && this.tState === STALE ? updateComputation(this) : lookUpstream(this);
    Updates = updates;
  }

  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;

    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }

    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }

  if (runningTransition && Transition.sources.has(this)) return this.tValue;
  return this.value;
}

function writeSignal(node, value, isComp) {
  if (Pending) {
    if (node.pending === NOTPENDING) Pending.push(node);
    node.pending = value;
    return value;
  }

  if (node.comparator) {
    if (Transition && Transition.running && Transition.sources.has(node)) {
      if (node.comparator(node.tValue, value)) return value;
    } else if (node.comparator(node.value, value)) return value;
  }

  let TransitionRunning = false;

  if (Transition) {
    TransitionRunning = Transition.running;

    if (TransitionRunning || !isComp && Transition.sources.has(node)) {
      Transition.sources.add(node);
      node.tValue = value;
    }

    if (!TransitionRunning) node.value = value;
  } else node.value = value;

  if (node.observers && node.observers.length) {
    runUpdates(() => {
      for (let i = 0; i < node.observers.length; i += 1) {
        const o = node.observers[i];
        if (TransitionRunning && Transition.disposed.has(o)) continue;

        if (TransitionRunning && !o.tState || !TransitionRunning && !o.state) {
          if (o.pure) Updates.push(o);else Effects.push(o);
          if (o.observers) markDownstream(o);
        }

        if (TransitionRunning) o.tState = STALE;else o.state = STALE;
      }

      if (Updates.length > 10e5) {
        Updates = [];
        if (false) ;
        throw new Error();
      }
    }, false);
  }

  return value;
}

function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const owner = Owner,
        listener = Listener,
        time = ExecCount;
  Listener = Owner = node;
  runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);

  if (Transition && !Transition.running && Transition.sources.has(node)) {
    queueMicrotask(() => {
      runUpdates(() => {
        Transition && (Transition.running = true);
        runComputation(node, node.tValue, time);
      }, false);
    });
  }

  Listener = listener;
  Owner = owner;
}

function runComputation(node, value, time) {
  let nextValue;

  try {
    nextValue = node.fn(value);
  } catch (err) {
    handleError(err);
  }

  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.observers && node.observers.length) {
      writeSignal(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else node.value = nextValue;

    node.updatedAt = time;
  }
}

function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state: state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: null,
    pure
  };

  if (Transition && Transition.running) {
    c.state = 0;
    c.tState = state;
  }

  if (Owner === null) ;else if (Owner !== UNOWNED) {
    if (Transition && Transition.running && Owner.pure) {
      if (!Owner.tOwned) Owner.tOwned = [c];else Owner.tOwned.push(c);
    } else {
      if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
    }
  }

  return c;
}

function runTop(node) {
  const runningTransition = Transition && Transition.running;
  if (!runningTransition && node.state === 0 || runningTransition && node.tState === 0) return;
  if (!runningTransition && node.state === PENDING || runningTransition && node.tState === PENDING) return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const ancestors = [node];

  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (runningTransition && Transition.disposed.has(node)) return;
    if (!runningTransition && node.state || runningTransition && node.tState) ancestors.push(node);
  }

  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];

    if (runningTransition) {
      let top = node,
          prev = ancestors[i + 1];

      while ((top = top.owner) && top !== prev) {
        if (Transition.disposed.has(top)) return;
      }
    }

    if (!runningTransition && node.state === STALE || runningTransition && node.tState === STALE) {
      updateComputation(node);
    } else if (!runningTransition && node.state === PENDING || runningTransition && node.tState === PENDING) {
      const updates = Updates;
      Updates = null;
      lookUpstream(node, ancestors[0]);
      Updates = updates;
    }
  }
}

function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;else Effects = [];
  ExecCount++;

  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    handleError(err);
  } finally {
    Updates = null;
    if (!wait) Effects = null;
  }
}

function completeUpdates(wait) {
  if (Updates) {
    runQueue(Updates);
    Updates = null;
  }

  if (wait) return;
  let res;

  if (Transition && Transition.running) {
    if (Transition.promises.size || Transition.queue.size) {
      Transition.running = false;
      Transition.effects.push.apply(Transition.effects, Effects);
      Effects = null;
      setTransPending(true);
      return;
    }

    const sources = Transition.sources;
    res = Transition.resolve;
    Effects.forEach(e => {
      "tState" in e && (e.state = e.tState);
      delete e.tState;
    });
    Transition = null;
    batch(() => {
      sources.forEach(v => {
        v.value = v.tValue;

        if (v.owned) {
          for (let i = 0, len = v.owned.length; i < len; i++) cleanNode(v.owned[i]);
        }

        if (v.tOwned) v.owned = v.tOwned;
        delete v.tValue;
        delete v.tOwned;
        v.tState = 0;
      });
      setTransPending(false);
    });
  }

  if (Effects.length) batch(() => {
    runEffects(Effects);
    Effects = null;
  });else {
    Effects = null;
  }
  if (res) res();
}

function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}

function runUserEffects(queue) {
  let i,
      userLength = 0;

  for (i = 0; i < queue.length; i++) {
    const e = queue[i];
    if (!e.user) runTop(e);else queue[userLength++] = e;
  }

  if (sharedConfig.context) setHydrateContext();
  const resume = queue.length;

  for (i = 0; i < userLength; i++) runTop(queue[i]);

  for (i = resume; i < queue.length; i++) runTop(queue[i]);
}

function lookUpstream(node, ignore) {
  const runningTransition = Transition && Transition.running;
  if (runningTransition) node.tState = 0;else node.state = 0;

  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];

    if (source.sources) {
      if (!runningTransition && source.state === STALE || runningTransition && source.tState === STALE) {
        if (source !== ignore) runTop(source);
      } else if (!runningTransition && source.state === PENDING || runningTransition && source.tState === PENDING) lookUpstream(source, ignore);
    }
  }
}

function markDownstream(node) {
  const runningTransition = Transition && Transition.running;

  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];

    if (!runningTransition && !o.state || runningTransition && !o.tState) {
      if (runningTransition) o.tState = PENDING;else o.state = PENDING;
      if (o.pure) Updates.push(o);else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}

function cleanNode(node) {
  let i;

  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
            index = node.sourceSlots.pop(),
            obs = source.observers;

      if (obs && obs.length) {
        const n = obs.pop(),
              s = source.observerSlots.pop();

        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }

  if (Transition && Transition.running && node.pure) {
    if (node.tOwned) {
      for (i = 0; i < node.tOwned.length; i++) cleanNode(node.tOwned[i]);

      delete node.tOwned;
    }

    reset(node, true);
  } else if (node.owned) {
    for (i = 0; i < node.owned.length; i++) cleanNode(node.owned[i]);

    node.owned = null;
  }

  if (node.cleanups) {
    for (i = 0; i < node.cleanups.length; i++) node.cleanups[i]();

    node.cleanups = null;
  }

  if (Transition && Transition.running) node.tState = 0;else node.state = 0;
  node.context = null;
}

function reset(node, top) {
  if (!top) {
    node.tState = 0;
    Transition.disposed.add(node);
  }

  if (node.owned) {
    for (let i = 0; i < node.owned.length; i++) reset(node.owned[i]);
  }
}

function handleError(err) {
  const fns = ERROR && lookup(Owner, ERROR);
  if (!fns) throw err;
  fns.forEach(f => f(err));
}

function lookup(owner, key) {
  return owner ? owner.context && owner.context[key] !== undefined ? owner.context[key] : lookup(owner.owner, key) : undefined;
}

function resolveChildren(children) {
  if (typeof children === "function" && !children.length) return resolveChildren(children());

  if (Array.isArray(children)) {
    const results = [];

    for (let i = 0; i < children.length; i++) {
      const result = resolveChildren(children[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }

    return results;
  }

  return children;
}

function createProvider(id) {
  return function provider(props) {
    let res;
    createComputed(() => res = untrack(() => {
      Owner.context = {
        [id]: props.value
      };
      return children(() => props.children);
    }));
    return res;
  };
}

const FALLBACK = Symbol("fallback");

function dispose(d) {
  for (let i = 0; i < d.length; i++) d[i]();
}

function mapArray(list, mapFn, options = {}) {
  let items = [],
      mapped = [],
      disposers = [],
      len = 0,
      indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [],
        i,
        j;
    newItems[$TRACK];
    return untrack(() => {
      let newLen = newItems.length,
          newIndices,
          newIndicesNext,
          temp,
          tempdisposers,
          tempIndexes,
          start,
          end,
          newEnd,
          item;

      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }

        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot(disposer => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
      } else if (len === 0) {
        mapped = new Array(newLen);

        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper);
        }

        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));

        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);

        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }

        newIndices = new Map();
        newIndicesNext = new Array(newEnd + 1);

        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }

        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);

          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }

        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];

            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else mapped[j] = createRoot(mapper);
        }

        mapped = mapped.slice(0, len = newLen);
        items = newItems.slice(0);
      }

      return mapped;
    });

    function mapper(disposer) {
      disposers[j] = disposer;

      if (indexes) {
        const [s, set] = createSignal(j);
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }

      return mapFn(newItems[j]);
    }
  };
}

let hydrationEnabled = false;

function enableHydration() {
  hydrationEnabled = true;
}

function createComponent(Comp, props) {
  if (hydrationEnabled) {
    if (sharedConfig.context) {
      const c = sharedConfig.context;
      setHydrateContext(nextHydrateContext());
      const r = untrack(() => Comp(props || {}));
      setHydrateContext(c);
      return r;
    }
  }

  return untrack(() => Comp(props || {}));
}

function lazy(fn) {
  let comp;
  let p;

  const wrap = props => {
    const ctx = sharedConfig.context;

    if (ctx) {
      const [s, set] = createSignal();
      (p || (p = fn())).then(mod => {
        setHydrateContext(ctx);
        set(() => mod.default);
        setHydrateContext();
      });
      comp = s;
    } else if (!comp) {
      const [s] = createResource(() => (p || (p = fn())).then(mod => mod.default));
      comp = s;
    } else {
      const c = comp();
      if (c) return c(props);
    }

    let Comp;
    return createMemo(() => (Comp = comp()) && untrack(() => {
      if (!ctx) return Comp(props);
      const c = sharedConfig.context;
      setHydrateContext(ctx);
      const r = Comp(props);
      setHydrateContext(c);
      return r;
    }));
  };

  wrap.preload = () => p || ((p = fn()).then(mod => comp = () => mod.default), p);

  return wrap;
}

let counter = 0;

function createUniqueId() {
  const ctx = sharedConfig.context;
  return ctx ? `${ctx.id}${ctx.count++}` : `cl-${counter++}`;
}

function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback ? fallback : undefined));
}

function Switch(props) {
  let strictEqual = false;
  const conditions = children(() => props.children),
        evalConditions = createMemo(() => {
    let conds = conditions();
    if (!Array.isArray(conds)) conds = [conds];

    for (let i = 0; i < conds.length; i++) {
      const c = conds[i].when;
      if (c) return [i, c, conds[i]];
    }

    return [-1];
  }, undefined, {
    equals: (a, b) => a[0] === b[0] && (strictEqual ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2]
  });
  return createMemo(() => {
    const [index, when, cond] = evalConditions();
    if (index < 0) return props.fallback;
    const c = cond.children;
    return (strictEqual = typeof c === "function" && c.length > 0) ? untrack(() => c(when)) : c;
  });
}

function Match(props) {
  return props;
}

let Errors;

function ErrorBoundary(props) {
  let err = undefined;

  if (sharedConfig.context && sharedConfig.load) {
    err = sharedConfig.load(sharedConfig.context.id + sharedConfig.context.count);
  }

  const [errored, setErrored] = createSignal(err);
  Errors || (Errors = new Set());
  Errors.add(setErrored);
  onCleanup(() => Errors.delete(setErrored));
  let e;
  return createMemo(() => {
    if ((e = errored()) != null) {
      const f = props.fallback;
      return typeof f === "function" && f.length ? untrack(() => f(e, () => setErrored(null))) : f;
    }

    onError(setErrored);
    return props.children;
  });
}

const SuspenseListContext = createContext();

function Suspense(props) {
  let counter = 0,
      showContent,
      showFallback,
      ctx,
      p,
      flicker,
      error;
  const [inFallback, setFallback] = createSignal(false),
        SuspenseContext = getSuspenseContext(),
        store = {
    increment: () => {
      if (++counter === 1) setFallback(true);
    },
    decrement: () => {
      if (--counter === 0) setFallback(false);
    },
    inFallback,
    effects: [],
    resolved: false
  },
        owner = getOwner();

  if (sharedConfig.context) {
    const key = sharedConfig.context.id + sharedConfig.context.count;
    p = sharedConfig.load(key);

    if (p) {
      if (typeof p !== "object" || !("then" in p)) p = Promise.resolve(p);
      const [s, set] = createSignal(undefined, {
        equals: false
      });
      flicker = s;
      p.then(err => {
        if ((error = err) || sharedConfig.done) return set();
        sharedConfig.gather(key);
        setHydrateContext(ctx);
        set();
        setHydrateContext();
      });
    }
  }

  const listContext = useContext(SuspenseListContext);
  if (listContext) [showContent, showFallback] = listContext.register(store.inFallback);
  let dispose;
  onCleanup(() => dispose && dispose());
  return createComponent(SuspenseContext.Provider, {
    value: store,

    get children() {
      return createMemo(() => {
        if (error) throw error;
        ctx = sharedConfig.context;

        if (flicker) {
          flicker();
          return flicker = undefined;
        }

        if (ctx && p === undefined) setHydrateContext();
        const rendered = untrack(() => props.children);
        return createMemo(() => {
          const inFallback = store.inFallback(),
                visibleContent = showContent ? showContent() : true,
                visibleFallback = showFallback ? showFallback() : true;
          dispose && dispose();

          if ((!inFallback || p !== undefined) && visibleContent) {
            store.resolved = true;
            ctx = p = undefined;
            resumeEffects(store.effects);
            return rendered;
          }

          if (!visibleFallback) return;
          return createRoot(disposer => {
            dispose = disposer;

            if (ctx) {
              setHydrateContext({
                id: ctx.id + "f",
                count: 0
              });
              ctx = undefined;
            }

            return props.fallback;
          }, owner);
        });
      });
    }

  });
}

function reconcileArrays(parentNode, a, b) {
  let bLength = b.length,
      aEnd = a.length,
      bEnd = bLength,
      aStart = 0,
      bStart = 0,
      after = a[aEnd - 1].nextSibling,
      map = null;

  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }

    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }

    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;

      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;

        while (i < bEnd) map.set(b[i], i++);
      }

      const index = map.get(a[aStart]);

      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
              sequence = 1,
              t;

          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }

          if (sequence > index - bStart) {
            const node = a[aStart];

            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else a[aStart++].remove();
    }
  }
}

const $$EVENTS = "_$DX_DELEGATE";

function render(code, element, init) {
  let disposer;
  createRoot(dispose => {
    disposer = dispose;
    element === document ? code() : insert(element, code(), element.firstChild ? null : undefined, init);
  });
  return () => {
    disposer();
    element.textContent = "";
  };
}

function template(html, check, isSVG) {
  const t = document.createElement("template");
  t.innerHTML = html;
  let node = t.content.firstChild;
  if (isSVG) node = node.firstChild;
  return node;
}

function delegateEvents(eventNames, document = window.document) {
  const e = document[$$EVENTS] || (document[$$EVENTS] = new Set());

  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];

    if (!e.has(name)) {
      e.add(name);
      document.addEventListener(name, eventHandler);
    }
  }
}

function setAttribute(node, name, value) {
  if (value == null) node.removeAttribute(name);else node.setAttribute(name, value);
}

function addEventListener(node, name, handler, delegate) {
  if (delegate) {
    if (Array.isArray(handler)) {
      node[`$$${name}`] = handler[0];
      node[`$$${name}Data`] = handler[1];
    } else node[`$$${name}`] = handler;
  } else if (Array.isArray(handler)) {
    node.addEventListener(name, e => handler[0](handler[1], e));
  } else node.addEventListener(name, handler);
}

function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = [];
  if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
  createRenderEffect(current => insertExpression(parent, accessor(), current, marker), initial);
}

function hydrate$1(code, element, options = {}) {
  sharedConfig.completed = globalThis._$HY.completed;
  sharedConfig.events = globalThis._$HY.events;
  sharedConfig.load = globalThis._$HY.load;

  sharedConfig.gather = root => gatherHydratable(element, root);

  sharedConfig.registry = new Map();
  sharedConfig.context = {
    id: options.renderId || "",
    count: 0
  };
  gatherHydratable(element, options.renderId);
  const dispose = render(code, element, [...element.childNodes]);
  sharedConfig.context = null;
  return dispose;
}

function getNextElement(template) {
  let node, key;

  if (!sharedConfig.context || !(node = sharedConfig.registry.get(key = getHydrationKey()))) {
    return template.cloneNode(true);
  }

  if (sharedConfig.completed) sharedConfig.completed.add(node);
  sharedConfig.registry.delete(key);
  return node;
}

function getNextMatch(el, nodeName) {
  while (el && el.localName !== nodeName) el = el.nextSibling;

  return el;
}

function getNextMarker(start) {
  let end = start,
      count = 0,
      current = [];

  if (sharedConfig.context) {
    while (end) {
      if (end.nodeType === 8) {
        const v = end.nodeValue;
        if (v === "#") count++;else if (v === "/") {
          if (count === 0) return [end, current];
          count--;
        }
      }

      current.push(end);
      end = end.nextSibling;
    }
  }

  return [end, current];
}

function runHydrationEvents() {
  if (sharedConfig.events && !sharedConfig.events.queued) {
    queueMicrotask(() => {
      const {
        completed,
        events
      } = sharedConfig;
      events.queued = false;

      while (events.length) {
        const [el, e] = events[0];
        if (!completed.has(el)) return;
        eventHandler(e);
        events.shift();
      }
    });
    sharedConfig.events.queued = true;
  }
}

function eventHandler(e) {
  const key = `$$${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;

  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }

  Object.defineProperty(e, "currentTarget", {
    configurable: true,

    get() {
      return node || document;
    }

  });

  if (sharedConfig.registry && !sharedConfig.done) {
    sharedConfig.done = true;
    document.querySelectorAll("[id^=pl-]").forEach(elem => elem.remove());
  }

  while (node !== null) {
    const handler = node[key];

    if (handler && !node.disabled) {
      const data = node[`${key}Data`];
      data !== undefined ? handler(data, e) : handler(e);
      if (e.cancelBubble) return;
    }

    node = node.host && node.host !== node && node.host instanceof Node ? node.host : node.parentNode;
  }
}

function insertExpression(parent, value, current, marker, unwrapArray) {
  if (sharedConfig.context && !current) current = [...parent.childNodes];

  while (typeof current === "function") current = current();

  if (value === current) return current;
  const t = typeof value,
        multi = marker !== undefined;
  parent = multi && current[0] && current[0].parentNode || parent;

  if (t === "string" || t === "number") {
    if (sharedConfig.context) return current;
    if (t === "number") value = value.toString();

    if (multi) {
      let node = current[0];

      if (node && node.nodeType === 3) {
        node.data = value;
      } else node = document.createTextNode(value);

      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    if (sharedConfig.context) return current;
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    createRenderEffect(() => {
      let v = value();

      while (typeof v === "function") v = v();

      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];

    if (normalizeIncomingArray(array, value, unwrapArray)) {
      createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }

    if (sharedConfig.context) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].parentNode) return current = array;
      }
    }

    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else if (Array.isArray(current)) {
      if (current.length === 0) {
        appendNodes(parent, array, marker);
      } else reconcileArrays(parent, current, array);
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }

    current = array;
  } else if (value instanceof Node) {
    if (sharedConfig.context && value.parentNode) return current = multi ? [value] : value;

    if (Array.isArray(current)) {
      if (multi) return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);

    current = value;
  } else ;

  return current;
}

function normalizeIncomingArray(normalized, array, unwrap) {
  let dynamic = false;

  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
        t;

    if (item instanceof Node) {
      normalized.push(item);
    } else if (item == null || item === true || item === false) ;else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item) || dynamic;
    } else if ((t = typeof item) === "string") {
      normalized.push(document.createTextNode(item));
    } else if (t === "function") {
      if (unwrap) {
        while (typeof item === "function") item = item();

        dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else normalized.push(document.createTextNode(item.toString()));
  }

  return dynamic;
}

function appendNodes(parent, array, marker) {
  for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}

function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) return parent.textContent = "";
  const node = replacement || document.createTextNode("");

  if (current.length) {
    let inserted = false;

    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];

      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);else isParent && el.remove();
      } else inserted = true;
    }
  } else parent.insertBefore(node, marker);

  return [node];
}

function gatherHydratable(element, root) {
  const templates = element.querySelectorAll(`*[data-hk]`);

  for (let i = 0; i < templates.length; i++) {
    const node = templates[i];
    const key = node.getAttribute("data-hk");
    if ((!root || key.startsWith(root)) && !sharedConfig.registry.has(key)) sharedConfig.registry.set(key, node);
  }
}

function getHydrationKey() {
  const hydrate = sharedConfig.context;
  return `${hydrate.id}${hydrate.count++}`;
}

const hydrate = (...args) => {
  enableHydration();
  return hydrate$1(...args);
};

const _tmpl$$1 = /*#__PURE__*/template(`<a class="link"></a>`);

const RouterContext = createContext();

function RouteHOC(Comp) {
  return (props = {}) => {
    const [location, setLocation] = createSignal((props.url ? props.url : window.location.pathname).slice(1) || 'index');

    const matches = match => match === (location() || 'index');

    const [pending, start] = useTransition();
    (window.onpopstate = () => setLocation(window.location.pathname.slice(1)));
    return createComponent(RouterContext.Provider, {
      value: [location, pending, {
        setLocation: v => start(() => setLocation(v)),
        matches
      }],

      get children() {
        return createComponent(Comp, {});
      }

    });
  };
}

const Link = props => {
  const [,, {
    setLocation
  }] = useContext(RouterContext);

  const navigate = e => {
    if (e) e.preventDefault();
    window.history.pushState('', '', `/${props.path}`);
    setLocation(props.path);
  };

  return (() => {
    const _el$ = getNextElement(_tmpl$$1);

    _el$.$$click = navigate;

    insert(_el$, () => props.children);

    createRenderEffect(() => setAttribute(_el$, "href", `/${props.path}`));

    runHydrationEvents();

    return _el$;
  })();
};

delegateEvents(["click"]);

const Profile = lazy(() => import('./Profile-a9ca1003.js')); // this component lazy loads data and code in parallel

var Profile$1 = (() => {
  const [user] = createResource(() => {
    // simulate data loading
    console.log("LOAD USER");
    return new Promise(res => {
      setTimeout(() => res({
        firstName: "Jon",
        lastName: "Snow"
      }), 400);
    });
  }),
        [info] = createResource(user, () => {
    // simulate cascading data loading
    console.log("LOAD INFO");
    return new Promise(res => {
      setTimeout(() => res(["Something Interesting", "Something else you might care about", "Or maybe not"]), 400);
    });
  }, {
    initialValue: []
  });
  return createComponent(Profile, {
    get user() {
      return user();
    },

    get info() {
      return info();
    }

  });
});

const _tmpl$ = /*#__PURE__*/template(`<h2>Error: <!#><!/></h2>`),
      _tmpl$2 = /*#__PURE__*/template(`<button>Reset</button>`),
      _tmpl$3 = /*#__PURE__*/template(`<span class="loader" style="opacity: 0">Loading...</span>`);
const Home = lazy(() => import('./Home-ea63427f.js'));
const Settings = lazy(() => import('./Settings-ca689772.js'));
const App = RouteHOC(() => {
  const [, pending, {
    matches
  }] = useContext(RouterContext);
  return (() => {
    const _el$ = getNextElement(),
          _el$9 = getNextMatch(_el$.firstChild, "body"),
          _el$10 = _el$9.firstChild,
          _el$11 = _el$10.firstChild,
          _el$12 = _el$11.firstChild,
          _el$13 = _el$12.nextSibling,
          _el$14 = _el$13.nextSibling,
          _el$15 = _el$11.nextSibling;

    insert(_el$12, createComponent(Link, {
      path: "",
      children: "Home"
    }));

    insert(_el$13, createComponent(Link, {
      path: "profile",
      children: "Profile"
    }));

    insert(_el$14, createComponent(Link, {
      path: "settings",
      children: "Settings"
    }));

    insert(_el$15, createComponent(ErrorBoundary, {
      fallback: (err, reset) => {
        return [(() => {
          const _el$16 = getNextElement(_tmpl$),
                _el$17 = _el$16.firstChild,
                _el$18 = _el$17.nextSibling,
                [_el$19, _co$2] = getNextMarker(_el$18.nextSibling);

          insert(_el$16, () => err.message, _el$19, _co$2);

          return _el$16;
        })(), (() => {
          const _el$20 = getNextElement(_tmpl$2);

          addEventListener(_el$20, "click", reset, true);

          runHydrationEvents();

          return _el$20;
        })()];
      },

      get children() {
        return createComponent(Suspense, {
          get fallback() {
            return getNextElement(_tmpl$3);
          },

          get children() {
            return createComponent(Switch, {
              get children() {
                return [createComponent(Match, {
                  get when() {
                    return matches('index');
                  },

                  get children() {
                    return createComponent(Home, {});
                  }

                }), createComponent(Match, {
                  get when() {
                    return matches('profile');
                  },

                  get children() {
                    return createComponent(Profile$1, {});
                  }

                }), createComponent(Match, {
                  get when() {
                    return matches('settings');
                  },

                  get children() {
                    return createComponent(Settings, {});
                  }

                })];
              }

            });
          }

        });
      }

    }));

    createRenderEffect(_p$ => {
      const _v$ = !!matches('index'),
            _v$2 = !!matches('profile'),
            _v$3 = !!matches('settings'),
            _v$4 = !!pending();

      _v$ !== _p$._v$ && _el$12.classList.toggle("selected", _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && _el$13.classList.toggle("selected", _p$._v$2 = _v$2);
      _v$3 !== _p$._v$3 && _el$14.classList.toggle("selected", _p$._v$3 = _v$3);
      _v$4 !== _p$._v$4 && _el$15.classList.toggle("pending", _p$._v$4 = _v$4);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined,
      _v$4: undefined
    });

    return _el$;
  })();
});

delegateEvents(["click"]);

hydrate(() => createComponent(App, {}), document);

export { For as F, Suspense as S, onCleanup as a, createUniqueId as b, createSignal as c, createRenderEffect as d, delegateEvents as e, getNextMarker as f, getNextElement as g, createComponent as h, insert as i, onMount as o, runHydrationEvents as r, setAttribute as s, template as t };
