import { readFile, writeFile } from "node:fs/promises";

import { chromium, firefox, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 30000 });
const browser = await (
  process.argv.includes("--firefox") ? firefox : chromium
).launch();
const context = await browser.newContext({
  storageState: ".tmp/production-auth-state.json",
  viewport: { width: 1600, height: 1000 },
});
await context.addInitScript(() => {
  window.__crewcoverTrace = [];
  const original = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await original(...args);
    const url =
      typeof args[0] === "string"
        ? args[0]
        : (args[0]?.url ?? args[0]?.href ?? "");
    if (
      /event-stream|ndjson/.test(response.headers.get("content-type") ?? "")
    ) {
      const copy = response.clone();
      const streamIndex = window.__crewcoverTrace.push("") - 1;
      void (async () => {
        try {
          const reader = copy.body?.getReader();
          if (!reader) return;
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            window.__crewcoverTrace[streamIndex] += decoder.decode(value, {
              stream: true,
            });
          }
        } catch {}
      })();
    }
    return response;
  };
});
const page = await context.newPage();
page.on("pageerror", (e) =>
  console.log("Page error:", e.message.slice(0, 250)),
);
page.on("request", (r) => {
  if (r.method() === "POST" && r.url().includes("agent-chat"))
    console.log("Agent POST:", new URL(r.url()).pathname);
});
page.on("response", (r) => {
  if (r.status() >= 400 && r.url().includes("crewcover"))
    console.log("HTTP", r.status(), new URL(r.url()).pathname);
});
function parseTools(raw) {
  const tools = [];
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    if (value.type === "tool_start" && value.tool) tools.push(value.tool);
    if (value.type === "TOOL_CALL_START" && value.toolCallName)
      tools.push(value.toolCallName);
    for (const v of Object.values(value))
      if (typeof v === "object") Array.isArray(v) ? v.forEach(walk) : walk(v);
  };
  for (const line of raw.split(/\r?\n/)) {
    try {
      walk(JSON.parse(line.replace(/^data:\s*/, "")));
    } catch {}
  }
  return tools;
}
async function readyModel() {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page
        .getByText("Gemini 3.1 Flash-Lite", { exact: true })
        .filter({ visible: true })
        .first()
        .waitFor({ timeout: 15000 });
      return;
    } catch {
      const retry = page.getByRole("button", { name: "Retry", exact: true });
      if (await retry.isVisible()) await retry.click();
    }
  }
  throw new Error(
    "Gemini model selector did not become ready after visible retries.",
  );
}
try {
  await page.goto("https://crewcover-iota.vercel.app/operations");
  await page
    .getByRole("heading", { name: "Gather 2026", exact: true })
    .waitFor({ timeout: 60000 });
  const recheckOnly = process.argv.includes("--recheck-only");
  const resume = process.argv.includes("--resume-proposal") || recheckOnly;
  let tools;
  if (!resume) {
    await page.getByRole("button", { name: "Reset demo", exact: true }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Reset conference", exact: true })
      .click();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    for (const [name, role, percent] of [
      ["Ada Okafor", "Welcome desk", "95%"],
      ["Noah Patel", "Safety & access", "90%"],
      ["Mia Chen", "Stage & technical", "85%"],
    ]) {
      await page
        .getByRole("button", { name: `Cancel ${name} on ${role}`, exact: true })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Cancel assignment", exact: true })
        .click();
      await expect(page.getByTestId("coverage-percentage")).toHaveText(percent);
    }
    await page
      .getByRole("button", { name: "Ask agent", exact: true })
      .first()
      .click();
    const editor = page
      .locator("[contenteditable=true][role=textbox]:visible")
      .first();
    await editor.waitFor({ timeout: 60000 });
    await readyModel();
    await editor.fill(
      "Three volunteers have cancelled. Find qualified replacements without double-booking anyone. Read my current event and generate a repair proposal. Do not approve or apply it.",
    );
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review pending repair", exact: true })
      .waitFor({ timeout: 120000 });
    await expect(page.getByTestId("coverage-percentage")).toHaveText("85%");
    await page.waitForTimeout(1500);
    const raw = await page.evaluate(() => window.__crewcoverTrace.join("\n"));
    await writeFile(".tmp/live-agent-trace.txt", raw, { mode: 0o600 });
    tools = parseTools(raw);
    console.log("Actual model tool starts:", tools);
    if (
      !tools.includes("generate-repair-proposal") ||
      !tools.includes("get-event-coverage")
    )
      throw new Error("Expected real model action calls were not captured.");
    await writeFile(
      ".tmp/agent-proof-phase1.json",
      JSON.stringify(
        {
          at: new Date().toISOString(),
          tools,
          coverageBeforeHumanApproval: 85,
        },
        null,
        2,
      ),
    );
  } else {
    tools = JSON.parse(
      await readFile(".tmp/agent-proof-phase1.json", "utf8"),
    ).tools;
    if (!tools.includes("generate-repair-proposal"))
      throw new Error("No recorded genuine proposal action to resume.");
  }
  if (!recheckOnly) {
    await page
      .getByRole("navigation", { name: "Event views" })
      .getByRole("button", { name: /^Repair Center/ })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "3 qualified replacements",
        exact: true,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: ".impeccable/review/live-agent-proposal.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Review & approve", exact: true })
      .click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Approve & apply repair", exact: true })
      .click();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    await page
      .getByRole("navigation", { name: "Event views" })
      .getByRole("button", { name: "Schedule", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Cancel Leo Mensah on Guest assistance",
        exact: true,
      })
      .click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cancel assignment", exact: true })
      .click();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
    await page
      .getByRole("textbox", { name: "Find volunteer to assign" })
      .fill("Sofia Park");
    const source = page.getByRole("button", {
      name: "Drag Sofia Park to a vacancy",
      exact: true,
    });
    const target = page.getByTestId("shift-s-4");
    await target.scrollIntoViewIfNeeded();
    await source.scrollIntoViewIfNeeded();
    const from = await source.boundingBox();
    if (!from) throw new Error("Drag source unavailable");
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      from.x + from.width / 2 + 12,
      from.y + from.height / 2,
      { steps: 3 },
    );
    await expect(page.locator(".cc-drag-preview")).toBeVisible();
    const to = await target.boundingBox();
    if (!to) throw new Error("Drag target unavailable");
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: 15,
    });
    await expect(target).toHaveClass(/cc-drop-over/);
    await page.screenshot({
      path: ".impeccable/review/enhancements/drag-final-with-agent.png",
      animations: "disabled",
    });
    await expect(target).toHaveClass(/cc-drop-over/);
    await page.mouse.up();
    await expect(page.getByRole("alertdialog").getByRole("heading")).toHaveText(
      "Review manual assignment",
    );
    await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
    await page
      .getByRole("button", { name: "Approve assignment", exact: true })
      .click();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    await writeFile(
      ".tmp/agent-proof-phase2.json",
      JSON.stringify(
        {
          at: new Date().toISOString(),
          coverageAfterApproval: 100,
          manualAssignmentSaved: true,
          manualAssignmentMethod: "drag-to-fill-vacancy",
        },
        null,
        2,
      ),
    );
  } else {
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    const nav = page.getByRole("navigation", { name: "Event views" });
    await nav.getByRole("button", { name: "Activity", exact: true }).click();
    await expect(
      page.getByText("Repair approved. Coverage is 100%.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Sofia Park assigned to Guest assistance.", {
        exact: true,
      }),
    ).toBeVisible();
    await nav.getByRole("button", { name: "Schedule", exact: true }).click();
  }
  if (resume)
    await page
      .getByRole("button", { name: "Ask agent", exact: true })
      .first()
      .click();
  const editor = page
    .locator("[contenteditable=true][role=textbox]:visible")
    .first();
  await editor.waitFor({ timeout: 60000 });
  await readyModel();
  const start = await page.evaluate(
    () => window.__crewcoverTrace.join("\n").length,
  );
  await editor.fill(
    "I manually changed an assignment. Recheck the current persisted coverage with get-event-coverage and report the current schedule revision.",
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.waitForFunction(
    (start) => {
      const raw = window.__crewcoverTrace.join("\n").slice(start);
      let found = false;
      const walk = (value) => {
        if (!value || typeof value !== "object") return;
        if (value.type === "tool_done" && value.tool === "get-event-coverage")
          found = true;
        for (const item of Object.values(value))
          if (typeof item === "object")
            Array.isArray(item) ? item.forEach(walk) : walk(item);
      };
      for (const line of raw.split(/\r?\n/)) {
        try {
          walk(JSON.parse(line.replace(/^data:\s*/, "")));
        } catch {}
      }
      return found;
    },
    start,
    { timeout: 90000 },
  );
  await page.waitForTimeout(3000);
  const full = await page.evaluate(() => window.__crewcoverTrace.join("\n"));
  const recheck = parseTools(full.slice(start));
  console.log("Tool starts after manual change:", recheck);
  if (!recheck.includes("get-event-coverage"))
    throw new Error("No fresh coverage read after manual change.");
  const readbacks = [];
  const inspect = (value) => {
    if (!value || typeof value !== "object") return;
    if (value.coverage?.percentage !== undefined)
      readbacks.push({
        percentage: value.coverage.percentage,
        revision: value.state?.revision ?? value.revision,
      });
    for (const item of Object.values(value)) {
      if (typeof item === "object")
        Array.isArray(item) ? item.forEach(inspect) : inspect(item);
      else if (typeof item === "string" && item.startsWith("{")) {
        try {
          inspect(JSON.parse(item));
        } catch {}
      }
    }
  };
  for (const line of full.slice(start).split(/\r?\n/)) {
    try {
      inspect(JSON.parse(line.replace(/^data:\s*/, "")));
    } catch {}
  }
  const fresh = readbacks.find(
    (value) => value.percentage === 100 && Number.isInteger(value.revision),
  );
  if (!fresh)
    throw new Error(
      "The completed coverage tool did not return persisted 100% coverage and a schedule revision.",
    );
  await writeFile(".tmp/live-agent-trace.txt", full, { mode: 0o600 });
  await writeFile(
    ".tmp/agent-proof.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        url: "https://crewcover-iota.vercel.app",
        tools,
        recheckTools: recheck,
        coverageAfterCancellations: 85,
        coverageBeforeHumanApproval: 85,
        coverageAfterApproval: 100,
        manualAssignmentSaved: true,
        manualAssignmentMethod: "drag-to-fill-vacancy",
        freshAgentRead: fresh,
        resumedVerification: recheckOnly,
      },
      null,
      2,
    ),
  );
  await page.screenshot({
    path: ".impeccable/review/live-agent-recheck.png",
    fullPage: true,
  });
  console.log(
    "Live Gemini → shared actions → human approval → persisted recovery → fresh read after manual change verified.",
  );
} catch (error) {
  console.log("Live agent proof failed:", error.message.slice(0, 600));
  console.log(
    "Visible page tail:",
    (await page.locator("body").innerText()).slice(-4000),
  );
  const raw = await page.evaluate(
    () => window.__crewcoverTrace?.join("\n") ?? "",
  );
  if (raw) await writeFile(".tmp/live-agent-trace.txt", raw, { mode: 0o600 });
  await page.screenshot({
    path: ".impeccable/review/live-agent-error.png",
    fullPage: true,
  });
  process.exitCode = 1;
} finally {
  await browser.close();
}
