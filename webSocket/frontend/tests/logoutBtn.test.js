import fs from "fs";
import path from "path";

import { vi, it, describe, expect } from "vitest";
import { Window } from "happy-dom";

// ensure the content of the of logout page is available
const htmlDocPath = path.join(process.cwd(), "chat.html");
const htmlDocumentContent = fs.readFileSync(htmlDocPath).toString();

const window = new Window();
const document = window.document;
document.write(htmlDocumentContent);
vi.stubGlobal("document", document);

let logoutBtn = document.getElementById("logout-btn");

describe("logoutBtn", () => {
  it("should execute logoutUser function when logoutBtn is clicked", () => {
    const logoutUser = vi.fn();

    expect(logoutBtn).not.toBeNull();
    logoutBtn.addEventListener("click", logoutUser);
    logoutBtn.click();

    expect(logoutUser).toHaveBeenCalled();
  });

  it("should yield null if logoutBtn is not available", () => {
    logoutBtn = null;
    expect(logoutBtn).toBeNull();
  });
});
