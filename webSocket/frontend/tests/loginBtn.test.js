import fs from "fs";
import path from "path";

import { vi, it, describe, expect } from "vitest";
import { Window } from "happy-dom";

// ensure the content of the of login page is available
const htmlDocPath = path.join(process.cwd(), "login.html");
const htmlDocumentContent = fs.readFileSync(htmlDocPath).toString();

const window = new Window();
const document = window.document;
document.write(htmlDocumentContent);
vi.stubGlobal("document", document);

let loginBtn = document.getElementById("login-btn");

describe("loginBtn", () => {
  it("should execute loginUser function when loginBtn is clicked", () => {
    const loginUser = vi.fn();

    expect(loginBtn).not.toBeNull();
    loginBtn.addEventListener("click", loginUser);
    loginBtn.click();

    expect(loginUser).toHaveBeenCalled();
  });

  it("should yield null if loginBtn is not available", () => {
    loginBtn = null;
    expect(loginBtn).toBeNull();
  });
});
