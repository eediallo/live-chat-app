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

  it("should create a button with content 'login'", () => {
    const tag = "button";
    const content = "login";
    const button = createDOMElement(tag, content);

    expect(button.tagName.toLowerCase()).toBe(tag);
    expect(button.textContent).toBe(content);
  });

  it("should throw an error is tag or content is not provided", () => {
    const resultFn = () => createDOMElement();
    expect(resultFn).toThrow();
  });
});
