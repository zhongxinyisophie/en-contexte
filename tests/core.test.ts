import { test } from "node:test";
import assert from "node:assert/strict";
import { demoEntries, findDemo } from "../src/lib/demo";
import { prototypeScheduler, isDue } from "../src/lib/scheduler";
import { emptyState, parseState } from "../src/lib/storage";
test("20 complete teaching entries and normalized lookup", () => {
  assert.equal(demoEntries.length, 20);
  for (const e of demoEntries) {
    assert.ok(
      e.definition_fr && e.main_chunk && e.example_fr && e.level && e.register,
    );
    assert.equal(e.example_type, "Exemple pédagogique");
  }
  assert.equal(findDemo(" IL N'EN DEMEURE PAS MOINS QUE ")?.level, "C1");
  assert.equal(findDemo("inconnu"), undefined);
});
test("prototype intervals and due boundaries", () => {
  const now = new Date("2026-10-14T10:00:00Z");
  const card = {
    id: "c",
    entryId: "e",
    dueAt: now.toISOString(),
    intervalDays: 0,
    repetitions: 0,
  };
  const again = prototypeScheduler.schedule(card, "again", now);
  assert.equal(again.dueAt, "2026-10-14T10:10:00.000Z");
  assert.equal(isDue(again, now), false);
  assert.equal(isDue(again, new Date(again.dueAt)), true);
  const understood = prototypeScheduler.schedule(card, "understood", now);
  assert.equal(understood.intervalDays, 1);
  assert.equal(
    prototypeScheduler.schedule(
      { ...card, intervalDays: 20 },
      "understood",
      now,
    ).intervalDays,
    30,
  );
});
test("storage roundtrip and invalid-data protection", () => {
  assert.deepEqual(parseState(JSON.stringify(emptyState())), emptyState());
  assert.throws(() => parseState("{"));
  assert.throws(() => parseState('{"version":2}'));
});
