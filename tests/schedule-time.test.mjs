import assert from "node:assert/strict";
import test from "node:test";
import { demoDate, getNowState, isoWeek } from "../components/schedule-time.ts";

// Monday 23 Nov 2026 is the reference week.
const at = (day, time) => {
  const [h, m] = time.split(":").map(Number);
  return new Date(2026, 10, 23 + day, h, m);
};

test("during a class: current is set, upcoming excludes it", () => {
  const s = getNowState(at(0, "15:40"));
  assert.equal(s.todayIndex, 0);
  assert.equal(s.current?.code, "10700252");
  assert.deepEqual(s.upcoming.map((c) => `${c.day} ${c.start}`), ["mon 17:00", "tue 09:00", "tue 13:00"]);
  assert.equal(s.minutesToNext, 80);
});

test("class end is exclusive", () => {
  const s = getNowState(at(0, "12:00"));
  assert.equal(s.current, null);
  assert.equal(s.upcoming[0].start, "13:00");
  assert.equal(s.minutesToNext, 60);
});

test("Wednesday has no classes; next is Thursday morning", () => {
  const s = getNowState(at(2, "10:00"));
  assert.equal(s.todayIndex, 2);
  assert.equal(s.current, null);
  assert.equal(`${s.upcoming[0].day} ${s.upcoming[0].start}`, "thu 10:00");
  assert.equal(s.minutesToNext, 1440);
});

test("after Friday's last class and on weekends the queue wraps to next Monday", () => {
  const fri = getNowState(at(4, "18:00"));
  assert.equal(`${fri.upcoming[0].day} ${fri.upcoming[0].start}`, "mon 10:00");
  assert.equal(fri.minutesToNext, 3 * 1440 - 8 * 60);
  const sun = getNowState(at(6, "12:00"));
  assert.equal(sun.todayIndex, -1);
  assert.equal(sun.current, null);
  assert.equal(sun.upcoming.length, 3);
  assert.equal(sun.minutesToNext, 22 * 60);
});

test("ISO week and demo clock", () => {
  assert.equal(isoWeek(at(0, "00:00")), 48);
  const d = demoDate(at(3, "08:00"));
  assert.equal(d.getDay(), 1);
  assert.equal(`${d.getHours()}:${d.getMinutes()}`, "15:40");
});
