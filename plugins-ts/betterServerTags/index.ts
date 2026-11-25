const {
  observeDom,
  ui: { injectCss },
  util: { log },
} = shelter;

const disposers: (() => void)[] = [];

// cfgs (ported from the css)
const TAG_TIME = "0.5s";
const TAG_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const TAG_HOVER_DELAY = "0.08s";
const TAG_ICON_GAP = "0.6ch";
const TAG_WRAP_GAP = "0.5ch";
const TAG_MAX_WIDTH = "4em";

export function onLoad() {
  disposers.push(
    injectCss(`
      .shelter-mplg-better-server-tags-container {
        background: transparent !important;
        padding: 0;

        .shelter-mplg-better-server-tags-text {
          interpolate-size: allow-keywords;
          display: inline-block;
          line-height: 100%;
          white-space: nowrap;
          overflow: hidden;
          max-width: 0;
          transition: max-width ${TAG_TIME} ${TAG_EASE};
        }

        img[class*="badge_"] {
          margin-right: 0;
          margin-bottom: auto !important;
          transition:
            transform ${TAG_TIME} ${TAG_EASE},
            margin-right ${TAG_TIME} ${TAG_EASE};
        }

        &:hover {
          .shelter-mplg-better-server-tags-text {
            max-width: max-content;
            transition-delay: ${TAG_HOVER_DELAY};
          }

          > span > img[class*="badge_"] {
            transform: rotate(360deg);
            margin-right: ${TAG_ICON_GAP};
            transition-delay: ${TAG_HOVER_DELAY};
          }

          ~ .shelter-mplg-better-server-tags-text {
            display: block;
            clear: both;
            margin-top: ${TAG_WRAP_GAP};
          }
        }
      }

      .shelter-mplg-better-server-tags-trim {
        border: none;
      }

      /* trim server tags*/
      .shelter-mplg-better-server-tags-trim  {
        display: -webkit-inline-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        max-width: ${TAG_MAX_WIDTH};
        overflow: hidden;
        overflow-wrap: anywhere;
      }
      `),

    observeDom(
      '[class*="clanTag_"], [class*="chipletContainerInner_"][class*="guildTagPill_"], [class*="chipletContainerInner_"][class*="clanTagChiplet_"]',
      (el) => {
        if (el.classList.contains("shelter-modified")) return;
        el.classList.add("shelter-modified");
        el.classList.add("shelter-mplg-better-server-tags-container");

        const tagText = el.querySelector("[class*='tagText']");
        if (tagText) {
          tagText.classList.add("shelter-mplg-better-server-tags-text");
          tagText.classList.add(".shelter-mplg-better-server-tags-trim");
        }
      },
    ),
  );
}

export function onUnload() {
  for (const d of disposers.splice(0)) d();
}
