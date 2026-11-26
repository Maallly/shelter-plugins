const {
  observeDom,
  ui: { injectCss },
} = shelter;

const disposers: (() => void)[] = [];

const LEADING = '[data-window-chrome] > [class*="leading_"]';
const CONTAINER = "shelter-navi-backForwardsButtons-container";
const BUTTON = "shelter-navi-backForwardsButtons-button";

const BACK_PATH =
  "M3.3 11.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L6.42 13H20a1 1 0 1 0 0-2H6.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z";
const FORWARD_PATH =
  "M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z";

const nav = (window as any).navigation;

function makeButton(label: string, path: string, go: () => void) {
  const btn = document.createElement("div");
  btn.className = BUTTON;
  btn.role = "button";
  btn.tabIndex = 0;
  btn.ariaLabel = label;
  btn.innerHTML = `<svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="${path}"/></svg>`;
  btn.onclick = go;
  btn.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };
  return btn;
}

function updateDisabled() {
  if (!nav) return;
  for (const c of document.querySelectorAll(`.${CONTAINER}`)) {
    c.children[0]?.setAttribute("aria-disabled", String(!nav.canGoBack));
    c.children[1]?.setAttribute("aria-disabled", String(!nav.canGoForward));
  }
}

function addNavigator(leading: Element) {
  if (leading.querySelector(`.${CONTAINER}`)) return;

  const navigator = document.createElement("div");
  navigator.className = CONTAINER;
  navigator.append(
    makeButton("Go back", BACK_PATH, () => history.back()),
    makeButton("Go forward", FORWARD_PATH, () => history.forward()),
  );

  leading.prepend(navigator);
  updateDisabled();
}

export function onLoad() {
  disposers.push(
    injectCss(`
      .${CONTAINER} {
        --custom-bf-button-radius: var(--custom-app-top-bar-item-radius, 4px);
        --custom-bf-outer-padding: var(--space-6, 6px);
        --custom-bf-inner-padding: 2px;
        align-items: center;
        display: flex;
        flex-direction: row;
        gap: 2px;
        justify-content: center;
        min-width: var(--custom-guild-list-width);
        -webkit-app-region: no-drag;
      }

      .${BUTTON} {
        display: flex;
        padding: var(--custom-bf-inner-padding);
        border-radius: var(--custom-bf-button-radius);
        color: var(--interactive-icon-default, var(--interactive-normal));
        cursor: pointer;
      }

      .${BUTTON}:hover {
        color: var(--interactive-icon-hover, var(--interactive-hover));
        background: var(--background-modifier-hover);
      }

      .${BUTTON}[aria-disabled="true"] {
        opacity: 0.4;
        pointer-events: none;
      }
    `),
    observeDom(LEADING, addNavigator),
  );

  document.querySelectorAll(LEADING).forEach(addNavigator);

  if (nav) {
    nav.addEventListener("currententrychange", updateDisabled);
    disposers.push(() =>
      nav.removeEventListener("currententrychange", updateDisabled),
    );
  }

  disposers.push(() =>
    document.querySelectorAll(`.${CONTAINER}`).forEach((e) => e.remove()),
  );
}

export function onUnload() {
  for (const d of disposers.splice(0)) d();
}
