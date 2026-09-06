import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CLASSES, getSessionGrid } from "../components/schedule-data.ts";

// Captured from commit 4dfcc23 before changing the original grid-based data.
const original = JSON.parse(await readFile(new URL("../artifacts/mobile-qa/schedule-baseline.json", import.meta.url), "utf8"));

test("all 12 sessions retain every original timetable value", () => {
  assert.equal(CLASSES.length, 12);
  assert.equal(new Set(CLASSES.map(session => session.code)).size, 6);
  assert.deepEqual(CLASSES, original);
});

test("semantic day and time reproduce the original desktop grid cells", () => {
  const originalCells = [
    [2, 3, 5], [2, 6, 8], [2, 8, 10],
    [3, 3, 5], [3, 6, 9], [3, 10, 12],
    [5, 2, 5], [5, 6, 8], [5, 8, 10],
    [6, 2, 5], [6, 6, 9], [6, 10, 12],
  ];
  assert.deepEqual(CLASSES.map(session => {
    const grid = getSessionGrid(session);
    return [grid.gridRowStart, grid.gridColumnStart, grid.gridColumnEnd];
  }), originalCells);
});
