export function createAndAppendElToContainer(
  tag,
  className,
  content,
  container
) {
  if (!tag || !className || !content || !container) {
    throw new Error("All arguments are required.");
  }
  const element = createDOMElement(tag, content);
  element.classList.add(className);
  container.append(element);
}

export function createDOMElement(tag, content) {
  if (!tag || !content) {
    throw new Error("Both tag and content are required.");
  }
  const element = document.createElement(tag, content);
  element.textContent = content;
  return element;
}
