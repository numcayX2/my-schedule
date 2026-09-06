import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { DAYS } from "../components/schedule-data.ts";

// A simulated DOM/React lifecycle. Browser interaction evidence is recorded
// separately in artifacts/mobile-qa; these tests do not emulate a browser.
const source = await readFile(new URL("../components/useDayNavigation.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup(reduced = false) {
  let effect, active = "mon", frameId = 0;
  const frames = new Map();
  const listeners = new Map();
  const mediaListeners = new Map();
  const calls = [];
  const positions = [300, 750, 1200, 1350, 1800];
  const window = {
    innerHeight: 844, scrollY: 0,
    matchMedia: query => ({
      get matches() { return query.includes("reduced-motion") ? reduced : true; },
      addEventListener: (_, fn) => mediaListeners.set(query, fn),
      removeEventListener: () => {},
    }),
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: event => listeners.delete(event),
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: () => 1, clearTimeout: () => {},
    scrollTo: options => {
      calls.push(options);
      if (options.behavior === "instant") window.scrollY = options.top;
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, window,
    document: { documentElement: { scrollHeight: 2400 } },
    ResizeObserver: class { observe() {} disconnect() {} },
    require: name => name === "react" ? {
      useRef: current => ({ current }),
      useState: () => [active, value => { active = value; }],
      useEffect: fn => { effect = fn; },
    } : { DAYS },
  });
  const hook = exports.default();
  DAYS.forEach((day, i) => {
    hook.dayRefs.current[day.id] = { getBoundingClientRect: () => ({ top: positions[i] - window.scrollY }) };
  });
  const cleanup = effect();
  const flush = () => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(fn => fn());
  };
  flush();
  return {
    hook, calls, cleanup, flush,
    get active() { return active; },
    scroll(y) { window.scrollY = y; listeners.get("scroll")(); flush(); },
    event(name, value = {}) { listeners.get(name)?.(value); flush(); },
    reduceMotion() { reduced = true; mediaListeners.get("(prefers-reduced-motion: reduce)")(); flush(); },
  };
}

test("scrolling down and reversing recomputes all sections, including the empty day", () => {
  const app = setup();
  app.scroll(700);
  assert.equal(app.active, "tue");
  app.scroll(400);
  assert.equal(app.active, "mon");
  app.scroll(1176);
  assert.equal(app.active, "wed");
  app.scroll(1326);
  assert.equal(app.active, "thu");
  app.scroll(1176);
  assert.equal(app.active, "wed");
  app.scroll(1556);
  assert.equal(app.active, "fri", "at the document end Friday is selected even when its heading cannot reach 96px");
  app.cleanup();
});

test("rapid day clicks follow actual scroll position; scrollend recalculates", () => {
  const app = setup();
  app.hook.scrollToDay("fri");
  app.hook.scrollToDay("tue");
  assert.equal(app.calls.at(-1).top, 726);
  assert.equal(app.active, "mon", "a requested destination does not lock the highlight");
  app.scroll(726);
  app.event("scrollend");
  assert.equal(app.active, "tue");
  app.scroll(400);
  assert.equal(app.active, "mon");
  app.cleanup();
});

test("wheel, touch, pointer and scroll keys cancel smooth scrolling", () => {
  for (const [event, payload] of [["wheel", {}], ["touchstart", {}], ["pointerdown", {}], ["keydown", { key: "PageUp" }]]) {
    const app = setup();
    app.hook.scrollToDay("fri");
    app.scroll(400);
    app.event(event, payload);
    assert.equal(app.calls.at(-1).behavior, "instant");
    assert.equal(app.calls.at(-1).top, 400);
    assert.equal(app.active, "mon");
    app.cleanup();
  }
});

test("reduced motion scrolls instantly and responds to a live preference change", () => {
  const app = setup(true);
  app.hook.scrollToDay("tue");
  app.flush();
  assert.equal(app.calls.at(-1).behavior, "instant");
  assert.equal(app.active, "tue");
  app.cleanup();
  const live = setup();
  live.hook.scrollToDay("fri");
  live.scroll(400);
  live.reduceMotion();
  assert.equal(live.calls.at(-1).behavior, "instant");
  assert.equal(live.active, "mon");
  live.cleanup();
});
