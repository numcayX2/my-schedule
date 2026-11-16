import assert from "node:assert/strict";
import test from "node:test";
import { CLASSES, COURSE_TONES, TIMES, getSessionGrid } from "../components/schedule-data.ts";

test("term 2/2569 schedule contains 11 sessions across 6 courses", () => {
  assert.equal(CLASSES.length, 11);
  assert.equal(new Set(CLASSES.map(session => session.code)).size, 6);
  assert.equal(TIMES[0], "09:00");
  assert.equal(TIMES[TIMES.length - 1], "20:00");
  for (const session of CLASSES) {
    assert.ok(COURSE_TONES[session.code], `missing tone for ${session.code}`);
  }
});

test("semantic day and time map to half-hour desktop grid cells without overlap", () => {
  const expectedCells = [
    [2, 4, 8], [2, 10, 14], [2, 14, 18], [2, 18, 26],
    [3, 2, 8], [3, 10, 14], [3, 14, 17],
    [5, 4, 10], [5, 14, 18],
    [6, 10, 14], [6, 14, 17],
  ];
  assert.deepEqual(CLASSES.map(session => {
    const grid = getSessionGrid(session);
    return [grid.gridRowStart, grid.gridColumnStart, grid.gridColumnEnd];
  }), expectedCells);
});
