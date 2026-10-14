import type { ReviewCard, ReviewResult } from "./types";
export interface ReviewScheduler {
  schedule(
    card: ReviewCard,
    rating: ReviewResult["rating"],
    now: Date,
  ): ReviewCard;
}
// Replace this adapter with FSRS without changing the review UI.
export const prototypeScheduler: ReviewScheduler = {
  schedule(card, rating, now) {
    const intervalDays =
      rating === "again"
        ? 0
        : Math.min(30, card.intervalDays ? card.intervalDays * 2 : 1);
    return {
      ...card,
      repetitions: card.repetitions + 1,
      intervalDays,
      dueAt: new Date(
        now.getTime() +
          (rating === "again" ? 10 * 60 * 1000 : intervalDays * 86400000),
      ).toISOString(),
    };
  },
};
export const isDue = (card: ReviewCard, now = new Date()) =>
  new Date(card.dueAt).getTime() <= now.getTime();
