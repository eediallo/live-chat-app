import { it, describe, expect, vi } from "vitest";
import { createDOMElement } from "../scripts/helperFuncs";

describe("createDOMElement()", () => {
  it("should create a paragraph with content 'Hello, World!'", () => {
    const tag = "p";
    const content = "Hello, World!";
    const paragraph = createDOMElement(tag, content);

    expect(paragraph.tagName.toLowerCase()).toBe(tag);
    expect(paragraph.textContent).toBe(content);
  });

  it("should create a button with content login ", () => {
    const tag = "button";
    const content = "login";
    const paragraph = createDOMElement(tag, content);

    expect(paragraph.tagName.toLowerCase()).toBe("button");
    expect(paragraph.textContent).toBe("login");
  });
});
