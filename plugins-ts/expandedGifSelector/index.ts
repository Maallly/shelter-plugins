const {
  ui: { injectCss },
} = shelter;

const disposers: (() => void)[] = [];

// cfgs
const GIF_BAR_HEIGHT = "90%";
const GIF_DRAWER_TOP = "12rem";
const GIF_DRAWER_OFFSET = "11.5rem";

export function onLoad() {
  disposers.push(
    injectCss(`
      [class*="positionLayer_"]:has([class*="drawerSizingWrapper_"]) {
        height: ${GIF_BAR_HEIGHT} !important;

        [class*="drawerSizingWrapper_"] {
          top: ${GIF_DRAWER_TOP} !important;
          height: calc(100% - ${GIF_DRAWER_OFFSET});
        }
      }
    `),
  );
}

export function onUnload() {
  for (const d of disposers.splice(0)) d();
}
