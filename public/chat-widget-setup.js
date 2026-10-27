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
    ".lc_text-widget--bubble img{animation:cl-logo-spin 1.1s cubic-bezier(.22,1,.36,1) backwards;transition:transform .8s cubic-bezier(.22,1,.36,1)}" +
    // The widget brightens the button to 125% on hover, which reads as a
    // flash. Swap that for a single logo spin. Doubled class beats its rule.
    ".lc_text-widget--bubble.lc_text-widget--bubble:not(.lc_text-widget--horizontal):hover{filter:none}" +
    ".lc_text-widget--bubble:hover img{transform:rotate(360deg)}" +
    // Hide the reseller's "Powered by Ignite Creative" footer line.
    ".lc_text-widget--agency-branding{display:none!important}" +
    // With the footer gone the message box sat flush on the bottom edge.
    // It lives in the nested chat-input component, hence the walk below.
    // Doubled class: the widget's adopted sheets win ties against ours.
    ".input-row.input-row{padding-bottom:12px}" +
    "@media (prefers-reduced-motion:reduce){.lc_text-widget--bubble,.lc_text-widget--bubble img{animation:none;transition:none}.lc_text-widget--bubble:hover img{transform:none}}";

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
