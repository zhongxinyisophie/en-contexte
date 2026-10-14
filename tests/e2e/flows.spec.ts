import { test, expect } from "@playwright/test";
test("duplicate words and damaged storage do not overwrite data", async ({
  page,
}) => {
  await page.goto("/ajouter");
  await page.getByRole("button", { name: "enjeu ↗" }).click();
  await page.getByRole("button", { name: "Enregistrer ce mot" }).click();
  await page.reload();
  await page.getByRole("button", { name: "enjeu ↗" }).click();
  await page.getByRole("button", { name: "Enregistrer ce mot" }).click();
  await expect(page.locator(".editor [role=alert]")).toContainText(
    "Ce mot existe déjà",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("en-contexte:library:v1")!).entries
          .length,
    ),
  ).toBe(1);
  await page.evaluate(() =>
    localStorage.setItem("en-contexte:library:v1", "damaged-test-data"),
  );
  await page.reload();
  await expect(page.locator(".storage-error")).toContainText(
    "Impossible de lire vos données",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("en-contexte:library:v1")),
  ).toBe("damaged-test-data");
});
test("failed storage write never reports success", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Stockage plein", "QuotaExceededError");
    };
  });
  await page.goto("/ajouter");
  await page.getByRole("button", { name: "enjeu ↗" }).click();
  await page.getByRole("button", { name: "Enregistrer ce mot" }).click();
  await expect(
    page.getByRole("button", { name: "Fiche enregistrée" }),
  ).toHaveCount(0);
  await expect(page.locator('.editor [role="alert"]')).toContainText(
    "Stockage plein",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("en-contexte:library:v1")),
  ).toBeNull();
});
test("library, custom entry, collections, persistence and review", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("Votre premier mot commence ici.")).toBeVisible();
  await page.goto("/reviser");
  await expect(
    page.getByRole("heading", { name: "Vos mots vous attendent." }),
  ).toBeVisible();
  await page.goto("/mes-mots");
  await page.getByRole("button", { name: "Créer une liste" }).click();
  await page.getByLabel("Nom de la liste").fill("Lectures");
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await page.goto("/ajouter");
  await page.getByRole("button", { name: "enjeu ↗" }).click();
  await expect(
    page.getByText("un enjeu majeur", { exact: true }),
  ).toBeVisible();
  await page.getByText("Ajouter à une liste", { exact: false }).click();
  await page.getByLabel("Lectures", { exact: true }).check();
  await page.getByRole("button", { name: "Enregistrer ce mot" }).click();
  await expect(
    page.getByRole("button", { name: "Fiche enregistrée" }),
  ).toBeVisible();
  await page.goto("/mes-mots");
  await page.getByRole("button", { name: "Lectures 1" }).click();
  await expect(
    page.getByRole("heading", { name: "enjeu", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "enjeu", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Modifier enjeu" }).click();
  await page.getByRole("button", { name: "Modifier la fiche" }).click();
  await page.getByLabel("Chunk principal").fill("un enjeu de société");
  await page
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await page.goto("/reviser");
  await page.getByRole("button", { name: "Retourner la carte" }).click();
  await expect(
    page.getByText("un enjeu de société", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "J’ai compris" }).click();
  await expect(
    page.getByRole("heading", { name: "C’est tout pour cette fois." }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("en-contexte:library:v1")!),
  );
  expect(stored.results).toHaveLength(1);
  expect(stored.results[0].rating).toBe("understood");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Vous êtes à jour." }),
  ).toBeVisible();
  await page.goto("/ajouter");
  await page
    .getByRole("textbox", { name: "Mot ou expression à ajouter" })
    .fill("flâner");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await expect(
    page.getByText("Ce mot ne figure pas", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Définition en français")
    .fill("Se promener sans se presser.");
  await page.getByLabel("Chunk principal").fill("flâner dans les rues");
  await page
    .getByLabel("Exemple en français")
    .fill("J’aime flâner dans les rues le dimanche.");
  await page.getByRole("button", { name: "Enregistrer ce mot" }).click();
  await page.goto("/reviser");
  await page.getByRole("button", { name: "Retourner la carte" }).click();
  await page.getByRole("button", { name: "Pas encore", exact: true }).click();
  const again = await page.evaluate(
    () => JSON.parse(localStorage.getItem("en-contexte:library:v1")!).results,
  );
  expect(again[1].rating).toBe("again");
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of [
    "/",
    "/mes-mots",
    "/reviser",
    "/ajouter?id=" + stored.entries[0].id,
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/mes-mots");
  await page
    .getByRole("textbox", { name: "Rechercher dans mes mots" })
    .fill("flâner");
  await expect(
    page.getByRole("heading", { name: "enjeu", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Supprimer flâner" }).click();
  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Aucun mot trouvé." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "flâner", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("four mobile routes do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/", "/ajouter", "/mes-mots", "/reviser"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
