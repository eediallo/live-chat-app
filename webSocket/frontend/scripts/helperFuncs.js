export function createAndAppendElToContainer(
  tag,
  className,
  content,
  container
) {
  const element = createDOMElement(tag, content);
  element.classList.add(className);
  container.append(element);
}

export function createDOMElement(tag, content) {
  const element = document.createElement(tag, content);
  element.textContent = content;
  return element;
}
