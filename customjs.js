(function () {
  "use strict";

  /* ── CONFIG: hardcoded external URLs (edit here in one place) ── */
  var MO_URLS = {
    /* Logout page -> external account logout */
    logoutRedirect: "https://dev.account.bouwmaat.nl/account/logout?returnTo=https://dev.bouwmaat.nl/account/logout",
    /* Enduser dashboard -> broker login */
    dashboardRedirect: "https://store.xecurify.com/moas/broker/login/shopify/dev.bouwmaat.nl/account?idpname=custom_oauth_Hhc&redirect_endpoint=/usersession",
    /* OTP page (validatenextfactor) Cancel button -> broker login */
    otpCancelRedirect: "https://store.xecurify.com/moas/broker/login/shopify/dev.bouwmaat.nl/account?idpname=custom_oauth_UCC&redirect_endpoint=/usersession",
    /* Forgot-password helper -> customer support page */
    supportPage: "https://dev.bouwmaat.nl/pages/customer-support-page",
    /* Figtree webfont stylesheet */
    fontStylesheet: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap"
  };

  /* White right-arrow as an inline SVG data URI — used as a background-image
     inside the brand submit buttons. <input> buttons can't hold a child <i>
     or use ::after, so the icon lives in the button's background instead. */
  var MO_ARROW_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='4' y1='12' x2='20' y2='12'/%3E%3Cpolyline points='13 5 20 12 13 19'/%3E%3C/svg%3E\")";

  document.querySelectorAll('#login-main-body, #login-header, #login-body')
    .forEach(el => {
      el.style.setProperty('display', 'randomstring', 'important');
    });
  document.querySelectorAll('#login-body')
    .forEach(el => {
      el.style.setProperty('display', 'flex', 'important');
    });
  /* ── PAGE DETECTION HELPERS ── */
  function checkIsLogin() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/moas/login") !== -1 || path.indexOf("/moas/idp/userlogin") !== -1) {
      return true;
    }
    return !!document.getElementById("enduserloginform") || !!document.getElementById("idploginform");
  }

  function checkIsRedirectToIdpLogin() {
    var path = window.location.pathname.toLowerCase();
    return path.indexOf("/moas/redirecttoidplogin") !== -1;
  }

  function checkIsForgot() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("moas/idp/forgotpassword") !== -1 || 
        path.indexOf("moas/idp/resetpassword") !== -1 || 
        path.indexOf("moas/idp/resetuserpassword") !== -1) {
      return true;
    }
    var userform = document.getElementById("userform");
    if (userform) {
      var act = (userform.getAttribute("action") || "").toLowerCase();
      if (act.indexOf("resetuserpassword") !== -1 || act.indexOf("resetpassword") !== -1 || act.indexOf("forgotpassword") !== -1) {
        return true;
      }
    }
    return false;
  }

  function checkIsOtp() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/moas/idp/validatenextfactor") !== -1) {
      return true;
    }
    return !!document.getElementById("otpToken");
  }

  function checkIsChangePass() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("moas/idp/changepassword") !== -1 ||
        path.indexOf("moas/idp/changeuserpassword") !== -1 ||
        path.indexOf("moas/idp/updateuserpassword") !== -1) {
      return true;
    }
    if (document.getElementById("passwordform")) {
      return true;
    }
    var lh = document.querySelector(".login-header");
    if (lh && lh.textContent.toLowerCase().indexOf("change") !== -1) {
      return true;
    }
    return false;
  }

  function checkIsLogout() {
    var path = window.location.pathname.toLowerCase();
    return path.indexOf("/moas/logoutpage") !== -1;
  }

  function checkIsEnduserDashboard() {
    var path = window.location.pathname.toLowerCase();
    return path.indexOf("/moas/enduserwelcome") !== -1;
  }

  function checkIsPasswordSentMessage() {
    var path = window.location.pathname.toLowerCase();
    return path.indexOf("idp/showpasswordsentmessage") !== -1;
  }


  /* ── LOGOUT PAGE: auto-redirect ── */
  function applyLogoutPage() {
    if (!checkIsLogout()) return;
    $('.d-flex.justify-content-center.align-items-center.h-25').addClass('d-none')
    window.location.replace(MO_URLS.logoutRedirect);
  }

  /* ── ENDUSER DASHBOARD PAGE (/moas/enduserwelcome) ── */
  function applyEnduserDashboard() {
    if (!checkIsEnduserDashboard()) return;
    window.location.replace(MO_URLS.dashboardRedirect);
  }

  /* ── PASSWORD SENT MESSAGE PAGE (idp/showpasswordsentmessage) ── */
  function applyPasswordSentMessage() {
    if (!checkIsPasswordSentMessage()) return;

    /* Reuse the shared /login page styling (background, card, font, etc.) */
    injectFontAndCss();

    /* This page only: override the card padding to 20px 28px. An inline
       !important is required to beat the #mo-psm-css `#login-wrapper` rule
       (jQuery's .css() can't set !important). Guarded (only write when it
       differs) so the style mutation doesn't retrigger the observer loop. */
    $('#login-wrapper').each(function () {
      if (this.style.padding !== "20px 28px") {
        this.style.setProperty("padding", "20px 28px", "important");
      }
    });

    /* Full-height centering for the React layout wrapper.
       Only set when not already set — otherwise the style mutation
       retriggers the observer and creates an infinite loop. */
    $('.d-flex.flex-column.align-items-center.justify-content-center').each(function () {
      if (this.style.height !== "100vh") this.style.height = "100vh";
    });

    /* Replace heading text with RESET PASSWORD (localized).
       Guarded so we only write when it differs — avoids the observer loop. */
    var psmTitle = document.querySelector("#login-wrapper h4");
    if (psmTitle && psmTitle.textContent !== tr("psm.title")) {
      psmTitle.textContent = tr("psm.title");
    }

    /* Point "Go back to Login Page" at the broker login (dashboard) URL */
    var goBackLink = document.getElementById("go-back-link");
    if (goBackLink && goBackLink.getAttribute("href") !== MO_URLS.dashboardRedirect) {
      goBackLink.setAttribute("href", MO_URLS.dashboardRedirect);
    }

    /* Page-specific styling (inject once) — makes this page match /login:
       carded wrapper, left-aligned bold heading, clean green message box,
       and styled links. */
    if (!document.getElementById("mo-psm-css")) {
      console.log('on passowrd sent message page');
      var psmCss =
        /* Page background + font */
        "body,#login-body,#root{background:#eef1f7!important;font-family:'Figtree',sans-serif!important;}" +
        "#root>div{background:#eef1f7!important;}" +

        /* Center the card in the viewport */
        "body #login-body,body .container-fluid{min-height:100vh!important;display:flex!important;" +
        "flex-direction:column!important;align-items:center!important;justify-content:center!important;" +
        "box-sizing:border-box!important;padding:40px 16px!important;background:transparent!important;}" +

        /* Card (override the inline white border/bg from the markup) */
        "#login-wrapper{background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "padding:28px 14px!important;max-width:560px!important;width:100%!important;margin:0 auto!important;}" +

        /* Heading -> left-aligned bold, like the LOG IN title */
        "#login-wrapper h4{font-family:'Figtree',sans-serif!important;font-size:26px!important;" +
        "font-weight:800!important;color:#000933!important;text-align:left!important;margin:0 0 20px 0!important;}" +

        /* Hide the separator */
        "#login-wrapper hr{display:none!important;}" +

        /* Green success message box */
        "#login-wrapper .alert-success{background:#e8f5e9!important;border:none!important;" +
        "border-left:4px solid #2e7d32!important;border-radius:4px!important;color:#1b5e20!important;" +
        "padding:14px 16px!important;text-align:left!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;line-height:1.5!important;margin-bottom:0!important;}" +
        "#login-wrapper .alert-success .actionMessage{list-style:none!important;padding:0!important;margin:0!important;}" +
        "#login-wrapper .alert-success .actionMessage li span{font-weight:600!important;}" +

        /* Links row -> left aligned, blue links like #mo-forgot */
        "#login-wrapper .d-flex.justify-content-center{justify-content:flex-start!important;gap:16px!important;margin-top:18px!important;}" +
        "#go-back-link,#try-again-link{font-family:'Figtree',sans-serif!important;font-size:13px!important;" +
        "font-weight:500!important;color:#0A55D7!important;text-decoration:none!important;padding:0!important;}" +
        "#go-back-link:hover,#try-again-link:hover{text-decoration:underline!important;}";

      var psmSt = document.createElement("style");
      psmSt.id = "mo-psm-css"; psmSt.textContent = psmCss;
      document.head.appendChild(psmSt);
    }
    
  }

  /* ── ERROR DETECTION HELPER ── */
  /* Detects the server-rendered error banner (#error-alert-message).
     The wrapper structure stays constant — only the message text changes:
       #error-alert-message > ul.errorMessage > li > span  ("...message...")
     Returns true when a non-empty error message is present. */
  function errorOnPage() {
    var banner = document.getElementById("error-alert-message");
    if (!banner) return false;

    var span = banner.querySelector(".errorMessage li span");
    var message = span ? span.textContent.trim() : "";
    if (!message) return false;

    console.log("THIS PAGE HAS ERROR");
    return true;
  }

  /* ── INJECT FONT AND CSS ── */
  function injectFontAndCss() {

  /* ── FONT ── */
  if (!document.getElementById("mo-font")) {
    var lk = document.createElement("link");
    lk.id = "mo-font"; lk.rel = "stylesheet";
    lk.href = MO_URLS.fontStylesheet;
    document.head.appendChild(lk);
  }

  /* ── CSS ── */
  if (!document.getElementById("mo-css")) {
    var css =
      /* Page bg — keep full viewport height so flex centering works */
      "#login-main-body{" +
      "background:#eef1f7!important;" +
      "font-family:'Figtree',sans-serif!important;" +
      "min-height:100vh!important;" +
      "display:flex!important;" +
      "align-items:center!important;" +
      "justify-content:center!important;" +
      "flex-direction:column!important;" +
      "box-sizing:border-box!important;" +
      "padding:40px 16px!important;" +
      "}" +
      "#login-body > br,#login-main-body > br{display:none!important;}" +

      /* Error messages — uniform 12px */
      ".error-message{font-size:12px!important;color:#E91616!important;}" +
      ".border-danger{border-color:#E91616!important;}" +

      /* Logo — hidden */
      "#login-header{display:none!important;}" +

      /* Card */
      "#login-wrapper{" +
      "background:#fff!important;border:1px solid #e0e7ef!important;" +
      "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
      "padding:28px 14px!important;max-width:560px!important;margin:0 auto!important;" +
      "}" +

      /* Form: stretch children to full width (removes Bootstrap center alignment) */
      "#enduserloginform,#idploginform{align-items:stretch!important;}" +

      /* Inner containers: full width, no extra padding */
      "#enduserloginform .w-75,#enduserloginform .px-4,#idploginform .w-75,#idploginform .px-4{width:100%!important;padding-left:0!important;padding-right:0!important;max-width:100%!important;}" +
      "#enduserloginform .row,#idploginform .row{margin:0!important;}" +

      /* Hide original page elements */
      ".login-header.custom-title,hr,#dynamicUserName,#feedback-msg,#username-error,br.my-2," +
      "#goBack," +
      "a[href*='businessfreetrial'],a[href*='forgotpassword']:not(#mo-forgot),a[href*='resetpassword']:not(#mo-forgot),.col-auto.form-group{display:none!important;}" +

      /* Hide the bottom links block ("Sign in with another account" + forgot).
         There are two .w-75.px-4 wrappers; the FIRST holds the form (its row is
         plain .row) and the SECOND holds only these links (its row is
         .row.justify-content-center). :has() targets just the second so the
         form is never hidden. */
      "#enduserloginform .w-75.px-4:has(.row.justify-content-center),#idploginform .w-75.px-4:has(.row.justify-content-center){display:none!important;}" +

      /* LOG IN heading — top LEFT */
      "#mo-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;font-weight:800;" +
      "color:#000933;margin-bottom:12px;text-align:left;}" +

      /* Labels — left aligned */
      ".mo-lbl{display:block;color:#3c515d;font-size:14px;font-weight:700;padding:0 0 4px;" +
      "font-family:'Figtree',sans-serif;text-align:left;}" +
      ".mo-lbl .mo-req{color:#e02020;margin-left:2px;}" +

      /* Field group spacing */
      ".mo-fg{margin-bottom:14px;width:100%;}" +

      /* Shared input style */
      "#username,#plaintextPassword,.mo-styled-input{" +
      "height:40px!important;border:1px solid #C1CFD7;border-radius:4px!important;" +
      "padding:0 12px!important;font-size:14px!important;font-family:'Figtree',sans-serif!important;" +
      "color:#000933!important;background:#fff!important;width:100%!important;" +
      "box-shadow:none!important;outline:none!important;box-sizing:border-box!important;" +
      "margin-bottom:0!important;display:block!important;" +
      "}" +
      "#username::placeholder,#plaintextPassword::placeholder,.mo-styled-input::placeholder{color:#a0aab6!important;}" +
      "#username:focus,#plaintextPassword:focus,.mo-styled-input:focus{border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;}" +

      /* Password wrapper (eye toggle) */
      ".mo-pw-wrap{position:relative;display:flex;align-items:center;width:100%;}" +
      "#plaintextPassword,.mo-styled-input{padding-right:42px!important;}" +
      ".mo-eye{position:absolute;right:10px;background:none;border:none;cursor:pointer;" +
      "color:#6b7a8d;padding:4px;display:flex;align-items:center;}" +
      ".mo-eye:hover{color:#0A55D7;}" +
      ".mo-eye svg{width:18px;height:18px;pointer-events:none;}" +

      /* Forgot link row — right aligned */
      "#mo-bottom{display:flex;align-items:center;justify-content:flex-end;margin:16px 0 20px;width:100%;}" +
      "#mo-forgot{font-size:13px;font-weight:500;color:#0A55D7;text-decoration:none;font-family:'Figtree',sans-serif;}" +
      "#mo-forgot:hover{text-decoration:underline;}" +

      /* Read-only username display on password step */
      ".mo-user-display{height:40px;border:1px solid #C1CFD7;border-radius:4px;padding:0 12px;" +
      "font-size:14px;color:#6b7a8d;background:#f5f7fa;display:flex;align-items:center;" +
      "font-family:'Figtree',sans-serif;box-sizing:border-box;width:100%;cursor:default;}" +

      /* Login button — left-aligned */
      "#loginbutton{" +
      "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
      "gap:8px!important;min-height:40px!important;padding:8px 20px!important;" +
      "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
      "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
      "font-size:14px!important;font-weight:700!important;letter-spacing:.6px!important;" +
      "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;width:auto!important;" +
      "padding-right:44px!important;background-image:" + MO_ARROW_BG + "!important;" +
      "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;" +
      "}" +
      "#loginbutton:hover{background-color:#0844b0!important;}" +
      /* button row — left align the submit button */
      "#enduserloginform .row div:has(#loginbutton),#idploginform .row div:has(#loginbutton){text-align:left!important;display:block!important;}" +

      /* Mobile */
      "@media(max-width:576px){" +
      "#login-wrapper{padding:24px 18px 20px!important;}" +
      ".mo-lbl,#username,#plaintextPassword{font-size:16px!important;}" +
      "#loginbutton{font-size:12px!important;}" +
      "}" +

      /* Input Error Styling */
      ".mo-input-error { border-color: #ef2f2f!important; }" +
      ".mo-input-error:focus { box-shadow: 0 0 0 3px rgba(239, 47, 47, .12)!important; }" +
      ".mo-error-text { color: #ef2f2f; font-size: 13px; font-weight: 500; margin-top: 6px; text-align: left; display: block; font-family: 'Figtree', sans-serif; }" +
      "[dir='rtl'] .mo-error-text { text-align: right!important; }" +
      ".mo-error-icon { position: absolute; right: 12px; display: flex; align-items: center; pointer-events: none; color: #E91616; }" +
      ".mo-error-icon svg { width: 18px; height: 18px; fill: currentColor; }" +
      ".mo-input-error { padding-right: 40px!important; }" +
      "[dir='rtl'] .mo-error-icon { right: auto!important; left: 12px!important; }" +
      "[dir='rtl'] .mo-input-error { padding-right: 12px!important; padding-left: 40px!important; }" +
      ".mo-pw-wrap .mo-error-icon { right: 36px!important; }" +
      "[dir='rtl'] .mo-pw-wrap .mo-error-icon { right: auto!important; left: 36px!important; }" +
      ".mo-pw-wrap .mo-input-error { padding-right: 64px!important; }" +
      "[dir='rtl'] .mo-pw-wrap .mo-input-error { padding-right: 12px!important; padding-left: 64px!important; }";

    var st = document.createElement("style");
    st.id = "mo-css"; st.textContent = css;
    document.head.appendChild(st);
  }
}

  /* ── HELPERS ── */
  function getForgotHref() {
    var a = document.querySelector("a[href*='forgotpassword'], a[href*='resetpassword']");
    return a ? a.href : "#";
  }

  /* Set a submit button's label. The trailing white right-arrow is supplied
     by CSS (background-image: MO_ARROW_BG) on the button selectors, so the
     look is identical whether the button is an <input> or a <button>.
     Idempotent — safe to call on every observer pass. */
  function setBtnArrowLabel(btn, label) {
    if (!btn) return;
    if (btn.tagName === "INPUT") {
      if (btn.value !== label) { btn.value = label; btn.dataset.mo = "1"; }
    } else {
      if (btn.textContent !== label) { btn.textContent = label; btn.dataset.mo = "1"; }
    }
  }

  function getUrlParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function getLocale() {
    /* Normalize any locale string ("it", "it-IT", "it_IT", " IT ") to the
       2-letter lowercase key used in TRANSLATIONS. Returns "" unless we
       actually ship translations for it, so an unknown value falls through
       to the next signal instead of forcing English via tr()'s fallback. */
    function norm(v) {
      if (!v) return "";
      var code = String(v).trim().toLowerCase().split(/[-_]/)[0];
      return TRANSLATIONS[code] ? code : "";
    }

    /* Priority: signals the SERVER controls beat the client-side dropdown.
         1. ?request_locale — authoritative on the /openidsso entry page.
         2. <html lang>     — set by the server from request_locale and, unlike
            the query param, survives the 302 -> /userlogin redirect.
         3. #languageSelect — only a UI widget; its default may not reflect the
            locale actually applied, so it ranks last among live signals.
         4. localStorage    — final fallback so a resolved locale persists onto
            pages that expose none of the above. */
    var sel = document.getElementById("languageSelect");
    var lang =
      norm(getUrlParam("request_locale")) ||
      norm(document.documentElement.getAttribute("lang")) ||
      norm(sel && sel.value) ||
      norm(localStorage.getItem("mo_locale")) ||
      "nl";   /* default locale when no other signal resolves */

    if (lang) localStorage.setItem("mo_locale", lang);
    return lang;
  }

  /* ── TRANSLATIONS ──
     Keyed by locale code (matches #languageSelect option values + mo_locale).
     tr(key) resolves against the current mo_locale, falling back to English,
     then to the raw key if nothing is found. Structural glyphs (→, *) are
     appended in code, never stored here. */
  var TRANSLATIONS = {
    en: {
      "login.page.title": "LOG IN",
      "login.page.button": "LOG IN",
      "email.field.placeholder": "email",
      "email.field.label": "Email address",
      "password.field.label": "Password",
      "password.field.placeholder": "Password",
      "forgot.password.link": "Forgot Password",
      "reset.password": "RESET PASSWORD",
      "reset.password.subtext": "We will send you an email with instructions on how to recover it",
      "forgot.page.helper": "Not receiving an email to reset your password? Then the e-mail address used is not known to us. Can’t figure it out?",
      "forgot.page.helper.link": "Contact customer service",
      "next.button": "NEXT",
      "otp.page.title": "VERIFY YOUR IDENTITY",
      "otp.field.label": "Enter OTP here",
      "otp.field.placeholder": "OTP number",
      "otp.verify.button": "Verify",
      "otp.cancel.button": "Cancel",
      "otp.alert": "The OTP has been sent to {Email}. Please enter the OTP you received to Validate.",
      "otp.resend.link": "Did not receive OTP? Click here to Resend OTP",
      "otp.error.invalid": "Invalid OTP provided. Please try again. You have {X} more attempt(s) left.",
      "changepw.title": "RESET PASSWORD",
      "changepw.newpassword.label": "New password",
      "changepw.confirmpassword.label": "Confirm password",
      "changepw.req.length": "{min}-{max} characters",
      "changepw.req.uppercase": "1 uppercase character should be present",
      "changepw.req.number": "1 number character should be present",
      "changepw.req.symbol": "At least one of the following symbols ( {symbols} ) should be present",
      "changepw.req.consecutive": "Does not contain more than {n} consecutive characters of {fields}",
      "changepw.field.firstname": "first name",
      "changepw.field.lastname": "last name",
      "changepw.field.username": "username",
      "changepw.field.email": "email",
      "changepw.strength.label": "Password strength",
      "changepw.strength.weak": "Poor",
      "changepw.strength.fair": "Fair",
      "changepw.strength.good": "Good",
      "changepw.strength.strong": "Strong",
      "changepw.error.required": "New password is required.",
      "changepw.error.requirements": "Please satisfy all password requirements.",
      "changepw.error.mismatch": "The password don't match. Please try again",
      "psm.title": "Reset Password",
      "psm.alert": "You will receive a password reset email shortly if the \"EMAIL\" is associated with an account.",
      "goback.login": "Go back to Login Page",
      "changepw.success.title": "Password Successfully Changed",
      "changepw.success.text": "Your password has been successfully changed",
      "login.error.invalid": "Invalid username or password. You have {X} more attempt(s) left."
    },
    de: {
      "login.page.title": "ANMELDEN",
      "login.page.button": "ANMELDEN",
      "email.field.placeholder": "E-Mail",
      "email.field.label": "E-Mail-Adresse",
      "password.field.label": "Passwort",
      "password.field.placeholder": "Passwort",
      "forgot.password.link": "Passwort vergessen",
      "reset.password": "PASSWORT ZURÜCKSETZEN",
      "reset.password.subtext": "Wir senden Ihnen eine E-Mail mit Anweisungen zur Wiederherstellung",
      "forgot.page.helper": "Sie erhalten keine E-Mail zum Zurücksetzen Ihres Passworts? Dann ist die verwendete E-Mail-Adresse uns nicht bekannt. Kommen Sie nicht weiter?",
      "forgot.page.helper.link": "Kundenservice kontaktieren",
      "next.button": "WEITER",
      "otp.page.title": "IDENTITÄT BESTÄTIGEN",
      "otp.field.label": "OTP hier eingeben",
      "otp.field.placeholder": "OTP-Nummer",
      "otp.verify.button": "BESTÄTIGEN",
      "otp.cancel.button": "ABBRECHEN",
      "otp.alert": "Der OTP wurde an {Email} gesendet. Bitte geben Sie den erhaltenen OTP zur Bestätigung ein.",
      "otp.resend.link": "Keinen OTP erhalten? Klicken Sie hier, um den OTP erneut zu senden",
      "otp.error.invalid": "Ungültiger OTP eingegeben. Bitte versuchen Sie es erneut. Sie haben noch {X} Versuch(e) übrig.",
      "changepw.title": "PASSWORT ZURÜCKSETZEN",
      "changepw.newpassword.label": "Neues Passwort",
      "changepw.confirmpassword.label": "Passwort bestätigen",
      "changepw.req.length": "{min}-{max} Zeichen",
      "changepw.req.uppercase": "Es muss mindestens ein Großbuchstabe vorhanden sein",
      "changepw.req.number": "Es muss mindestens eine Ziffer vorhanden sein",
      "changepw.req.symbol": "Mindestens eines der folgenden Sonderzeichen ( {symbols} ) muss vorhanden sein",
      "changepw.req.consecutive": "Enthält nicht mehr als {n} aufeinanderfolgende Zeichen von {fields}",
      "changepw.field.firstname": "Vorname",
      "changepw.field.lastname": "Nachname",
      "changepw.field.username": "Benutzername",
      "changepw.field.email": "E-Mail",
      "changepw.strength.label": "Passwortstärke",
      "changepw.strength.weak": "Mangelhaft",
      "changepw.strength.fair": "Mäßig",
      "changepw.strength.good": "Gut",
      "changepw.strength.strong": "Stark",
      "changepw.error.required": "Neues Passwort ist erforderlich.",
      "changepw.error.requirements": "Bitte erfüllen Sie alle Passwortanforderungen.",
      "changepw.error.mismatch": "Die Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut.",
      "psm.title": "Passwort zurücksetzen",
      "psm.alert": "Sie erhalten in Kürze eine E-Mail zum Zurücksetzen des Passworts, wenn die \"EMAIL\" mit einem Konto verknüpft ist.",
      "goback.login": "Zurück zur Anmeldeseite",
      "changepw.success.title": "Passwort erfolgreich geändert",
      "changepw.success.text": "Ihr Passwort wurde erfolgreich geändert",
      "login.error.invalid": "Ungültiger Benutzername oder ungültiges Passwort. Sie haben noch {X} Versuch(e) übrig."
    },
    it: {
      "login.page.title": "ACCEDI",
      "login.page.button": "ACCEDI",
      "email.field.placeholder": "Email",
      "email.field.label": "Indirizzo email",
      "password.field.label": "Password",
      "password.field.placeholder": "Password",
      "forgot.password.link": "Password dimenticata",
      "reset.password": "REIMPOSTA PASSWORD",
      "reset.password.subtext": "Ti invieremo un'email con le istruzioni su come recuperarla",
      "forgot.page.helper": "Non ricevi l'email per reimpostare la password? Allora l'indirizzo email utilizzato non è registrato. Non riesci a capire?",
      "forgot.page.helper.link": "Contatta il servizio clienti",
      "next.button": "AVANTI",
      "otp.page.title": "VERIFICA LA TUA IDENTITÀ",
      "otp.field.label": "Inserisci qui l'OTP",
      "otp.field.placeholder": "Numero OTP",
      "otp.verify.button": "VERIFICA",
      "otp.cancel.button": "ANNULLA",
      "otp.alert": "Il codice OTP è stato inviato a {Email}. Inserisci il codice OTP ricevuto per confermare.",
      "otp.resend.link": "Non hai ricevuto l'OTP? Clicca qui per inviarlo di nuovo",
      "otp.error.invalid": "OTP non valido. Riprova. Hai ancora {X} tentativo/i.",
      "changepw.title": "REIMPOSTA PASSWORD",
      "changepw.newpassword.label": "Nuova password",
      "changepw.confirmpassword.label": "Conferma password",
      "changepw.req.length": "{min}-{max} caratteri",
      "changepw.req.uppercase": "Deve essere presente almeno una lettera maiuscola",
      "changepw.req.number": "Deve essere presente almeno un numero",
      "changepw.req.symbol": "Deve essere presente almeno uno dei seguenti simboli ( {symbols} )",
      "changepw.req.consecutive": "Non contiene più di {n} caratteri consecutivi di {fields}",
      "changepw.field.firstname": "nome",
      "changepw.field.lastname": "cognome",
      "changepw.field.username": "nome utente",
      "changepw.field.email": "email",
      "changepw.strength.label": "Sicurezza della password",
      "changepw.strength.weak": "Scarsa",
      "changepw.strength.fair": "Discreta",
      "changepw.strength.good": "Buona",
      "changepw.strength.strong": "Forte",
      "changepw.error.required": "La nuova password è obbligatoria.",
      "changepw.error.requirements": "Soddisfa tutti i requisiti della password.",
      "changepw.error.mismatch": "Le password non corrispondono. Riprova.",
      "psm.title": "Reimposta password",
      "psm.alert": "Riceverai a breve un'email per reimpostare la password se \"EMAIL\" è associata a un account.",
      "goback.login": "Torna alla pagina di accesso",
      "changepw.success.title": "Password modificata con successo",
      "changepw.success.text": "La tua password è stata modificata con successo",
      "login.error.invalid": "Nome utente o password non validi. Hai ancora {X} tentativo/i."
    },
    ar: {
      "login.page.title": "تسجيل الدخول",
      "login.page.button": "تسجيل الدخول",
      "email.field.placeholder": "البريد الإلكتروني",
      "email.field.label": "عنوان البريد الإلكتروني",
      "password.field.label": "كلمة المرور",
      "password.field.placeholder": "كلمة المرور",
      "forgot.password.link": "نسيت كلمة المرور",
      "reset.password": "إعادة تعيين كلمة المرور",
      "reset.password.subtext": "سنرسل لك بريدًا إلكترونيًا يحتوي على تعليمات حول كيفية استعادتها",
      "forgot.page.helper": "ألا تتلقى بريدًا إلكترونيًا لإعادة تعيين كلمة المرور؟ إذًا عنوان البريد الإلكتروني المستخدم غير معروف لدينا. لا يمكنك معرفة ذلك؟",
      "forgot.page.helper.link": "اتصل بخدمة العملاء",
      "next.button": "التالي",
      "otp.page.title": "تحقق من هويتك",
      "otp.field.label": "أدخل رمز OTP هنا",
      "otp.field.placeholder": "رقم OTP",
      "otp.verify.button": "تحقق",
      "otp.cancel.button": "إلغاء",
      "otp.alert": "تم إرسال رمز OTP إلى {Email}. يرجى إدخال الرمز الذي تلقيته للتحقق.",
      "otp.resend.link": "لم تتلقَّ رمز OTP؟ انقر هنا لإعادة إرساله",
      "otp.error.invalid": "رمز OTP غير صالح. يرجى المحاولة مرة أخرى. لديك {X} محاولة/محاولات متبقية.",
      "changepw.title": "إعادة تعيين كلمة المرور",
      "changepw.newpassword.label": "كلمة المرور الجديدة",
      "changepw.confirmpassword.label": "تأكيد كلمة المرور",
      "changepw.req.length": "{min}-{max} حرفًا",
      "changepw.req.uppercase": "يجب أن يحتوي على حرف كبير واحد على الأقل",
      "changepw.req.number": "يجب أن يحتوي على رقم واحد على الأقل",
      "changepw.req.symbol": "يجب أن يحتوي على واحد على الأقل من الرموز التالية ( {symbols} )",
      "changepw.req.consecutive": "لا يحتوي على أكثر من {n} أحرف متتالية من {fields}",
      "changepw.field.firstname": "الاسم الأول",
      "changepw.field.lastname": "اسم العائلة",
      "changepw.field.username": "اسم المستخدم",
      "changepw.field.email": "البريد الإلكتروني",
      "changepw.strength.label": "قوة كلمة المرور",
      "changepw.strength.weak": "رديئة",
      "changepw.strength.fair": "متوسطة",
      "changepw.strength.good": "جيدة",
      "changepw.strength.strong": "قوية",
      "changepw.error.required": "كلمة المرور الجديدة مطلوبة.",
      "changepw.error.requirements": "يرجى استيفاء جميع متطلبات كلمة المرور.",
      "changepw.error.mismatch": "كلمتا المرور غير متطابقتين. يرجى المحاولة مرة أخرى.",
      "psm.title": "إعادة تعيين كلمة المرور",
      "psm.alert": "ستتلقى قريبًا بريدًا إلكترونيًا لإعادة تعيين كلمة المرور إذا كان \"EMAIL\" مرتبطًا بحساب.",
      "goback.login": "العودة إلى صفحة تسجيل الدخول",
      "changepw.success.title": "تم تغيير كلمة المرور بنجاح",
      "changepw.success.text": "تم تغيير كلمة المرور الخاصة بك بنجاح",
      "login.error.invalid": "اسم المستخدم أو كلمة المرور غير صالحة. لديك {X} محاولة/محاولات متبقية."
    },
    pt: {
      "login.page.title": "ENTRAR",
      "login.page.button": "ENTRAR",
      "email.field.placeholder": "E-mail",
      "email.field.label": "Endereço de e-mail",
      "password.field.label": "Senha",
      "password.field.placeholder": "Senha",
      "forgot.password.link": "Esqueceu a senha",
      "reset.password": "REDEFINIR SENHA",
      "reset.password.subtext": "Enviaremos um e-mail com instruções sobre como recuperá-la",
      "forgot.page.helper": "Não está recebendo um e-mail para redefinir sua senha? Então o endereço de e-mail usado não é conhecido por nós. Não consegue descobrir?",
      "forgot.page.helper.link": "Entre em contato com o atendimento ao cliente",
      "next.button": "PRÓXIMO",
      "otp.page.title": "VERIFIQUE SUA IDENTIDADE",
      "otp.field.label": "Digite o OTP aqui",
      "otp.field.placeholder": "Número OTP",
      "otp.verify.button": "VERIFICAR",
      "otp.cancel.button": "CANCELAR",
      "otp.alert": "O código OTP foi enviado para {Email}. Insira o código OTP recebido para validar.",
      "otp.resend.link": "Não recebeu o OTP? Clique aqui para reenviar o OTP",
      "otp.error.invalid": "OTP inválido. Tente novamente. Você tem mais {X} tentativa(s).",
      "changepw.title": "REDEFINIR SENHA",
      "changepw.newpassword.label": "Nova senha",
      "changepw.confirmpassword.label": "Confirmar senha",
      "changepw.req.length": "{min}-{max} caracteres",
      "changepw.req.uppercase": "Deve conter pelo menos uma letra maiúscula",
      "changepw.req.number": "Deve conter pelo menos um número",
      "changepw.req.symbol": "Deve conter pelo menos um dos seguintes símbolos ( {symbols} )",
      "changepw.req.consecutive": "Não contém mais de {n} caracteres consecutivos de {fields}",
      "changepw.field.firstname": "nome",
      "changepw.field.lastname": "sobrenome",
      "changepw.field.username": "nome de usuário",
      "changepw.field.email": "e-mail",
      "changepw.strength.label": "Força da senha",
      "changepw.strength.weak": "Ruim",
      "changepw.strength.fair": "Razoável",
      "changepw.strength.good": "Boa",
      "changepw.strength.strong": "Forte",
      "changepw.error.required": "A nova senha é obrigatória.",
      "changepw.error.requirements": "Atenda a todos os requisitos da senha.",
      "changepw.error.mismatch": "As senhas não coincidem. Tente novamente.",
      "psm.title": "Redefinir senha",
      "psm.alert": "Você receberá em breve um e-mail de redefinição de senha se \"EMAIL\" estiver associado a uma conta.",
      "goback.login": "Voltar para a página de login",
      "changepw.success.title": "Senha alterada com sucesso",
      "changepw.success.text": "Sua senha foi alterada com sucesso",
      "login.error.invalid": "Nome de usuário ou senha inválidos. Você tem mais {X} tentativa(s)."
    },
    es: {
      "login.page.title": "INICIAR SESIÓN",
      "login.page.button": "INICIAR SESIÓN",
      "email.field.placeholder": "correo electrónico",
      "email.field.label": "Correo electrónico",
      "password.field.label": "Contraseña",
      "password.field.placeholder": "Contraseña",
      "forgot.password.link": "¿Olvidó su contraseña?",
      "reset.password": "RESTABLECER CONTRASEÑA",
      "reset.password.subtext": "Le enviaremos un correo electrónico con instrucciones sobre cómo recuperarla",
      "forgot.page.helper": "¿No recibe un correo electrónico para restablecer su contraseña? Entonces la dirección de correo electrónico utilizada no es conocida por nosotros. ¿No lo puede averiguar?",
      "forgot.page.helper.link": "Contactar con atención al cliente",
      "next.button": "SIGUIENTE",
      "otp.page.title": "VERIFIQUE SU IDENTIDAD",
      "otp.field.label": "Ingrese el OTP aquí",
      "otp.field.placeholder": "Número OTP",
      "otp.verify.button": "VERIFICAR",
      "otp.cancel.button": "CANCELAR",
      "otp.alert": "El código OTP se ha enviado a {Email}. Introduzca el código OTP recibido para validar.",
      "otp.resend.link": "¿No recibió el OTP? Haga clic aquí para reenviarlo",
      "otp.error.invalid": "OTP no válido. Inténtelo de nuevo. Le queda(n) {X} intento(s).",
      "changepw.title": "RESTABLECER CONTRASEÑA",
      "changepw.newpassword.label": "Nueva contraseña",
      "changepw.confirmpassword.label": "Confirmar contraseña",
      "changepw.req.length": "{min}-{max} caracteres",
      "changepw.req.uppercase": "Debe contener al menos una letra mayúscula",
      "changepw.req.number": "Debe contener al menos un número",
      "changepw.req.symbol": "Debe contener al menos uno de los siguientes símbolos ( {symbols} )",
      "changepw.req.consecutive": "No contiene más de {n} caracteres consecutivos de {fields}",
      "changepw.field.firstname": "nombre",
      "changepw.field.lastname": "apellido",
      "changepw.field.username": "nombre de usuario",
      "changepw.field.email": "correo electrónico",
      "changepw.strength.label": "Seguridad de la contraseña",
      "changepw.strength.weak": "Pobre",
      "changepw.strength.fair": "Aceptable",
      "changepw.strength.good": "Buena",
      "changepw.strength.strong": "Fuerte",
      "changepw.error.required": "La nueva contraseña es obligatoria.",
      "changepw.error.requirements": "Cumpla con todos los requisitos de la contraseña.",
      "changepw.error.mismatch": "Las contraseñas no coinciden. Inténtelo de nuevo.",
      "psm.title": "Restablecer contraseña",
      "psm.alert": "Recibirá en breve un correo electrónico para restablecer la contraseña si \"EMAIL\" está asociado a una cuenta.",
      "goback.login": "Volver a la página de inicio de sesión",
      "changepw.success.title": "Contraseña cambiada correctamente",
      "changepw.success.text": "Su contraseña se ha cambiado correctamente",
      "login.error.invalid": "Nombre de usuario o contraseña no válidos. Le queda(n) {X} intento(s)."
    },
    fr: {
      "login.page.title": "CONNEXION",
      "login.page.button": "CONNEXION",
      "email.field.placeholder": "E-mail",
      "email.field.label": "Adresse e-mail",
      "password.field.label": "Mot de passe",
      "password.field.placeholder": "Mot de passe",
      "forgot.password.link": "Mot de passe oublié",
      "reset.password": "RÉINITIALISER LE MOT DE PASSE",
      "reset.password.subtext": "Nous vous enverrons un e-mail contenant des instructions pour le récupérer",
      "forgot.page.helper": "Vous ne recevez pas d'e-mail pour réinitialiser votre mot de passe ? Alors l'adresse e-mail utilisée ne nous est pas connue. Vous ne trouvez pas ?",
      "forgot.page.helper.link": "Contacter le service client",
      "next.button": "SUIVANT",
      "otp.page.title": "VÉRIFIEZ VOTRE IDENTITÉ",
      "otp.field.label": "Saisissez l'OTP ici",
      "otp.field.placeholder": "Numéro OTP",
      "otp.verify.button": "VÉRIFIER",
      "otp.cancel.button": "ANNULER",
      "otp.alert": "Le code OTP a été envoyé à {Email}. Veuillez saisir le code OTP reçu pour valider.",
      "otp.resend.link": "Vous n'avez pas reçu l'OTP ? Cliquez ici pour le renvoyer",
      "otp.error.invalid": "OTP invalide. Veuillez réessayer. Il vous reste {X} tentative(s).",
      "changepw.title": "RÉINITIALISER LE MOT DE PASSE",
      "changepw.newpassword.label": "Nouveau mot de passe",
      "changepw.confirmpassword.label": "Confirmer le mot de passe",
      "changepw.req.length": "{min}-{max} caractères",
      "changepw.req.uppercase": "Au moins une lettre majuscule doit être présente",
      "changepw.req.number": "Au moins un chiffre doit être présent",
      "changepw.req.symbol": "Au moins un des symboles suivants ( {symbols} ) doit être présent",
      "changepw.req.consecutive": "Ne contient pas plus de {n} caractères consécutifs de {fields}",
      "changepw.field.firstname": "prénom",
      "changepw.field.lastname": "nom de famille",
      "changepw.field.username": "nom d'utilisateur",
      "changepw.field.email": "e-mail",
      "changepw.strength.label": "Force du mot de passe",
      "changepw.strength.weak": "Médiocre",
      "changepw.strength.fair": "Moyen",
      "changepw.strength.good": "Bon",
      "changepw.strength.strong": "Fort",
      "changepw.error.required": "Le nouveau mot de passe est requis.",
      "changepw.error.requirements": "Veuillez satisfaire à toutes les exigences du mot de passe.",
      "changepw.error.mismatch": "Les mots de passe ne correspondent pas. Veuillez réessayer.",
      "psm.title": "Réinitialiser le mot de passe",
      "psm.alert": "Vous recevrez sous peu un e-mail de réinitialisation du mot de passe si \"EMAIL\" est associé à un compte.",
      "goback.login": "Retour à la page de connexion",
      "changepw.success.title": "Mot de passe modifié avec succès",
      "changepw.success.text": "Votre mot de passe a été modifié avec succès",
      "login.error.invalid": "Nom d'utilisateur ou mot de passe invalide. Il vous reste {X} tentative(s)."
    },
    nl: {
      "login.page.title": "INLOGGEN",
      "login.page.button": "INLOGGEN",
      "email.field.placeholder": "E-mail",
      "email.field.label": "E-mailadres",
      "password.field.label": "Wachtwoord",
      "password.field.placeholder": "Wachtwoord",
      "forgot.password.link": "Wachtwoord vergeten?",
      "reset.password": "WACHTWOORD WIJZIGEN",
      "reset.password.subtext": "We sturen je een e-mail met instructies om je wachtwoord opnieuw in te stellen.",
      "forgot.page.helper": "Geen e-mail ontvangen? Controleer of het juiste e-mailadres is ingevoerd, of het opgegeven e-mailadres is niet bij ons bekend.",
      "forgot.page.helper.link": "Neem contact op met onze klantenservice.",
      "next.button": "VOLGENDE",
      "otp.page.title": "BEVESTIG DAT JIJ HET BENT",
      "otp.field.label": "Vul eenmalige login code in",
      "otp.field.placeholder": "Eenmalige code",
      "otp.verify.button": "BEVESTIG",
      "otp.cancel.button": "ANNULEER",
      "otp.alert": "De eenmalige code is verzonden naar {Email}. Vul de code in om verder te gaan.",
      "otp.resend.link": "Geen eenmalige code ontvangen? Vraag een nieuwe code aan.",
      "otp.error.invalid": "Ongeldige eenmalige code. Je mag het nog {X} keer proberen.",
      "changepw.title": "NIEUW WACHTWOORD INSTELLEN",
      "changepw.newpassword.label": "Vul een nieuw wachtwoord in",
      "changepw.confirmpassword.label": "Bevestig wachtwoord",
      "changepw.req.length": "{min}-{max} karakters",
      "changepw.req.uppercase": "Minimaal één hoofdletter",
      "changepw.req.number": "Minimaal één cijfer",
      "changepw.req.symbol": "Minimaal één speciaal karakter ( {symbols} )",
      "changepw.req.consecutive": "Bevat niet meer dan {n} opeenvolgende tekens van {fields}",
      "changepw.field.firstname": "voornaam",
      "changepw.field.lastname": "achternaam",
      "changepw.field.username": "gebruikersnaam",
      "changepw.field.email": "e-mailadres",
      "changepw.strength.label": "Wachtwoordsterkte",
      "changepw.strength.weak": "Slecht",
      "changepw.strength.fair": "Redelijk",
      "changepw.strength.good": "Goed",
      "changepw.strength.strong": "Sterk",
      "changepw.error.required": "Nieuw wachtwoord is vereist.",
      "changepw.error.requirements": "Voldoe aan alle wachtwoordvereisten.",
      "changepw.error.mismatch": "De wachtwoorden komen niet overeen. Probeer het opnieuw.",
      "psm.title": "NIEUW WACHTWOORD INSTELLEN",
      "psm.alert": "Als 'EMAIL' is gekoppeld aan een account, ontvang je een e-mail om je wachtwoord opnieuw in te stellen.",
      "goback.login": "Terug naar inloggen",
      "changepw.success.title": "Wachtwoord gewijzigd",
      "changepw.success.text": "Je wachtwoord is gewijzigd",
      "login.error.invalid": "De combinatie van e-mailadres en wachtwoord is niet geldig. Je mag het nog {X} keer proberen."
    }
  };

  function tr(key) {
    /* Default to 'nl' so any tr() call before getLocale() resolves (or on a
       page exposing no locale signal) renders Dutch rather than English. */
    var locale = localStorage.getItem("mo_locale") || "nl";
    var dict = TRANSLATIONS[locale] || TRANSLATIONS.nl || TRANSLATIONS.en;
    if (dict && dict[key] != null) return dict[key];
    if (TRANSLATIONS.nl && TRANSLATIONS.nl[key] != null) return TRANSLATIONS.nl[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] != null) return TRANSLATIONS.en[key];
    return key;
  }

  /* Re-sync every locale-dependent text node on the login page on EVERY tick.
     The custom nodes are inserted once (guarded by id), but their text must be
     refreshed later: on a cold load the /openidsso 302 means our JS never ran
     to capture ?request_locale, so <html lang> is the only locale carrier and
     miniOrange can set it AFTER our first ticks — labels first render in English
     and must correct to the resolved locale once it settles. Compare before
     writing so a matched value doesn't retrigger the MutationObserver. */
  function syncLoginText() {
    function setText(el, val) { if (el && el.textContent !== val) el.textContent = val; }
    function setHtml(el, val) { if (el && el.innerHTML !== val) el.innerHTML = val; }
    function setPh(el, val) { if (el && el.getAttribute("placeholder") !== val) el.setAttribute("placeholder", val); }

    setText(document.getElementById("mo-title"), tr("login.page.title"));
    setHtml(document.getElementById("mo-email-lbl"), tr("email.field.label") + ' <span class="mo-req">*</span>');
    setHtml(document.getElementById("mo-pw-lbl"), tr("password.field.label") + ' <span class="mo-req">*</span>');
    setText(document.getElementById("mo-user-display-lbl"), tr("email.field.label"));
    setText(document.getElementById("mo-forgot"), tr("forgot.password.link"));
    setPh(document.getElementById("username"), tr("email.field.placeholder"));
    setPh(document.getElementById("plaintextPassword"), tr("password.field.placeholder"));
  }

  /* ── STEP 1: Email page UI ── */
  function applyEmailStep() {
    var wrapper = document.getElementById("login-wrapper");
    if (!wrapper) return;

    syncLoginText();

    /* LOG IN title — insert once before any form child */
    if (!document.getElementById("mo-title")) {
      var t = document.createElement("span");
      t.id = "mo-title"; t.className = "px-2 mx-1"; t.textContent = tr("login.page.title");
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    /* Email label above the username input */
    var userDiv = document.getElementById("userName");
    if (userDiv && !document.getElementById("mo-email-lbl")) {
      var fg = document.createElement("div"); fg.className = "mo-fg";
      var lbl = document.createElement("label");
      lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
      lbl.setAttribute("for", "username");
      lbl.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
      fg.appendChild(lbl);
      userDiv.parentNode.insertBefore(fg, userDiv);
      fg.appendChild(userDiv);
      var inp = document.getElementById("username");
      if (inp) inp.setAttribute("placeholder", tr("email.field.placeholder"));
    }

 

    /* Button label */
    var btn = document.getElementById("loginbutton");
    setBtnArrowLabel(btn, tr("login.page.button"));

    /* Server-rendered error banner -> show below the email field.
       Guarded by #mo-userlogin-error so it runs ONCE (avoids the
       observer infinite-loop from repeated DOM mutations). */
    var isPageHasError = errorOnPage();
    var unameEl = document.getElementById("username");
    if (isPageHasError && !document.getElementById("mo-userlogin-error") && !(unameEl && unameEl.dataset.moUserErrDismissed)) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      $('#userName').after(
        '<div id="mo-userlogin-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>'
      );
      /* Red border + cross icon on the username field */
      $('#username').addClass('border border-danger mo-input-error');
      var userNameWrap = document.getElementById("userName");
      if (userNameWrap && !userNameWrap.querySelector(".mo-error-icon")) {
        userNameWrap.style.position = "relative";
        userNameWrap.style.display = "flex";
        userNameWrap.style.alignItems = "center";
        var ulIcon = document.createElement("span");
        ulIcon.id = "mo-userlogin-icon";
        ulIcon.className = "mo-error-icon";
        ulIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        userNameWrap.appendChild(ulIcon);
      }
      /* Clear the error indicators once the user edits the email again */
      if (unameEl && !unameEl.dataset.moEmailClear) {
        unameEl.dataset.moEmailClear = "true";
        unameEl.addEventListener("input", function () {
          this.dataset.moUserErrDismissed = "true";
          $('#mo-userlogin-error').remove();
          $('#mo-userlogin-icon').remove();
          $('#username').removeClass('border border-danger mo-input-error');
        });
      }
      $('#error-alert-message').hide();
    }

    /* Hide hr and br */
    wrapper.querySelectorAll("hr,br").forEach(function (el) {
      el.style.display = "none";
    });
  }

  /* ── STEP 2: Password page UI ── */
  function applyPasswordStep() {
    var pwField = document.getElementById("plaintextPassword");
    if (!pwField) return;                          // not the password step yet
    if (pwField.style.display === "none" || pwField.classList.contains("d-none")) return;

    syncLoginText();

    /* Force-hide elements that jQuery's showAdminPassword() re-shows */
    var dynUser = document.getElementById("dynamicUserName");
    if (dynUser) { dynUser.style.setProperty("display", "none", "important"); }
    var goBack = document.getElementById("goBack");
    if (goBack) { goBack.style.setProperty("display", "none", "important"); }

    /* Hide the step-1 email label+input wrapper (Xecurify only hides #userName, not our wrapper) */
    var emailLbl = document.getElementById("mo-email-lbl");
    if (emailLbl) {
      var emailFg = emailLbl.closest(".mo-fg") || emailLbl.parentElement;
      if (emailFg) emailFg.style.setProperty("display", "none", "important");
    }

    /* LOG IN title — insert once before any form child */
    var wrapper = document.getElementById("login-wrapper");
    if (wrapper && !document.getElementById("mo-title")) {
      var t = document.createElement("span");
      t.id = "mo-title"; t.className = "px-2 mx-1"; t.textContent = tr("login.page.title");
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    /* Button label */
    var btn = document.getElementById("loginbutton");
    setBtnArrowLabel(btn, tr("login.page.button"));

    if (document.getElementById("mo-pw-lbl")) return; // already applied

    /* Password label above #plaintextPassword */
    var pwLbl = document.createElement("label");
    pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
    pwLbl.setAttribute("for", "plaintextPassword");
    pwLbl.innerHTML = tr("password.field.label") + ' <span class="mo-req">*</span>';
    pwField.parentNode.insertBefore(pwLbl, pwField);

    /* Show read-only username above password field */
    if (!document.getElementById("mo-user-display")) {
      var usernameVal = "";
      var unInp = document.getElementById("username");
      if (unInp && unInp.value) usernameVal = unInp.value;
      if (!usernameVal && dynUser) usernameVal = dynUser.textContent.trim();
      if (usernameVal) {
        var userFg = document.createElement("div"); userFg.className = "mo-fg";
        var userLbl = document.createElement("label"); userLbl.className = "mo-lbl";
        userLbl.id = "mo-user-display-lbl";
        userLbl.textContent = tr("email.field.label");
        var userBox = document.createElement("div"); userBox.id = "mo-user-display";
        userBox.className = "mo-user-display";
        userBox.textContent = usernameVal;
        userFg.appendChild(userLbl); userFg.appendChild(userBox);
        pwLbl.parentNode.insertBefore(userFg, pwLbl);
      }
    }

    /* Guarded by #mo-pw-error so it appends ONCE (otherwise the observer
       re-runs this block and stacks duplicate error messages). */
    var isPageHasError = errorOnPage();
    if(isPageHasError && !document.getElementById("mo-pw-error")) {
      console.log('IN ERROR SECTION ')
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      $('#mo-user-display').after(
        '<div id="mo-pw-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>'
      );
      $('#username, #plaintextPassword').addClass('border border-danger');
      $('.mo-user-display').addClass('border border-danger');
      /* Red cross icon inside the read-only email display box */
      var userBox = document.getElementById("mo-user-display");
      if (userBox && !userBox.querySelector(".mo-error-icon")) {
        userBox.style.position = "relative";
        userBox.style.paddingRight = "40px";
        var emailErrIcon = document.createElement("span");
        emailErrIcon.id = "mo-email-server-icon";
        emailErrIcon.className = "mo-error-icon";
        emailErrIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        userBox.appendChild(emailErrIcon);
      }
      $('#error-alert-message').hide();
    }

    /* Wrap password field in .mo-pw-wrap for eye toggle */
    var wrap = document.createElement("div"); wrap.className = "mo-pw-wrap";
    pwField.parentNode.insertBefore(wrap, pwField);
    wrap.appendChild(pwField);
    pwField.setAttribute("placeholder", tr("password.field.placeholder"));

    /* Eye toggle button */
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    var eyeBtn = document.createElement("button");
    eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
    eyeBtn.setAttribute("aria-label", "Toggle password visibility");
    eyeBtn.innerHTML = EYE_OFF;
    eyeBtn.addEventListener("click", function () {
      var show = pwField.type === "password";
      pwField.type = show ? "text" : "password";
      eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
    });
    if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);

    /* On server error, add the red cross icon inside the password field
       (same look as the change-password page) */
    if (isPageHasError) {
      pwField.classList.add("mo-input-error");
      if (!wrap.querySelector(".mo-error-icon")) {
        var pwErrIcon = document.createElement("span");
        pwErrIcon.id = "mo-pw-server-icon";
        pwErrIcon.className = "mo-error-icon";
        pwErrIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        wrap.appendChild(pwErrIcon);
      }
    }

    /* Clear all login error indicators once the user edits the password
       (message, red borders, and both cross icons) — like the reset page. */
    if (!pwField.dataset.moLoginClear) {
      pwField.dataset.moLoginClear = "true";
      pwField.addEventListener("input", function () {
        $('#mo-pw-error').remove();
        $('#mo-pw-server-icon, #mo-email-server-icon').remove();
        $('#username, #plaintextPassword').removeClass('border border-danger mo-input-error');
        $('.mo-user-display').removeClass('border border-danger').css('padding-right', '');
      });
    }

    /* Forgot password link only (no Remember me checkbox) */
    if (!document.getElementById("mo-bottom")) {
      var row = document.createElement("div"); row.id = "mo-bottom";
      var fl = document.createElement("a"); fl.id = "mo-forgot";
      fl.href = "/moas/idp/resetpassword"; fl.textContent = tr("forgot.password.link");
      row.appendChild(fl);
      wrap.parentNode.insertBefore(row, wrap.nextSibling);
    }
  }

  /* ── Force-hide specific elements that jQuery's showAdminPassword() re-shows ── */
  function forceHide() {
    /* Hide by ID — only the element itself, never its parent */
    ["dynamicUserName", "goBack"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.setProperty("display", "none", "important");
    });

    /* Hide "Sign in with another account" links only — check the link's OWN text, not children */
    document.querySelectorAll("a").forEach(function (a) {
      var txt = "";
      a.childNodes.forEach(function (n) { if (n.nodeType === 3) txt += n.nodeValue; });
      txt = txt.trim().toLowerCase();
      if (txt.indexOf("sign in with another") !== -1) {
        a.style.setProperty("display", "none", "important");
        /* Only hide parent if it is a safe small container (.col-auto or .form-group) */
        var p = a.parentElement;
        if (p && (p.classList.contains("col-auto") || p.classList.contains("form-group"))) {
          p.style.setProperty("display", "none", "important");
        }
      }
    });
  }



  /* ── LOGIN ERROR HANDLER ── */
  function handleLoginErrors() {
    var feedbackEl = document.getElementById("feedback-msg");
    var userErrorEl = document.getElementById("username-error");
    var errorText = "";

    if (feedbackEl && feedbackEl.textContent.trim()) {
      errorText = feedbackEl.textContent.trim();
    } else if (userErrorEl && userErrorEl.textContent.trim()) {
      errorText = userErrorEl.textContent.trim();
    }

    // Clean existing styled error indicators.
    // Preserve the server-error icon/state owned by applyPasswordStep
    // (#mo-pw-server-icon) so its cross isn't wiped on every cycle.
    var hasServerIcon = !!document.getElementById("mo-pw-server-icon");
    var hasUserIcon = !!document.getElementById("mo-userlogin-icon");
    document.querySelectorAll(".mo-input-error").forEach(function (inp) {
      if (hasServerIcon && inp.id === "plaintextPassword") return;
      if (hasUserIcon && inp.id === "username") return;
      inp.classList.remove("mo-input-error");
    });
    document.querySelectorAll(".mo-error-icon").forEach(function (ico) {
      if (ico.id === "mo-pw-server-icon" || ico.id === "mo-email-server-icon" || ico.id === "mo-userlogin-icon") return;
      ico.remove();
    });
    document.querySelectorAll(".mo-error-text").forEach(function (txt) {
      txt.remove();
    });

    if (!errorText) return;

    var isLogin = checkIsLogin();
    if (!isLogin) return;

    var pwField = document.getElementById("plaintextPassword");
    var isPasswordStep = pwField && pwField.style.display !== "none" && !pwField.classList.contains("d-none");

    if (isPasswordStep) {
      var input = document.getElementById("plaintextPassword");
      if (input) {
        input.classList.add("mo-input-error");
        var wrap = input.closest(".mo-pw-wrap");
        if (wrap && !wrap.querySelector(".mo-error-icon")) {
          var icon = document.createElement("span");
          icon.className = "mo-error-icon";
          icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
          wrap.appendChild(icon);
        }
        var errorMsgId = "mo-pw-error-msg";
        var errorMsg = document.getElementById(errorMsgId);
        if (!errorMsg) {
          errorMsg = document.createElement("span");
          errorMsg.id = errorMsgId;
          errorMsg.className = "mo-error-text";
          var insertTarget = wrap || input;
          insertTarget.parentNode.insertBefore(errorMsg, insertTarget.nextSibling);
        }
        errorMsg.textContent = errorText;
      }
    } else {
      var input = document.getElementById("username");
      if (input) {
        input.classList.add("mo-input-error");
        var wrap = input.parentNode;
        if (wrap.className !== "mo-input-wrap") {
          wrap = document.createElement("div");
          wrap.className = "mo-input-wrap";
          wrap.style.position = "relative";
          wrap.style.display = "flex";
          wrap.style.alignItems = "center";
          wrap.style.width = "100%";
          input.parentNode.insertBefore(wrap, input);
          wrap.appendChild(input);
        }
        if (wrap && !wrap.querySelector(".mo-error-icon")) {
          var icon = document.createElement("span");
          icon.className = "mo-error-icon";
          icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
          wrap.appendChild(icon);
        }
        var errorMsgId = "mo-email-error-msg";
        var errorMsg = document.getElementById(errorMsgId);
        if (!errorMsg) {
          errorMsg = document.createElement("span");
          errorMsg.id = errorMsgId;
          errorMsg.className = "mo-error-text";
          wrap.parentNode.insertBefore(errorMsg, wrap.nextSibling);
        }
        errorMsg.textContent = errorText;
      }
    }
  }

  /* ── COMBINED EMAIL + PASSWORD STEP (redirecttoidplogin) ── */
  /* On this page both the email and password fields are visible at once,
     so we style both together — no two-step toggle and no read-only
     username box (the email field stays editable). */
  function applyEmailPasswordStep() {
    var wrapper = document.getElementById("login-wrapper");
    if (!wrapper) return;

    /* LOG IN title — insert once before any form child */
    if (!document.getElementById("mo-title")) {
      var t = document.createElement("span");
      t.id = "mo-title"; t.className = "px-2 mx-1"; t.textContent = tr("login.page.title");
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    $('.d-flex.justify-content-center.container-fluid.w-100').addClass('h-100 align-items-center');
    $('.row.w-75.px-4').removeClass('w-75 px-4').addClass('w-100');
    $('.login-header').hide();

    /* Email label + placeholder */
    var userDiv = document.getElementById("userName");
    if (userDiv && !document.getElementById("mo-email-lbl")) {
      var fg = document.createElement("div"); fg.className = "mo-fg";
      var lbl = document.createElement("label");
      lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
      lbl.setAttribute("for", "username");
      lbl.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
      fg.appendChild(lbl);
      userDiv.parentNode.insertBefore(fg, userDiv);
      fg.appendChild(userDiv);
    }
    /* redirecttoidplogin only: drop the #userName id from the wrapper div */
    var userNameDiv = document.getElementById("userName");
    if (userNameDiv) userNameDiv.removeAttribute("id");
    var emailInp = document.getElementById("username");
    if (emailInp) emailInp.setAttribute("placeholder", tr("email.field.placeholder"));

    /* Password label + eye toggle + placeholder */
    var pwField = document.getElementById("plaintextPassword");
    if (pwField) {
      pwField.setAttribute("placeholder", tr("password.field.placeholder"));

      if (!document.getElementById("mo-pw-lbl")) {
        var pwLbl = document.createElement("label");
        pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
        pwLbl.setAttribute("for", "plaintextPassword");
        pwLbl.innerHTML = tr("password.field.label") + ' <span class="mo-req">*</span>';
        pwField.parentNode.insertBefore(pwLbl, pwField);
      }

      /* Wrap password field in .mo-pw-wrap for eye toggle (once) */
      if (!pwField.parentNode.classList.contains("mo-pw-wrap")) {
        var wrap = document.createElement("div"); wrap.className = "mo-pw-wrap";
        pwField.parentNode.insertBefore(wrap, pwField);
        wrap.appendChild(pwField);

        var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        var eyeBtn = document.createElement("button");
        eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
        eyeBtn.setAttribute("aria-label", "Toggle password visibility");
        eyeBtn.innerHTML = EYE_OFF;
        eyeBtn.addEventListener("click", function () {
          var show = pwField.type === "password";
          pwField.type = show ? "text" : "password";
          eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
        });
        if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);

        /* Forgot password link row */
        if (!document.getElementById("mo-bottom")) {
          var row = document.createElement("div"); row.id = "mo-bottom";
          var fl = document.createElement("a"); fl.id = "mo-forgot";
          fl.href = "/moas/idp/resetpassword"; fl.textContent = tr("forgot.password.link");
          row.appendChild(fl);
          wrap.parentNode.insertBefore(row, wrap.nextSibling);
        }
      }
    }

    /* Button label */
    var btn = document.getElementById("loginbutton");
    setBtnArrowLabel(btn, tr("login.page.button"));

    $('#loginbutton').parent().addClass('d-flex')

    /* Hide hr and br inside the card */
    wrapper.querySelectorAll("hr,br").forEach(function (el) { el.style.display = "none"; });
  }

  /* ── Redirect to IDP login PAGE (/moas/redirecttoidplogin) ── */
  /* Same styling/behaviour as the /moas/login page — reuses the shared
     CSS injection. Uses the combined step (both fields shown at once). */
  function applyRedirectToIdpLogin() {
    console.log('in apply redirecto idplogin')
    if (!checkIsRedirectToIdpLogin()) return;

    injectFontAndCss();
    applyEmailPasswordStep();
    handleLoginErrors();
    forceHide();

    /* Server-rendered error banner -> show below the password field.
       Guarded by #mo-redirect-error so it runs ONCE — otherwise the DOM
       mutations below keep re-triggering the observer (infinite loop). */
    var isPageHasError = errorOnPage();
    /* Also gate on a "dismissed" flag: the server banner (#error-alert-message)
       stays in the DOM (just hidden), so errorOnPage() keeps returning true.
       Without this flag the next observer tick would re-inject the message,
       border and icons the moment the user's input handler removes them. */
    var rdUname = document.getElementById("username");
    if (isPageHasError && !document.getElementById("mo-redirect-error") && !(rdUname && rdUname.dataset.moRedirectDismissed)) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      var errHtml = '<div id="mo-redirect-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>';
      if ($('.mo-pw-wrap').length) {
        $('.mo-pw-wrap').after(errHtml);
      } else {
        $('#username').after(errHtml);
      }
      $('#username, #plaintextPassword').addClass('border border-danger mo-input-error');

      var RD_CROSS = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';

      /* Red cross inside the email field (wrap it once for positioning).
         Uses id mo-userlogin-icon so handleLoginErrors() treats it as exempt
         and doesn't strip it on later observer ticks. */
      var rdEmail = document.getElementById("username");
      if (rdEmail) {
        var rdEw = rdEmail.parentNode;
        if (!rdEw.classList.contains("mo-input-wrap")) {
          rdEw = document.createElement("div");
          rdEw.className = "mo-input-wrap";
          rdEw.style.position = "relative";
          rdEw.style.display = "flex";
          rdEw.style.alignItems = "center";
          rdEw.style.width = "100%";
          rdEmail.parentNode.insertBefore(rdEw, rdEmail);
          rdEw.appendChild(rdEmail);
        }
        if (!rdEw.querySelector(".mo-error-icon")) {
          var rdEIcon = document.createElement("span");
          rdEIcon.id = "mo-userlogin-icon";
          rdEIcon.className = "mo-error-icon";
          rdEIcon.innerHTML = RD_CROSS;
          rdEw.appendChild(rdEIcon);
        }
      }

      /* Red cross inside the password field (inside its .mo-pw-wrap).
         Uses id mo-pw-server-icon so handleLoginErrors() leaves it alone. */
      var rdPwWrap = document.querySelector(".mo-pw-wrap");
      if (rdPwWrap && !rdPwWrap.querySelector(".mo-error-icon")) {
        var rdPIcon = document.createElement("span");
        rdPIcon.id = "mo-pw-server-icon";
        rdPIcon.className = "mo-error-icon";
        rdPIcon.innerHTML = RD_CROSS;
        rdPwWrap.appendChild(rdPIcon);
      }

      /* Once the user edits either field, clear the error message, borders
         and cross icons (bound once per field). */
      ["username", "plaintextPassword"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.dataset.moRedirectClear) {
          el.dataset.moRedirectClear = "true";
          el.addEventListener("input", function () {
            /* Mark dismissed so the guarded block above won't re-inject on the
               next observer tick (the server banner is still in the DOM). */
            var u = document.getElementById("username");
            if (u) u.dataset.moRedirectDismissed = "true";
            $('#mo-redirect-error').remove();
            $('#mo-userlogin-icon, #mo-pw-server-icon').remove();
            $('#username, #plaintextPassword').removeClass('border border-danger mo-input-error');
          });
        }
      });

      $('#error-alert-message').hide();
    }

    /* Hide original forgot/create link wrappers — skip our custom #mo-forgot */
    document.querySelectorAll("a[href*='forgotpassword'],a[href*='resetpassword'],a[href*='businessfreetrial']").forEach(function (a) {
      if (a.id === "mo-forgot") return;
      var c = a.closest(".col-auto");
      if (c) c.style.setProperty("display", "none", "important");
      else a.style.setProperty("display", "none", "important");
    });

    var wrapper = document.getElementById("login-wrapper");
    if (wrapper) wrapper.querySelectorAll("hr,br").forEach(function (el) { el.style.display = "none"; });

    $('body').addClass('h-100 align-items-center');
  }

  /* ── FORGOT PASSWORD PAGE (/moas/idp/forgotpassword) ── */
  function applyForgotPage() {
    if (!checkIsForgot()) return;

    /* Wait for form to load */
    var emailInput = document.getElementById("emailAddress") || document.getElementById("username");
    if (!emailInput) return; // not ready yet

    /* resetpassword endpoint: strip all <br> spacers (runs every tick to
       catch any re-added by React). */
    if (window.location.pathname.toLowerCase().indexOf("moas/idp/resetpassword") !== -1) {
      $('br').remove();

      /* This page only: override the card padding to 28px 20px. An inline
         !important is required to beat the #mo-fp-css `#login-wrapper` rule
         (jQuery's .css() can't set !important). Guarded (only write when it
         differs) so the style mutation doesn't retrigger the observer loop. */
      var rpWrapper = document.getElementById("login-wrapper");
      if (rpWrapper && rpWrapper.style.padding !== "28px 20px") {
        rpWrapper.style.setProperty("padding", "28px 20px", "important");
      }
    }

    /* ── CSS injection (once) ── */
    if (!document.getElementById("mo-fp-css")) {
      var fpCss =
        /* Page background */
        "body{" +
        "min-height:100vh!important;margin:0!important;padding:0!important;" +
        "display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;" +
        "background:#eef1f7!important;" +
        "}" +
        "#root,#login-body{background:#eef1f7!important;}" +
        "#root>div{background:#eef1f7!important;}" +
        "#login-header{display:none!important;}" +
        "body #login-body, body .container-fluid{" +
        "width:100%!important;max-  width:100%!important;margin:0 auto!important;padding:24px 16px!important;" +
        "display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;" +
        "box-sizing:border-box!important;background:transparent!important;float:none!important;" +
        "height:auto!important;min-height:unset!important;" +
        "}" +
        "#root .d-flex.flex-column.align-items-center{" +
        "align-items:center!important;" +
        "justify-content:center!important;" +
        "min-height:100vh!important;" +
        "padding:40px 16px!important;" +
        "box-sizing:border-box!important;" +
        "background:#eef1f7!important;" +
        "}" +

        /* Card */
        "body #login-body .container-fluid #login-wrapper, body #login-wrapper, #login-wrapper{" +
        "background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "max-width:560px!important;width:100%!important;" +
        "margin-left:auto!important;margin-right:auto!important;" +
        "margin-top:0!important;margin-bottom:0!important;" +
        "display:block!important;float:none!important;" +
        "position:relative!important;left:auto!important;right:auto!important;" +
        "padding:28px 14px!important;box-sizing:border-box!important;" +
        "height:auto!important;min-height:unset!important;align-self:center!important;" +
        "}" +

        /* Form override (remove grey background) */
        "#userform,.login-form{" +
        "background:transparent!important;border:none!important;box-shadow:none!important;" +
        "padding:0!important;margin:0!important;width:100%!important;max-width:100%!important;" +
        "display:flex!important;flex-direction:column!important;align-items:stretch!important;" +
        "}" +

        /* Hide logo row, h4, p, separators */
        ".w-100.d-flex.justify-content-between.align-items-start.mb-4{display:none!important;}" +
        "h4.fw-medium.text-dark.mb-1,h4.fw-medium,h4.my-4{display:none!important;}" +
        "p.text-muted.small{display:none!important;}" +
        "#login-wrapper hr,#userform hr{display:none!important;}" +

        /* Hide card's inner heading */
        "#mo-fp-hide-section{display:none!important;}" +

        /* RESET PASSWORD heading */
        "#mo-fp-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;font-weight:800;" +
        "color:#000933;margin-bottom:6px;letter-spacing:-.3px;text-align:left!important;}" +

        /* Subtitle */
        "#mo-fp-subtitle{display:block;font-size:14px;font-weight:400;color:#000933;font-family:'Figtree',sans-serif;margin-bottom:12px;text-align:left!important;}" +

        /* Label */
        "#mo-fp-lbl{" +
        "display:block!important;color:#3c515d!important;font-size:14px!important;font-weight:700!important;" +
        "padding:0 0 6px!important;font-family:'Figtree',sans-serif!important;margin-bottom:0!important;" +
        "text-align:left!important;width:100%!important;" +
        "}" +
        "#mo-fp-lbl .mo-req{color:#e02020!important;margin-left:2px!important;}" +

        /* Email input */
        "#emailAddress,#username{" +
        "height:40px!important;border:1px solid #C1CFD7;border-radius:4px!important;" +
        "padding:0 12px!important;padding-left:12px!important;font-size:14px!important;" +
        "font-family:'Figtree',sans-serif!important;color:#000933!important;" +
        "background:#fff!important;width:100%!important;box-shadow:none!important;" +
        "outline:none!important;box-sizing:border-box!important;" +
        "margin-bottom:0!important;display:block!important;" +
        "}" +
        "#emailAddress::placeholder,#username::placeholder{color:#a0aab6!important;font-size:14px!important;}" +
        "#emailAddress:focus,#username:focus{border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;}" +

        /* Remove input icon */
        ".position-relative span.position-absolute{display:none!important;}" +

        /* Form / row scaling for legacy */
        "#userform .w-75,#userform .row,#userform .username-custom{" +
        "width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;" +
        "display:block!important;" +
        "}" +
        /* resetpassword endpoint: restore horizontal padding on the field
           container (JS adds .px-2 there only, so this is scoped to it and
           out-specifies the padding:0 rule above via the extra class). */
        "#userform .w-75.px-2{padding-left:.5rem!important;padding-right:.5rem!important;}" +

        /* Helper text */
        "#mo-fp-helper{font-size:14px;font-weight:400;color:#000933;font-family:'Figtree',sans-serif;" +
        "margin:14px 0 18px;line-height:1.5;text-align:left!important;width:100%!important;padding-left:0;padding-right:0;}" +
        "#mo-fp-helper a{display:block;margin-top:4px;color:#0A55D7;text-decoration:none;font-weight:500;}" +
        "#mo-fp-helper a:hover{text-decoration:underline;}" +

        /* NEXT button */
        ".d-grid.mb-3{display:block!important;}" +
        ".d-grid.mb-3 button[type=submit],#userform button[type=submit],#userform button.custom-button{" +
        "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
        "gap:8px!important;min-height:40px!important;padding:8px 24px!important;" +
        "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;font-weight:700!important;letter-spacing:.6px!important;" +
        "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;" +
        "width:auto!important;margin:0 auto 0 0!important;align-self:flex-start!important;" +
        "padding-right:46px!important;background-image:" + MO_ARROW_BG + "!important;" +
        "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;" +
        "}" +
        ".d-grid.mb-3 button[type=submit]:hover,#userform button[type=submit]:hover,#userform button.custom-button:hover{" +
        "background-color:#0844b0!important;" +
        "}" +
        "#userform .row div:has(.custom-button){text-align:left!important;width:100%!important;}" +

        /* Hide Go back button */
        ".text-center button.btn-link,#go-back-link,#userform p:has(#go-back-link){display:none!important;}";

      var fpSt = document.createElement("style");
      fpSt.id = "mo-fp-css"; fpSt.textContent = fpCss;
      document.head.appendChild(fpSt);
    }

    /* ── JS force-hide (runs every call — beats React re-renders & inline styles) ── */
    /* Logo row */
    document.querySelectorAll("div.w-100.d-flex").forEach(function (el) {
      if (el.classList.contains("justify-content-between") && el.classList.contains("align-items-start")) {
        el.style.setProperty("display", "none", "important");
      }
    });
    /* h4 heading */
    document.querySelectorAll("h4").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    /* Subtitle paragraph */
    document.querySelectorAll("p.text-muted").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    /* Card heading block */
    var cardHeading = document.querySelector(".d-flex.flex-column.gap-2.mb-2");
    if (cardHeading) { cardHeading.style.setProperty("display", "none", "important"); }

    /* separators and headers */
    document.querySelectorAll("#login-wrapper hr,#userform hr").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });

    /* ── DOM injection — only once ── */
    if (document.getElementById("mo-forgot-done")) return;

    /* Find the form element */
    var fpForm = emailInput.closest("form");
    if (!fpForm) return;

    /* Insert RESET PASSWORD title + subtitle before the form */
    if (!document.getElementById("mo-fp-title")) {
      var fpTitle = document.createElement("span");
      fpTitle.id = "mo-fp-title"; fpTitle.textContent = tr("reset.password");
      fpForm.parentNode.insertBefore(fpTitle, fpForm);

      var fpSub = document.createElement("span");
      fpSub.id = "mo-fp-subtitle";
      fpSub.textContent = tr("reset.password.subtext");
      fpForm.parentNode.insertBefore(fpSub, fpForm);
    }

    /* resetpassword endpoint only: add horizontal padding (px-2) to the
       title, subtitle and the field container div. classList.add is a no-op
       when the class is already present, so this is observer-loop safe. */
    if (window.location.pathname.toLowerCase().indexOf("moas/idp/resetpassword") !== -1) {
      var rpTitle = document.getElementById("mo-fp-title");
      if (rpTitle) rpTitle.classList.add("px-2");
      var rpSub = document.getElementById("mo-fp-subtitle");
      if (rpSub) rpSub.classList.add("px-2");
      var rpBody = document.querySelector("#userform .w-75.px-4");
      if (rpBody) rpBody.classList.add("px-2");
    }

    /* Replace/create label text */
    var origLabel = fpForm.querySelector("label[for='emailAddress']") || fpForm.querySelector("label[for='username']") || document.getElementById("mo-fp-lbl");
    if (!origLabel) {
      origLabel = document.createElement("label");
      origLabel.setAttribute("for", emailInput.id);
      origLabel.id = "mo-fp-lbl";
      origLabel.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
      emailInput.parentNode.insertBefore(origLabel, emailInput);
    } else if (origLabel.id !== "mo-fp-lbl") {
      origLabel.id = "mo-fp-lbl"; origLabel.className = "";
      origLabel.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
    }

    /* Fix input placeholder */
    emailInput.setAttribute("placeholder", tr("email.field.placeholder"));

    /* Insert helper text after the input wrapper (once) */
    if (!document.getElementById("mo-fp-helper")) {
      var inputWrapper = emailInput.closest(".mb-3") || emailInput.closest(".username-custom") || emailInput.closest(".row");
      if (inputWrapper) {
        var helper = document.createElement("p");
        helper.id = "mo-fp-helper";
        helper.innerHTML =
          tr("forgot.page.helper") + "<br>" +
          '<a href="' + MO_URLS.supportPage + '">' + tr("forgot.page.helper.link") + '</a>';
        inputWrapper.parentNode.insertBefore(helper, inputWrapper.nextSibling);
      }
    }

    /* Change button text to NEXT → */
    var fpBtn = fpForm.querySelector("button") || fpForm.querySelector("input[type='submit']");
    setBtnArrowLabel(fpBtn, tr("next.button"));

    /* Mark as done */
    var done = document.createElement("span");
    done.id = "mo-forgot-done"; done.style.display = "none";
    document.body.appendChild(done);

    $('.btn.mo-btn-primary.btn-block.custom-button.w-100').parent().addClass('px-0')

    /* Server-rendered error banner -> red border + cross on the input and a
       message directly below it. Runs after the label exists so the wrap won't
       trap the label. Guarded so it doesn't stack; cleared once the user edits.

       Exception: on the /moas/idp/resetpassword endpoint specifically, suppress
       ALL error UI (message, red border, cross icon). Other forgot/reset
       endpoints (forgotpassword, resetuserpassword) keep it. */
    var isResetPasswordEndpoint = window.location.pathname.toLowerCase().indexOf("moas/idp/resetpassword") !== -1;
    var fpHasError = errorOnPage();
    if (isResetPasswordEndpoint) {
      $('#error-alert-message').hide();
      $('#mo-fp-error').remove();
      $('#mo-fp-error-icon').remove();
      $(emailInput).removeClass("border border-danger mo-input-error");
    } else if (fpHasError && !document.getElementById("mo-fp-error")) {
      console.log('IN ERROR SECTION ');
      var fpMessage = $('#error-alert-message .errorMessage li span').text().trim();
      /* Wrap ONLY the input in a relative flex container for the cross icon */
      if (!emailInput.parentNode.classList.contains("mo-fp-inputwrap")) {
        var fpIw = document.createElement("div");
        fpIw.className = "mo-fp-inputwrap";
        fpIw.style.position = "relative";
        fpIw.style.display = "flex";
        fpIw.style.alignItems = "center";
        fpIw.style.width = "100%";
        emailInput.parentNode.insertBefore(fpIw, emailInput);
        fpIw.appendChild(emailInput);
      }
      $(emailInput).addClass("border border-danger mo-input-error");
      var fpIwrap = emailInput.closest(".mo-fp-inputwrap");
      if (fpIwrap && !fpIwrap.querySelector(".mo-error-icon")) {
        var fpIcon = document.createElement("span");
        fpIcon.id = "mo-fp-error-icon";
        fpIcon.className = "mo-error-icon";
        fpIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        fpIwrap.appendChild(fpIcon);
      }
      /* Message directly below the input wrapper */
      $(fpIwrap || emailInput).after('<div id="mo-fp-error" class="error-message text-start" style="color:#E91616;font-size:13px;margin-top:6px;">' + fpMessage + '</div>');
      /* Clear once the user edits the email again */
      if (!emailInput.dataset.moFpClear) {
        emailInput.dataset.moFpClear = "true";
        emailInput.addEventListener("input", function () {
          $('#mo-fp-error').remove();
          $('#mo-fp-error-icon').remove();
          $(this).removeClass("border border-danger mo-input-error");
        });
      }
      $('#error-alert-message').hide();
    }

    $('.btn.mo-btn-primary.btn-block.custom-button.w-100').parent().addClass('d-flex');
    $('#go-back-link').parent().hide();
  }

  /* ── OTP VERIFY PAGE (/moas/idp/validatenextfactor) ── */
  function applyOtpPage() {
    if (!checkIsOtp()) return;

    /* CSS — inject once */
    if (!document.getElementById("mo-otp-css")) {
      var otpCss =
        /* Page: remove grey overlay, set brand bg */
        "body{background:#eef1f7!important;overflow:auto!important;" +
        "padding-right:0!important;font-family:'Figtree',sans-serif!important;}" +
        ".modal-backdrop{display:none!important;}" +
        ".modal.show{position:static!important;display:flex!important;" +
        "align-items:center!important;justify-content:center!important;" +
        "min-height:100vh!important;background:#eef1f7!important;" +
        "padding:40px 16px!important;box-sizing:border-box!important;}" +
        ".modal-dialog{margin:0!important;max-width:640px!important;width:100%!important;}" +
        ".modal-content{border:1px solid #e0e7ef!important;border-radius:4px!important;" +
        "box-shadow:0 2px 12px rgba(0,0,0,.08)!important;}" +
        "#modal-header-main{border-bottom:none!important;padding:26px 26px 12px!important;}" +
        ".modal-title{font-size:0!important;color:transparent!important;}" +
        "#mo-otp-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;" +
        "font-weight:800;color:#000933;text-transform:uppercase;letter-spacing:-.3px;margin:0;}" +
        "#modal-body{padding:4px 15px 4px!important;}" +
        "#success-alert-message{background:#D8F3EA!important;border:none!important;" +
        "border-left:4px solid #237659!important;border-radius:4px!important;" +
        "color:#000933!important;padding:12px 16px!important;display:flex!important;" +
        "align-items:flex-start!important;gap:10px!important;margin-bottom:20px!important;}" +
        "#success-alert-message .fa-check-circle{color:#237659!important;" +
        "font-size:18px!important;flex-shrink:0;margin-top:2px!important;}" +
        "#success-alert-message .btn-close{display:none!important;}" +
        "#success-alert-message .actionMessage{list-style:none!important;" +
        "padding:0!important;margin:0!important;}" +
        "#success-alert-message .actionMessage li span{font-family:'Figtree',sans-serif;" +
        "font-size:14px;line-height:1.5;color:#000933!important;}" +
        "#mo-otp-lbl{display:block;font-family:'Figtree',sans-serif;font-size:14px;" +
        "font-weight:700;color:#3c515d;margin-bottom:6px;}" +
        "#mo-otp-lbl .mo-req{color:#e02020;margin-left:2px;}" +
        "#otpToken{height:40px!important;border:1px solid #C1CFD7;" +
        "border-radius:4px!important;padding:0 12px!important;font-size:14px!important;" +
        "font-family:'Figtree',sans-serif!important;color:#000933!important;" +
        "background:#fff!important;box-shadow:none!important;" +
        "width:100%!important;box-sizing:border-box!important;}" +
        "#otpToken::placeholder{color:#a0aab6!important;font-size:14px!important;}" +
        "#otpToken:focus{border-color:#0A55D7!important;" +
        "box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;outline:none!important;}" +
        "#resendIdpOtpLink{color:#0A55D7!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;text-decoration:none!important;font-weight:500!important;" +
        "display:inline-block!important;margin-top:12px!important;}" +
        "#resendIdpOtpLink:hover{text-decoration:underline!important;}" +
        "#modal-footer{border-top:none!important;padding:20px 36px 32px!important;" +
        "justify-content:flex-start!important;gap:12px!important;}" +
        "#validate{background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;border-radius:0!important;color:#fff!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:16px!important;" +
        "font-weight:700!important;text-transform:uppercase!important;" +
        "letter-spacing:.6px!important;padding:8px 24px!important;" +
        "cursor:pointer!important;min-height:40px!important;}" +
        "#validate{padding-right:46px!important;background-image:" + MO_ARROW_BG + "!important;" +
        "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;}" +
        "#validate:hover{background-color:#0844b0!important;}" +
        ".btn-cancel{background:#EFF3F5!important;border:none!important;" +
        "border-radius:0!important;color:#000933!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
        "font-weight:700!important;text-transform:uppercase!important;" +
        "letter-spacing:.6px!important;padding:8px 24px!important;min-height:40px!important;}" +
        ".btn-cancel:hover{background:#dee2e6!important;}";

      var otpSt = document.createElement("style");
      otpSt.id = "mo-otp-css"; otpSt.textContent = otpCss;
      document.head.appendChild(otpSt);
    }

    /* Idempotent UI bits below run on EVERY call (incl. observer ticks after
       the AJAX "resend OTP", which re-renders the OTP subtree without a page
       reload) — each block is guarded so it neither duplicates nor stacks. */
    var otpInput = document.getElementById("otpToken");
    if (!otpInput) return;

    /* VERIFY YOUR IDENTITY title — re-sync on every tick (don't freeze). The
       first tick can run before mo_locale settles (script imported early in the
       JSP), so tr() may return English; a later tick must be able to correct it.
       Compare before writing so a matched value doesn't retrigger the observer. */
    var modalHeader = document.getElementById("modal-header-main");
    if (modalHeader) {
      var otpTitle = document.getElementById("mo-otp-title");
      if (!otpTitle) {
        otpTitle = document.createElement("span");
        otpTitle.id = "mo-otp-title";
        modalHeader.insertBefore(otpTitle, modalHeader.firstChild);
      }
      var otpTitleTxt = tr("otp.page.title");
      if (otpTitle.textContent !== otpTitleTxt) otpTitle.textContent = otpTitleTxt;
    }

    /* Label above OTP input — reuse a server-rendered label[for=otpToken]
       if present, otherwise create one right before the input. Works whether
       or not the page ships its own label. */
    var otpLbl = document.getElementById("mo-otp-lbl") || otpInput.parentNode.querySelector('label[for="otpToken"]');
    if (!otpLbl) {
      otpLbl = document.createElement("label");
      otpLbl.setAttribute("for", "otpToken");
      otpInput.parentNode.insertBefore(otpLbl, otpInput);
    }
    if (otpLbl.id !== "mo-otp-lbl") otpLbl.id = "mo-otp-lbl";
    /* Re-sync on every tick like the title. Compare against the target first so
       we only touch innerHTML when the locale actually changed \u2014 otherwise the
       childList mutation retriggers the observer and loops infinitely. */
    var otpLblHtml = tr("otp.field.label") + ' <span class="mo-req">*</span>';
    if (otpLbl.innerHTML !== otpLblHtml) {
      otpLbl.innerHTML = otpLblHtml;
      otpLbl.dataset.moLocalized = "1";
    }

    /* Form padding (jQuery no-ops when classes already match, so no loop) */
    $('#validateIdentityForm').removeClass('p-4').addClass('p-0');

    /* Strip all <br> spacers on this page. No-op (no mutation) once none
       remain, so it's observer-loop safe even running every tick. */
    $('br').remove();

    /* modal-footer padding, this page only. jQuery selects it, but the value
       is applied via setProperty with !important (jQuery's .css() can't set
       !important, and this must beat the #mo-otp-css `#modal-footer` rule).
       Guarded against the NORMALIZED read-back ("0" comes back as "0px") so
       the style write doesn't retrigger the observer loop. */
    $('#modal-footer').each(function () {
      if (this.style.padding !== "0px 26px 24px 22px") {
        this.style.setProperty("padding", "0 26px 24px 22px", "important");
      }
    });

    /* Placeholder (attribute not observed) */
    if (otpInput.getAttribute("placeholder") !== tr("otp.field.placeholder")) {
      otpInput.setAttribute("placeholder", tr("otp.field.placeholder"));
    }

    /* Verify button */
    var verifyBtn = document.getElementById("validate");
    setBtnArrowLabel(verifyBtn, tr("otp.verify.button"));

    /* Cancel button */
    var cancelBtn = document.querySelector(".btn-cancel");
    if (cancelBtn && cancelBtn.textContent !== tr("otp.cancel.button")) {
      cancelBtn.textContent = tr("otp.cancel.button");
    }
    /* Redirect Cancel to the broker login instead of submitting the
       cancelauthentication form. Override the inline onclick once. */
    if (cancelBtn && !cancelBtn.dataset.moCancel) {
      cancelBtn.dataset.moCancel = "true";
      cancelBtn.removeAttribute("onclick");
      cancelBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.replace(MO_URLS.otpCancelRedirect);
      });
    }

    /* Backend typo fix in the OTP success message: "...to Validate." -> "...to validate."
       English only — detected via the "Please enter the OTP" phrase. Idempotent:
       only rewrites when the capitalised "Validate" is still present. */
    var otpSuccessSpan = document.querySelector("#success-alert-message .actionMessage li span");
    if (otpSuccessSpan) {
      var sm = otpSuccessSpan.textContent;
      if (sm.indexOf("Please enter the OTP") !== -1 && sm.indexOf("Validate") !== -1) {
        otpSuccessSpan.textContent = sm.replace(/Validate/g, "validate");
      }
    }

    /* ── One-time-only below (server error handling + done marker) ── */
    if (document.getElementById("mo-otp-done")) return;

    /* Mark done */
    var otpDone = document.createElement("span");
    otpDone.id = "mo-otp-done"; otpDone.style.display = "none";
    document.body.appendChild(otpDone);

    var isPageHasError = errorOnPage();
    if (isPageHasError) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      $('#otpToken').after(
        '<div id="mo-userlogin-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>'
      );
      $('input').addClass('border border-danger')
      /* Wrap the OTP input + add a red cross icon inside it */
      if (otpInput && !document.getElementById("mo-otp-icon")) {
        var otpWrap = document.createElement("div");
        otpWrap.style.position = "relative";
        otpWrap.style.display = "flex";
        otpWrap.style.alignItems = "center";
        otpInput.parentNode.insertBefore(otpWrap, otpInput);
        otpWrap.appendChild(otpInput);
        otpInput.classList.add("mo-input-error");
        var otpIcon = document.createElement("span");
        otpIcon.id = "mo-otp-icon";
        otpIcon.className = "mo-error-icon";
        otpIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
        otpWrap.appendChild(otpIcon);
      }
      /* Clear the error indicators once the user edits the OTP again */
      if (otpInput && !otpInput.dataset.moOtpClear) {
        otpInput.dataset.moOtpClear = "true";
        otpInput.addEventListener("input", function () {
          $('#mo-userlogin-error').remove();
          $('#mo-otp-icon').remove();
          $(this).removeClass('border border-danger mo-input-error');
        });
      }
      $('#error-alert-message').hide();
    }
    

  }

  /* ── CHANGE PASSWORD PAGE (/moas/idp/changepassword) ── */
  function applyChangePasswordPage() {
    if (!checkIsChangePass()) return;
    $('.col-xs-8.col-xs-offset-2').addClass('text-start');
    $('.form-group').addClass('text-start');
    $('br').remove();

    /* changeuserpassword endpoint only: override the card padding to 28px on
       all sides. An inline !important is required to beat the #mo-cp-css
       `#login-wrapper` rule (jQuery's .css() can't set !important). Guarded
       (only write when it differs) so the style mutation doesn't retrigger the
       observer loop. */
    if (window.location.pathname.toLowerCase().indexOf("changeuserpassword") !== -1) {
      var cupWrapper = document.getElementById("login-wrapper");
      if (cupWrapper && cupWrapper.style.padding !== "28px") {
        cupWrapper.style.setProperty("padding", "28px", "important");
      }

      /* #userform carries Bootstrap's .p-3 (padding:1rem!important), so zeroing
         it needs an inline !important too. Guarded against the NORMALIZED
         read-back ("0" comes back as "0px") so it doesn't loop the observer. */
      var cupForm = document.getElementById("userform");
      if (cupForm && cupForm.style.padding !== "0px") {
        cupForm.style.setProperty("padding", "0", "important");
      }
    }
    /* CSS — inject once */
    if (!document.getElementById("mo-cp-css")) {
      var cpCss =
        /* Page bg */
        "body,#login-body{background:#eef1f7!important;font-family:'Figtree',sans-serif!important;min-height:100vh!important;}" +
        "#login-header{display:none!important;}" +

        /* Card wrapper */
        "#login-wrapper{" +
        "background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "padding:28px 14px!important;max-width:560px!important;width:100%!important;" +
        "margin:40px auto!important;box-sizing:border-box!important;" +
        "}" +

        /* Title styling */
        "#login-wrapper .login-header{" +
        "display:flex!important;justify-content:space-between!important;align-items:center!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:24px!important;" +
        "font-weight:800!important;color:#000933!important;text-transform:uppercase!important;" +
        "letter-spacing:-.3px!important;margin-bottom:20px!important;text-align:left!important;" +
        "border:none!important;padding:0!important;" +
        "}" +

        /* Hide line separators and old alert box */
        "#login-wrapper hr,.password-padding{display:none!important;}" +

        /* Form stack */
        "#passwordform .row,#userform .row{margin:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;}" +
        "#passwordform .col-md-5,#passwordform .col-md-8,#passwordform .offset-md-1,#passwordform .offset-md-2," +
        "#userform .col-xs-5,#userform .col-xs-offset-1,#userform .col-xs-10,#userform .col-xs-offset-2{" +
        "width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;text-align:left!important;" +
        "}" +

        /* Style label/text above inputs */
        "#passwordform p.text-left,#userform span.align-items-left,#userform span.d-flex{" +
        "display:block!important;color:#3c515d!important;font-size:14px!important;" +
        "font-weight:700!important;font-family:'Figtree',sans-serif!important;" +
        "text-align:left!important;margin:0 0 6px 0!important;" +
        "}" +

        /* Password Wrapper for eye toggle */
        ".mo-pw-wrap{" +
        "position:relative!important;display:flex!important;align-items:center!important;width:100%!important;margin-bottom:16px!important;" +
        "}" +

        /* Style inputs */
        "#newPassword,#confirmPassword,#password,#userform input[type='password']{" +
        "height:40px!important;border:1px solid #C1CFD7;border-radius:4px!important;" +
        "padding:0 42px 0 12px!important;font-size:14px!important;font-family:'Figtree',sans-serif!important;" +
        "color:#000933!important;background:#fff!important;width:100%!important;" +
        "box-shadow:none!important;outline:none!important;box-sizing:border-box!important;" +
        "margin-bottom:0!important;display:block!important;" +
        "}" +
        "#newPassword:focus,#confirmPassword:focus,#password:focus,#userform input[type='password']:focus{" +
        "border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;" +
        "}" +

        /* Padding adjustment for error + eye toggle icons */
        ".mo-pw-wrap .mo-input-error{padding-right:64px!important;}" +
        "[dir='rtl'] .mo-pw-wrap .mo-input-error{padding-right:12px!important;padding-left:64px!important;}" +

        /* Submit button styling */
        "#validate,#submit{" +
        "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
        "gap:8px!important;min-height:40px!important;padding:8px 24px!important;" +
        "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;font-weight:700!important;letter-spacing:.6px!important;" +
        "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;" +
        "width:auto!important;margin:0!important;align-self:flex-start!important;" +
        "}" +
        "#validate,#submit{padding-right:46px!important;background-image:" + MO_ARROW_BG + "!important;" +
        "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;}" +
        "#validate:hover,#submit:hover{background-color:#0844b0!important;}" +

        /* Hide Go Back to Login link */
        "#passwordform a.btn-link,#back-link{display:none!important;}";

      var cpSt = document.createElement("style");
      cpSt.id = "mo-cp-css"; cpSt.textContent = cpCss;
      document.head.appendChild(cpSt);
      $('#login-body').addClass('d-flex justify-content-center align-items-center')
    }

    /* On the /updateuserpassword success screen, repoint the "Go back to
       login page" link to the broker login URL. Runs before the form check
       below (the success screen has no password form). */
    if (window.location.pathname.toLowerCase().indexOf("updateuserpassword") !== -1) {
      var cpBackLink = document.querySelector('a.btn-link[href="/login"]') || document.querySelector('a[href="/login"]');
      if (cpBackLink && cpBackLink.getAttribute("href") !== MO_URLS.dashboardRedirect) {
        cpBackLink.setAttribute("href", MO_URLS.dashboardRedirect);
      }
    }

    var fpForm = document.getElementById("passwordform") || document.getElementById("userform");
    if (!fpForm) return;

    var newPasswordInput = document.getElementById("newPassword") || fpForm.querySelector("input[name='password']");
    var confirmPasswordInput = document.getElementById("confirmPassword") || fpForm.querySelector("input[name='confirmPassword']");

    /* Update title to RESET PASSWORD with close x button */
    var h3 = document.querySelector(".login-header");
    if (h3) {
      var titleTextNode = null;
      for (var i = 0; i < h3.childNodes.length; i++) {
        var node = h3.childNodes[i];
        if (node.nodeType === 3) {
          titleTextNode = node;
          break;
        }
      }
      if (titleTextNode) {
        titleTextNode.nodeValue = tr("changepw.title");
      } else {
        h3.insertBefore(document.createTextNode(tr("changepw.title")), h3.firstChild);
      }
    }

    /* Add * to labels */
    var labelSelector = "#passwordform p.text-left, #userform span.align-items-left, #userform span.d-flex";
    document.querySelectorAll(labelSelector).forEach(function (p) {
      var t = p.textContent.trim();
      if (t.toLowerCase().indexOf("new password") !== -1 && !p.querySelector(".mo-req")) {
        p.innerHTML = tr("changepw.newpassword.label") + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
      } else if (t.toLowerCase().indexOf("confirm password") !== -1 && !p.querySelector(".mo-req")) {
        p.innerHTML = tr("changepw.confirmpassword.label") + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
      }
    });

    /* Deduplicate requirements list if Xecurify script duplicated them */
    var listcontent = document.getElementById("listcontent");
    if (listcontent) {
      var items = listcontent.querySelectorAll("li");
      var seen = {};
      items.forEach(function (li) {
        var txt = li.textContent.trim();
        if (!txt || seen[txt]) {
          li.remove();
        } else {
          seen[txt] = true;
        }
      });
    }

    /* Hardcoded password policy (kept in sync with the server policy manually).
       The displayed requirements and their live validation both use these. */
    var cpMin = 12, cpMax = 50, cpSymbols = "!@#$.%^&*-_";
    /* Consecutive-characters rule: N and the restricted fields shown on the
       (static, server-validated) consecutive line. */
    var cpConsecN = 2;
    var cpFields = ["username", "email", "firstname", "lastname"];
    var cpSymRegex = new RegExp("[" + cpSymbols.replace(/[\]\\^-]/g, "\\$&") + "]");

    /* Build the localized, comma-joined field list for the consecutive line. */
    var cpFieldNames = cpFields.map(function (f) { return tr("changepw.field." + f); });
    var cpFieldsStr = cpFieldNames.length === 1
      ? cpFieldNames[0]
      : cpFieldNames.slice(0, -1).join(", ") + " & " + cpFieldNames[cpFieldNames.length - 1];

    /* Move requirements block below new password input (above confirm password input) */
    var newPasswordCol = newPasswordInput ? newPasswordInput.closest("div") : null;
    var requirementsBlock = document.querySelector(".password-padding");
    if (newPasswordCol && requirementsBlock && requirementsBlock.previousSibling !== newPasswordCol) {
      newPasswordCol.parentNode.insertBefore(requirementsBlock, newPasswordCol.nextSibling);
    }

    /* Wrap new password in .mo-pw-wrap for eye toggle */
    if (newPasswordInput && !newPasswordInput.parentNode.classList.contains("mo-pw-wrap")) {
      var wrap = document.createElement("div");
      wrap.className = "mo-pw-wrap";
      newPasswordInput.parentNode.insertBefore(wrap, newPasswordInput);
      wrap.appendChild(newPasswordInput);
      newPasswordInput.setAttribute("placeholder", tr("password.field.placeholder"));

      // Append eye toggle
      var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
      eyeBtn.setAttribute("aria-label", "Toggle password visibility");
      eyeBtn.innerHTML = EYE_OFF;
      eyeBtn.addEventListener("click", function () {
        var show = newPasswordInput.type === "password";
        newPasswordInput.type = show ? "text" : "password";
        this.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);
    }

    /* Wrap confirm password in .mo-pw-wrap for eye toggle */
    if (confirmPasswordInput && !confirmPasswordInput.parentNode.classList.contains("mo-pw-wrap")) {
      var wrap = document.createElement("div");
      wrap.className = "mo-pw-wrap";
      confirmPasswordInput.parentNode.insertBefore(wrap, confirmPasswordInput);
      wrap.appendChild(confirmPasswordInput);
      confirmPasswordInput.setAttribute("placeholder", tr("password.field.placeholder"));

      // Append eye toggle
      var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
      eyeBtn.setAttribute("aria-label", "Toggle password visibility");
      eyeBtn.innerHTML = EYE_OFF;
      eyeBtn.addEventListener("click", function () {
        var show = confirmPasswordInput.type === "password";
        confirmPasswordInput.type = show ? "text" : "password";
        this.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);
    }

    /* Helper text and Error message injection */
    var newPasswordWrap = newPasswordInput ? newPasswordInput.closest(".mo-pw-wrap") : null;
    if (newPasswordWrap && !document.getElementById("mo-cp-helper-text")) {
      // Error text container
      var errorText = document.createElement("p");
      errorText.id = "mo-cp-error-text";
      errorText.className = "text-danger pb-2";
      errorText.style.fontSize = "12px";
      errorText.style.marginTop = "-10px";
      errorText.style.marginBottom = "8px";
      errorText.style.display = "none";

      // Helper text — rendered as a bulleted requirements list
      var helper = document.createElement("ul");
      helper.id = "mo-cp-helper-text";
      helper.style.fontFamily = "'Figtree', sans-serif";
      helper.style.fontSize = "12px";
      helper.style.fontWeight = "400";
      helper.style.color = "#506C7C";
      helper.style.lineHeight = "1.6";
      helper.style.marginTop = "-6px";
      helper.style.marginBottom = "16px";
      helper.style.paddingLeft = "0";
      helper.style.listStyle = "none";
      helper.style.textAlign = "left";
      helper.style.display = "block";
      /* Fixed 5-line list. `check` is the live-validation type used by
         updateMoReqList; "static" rows (consecutive) always show a plain dot
         since first name / last name / username / email aren't available
         client-side. Numbers/symbols/fields come from the parsed server policy. */
      var moReqDefs = [
        { key: "changepw.req.length", check: "length" },
        { key: "changepw.req.uppercase", check: "uppercase" },
        { key: "changepw.req.number", check: "number" },
        { key: "changepw.req.symbol", check: "symbol" }
      ];
      moReqDefs.forEach(function (def) {
        var li = document.createElement("li");
        li.dataset.req = def.check;
        li.style.display = "flex";
        li.style.alignItems = "flex-start";
        li.style.gap = "6px";
        var marker = document.createElement("span");
        marker.className = "mo-req-marker";
        marker.style.flexShrink = "0";
        marker.style.width = "14px";
        marker.style.textAlign = "center";
        marker.style.fontWeight = "700";
        marker.style.lineHeight = "1.6";
        var txt = document.createElement("span");
        /* Fill placeholders with the real parsed policy values. Use function
           replacements so a "$" in the symbol set isn't treated as a $-pattern. */
        var label = tr(def.key)
          .replace("{min}", function () { return cpMin; })
          .replace("{max}", function () { return cpMax; })
          .replace("{symbols}", function () { return cpSymbols; })
          .replace("{n}", function () { return cpConsecN; })
          .replace("{fields}", function () { return cpFieldsStr; });
        txt.textContent = label;
        li.appendChild(marker);
        li.appendChild(txt);
        helper.appendChild(li);
      });

      newPasswordWrap.parentNode.insertBefore(errorText, newPasswordWrap.nextSibling);
      newPasswordWrap.parentNode.insertBefore(helper, newPasswordWrap.nextSibling);

      /* Password strength meter (below the policy list) */
      var strengthBox = document.createElement("div");
      strengthBox.id = "mo-cp-strength";
      strengthBox.style.margin = "4px 0 16px";
      strengthBox.style.display = "none";
      var track = document.createElement("div");
      track.style.height = "6px";
      track.style.background = "#e0e7ef";
      track.style.borderRadius = "4px";
      track.style.overflow = "hidden";
      var fill = document.createElement("div");
      fill.className = "mo-strength-fill";
      fill.style.height = "100%";
      fill.style.width = "0";
      fill.style.background = "#ef2f2f";
      fill.style.transition = "width .2s, background .2s";
      track.appendChild(fill);
      var slabel = document.createElement("div");
      slabel.className = "mo-strength-label";
      slabel.style.fontFamily = "'Figtree', sans-serif";
      slabel.style.fontSize = "12px";
      slabel.style.fontWeight = "600";
      slabel.style.marginTop = "6px";
      strengthBox.appendChild(track);
      strengthBox.appendChild(slabel);
      helper.parentNode.insertBefore(strengthBox, helper.nextSibling);
    }

    /* Dynamic Validation Function (keeps list updated behind the scenes for validation checks) */
    function updatePasswordRequirementsAndStrength() {
      if (!newPasswordInput) return;
      var val = newPasswordInput.value || "";

      var listItems = document.querySelectorAll("#listcontent li");
      listItems.forEach(function (li) {
        var txt = li.textContent.trim().toLowerCase();
        var isValid = false;

        if (txt.indexOf("minimum") !== -1 || txt.indexOf("characters") !== -1) {
          var minMatch = txt.match(/minimum\s+(\d+)/) || txt.match(/(\d+)-(\d+)\s+characters/);
          if (minMatch) {
            var minLen = parseInt(minMatch[1], 10);
            if (val.length >= minLen) isValid = true;
          } else {
            if (val.length >= 6) isValid = true;
          }
        } else if (txt.indexOf("maximum") !== -1) {
          var maxMatch = txt.match(/maximum\s+(\d+)/);
          if (maxMatch) {
            var maxLen = parseInt(maxMatch[1], 10);
            if (val.length <= maxLen && val.length > 0) isValid = true;
          } else {
            if (val.length <= 20 && val.length > 0) isValid = true;
          }
        } else if (txt.indexOf("uppercase") !== -1) {
          if (/[A-Z]/.test(val)) isValid = true;
        } else if (txt.indexOf("lowercase") !== -1) {
          if (/[a-z]/.test(val)) isValid = true;
        } else if (txt.indexOf("number") !== -1 || txt.indexOf("digit") !== -1) {
          if (/[0-9]/.test(val)) isValid = true;
        } else if (txt.indexOf("symbol") !== -1 || txt.indexOf("special") !== -1 || txt.indexOf("allowed symbols") !== -1) {
          if (/[!@#\$%\^&\*\-_\.]/.test(val)) isValid = true;
        } else {
          if (val.length > 0) isValid = true;
        }

        if (isValid) {
          li.classList.add("mo-valid");
          li.classList.remove("mo-invalid");
        } else {
          li.classList.add("mo-invalid");
          li.classList.remove("mo-valid");
        }
      });
    }

    /* Live green-tick / red-cross on our visible requirements list.
       Empty field -> no marker on the live-checkable rules. The consecutive
       rule always shows a plain dot (we don't have the name/email data
       client-side, so it's validated server-side). */
    function updateMoReqList(val) {
      var list = document.getElementById("mo-cp-helper-text");
      if (!list) return;
      var checks = {
        "length": val.length >= cpMin && val.length <= cpMax,
        "number": /[0-9]/.test(val),
        "uppercase": /[A-Z]/.test(val),
        "symbol": cpSymRegex.test(val)
      };
      list.querySelectorAll("li[data-req]").forEach(function (li) {
        var key = li.dataset.req;
        var marker = li.querySelector(".mo-req-marker");
        if (!marker) return;
        var state;
        if (!(key in checks)) state = "dot";      /* name/email -> plain dot */
        else if (!val) state = "empty";           /* empty field -> no marker */
        else state = checks[key] ? "ok" : "bad";
        /* Only touch the DOM when the state actually changes — otherwise the
           textContent/style writes retrigger the observer and loop. */
        if (marker.dataset.state === state) return;
        marker.dataset.state = state;
        if (state === "dot") { marker.textContent = "•"; marker.style.color = "#506C7C"; li.style.color = ""; }
        else if (state === "empty") { marker.textContent = ""; marker.style.color = ""; li.style.color = ""; }
        else if (state === "ok") { marker.textContent = "✔"; marker.style.color = "#1b8f3a"; li.style.color = "#1b8f3a"; }  /* satisfied -> green text */
        else { marker.textContent = "○"; marker.style.color = "#506C7C"; li.style.color = ""; }  /* not satisfied -> hollow dot */
      });
    }

    /* Password strength score (0-100) — graduated by composition, not just
       "all rules met": rewards length tiers, mixed case, multiple digits and
       multiple special characters. */
    function calcStrength(v) {
      if (!v) return 0;
      var score = 0;
      if (v.length >= 8) score += 30;
      if (v.length >= 12) score += 10;
      if (v.length >= 16) score += 10;
      if (/[a-z]/.test(v)) score += 10;   /* lowercase */
      if (/[A-Z]/.test(v)) score += 15;   /* uppercase */
      if (/[0-9]/.test(v)) score += 15;   /* digit */
      if (/[!@#$.%^&*_-]/.test(v)) score += 20;   /* symbol */
      return Math.min(score, 100);
    }

    function updateStrength(val) {
      var box = document.getElementById("mo-cp-strength");
      if (!box) return;
      var score = calcStrength(val);
      /* Guard on score so observer ticks with the same value don't rewrite
         style/text (which would retrigger the observer and loop). */
      if (box.dataset.score === String(score)) return;
      box.dataset.score = String(score);
      var fill = box.querySelector(".mo-strength-fill");
      var label = box.querySelector(".mo-strength-label");
      if (!val) { box.style.display = "none"; return; }
      box.style.display = "block";
      var tier, color;
      if (score < 30) { tier = tr("changepw.strength.weak"); color = "#ef2f2f"; }
      else if (score < 55) { tier = tr("changepw.strength.fair"); color = "#f59e0b"; }
      else if (score < 75) { tier = tr("changepw.strength.good"); color = "#0A55D7"; }
      else { tier = tr("changepw.strength.strong"); color = "#1b8f3a"; }
      if (fill) { fill.style.width = score + "%"; fill.style.background = color; }
      if (label) { label.textContent = tr("changepw.strength.label") + ": " + tier; label.style.color = color; }
    }

    /* Bind events for dynamic updates */
    if (newPasswordInput && !newPasswordInput.dataset.moListener) {
      newPasswordInput.dataset.moListener = "true";
      newPasswordInput.addEventListener("input", updatePasswordRequirementsAndStrength);
      newPasswordInput.addEventListener("input", clearCpError);
      newPasswordInput.addEventListener("input", function () {
        updateMoReqList(newPasswordInput.value || "");
        updateStrength(newPasswordInput.value || "");
      });
      updatePasswordRequirementsAndStrength();
    }
    /* Initial paint (handles dots + empty-state, runs even if listeners
       were already bound on a previous call) */
    updateMoReqList(newPasswordInput ? (newPasswordInput.value || "") : "");
    updateStrength(newPasswordInput ? (newPasswordInput.value || "") : "");
    if (confirmPasswordInput && !confirmPasswordInput.dataset.moListener) {
      confirmPasswordInput.dataset.moListener = "true";
      confirmPasswordInput.addEventListener("input", clearCpError);
    }

    /* Update button text to NEXT → */
    var saveBtn = document.getElementById("validate") || document.getElementById("submit");
    setBtnArrowLabel(saveBtn, tr("next.button"));

    /* Disable native HTML5 validation bubbles/hovers */
    var form = document.getElementById("passwordform") || document.getElementById("userform");
    if (form) {
      form.setAttribute("novalidate", "true");
    }
    if (newPasswordInput) {
      newPasswordInput.removeAttribute("title");
    }
    if (confirmPasswordInput) {
      confirmPasswordInput.removeAttribute("title");
    }

    /* Hide original error container #pwd_strength */
    var pwdStrengthDiv = document.getElementById("pwd_strength");
    if (pwdStrengthDiv) {
      pwdStrengthDiv.style.display = "none";
    }

    /* Error UI helper functions */
    function showCpError(msg) {
      var errEl = document.getElementById("mo-cp-error-text");
      var helpEl = document.getElementById("mo-cp-helper-text");
      
      // Highlight inputs
      if (newPasswordInput) newPasswordInput.classList.add("mo-input-error");
      if (confirmPasswordInput) confirmPasswordInput.classList.add("mo-input-error");

      // Add red cross icons inside wraps if not already present
      [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
        if (inp) {
          var wrap = inp.closest(".mo-pw-wrap");
          if (wrap && !wrap.querySelector(".mo-error-icon")) {
            var icon = document.createElement("span");
            icon.className = "mo-error-icon";
            icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
            wrap.appendChild(icon);
          }
        }
      });

      // Show message. Hide the policy checklist ONLY for the mismatch error;
      // keep it visible for "required"/"requirements" so the user can still
      // see which rule is unmet.
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = "block";
      }
      if (helpEl) {
        helpEl.style.display = (msg === tr("changepw.error.mismatch")) ? "none" : "block";
      }
      /* Mismatch also hides the strength meter; other errors leave it as-is
         (updateStrength manages its own visibility from the field value). */
      if (msg === tr("changepw.error.mismatch")) $('#mo-cp-strength').hide();
    }

    function clearCpError() {
      var errEl = document.getElementById("mo-cp-error-text");
      var helpEl = document.getElementById("mo-cp-helper-text");

      // Remove highlighting
      if (newPasswordInput) newPasswordInput.classList.remove("mo-input-error", "border", "border-danger");
      if (confirmPasswordInput) confirmPasswordInput.classList.remove("mo-input-error", "border", "border-danger");

      // Remove red cross icons
      document.querySelectorAll(".mo-pw-wrap .mo-error-icon").forEach(function (ico) {
        ico.remove();
      });

      // Remove the server-rendered error message and prevent the observer
      // from re-inserting it (set a dismissed flag once the user edits)
      var serverErr = document.getElementById("mo-cp-server-error");
      if (serverErr) serverErr.remove();
      if (fpForm) fpForm.dataset.moServerErrDismissed = "true";

      // Hide message and show helper text
      if (errEl) {
        errEl.textContent = "";
        errEl.style.display = "none";
      }
      if (helpEl) {
        helpEl.style.display = "block";
      }
    }

    /* Bind custom validation on submit to show neat errors instead of bubbles */
    if (form && !form.dataset.moValidationBound) {
      form.dataset.moValidationBound = "true";
      form.addEventListener("submit", function (e) {
        clearCpError();
        var val = newPasswordInput ? newPasswordInput.value : "";
        var confirmVal = confirmPasswordInput ? confirmPasswordInput.value : "";

        if (!val) {
          e.preventDefault();
          showCpError(tr("changepw.error.required"));
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        /* Re-evaluate the VISIBLE requirement list and block only if a shown,
           client-checkable rule is unmet — keeps the gate in sync with the
           green/red ticks the user actually sees (PII rules show a dot and are
           validated server-side, so they never block here). */
        updateMoReqList(val);
        var unmet = false;
        document.querySelectorAll("#mo-cp-helper-text li[data-req] .mo-req-marker").forEach(function (m) {
          if (m.dataset.state === "bad") unmet = true;
        });
        if (unmet) {
          e.preventDefault();
          showCpError(tr("changepw.error.requirements"));
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        if (val !== confirmVal) {
          e.preventDefault();
          showCpError(tr("changepw.error.mismatch"));
          if (confirmPasswordInput) confirmPasswordInput.focus();
          return;
        }
      });
    }

    /* ── PASSWORD MATCH CHECK (blur on confirm) ── */
    function bindPasswordMatchCheck() {
      if (!newPasswordInput || !confirmPasswordInput) return;
      if (confirmPasswordInput.dataset.moMatchListener) return;
      confirmPasswordInput.dataset.moMatchListener = "true";

      var MATCH_CROSS = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';

      function checkMatch() {
        var newVal = newPasswordInput.value;
        var confirmVal = confirmPasswordInput.value;
        if (confirmVal && newVal !== confirmVal) {
          $(newPasswordInput).addClass("border border-danger");
          $(confirmPasswordInput).addClass("border border-danger");
          /* Red cross icon inside each field (same as requirement error) */
          [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
            inp.classList.add("mo-input-error");
            var w = inp.closest(".mo-pw-wrap");
            if (w && !w.querySelector(".mo-error-icon")) {
              var icon = document.createElement("span");
              icon.className = "mo-error-icon";
              icon.innerHTML = MATCH_CROSS;
              w.appendChild(icon);
            }
          });
          if (!document.getElementById("mo-match-error")) {
            var $newWrap = $('[name="password"]').closest(".mo-pw-wrap");
            ($newWrap.length ? $newWrap : $('[name="password"]'))
              .after('<p id="mo-match-error" class="text-danger pb-2" style="font-size:12px;margin-top:-10px;margin-bottom:8px;">' + tr("changepw.error.mismatch") + '</p>');
          }
          /* Hide the password-policy checklist + strength meter while the
             mismatch is shown */
          $('#mo-cp-helper-text').hide();
          $('#mo-cp-strength').hide();
        } else {
          $(newPasswordInput).removeClass("border border-danger");
          $(confirmPasswordInput).removeClass("border border-danger");
          /* Remove the red cross icons */
          [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
            inp.classList.remove("mo-input-error");
            var w = inp.closest(".mo-pw-wrap");
            if (w) {
              var ic = w.querySelector(".mo-error-icon");
              if (ic) ic.remove();
            }
          });
          $("#mo-match-error").remove();
          /* Mismatch cleared -> restore the checklist + strength meter
             (recompute so an empty field stays hidden). */
          $('#mo-cp-helper-text').show();
          var sBox = document.getElementById("mo-cp-strength");
          if (sBox) sBox.dataset.score = "";
          updateStrength(newPasswordInput.value || "");
        }
      }

      $(confirmPasswordInput).on("blur", checkMatch);

      /* As soon as the user types again, hide the "passwords don't match"
         error and its indicators (re-checked on the next blur). */
      $(newPasswordInput).add(confirmPasswordInput).on("input", function () {
        if (!document.getElementById("mo-match-error") && !$(confirmPasswordInput).hasClass("border-danger")) return;
        $(newPasswordInput).removeClass("border border-danger");
        $(confirmPasswordInput).removeClass("border border-danger");
        [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
          inp.classList.remove("mo-input-error");
          var w = inp.closest(".mo-pw-wrap");
          if (w) { var ic = w.querySelector(".mo-error-icon"); if (ic) ic.remove(); }
        });
        $("#mo-match-error").remove();
        /* Restore the checklist + strength meter that the mismatch hid
           (recompute so an empty field stays hidden). */
        $('#mo-cp-helper-text').show();
        var sBox = document.getElementById("mo-cp-strength");
        if (sBox) sBox.dataset.score = "";
        updateStrength(newPasswordInput.value || "");
      });
    }
    bindPasswordMatchCheck();

    /* Server-rendered error banner -> show below the new password field.
       Guarded by #mo-cp-server-error so it appends ONCE (otherwise the
       observer re-runs this block and stacks duplicate messages). */
    var isPageHasError = errorOnPage();
    if (isPageHasError && !document.getElementById("mo-cp-server-error") && !(fpForm && fpForm.dataset.moServerErrDismissed)) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      /* The server returns the full password policy string when the password
         fails the policy (e.g. contains the user's name/email). We validate
         all those rules manually, so collapse this one case into a short msg. */
      if (/should be present|should not be present/i.test(message)) {
        message = "Password requirement not matched";
      }
      var $cpWrap = $('.mo-pw-wrap');
      var cpErrHtml = '<p id="mo-cp-server-error" class="text-danger pb-2" style="font-size:12px;margin-top:-10px;margin-bottom:8px;">' + message + '</p>';
      if ($cpWrap.length) {
        $cpWrap.eq(0).after(cpErrHtml);
      } else {
        $(newPasswordInput).after(cpErrHtml);
      }
      /* Highlight both fields with red border + cross icon */
      var CP_CROSS = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
      [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
        if (!inp) return;
        $(inp).addClass("border border-danger mo-input-error");
        var w = inp.closest(".mo-pw-wrap");
        if (w && !w.querySelector(".mo-error-icon")) {
          var icon = document.createElement("span");
          icon.className = "mo-error-icon";
          icon.innerHTML = CP_CROSS;
          w.appendChild(icon);
        }
      });
      $('#error-alert-message').hide();
    }

  }

  /* ── MAIN RUN ── */
  function run() {
    if (checkIsLogout()) { applyLogoutPage(); return; }

    /* getLocale() below already captures ?request_locale from the URL on the
       openidsso page too, and that page renders the normal login form — so we
       let it fall through to the login styling instead of short-circuiting. */
    getLocale();

    var isLogin = checkIsLogin();
    var isRedirectToIdpLogin = checkIsRedirectToIdpLogin();
    var isForgot = checkIsForgot();
    var isOtp = checkIsOtp();
    var isChangePass = checkIsChangePass();
    var isEnduserDashboard = checkIsEnduserDashboard();
    var isPasswordSentMessage = checkIsPasswordSentMessage();

    if (!isLogin && !isRedirectToIdpLogin && !isForgot && !isOtp && !isChangePass && !isEnduserDashboard && !isPasswordSentMessage) return;

    var isPageHasError = errorOnPage();
    if (isPageHasError) { console.log("this page has errir"); }

    injectFontAndCss();

    /* The redirecttoidplogin page also matches checkIsLogin() (it has
       #idploginform), so exclude it here — it has its own handler below.
       Otherwise both flows run and each appends its own error message. */
    if (isLogin && !isRedirectToIdpLogin) {
      applyEmailStep();
      applyPasswordStep();
      handleLoginErrors();
      forceHide();

      /* Hide original forgot/create link wrappers — skip our custom #mo-forgot */
      document.querySelectorAll("a[href*='forgotpassword'],a[href*='resetpassword'],a[href*='businessfreetrial']").forEach(function (a) {
        if (a.id === "mo-forgot") return;
        var c = a.closest(".col-auto");
        if (c) c.style.setProperty("display", "none", "important");
        else a.style.setProperty("display", "none", "important");
      });

      var wrapper = document.getElementById("login-wrapper");
      if (wrapper) wrapper.querySelectorAll("hr,br").forEach(function (el) { el.style.display = "none"; });
    }

    if (isRedirectToIdpLogin) { applyRedirectToIdpLogin(); }
    if (isForgot) { applyForgotPage(); }
    if (isOtp)    { applyOtpPage(); }
    if (isChangePass) { applyChangePasswordPage(); }
    if (isEnduserDashboard) { applyEnduserDashboard(); }
    if (isPasswordSentMessage) { applyPasswordSentMessage(); }
  }

  /* ── TIMING ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else { run(); }
  setTimeout(run, 300);
  setTimeout(run, 800);
  setTimeout(run, 1500);

  /* ── OBSERVER ── */
  var observer = new MutationObserver(function () {
    var isLogin = checkIsLogin();
    var isRedirectToIdpLogin = checkIsRedirectToIdpLogin();
    var isForgot = checkIsForgot();
    var isOtp = checkIsOtp();
    var isChangePass = checkIsChangePass();

    if (isLogin && !isRedirectToIdpLogin) { forceHide(); applyPasswordStep(); handleLoginErrors(); }
    if (isRedirectToIdpLogin) { applyRedirectToIdpLogin(); }
    if (isForgot) { applyForgotPage(); }
    if (isOtp)    { applyOtpPage(); }
    if (isChangePass) { applyChangePasswordPage(); }
    if (checkIsEnduserDashboard()) { applyEnduserDashboard(); }
    if (checkIsPasswordSentMessage()) { applyPasswordSentMessage(); }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"]
  });

  /* miniOrange can set <html lang> AFTER our timed ticks on a cold load. Since
     the /openidsso 302 stops our JS from ever seeing ?request_locale, that
     attribute is the only locale carrier here — re-resolve and re-render the
     moment it appears/changes so a late "it" corrects the English first paint.
     Watches documentElement (not body), which the observer above never sees. */
  var htmlLangObserver = new MutationObserver(function () { run(); });
  htmlLangObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

}());
