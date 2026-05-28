import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

// Verify the public assets exist
test("required public images exist", () => {
  const images = [
    "Bottle_1.jpeg",
    "Aesthetic_bottle_shot.jpeg",
    "bottle_TrueBlack.jpeg",
    "Bottle_in_ice.jpeg",
  ];

  const videos = [
    "ForeverWaterIntro2.mp4",
  ];

  for (const img of images) {
    const p = path.join("public", "images", img);
    assert.ok(fs.existsSync(p), `Missing image: ${img}`);
  }

  for (const vid of videos) {
    const p = path.join("public", "videos", vid);
    assert.ok(fs.existsSync(p), `Missing video: ${vid}`);
  }
});

test("design system colors are defined in CSS", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf-8");

  assert.ok(css.includes("--color-ink"), "Missing ink color");
  assert.ok(css.includes("--color-paper"), "Missing paper color");
  assert.ok(css.includes("--color-water"), "Missing water accent");
});

test("all section components exist", () => {
  const components = [
    "Navigation.tsx",
    "Hero.tsx",
    "Collection.tsx",
    "ImageBreak.tsx",
    "Approach.tsx",
    "Contact.tsx",
    "Footer.tsx",
    "useReveal.ts",
  ];

  for (const comp of components) {
    assert.ok(
      fs.existsSync(`src/components/${comp}`),
      `Missing component: ${comp}`
    );
  }
});
