import { MembersDot, OnlineDot, Voice } from "./svg";

const {
  http: { intercept },
  plugin: { store },
  observeDom,
  flux: { storesFlat },
  ui: { injectCss },
  util: { log },
} = shelter;

const disposers: (() => void)[] = [];

export function onLoad() {
  // these are pulled from the original plugin
  disposers.push(
    injectCss(`
    .shelter-membercount-member-list {
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 1em;
        padding-inline: 1em;
        line-height: 1.2em;
    }

    .shelter-membercount-widget {
        gap: .85em;
        display: flex;
        align-content: center;
        --color-online: var(--green-360);
        --color-total: var(--primary-400);
        --color-voice: var(--primary-400);
    }

    .shelter-membercount-container {
        display: flex;
        align-items: center;
        gap: .5em;
    }

    .shelter-membercount-online-count {
        fill: var(--status-online);
        width: 18px;
        height: 18px;
    }

    .shelter-membercount-total-count  {
       fill: none;
       stroke: var(--icon-status-offline);
       stroke-width: 4px;
       width: 15px;
       height: 15px;
   }

   .shelter-membercount-voice-icon {
       color: var(--color-voice);
       width: 15px;
       height: 15px;
   }

   .shelter-membercount-total {
       color: var(--color-total);
   }

   .shelter-membercount-online {
       color: var(--color-online);
   }

   .shelter-membercount-voice {
       color: var(--color-voice);
   }
    `),
  );

  disposers.push(
    observeDom('[role="list"][data-list-id^="members-"]', (el) => {
      if (el.classList.contains("shelter-membercount-modified")) return;
      el.classList.add("shelter-membercount-modified");

      const widget = document.createElement("div");
      widget.classList.add("shelter-membercount-member-list");
      widget.classList.add("shelter-membercount-widget");

      const currentGuild = storesFlat.SelectedGuildStore?.getGuildId?.();
      // seperator i think
      const seperator = document.createElement("span");
      seperator.style.display = "none";

      // online
      const online =
        storesFlat.GuildMemberCountStore?.getOnlineCount?.(currentGuild) ?? 0;

      const onlineContainer = document.createElement("div");
      onlineContainer.classList.add("shelter-membercount-container");

      const onlineText = document.createElement("span");
      onlineText.textContent = online.toLocaleString();
      onlineText.classList.add("shelter-membercount-online");

      onlineContainer.append(OnlineDot() as Node, onlineText);
      widget.appendChild(onlineContainer);
      widget.appendChild(seperator);

      // members
      const members =
        storesFlat.GuildMemberCountStore?.getMemberCount?.(currentGuild) ?? 0;

      const membersContainer = document.createElement("div");
      membersContainer.classList.add("shelter-membercount-container");

      const membersText = document.createElement("span");
      membersText.textContent = members.toLocaleString();
      membersText.classList.add("shelter-membercount-total");

      membersContainer.append(MembersDot() as Node, membersText);
      widget.appendChild(membersContainer);
      widget.appendChild(seperator);

      // VCs
      const voice = Object.keys(
        storesFlat.VoiceStateStore?.getVoiceStates?.(currentGuild) ?? {},
      ).length;

      const voiceContainer = document.createElement("div");
      voiceContainer.classList.add("shelter-membercount-container");

      const voiceText = document.createElement("span");
      voiceText.textContent = voice.toLocaleString();
      voiceText.classList.add("shelter-membercount-voice");

      voiceContainer.append(Voice() as Node, voiceText);
      widget.appendChild(voiceContainer);
      widget.appendChild(seperator);

      el.prepend(widget);
    }),
  );
}

export function onUnload() {
  for (const d of disposers.splice(0)) d();
  for (const el of document.querySelectorAll(".shelter-membercount-widget"))
    el.remove();
  for (const el of document.querySelectorAll(".shelter-membercount-modified"))
    el.classList.remove("shelter-membercount-modified");
}
