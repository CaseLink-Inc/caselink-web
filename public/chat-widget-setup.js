// Runs before the LeadConnector chat widget loads (app/layout.tsx and
// public/tips.html). Sets our reply sound (public/chat-sound.mp3), plus:
// 1. Start every page load with a fresh chat. The widget keeps the visitor
//    and conversation token in this one localStorage key, so dropping it
//    gives a new chat on refresh. The CRM's lead-source keys are left alone.
// 2. Replace the launcher's sudden pop-in with a soft scale-in while the
//    logo spins into place, and its hover flash with a logo spin. The widget renders in a shadow root, so page CSS
//    can't reach it and the style is injected into that root instead.
(function () {
  try {
    localStorage.removeItem(
      "0ZuDxrSRpERbLT7VphBD_6ae0d9536118072e0e2c589f_lead-connecter-live-widget-message-data"
    );
  } catch (e) {}

  var css =
    "@keyframes cl-bubble-in{from{opacity:0;transform:scale(.6)}}" +
    "@keyframes cl-logo-spin{from{transform:rotate(-360deg)}}" +
    ".lc_text-widget--bubble{animation:cl-bubble-in .5s cubic-bezier(.22,1,.36,1) backwards}" +
    ".lc_text-widget--bubble img{animation:cl-logo-spin 1.1s cubic-bezier(.22,1,.36,1) backwards;transition:transform .8s cubic-bezier(.22,1,.36,1);opacity:1;width:32px;height:32px}" +
    // The widget drops a black shadow on hover and again on focus:
    //   :hover { box-shadow: rgba(0,0,0,.38) 0 4px 12px; filter: brightness(125%) }
    //   :focus { box-shadow: rgba(0,0,0,.2) 0 10px 20px }
    // Both are replaced rather than tweaked. Depth in this system comes
    // from the rim, the sheen and the inner lips, so hovering lifts the
    // sheen and lights the mint return along the bottom instead, and the
    // brightness flash becomes a single logo spin. Doubled class beats
    // the widget's own rules.
    ".lc_text-widget--bubble.lc_text-widget--bubble:not(.lc_text-widget--horizontal):hover," +
    ".lc_text-widget--bubble.lc_text-widget--bubble:focus{" +
    "filter:none;" +
    "background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(255,255,255,.88));" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,1)," +
    "inset 0 -1px 0 rgba(147,227,198,.6)," +
    "inset 0 0 22px rgba(255,255,255,.34);" +
    "transform:scale(1.07)}" +
    // Keyboard focus keeps a visible ring: the system's 2px Blue Deep at
    // 3px offset, which the shadow was standing in for.
    ".lc_text-widget--bubble.lc_text-widget--bubble:focus-visible{" +
    "outline:2px solid #1d5fd8;outline-offset:3px}" +
    ".lc_text-widget--bubble:hover img{transform:rotate(360deg)}" +
    // The launcher is product glass rather than a solid white disc, and
    // carries no drop shadow: in this system depth comes from the rim,
    // the sheen and the inner lips. Doubled class to beat the widget's
    // own rule.
    ".lc_text-widget--bubble.lc_text-widget--bubble{" +
    "background:linear-gradient(180deg,rgba(255,255,255,.88),rgba(255,255,255,.78));" +
    "-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 -1px 0 rgba(116,189,245,.35),inset 0 0 18px rgba(255,255,255,.18);" +
    "filter:none;font-family:var(--cl-font,inherit);" +
    "transition:transform .28s cubic-bezier(.22,.9,.32,1),background .28s ease,box-shadow .28s ease}" +
    // A label beside the launcher, so the bot is recognisable as one
    // instead of an unexplained circle. It is a pseudo-element on the
    // button, which can sit outside it because the button does not clip.
    ".lc_text-widget--bubble::before{" +
    "content:\"Hi, I\u2019m CaseLink AI\\A Questions about referrals?\";white-space:pre;text-align:left;" +
    "position:absolute;right:70px;top:50%;transform:translateY(-50%) scale(.92);" +
    "padding:11px 16px;border-radius:18px;" +
    "font-family:inherit;font-weight:500;font-size:13px;line-height:19px;color:#0b2a66;" +
    "background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.8));" +
    "-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);" +
    "box-shadow:inset 0 0 0 1px rgba(255,255,255,.8),inset 0 1px 0 rgba(255,255,255,.95);" +
    "opacity:0;pointer-events:none;" +
    "animation:cl-label-in .55s cubic-bezier(.22,1,.36,1) 1.15s forwards}" +
    "@keyframes cl-label-in{to{opacity:1;transform:translateY(-50%) scale(1)}}" +
    // Once the chat opens the container holds more than the button, and
    // the label would sit over the pane. Anything that is not the style,
    // the stylesheet link or the button itself means it is open.
    ".lc_text-widget:has(> *:not(style):not(link):not(.lc_text-widget--bubble)) .lc_text-widget--bubble::before" +
    "{opacity:0;visibility:hidden}" +
    // The greeting bubble. It shipped at 16px/24px in a 301px white box
    // carrying rgba(0,0,0,.24) 0 8px 20px, which is both oversized for a
    // one-line hello and the drop shadow the system rules out. Now a
    // smaller glass pane: thin body, rim and inner lips, no shadow.
    // Doubled class so it beats the widget's own adopted sheet.
    ".lc_text-widget--prompt{max-width:256px!important}" +
    ".lc_text-widget_prompt--msg-bubble.lc_text-widget_prompt--msg-bubble{" +
    // The bubble carries its own width and overflowed the container's
    // max-width, so it is pinned to the parent rather than left to size
    // itself.
    // min-width wins over max-width, and the widget sets min-width:301px
    // on this bubble, which is why capping max-width alone did nothing.
    "min-width:0!important;max-width:256px!important;" +
    "width:auto!important;box-sizing:border-box!important;" +
    "padding:11px 13px!important;border-radius:16px!important;" +
    "background:linear-gradient(180deg,rgba(255,255,255,.74),rgba(255,255,255,.6))!important;" +
    "-webkit-backdrop-filter:blur(20px) saturate(1.5);" +
    "backdrop-filter:blur(20px) saturate(1.5);" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.95)," +
    "inset 0 0 0 1px rgba(255,255,255,.6)," +
    "inset 0 -1px 0 rgba(116,189,245,.35)!important}" +
    // Satoshi rather than the widget's Poppins. Font faces are declared
    // on the document, so they resolve inside the shadow root too, and
    // --font-sans inherits through from the page.
    ".lc_text-widget_prompt--prompt-text.lc_text-widget_prompt--prompt-text{" +
    "font:400 13px/18.5px var(--font-sans,inherit)!important;" +
    "color:#10172a!important;max-width:202px!important}" +
    ".lc_text-widget_prompt--prompt-close{transform:scale(.82)}" +
    // Hide the reseller's "Powered by Ignite Creative" footer line.
    ".lc_text-widget--agency-branding{display:none!important}" +
    // With the footer gone the message box sat flush on the bottom edge.
    // It lives in the nested chat-input component, hence the walk below.
    // Doubled class: the widget's adopted sheets win ties against ours.
    ".input-row.input-row{padding-bottom:12px}" +
    "@media (prefers-reduced-motion:reduce){.lc_text-widget--bubble,.lc_text-widget--bubble img{animation:none;transition:none}.lc_text-widget--bubble:hover img{transform:none}.lc_text-widget--bubble:hover,.lc_text-widget--bubble:focus{transform:none}.lc_text-widget--bubble::before{animation:none;opacity:1;transform:translateY(-50%)}}";

  // The widget nests components (chat-pane, chat-input) in shadow roots of
  // their own, created as the chat opens. Style every root as it appears.
  function style(root) {
    if (!root.getElementById("cl-launcher-motion")) {
      var s = document.createElement("style");
      s.id = "cl-launcher-motion";
      s.textContent = css;
      root.appendChild(s);
    }
    function nested() {
      root.querySelectorAll("*").forEach(function (el) {
        if (el.shadowRoot && !el.shadowRoot.getElementById("cl-launcher-motion")) style(el.shadowRoot);
      });
    }
    nested();
    new MutationObserver(nested).observe(root, { childList: true, subtree: true });
  }

  // Wait for the widget element, then for its shadow root (which can be
  // attached a moment after the element is inserted), then stop watching.
  var observer = new MutationObserver(function () {
    var widget = document.querySelector("chat-widget");
    if (!widget) return;
    observer.disconnect();
    // Our own reply sound ("bubble up", generated in-house) instead of the
    // widget's default.
    widget.notificationSoundUrl = location.origin + "/chat-sound.mp3";
    (function poll(tries) {
      if (widget.shadowRoot) style(widget.shadowRoot);
      else if (tries < 300) requestAnimationFrame(function () { poll(tries + 1); });
    })(0);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
