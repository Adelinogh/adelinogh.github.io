/* Meta Pixel for askadelino.com.
   Loads only when the browser does not send a Global Privacy Control signal.
   No personal data is sent: automatic configuration is off and no form data is read. */
(function () {
  'use strict';
  var PIXEL_ID = '1097378813124799';
  var gpc = navigator.globalPrivacyControl === true;

  if (gpc) {
    // Keep fbq calls in site.js harmless when the pixel is not loaded.
    window.fbq = window.fbq || function () {};
    return;
  }

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');

  if (/^\/diagnostic\/?$/.test(window.location.pathname)) {
    window.fbq('track', 'ViewContent', { content_name: 'Run It Right Diagnostic' });
  }
})();
