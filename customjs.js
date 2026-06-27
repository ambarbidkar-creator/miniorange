(function () {
  "use strict";

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

  /* ── LOGOUT PAGE: auto-redirect ── */
  function applyLogoutPage() {
    if (!checkIsLogout()) return;
    window.location.replace("https://dev.account.bouwmaat.nl/account/logout?returnTo=https://dev.bouwmaat.nl/account/logout");
  }

  /* ── ENDUSER DASHBOARD PAGE (/moas/enduserwelcome) ── */
  function applyEnduserDashboard() {
    if (!checkIsEnduserDashboard()) return;
    window.location.replace("https://store.xecurify.com/moas/broker/login/shopify/dev.bouwmaat.nl/account?idpname=custom_oauth_Hhc&redirect_endpoint=/usersession");
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
    lk.href = "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap";
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

      /* Logo — hidden */
      "#login-header{display:none!important;}" +

      /* Card */
      "#login-wrapper{" +
      "background:#fff!important;border:1px solid #e0e7ef!important;" +
      "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
      "padding:20px 15px!important;max-width:560px!important;margin:0 auto!important;" +
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

      /* LOG IN heading — top LEFT */
      "#mo-title{display:block;font-family:'Figtree',sans-serif;font-size:26px;font-weight:800;" +
      "color:#0d1b2a;margin-bottom:22px;text-align:left;}" +

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
      "}" +
      "#loginbutton:hover{background:#0844b0!important;background-color:#0844b0!important;}" +
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
      ".mo-error-icon { position: absolute; right: 12px; display: flex; align-items: center; pointer-events: none; color: #ef2f2f; }" +
      ".mo-error-icon svg { width: 18px; height: 18px; fill: currentColor; }" +
      ".mo-input-error { padding-right: 40px!important; }" +
      "[dir='rtl'] .mo-error-icon { right: auto!important; left: 12px!important; }" +
      "[dir='rtl'] .mo-input-error { padding-right: 12px!important; padding-left: 40px!important; }" +
      ".mo-pw-wrap .mo-error-icon { right: 36px!important; }" +
      "[dir='rtl'] .mo-pw-wrap .mo-error-icon { right: auto!important; left: 36px!important; }";

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

  function getUrlParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function getLocale() {
    var lang = getUrlParam("request_locale");
    if (!lang) {
      var sel = document.getElementById("languageSelect");
      if (sel) lang = sel.value;
    }
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
      "email.field.placeholder": "Email",
      "email.field.label": "Email address",
      "password.field.label": "Password",
      "password.field.placeholder": "Password",
      "forgot.password.link": "Forgot password",
      "reset.password": "RESET PASSWORD",
      "reset.password.subtext": "We will send you an email with instructions on how to recover it",
      "forgot.page.helper": "Not receiving an email to reset your password? Then the e-mail address used is not known to us. Can’t figure it out?",
      "forgot.page.helper.link": "Contact customer service",
      "next.button": "NEXT",
      "otp.page.title": "VERIFY YOUR IDENTITY",
      "otp.field.label": "Enter OTP here",
      "otp.field.placeholder": "OTP number",
      "otp.verify.button": "VERIFY",
      "otp.cancel.button": "CANCEL",
      "changepw.newpassword.label": "New password",
      "changepw.confirmpassword.label": "Confirm password",
      "changepw.req.min": "Minimum 8 characters should be present",
      "changepw.req.max": "Maximum 50 characters should be present",
      "changepw.req.number": "1 number character should be present",
      "changepw.req.uppercase": "1 uppercase character should be present",
      "changepw.req.symbol": "At least one of the following symbols !@#$.%^&*-_ should be present",
      "changepw.req.firstname": "More than 2 characters of FirstName should not be present",
      "changepw.req.lastname": "More than 2 characters of LastName should not be present",
      "changepw.req.username": "More than 2 characters of Username should not be present",
      "changepw.req.email": "More than 2 characters of Email should not be present.",
      "changepw.error.required": "New password is required.",
      "changepw.error.requirements": "Please satisfy all password requirements.",
      "changepw.error.mismatch": "The password don't match. Please try again"
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
      "changepw.newpassword.label": "Neues Passwort",
      "changepw.confirmpassword.label": "Passwort bestätigen",
      "changepw.req.min": "Mindestens 8 Zeichen müssen vorhanden sein",
      "changepw.req.max": "Maximal 50 Zeichen dürfen vorhanden sein",
      "changepw.req.number": "1 Ziffer muss vorhanden sein",
      "changepw.req.uppercase": "1 Großbuchstabe muss vorhanden sein",
      "changepw.req.symbol": "Mindestens eines der folgenden Symbole !@#$.%^&*-_ muss vorhanden sein",
      "changepw.req.firstname": "Nicht mehr als 2 Zeichen des Vornamens dürfen vorhanden sein",
      "changepw.req.lastname": "Nicht mehr als 2 Zeichen des Nachnamens dürfen vorhanden sein",
      "changepw.req.username": "Nicht mehr als 2 Zeichen des Benutzernamens dürfen vorhanden sein",
      "changepw.req.email": "Nicht mehr als 2 Zeichen der E-Mail dürfen vorhanden sein.",
      "changepw.error.required": "Neues Passwort ist erforderlich.",
      "changepw.error.requirements": "Bitte erfüllen Sie alle Passwortanforderungen.",
      "changepw.error.mismatch": "Die Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut."
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
      "changepw.newpassword.label": "Nuova password",
      "changepw.confirmpassword.label": "Conferma password",
      "changepw.req.min": "Devono essere presenti almeno 8 caratteri",
      "changepw.req.max": "Devono essere presenti al massimo 50 caratteri",
      "changepw.req.number": "Deve essere presente 1 numero",
      "changepw.req.uppercase": "Deve essere presente 1 lettera maiuscola",
      "changepw.req.symbol": "Deve essere presente almeno uno dei seguenti simboli !@#$.%^&*-_",
      "changepw.req.firstname": "Non devono essere presenti più di 2 caratteri del nome",
      "changepw.req.lastname": "Non devono essere presenti più di 2 caratteri del cognome",
      "changepw.req.username": "Non devono essere presenti più di 2 caratteri del nome utente",
      "changepw.req.email": "Non devono essere presenti più di 2 caratteri dell'email.",
      "changepw.error.required": "La nuova password è obbligatoria.",
      "changepw.error.requirements": "Soddisfa tutti i requisiti della password.",
      "changepw.error.mismatch": "Le password non corrispondono. Riprova."
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
      "changepw.newpassword.label": "كلمة المرور الجديدة",
      "changepw.confirmpassword.label": "تأكيد كلمة المرور",
      "changepw.req.min": "يجب أن يحتوي على 8 أحرف على الأقل",
      "changepw.req.max": "يجب ألا يزيد عن 50 حرفًا",
      "changepw.req.number": "يجب أن يحتوي على رقم واحد",
      "changepw.req.uppercase": "يجب أن يحتوي على حرف كبير واحد",
      "changepw.req.symbol": "يجب أن يحتوي على أحد الرموز التالية على الأقل !@#$.%^&*-_",
      "changepw.req.firstname": "يجب ألا يحتوي على أكثر من حرفين من الاسم الأول",
      "changepw.req.lastname": "يجب ألا يحتوي على أكثر من حرفين من اسم العائلة",
      "changepw.req.username": "يجب ألا يحتوي على أكثر من حرفين من اسم المستخدم",
      "changepw.req.email": "يجب ألا يحتوي على أكثر من حرفين من البريد الإلكتروني.",
      "changepw.error.required": "كلمة المرور الجديدة مطلوبة.",
      "changepw.error.requirements": "يرجى استيفاء جميع متطلبات كلمة المرور.",
      "changepw.error.mismatch": "كلمتا المرور غير متطابقتين. يرجى المحاولة مرة أخرى."
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
      "changepw.newpassword.label": "Nova senha",
      "changepw.confirmpassword.label": "Confirmar senha",
      "changepw.req.min": "Devem estar presentes no mínimo 8 caracteres",
      "changepw.req.max": "Devem estar presentes no máximo 50 caracteres",
      "changepw.req.number": "Deve estar presente 1 número",
      "changepw.req.uppercase": "Deve estar presente 1 letra maiúscula",
      "changepw.req.symbol": "Deve estar presente pelo menos um dos seguintes símbolos !@#$.%^&*-_",
      "changepw.req.firstname": "Não devem estar presentes mais de 2 caracteres do nome",
      "changepw.req.lastname": "Não devem estar presentes mais de 2 caracteres do sobrenome",
      "changepw.req.username": "Não devem estar presentes mais de 2 caracteres do nome de usuário",
      "changepw.req.email": "Não devem estar presentes mais de 2 caracteres do e-mail.",
      "changepw.error.required": "A nova senha é obrigatória.",
      "changepw.error.requirements": "Atenda a todos os requisitos da senha.",
      "changepw.error.mismatch": "As senhas não coincidem. Tente novamente."
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
      "changepw.newpassword.label": "Nueva contraseña",
      "changepw.confirmpassword.label": "Confirmar contraseña",
      "changepw.req.min": "Debe haber al menos 8 caracteres",
      "changepw.req.max": "Debe haber como máximo 50 caracteres",
      "changepw.req.number": "Debe haber 1 número",
      "changepw.req.uppercase": "Debe haber 1 letra mayúscula",
      "changepw.req.symbol": "Debe haber al menos uno de los siguientes símbolos !@#$.%^&*-_",
      "changepw.req.firstname": "No debe haber más de 2 caracteres del nombre",
      "changepw.req.lastname": "No debe haber más de 2 caracteres del apellido",
      "changepw.req.username": "No debe haber más de 2 caracteres del nombre de usuario",
      "changepw.req.email": "No debe haber más de 2 caracteres del correo electrónico.",
      "changepw.error.required": "La nueva contraseña es obligatoria.",
      "changepw.error.requirements": "Cumpla con todos los requisitos de la contraseña.",
      "changepw.error.mismatch": "Las contraseñas no coinciden. Inténtelo de nuevo."
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
      "forgot.page.helper": "Vous ne recevez pas d'e-mail pour réinitialiser votre mot de passe ? Alors l'adresse e-mail utilisée ne nous est pas connue. Vous ne trouvez pas ?",
      "forgot.page.helper.link": "Contacter le service client",
      "next.button": "SUIVANT",
      "otp.page.title": "VÉRIFIEZ VOTRE IDENTITÉ",
      "otp.field.label": "Saisissez l'OTP ici",
      "otp.field.placeholder": "Numéro OTP",
      "otp.verify.button": "VÉRIFIER",
      "otp.cancel.button": "ANNULER",
      "changepw.newpassword.label": "Nouveau mot de passe",
      "changepw.confirmpassword.label": "Confirmer le mot de passe",
      "changepw.req.min": "Au moins 8 caractères doivent être présents",
      "changepw.req.max": "Au maximum 50 caractères doivent être présents",
      "changepw.req.number": "1 chiffre doit être présent",
      "changepw.req.uppercase": "1 lettre majuscule doit être présente",
      "changepw.req.symbol": "Au moins l'un des symboles suivants !@#$.%^&*-_ doit être présent",
      "changepw.req.firstname": "Pas plus de 2 caractères du prénom ne doivent être présents",
      "changepw.req.lastname": "Pas plus de 2 caractères du nom de famille ne doivent être présents",
      "changepw.req.username": "Pas plus de 2 caractères du nom d'utilisateur ne doivent être présents",
      "changepw.req.email": "Pas plus de 2 caractères de l'e-mail ne doivent être présents.",
      "changepw.error.required": "Le nouveau mot de passe est requis.",
      "changepw.error.requirements": "Veuillez satisfaire à toutes les exigences du mot de passe.",
      "changepw.error.mismatch": "Les mots de passe ne correspondent pas. Veuillez réessayer."
    },
    nl: {
      "login.page.title": "INLOGGEN",
      "login.page.button": "INLOGGEN",
      "email.field.placeholder": "E-mail",
      "email.field.label": "E-mailadres",
      "password.field.label": "Wachtwoord",
      "password.field.placeholder": "Wachtwoord",
      "forgot.password.link": "Wachtwoord vergeten",
      "reset.password": "WACHTWOORD OPNIEUW INSTELLEN",
      "reset.password.subtext": "We sturen u een e-mail met instructies om het te herstellen",
      "forgot.page.helper": "Ontvangt u geen e-mail om uw wachtwoord opnieuw in te stellen? Dan is het gebruikte e-mailadres bij ons niet bekend. Komt u er niet uit?",
      "forgot.page.helper.link": "Neem contact op met de klantenservice",
      "next.button": "VOLGENDE",
      "otp.page.title": "VERIFIEER UW IDENTITEIT",
      "otp.field.label": "Voer hier de OTP in",
      "otp.field.placeholder": "OTP-nummer",
      "otp.verify.button": "VERIFIËREN",
      "otp.cancel.button": "ANNULEREN",
      "changepw.newpassword.label": "Nieuw wachtwoord",
      "changepw.confirmpassword.label": "Wachtwoord bevestigen",
      "changepw.req.min": "Er moeten minimaal 8 tekens aanwezig zijn",
      "changepw.req.max": "Er mogen maximaal 50 tekens aanwezig zijn",
      "changepw.req.number": "Er moet 1 cijfer aanwezig zijn",
      "changepw.req.uppercase": "Er moet 1 hoofdletter aanwezig zijn",
      "changepw.req.symbol": "Ten minste een van de volgende symbolen !@#$.%^&*-_ moet aanwezig zijn",
      "changepw.req.firstname": "Niet meer dan 2 tekens van de voornaam mogen aanwezig zijn",
      "changepw.req.lastname": "Niet meer dan 2 tekens van de achternaam mogen aanwezig zijn",
      "changepw.req.username": "Niet meer dan 2 tekens van de gebruikersnaam mogen aanwezig zijn",
      "changepw.req.email": "Niet meer dan 2 tekens van het e-mailadres mogen aanwezig zijn.",
      "changepw.error.required": "Nieuw wachtwoord is vereist.",
      "changepw.error.requirements": "Voldoe aan alle wachtwoordvereisten.",
      "changepw.error.mismatch": "De wachtwoorden komen niet overeen. Probeer het opnieuw."
    }
  };

  function tr(key) {
    var locale = localStorage.getItem("mo_locale") || "en";
    var dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
    if (dict && dict[key] != null) return dict[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] != null) return TRANSLATIONS.en[key];
    return key;
  }

  /* ── STEP 1: Email page UI ── */
  function applyEmailStep() {
    var wrapper = document.getElementById("login-wrapper");
    if (!wrapper) return;

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
    if (btn && !btn.dataset.mo) {
      btn.value = tr("login.page.button") + " \u2192";
      btn.dataset.mo = "1";
    }

    /* Server-rendered error banner -> show below the email field.
       Guarded by #mo-userlogin-error so it runs ONCE (avoids the
       observer infinite-loop from repeated DOM mutations). */
    var isPageHasError = errorOnPage();
    if (isPageHasError && !document.getElementById("mo-userlogin-error")) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      $('#userName').after(
        '<div id="mo-userlogin-error" class="error-message text-start" style="color:red;">' + message + '</div>'
      );
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
    var moLoginVal = tr("login.page.button") + " \u2192";
    if (btn && btn.value !== moLoginVal) {
      btn.value = moLoginVal;
    }

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
        '<div id="mo-pw-error" class="error-message text-start" style="color:red;">' + message + '</div>'
      );
      $('#username, #plaintextPassword').addClass('border border-danger');
      $('.mo-user-display').addClass('border border-danger');
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
    wrap.appendChild(eyeBtn);

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

    // Clean existing styled error indicators
    document.querySelectorAll(".mo-input-error").forEach(function (inp) {
      inp.classList.remove("mo-input-error");
    });
    document.querySelectorAll(".mo-error-icon").forEach(function (ico) {
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
        wrap.appendChild(eyeBtn);

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
    var moLoginVal = tr("login.page.button") + " →";
    if (btn && btn.value !== moLoginVal) {
      btn.value = moLoginVal;
      btn.dataset.mo = "1";
    }

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
    if (isPageHasError && !document.getElementById("mo-redirect-error")) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      var errHtml = '<div id="mo-redirect-error" class="error-message text-start" style="color:red;">' + message + '</div>';
      if ($('.mo-pw-wrap').length) {
        $('.mo-pw-wrap').after(errHtml);
      } else {
        $('#username').after(errHtml);
      }
      $('#username, #plaintextPassword').addClass('border border-danger');
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
  }

  /* ── FORGOT PASSWORD PAGE (/moas/idp/forgotpassword) ── */
  function applyForgotPage() {
    if (!checkIsForgot()) return;

    /* Wait for form to load */
    var emailInput = document.getElementById("emailAddress") || document.getElementById("username");
    if (!emailInput) return; // not ready yet

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
        "padding:20px 15px!important;box-sizing:border-box!important;" +
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
        "color:#0d1b2a;margin-bottom:6px;letter-spacing:-.3px;text-align:left!important;}" +

        /* Subtitle */
        "#mo-fp-subtitle{display:block;font-size:14px;color:#6b7a8d;font-family:'Figtree',sans-serif;margin-bottom:20px;text-align:left!important;}" +

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

        /* Helper text */
        "#mo-fp-helper{font-size:13px;color:#6b7a8d;font-family:'Figtree',sans-serif;" +
        "margin:14px 0 18px;line-height:1.5;text-align:left!important;width:100%!important;padding-left:0;padding-right:0;}" +
        "#mo-fp-helper a{color:#0A55D7;text-decoration:none;font-weight:500;}" +
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
        "width:auto!important;margin:10px auto 10px 0!important;align-self:flex-start!important;" +
        "}" +
        ".d-grid.mb-3 button[type=submit]:hover,#userform button[type=submit]:hover,#userform button.custom-button:hover{" +
        "background:#0844b0!important;background-color:#0844b0!important;" +
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
          '<a href="mailto:support@example.com">' + tr("forgot.page.helper.link") + '</a>';
        inputWrapper.parentNode.insertBefore(helper, inputWrapper.nextSibling);
      }
    }

    /* Change button text to NEXT → */
    var fpBtn = fpForm.querySelector("button") || fpForm.querySelector("input[type='submit']");
    if (fpBtn) {
      fpBtn.innerHTML = tr("next.button") + ' <span style="margin-left: 6px;">&rarr;</span>';
    }

    /* Mark as done */
    var done = document.createElement("span");
    done.id = "mo-forgot-done"; done.style.display = "none";
    document.body.appendChild(done);

    $('.btn.mo-btn-primary.btn-block.custom-button.w-100').parent().addClass('px-0')
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
        "#modal-header-main{border-bottom:none!important;padding:32px 36px 12px!important;}" +
        ".modal-title{font-size:0!important;color:transparent!important;}" +
        "#mo-otp-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;" +
        "font-weight:800;color:#0d1b2a;text-transform:uppercase;letter-spacing:-.3px;margin:0;}" +
        "#modal-body{padding:4px 36px 4px!important;}" +
        "#success-alert-message{background:#e8f5e9!important;border:none!important;" +
        "border-left:4px solid #2e7d32!important;border-radius:4px!important;" +
        "color:#1b5e20!important;padding:12px 16px!important;display:flex!important;" +
        "align-items:flex-start!important;gap:10px!important;margin-bottom:20px!important;}" +
        "#success-alert-message .fa-check-circle{color:#2e7d32!important;" +
        "font-size:18px!important;flex-shrink:0;margin-top:2px!important;}" +
        "#success-alert-message .btn-close{display:none!important;}" +
        "#success-alert-message .actionMessage{list-style:none!important;" +
        "padding:0!important;margin:0!important;}" +
        "#success-alert-message .actionMessage li span{font-family:'Figtree',sans-serif;" +
        "font-size:14px;line-height:1.5;}" +
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
        "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
        "font-weight:700!important;text-transform:uppercase!important;" +
        "letter-spacing:.6px!important;padding:8px 24px!important;" +
        "cursor:pointer!important;min-height:40px!important;}" +
        "#validate:hover{background:#0844b0!important;background-color:#0844b0!important;}" +
        ".btn-cancel{background:#e9ecef!important;border:none!important;" +
        "border-radius:0!important;color:#3c515d!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
        "font-weight:700!important;text-transform:uppercase!important;" +
        "letter-spacing:.6px!important;padding:8px 24px!important;min-height:40px!important;}" +
        ".btn-cancel:hover{background:#dee2e6!important;}";

      var otpSt = document.createElement("style");
      otpSt.id = "mo-otp-css"; otpSt.textContent = otpCss;
      document.head.appendChild(otpSt);
    }

    /* DOM changes — only once */
    if (document.getElementById("mo-otp-done")) return;
    var otpInput = document.getElementById("otpToken");
    if (!otpInput) return;

    /* VERIFY YOUR IDENTITY title */
    var modalHeader = document.getElementById("modal-header-main");
    if (modalHeader && !document.getElementById("mo-otp-title")) {
      var otpTitle = document.createElement("span");
      otpTitle.id = "mo-otp-title";
      otpTitle.textContent = tr("otp.page.title");
      modalHeader.insertBefore(otpTitle, modalHeader.firstChild);
    }

    /* Label above OTP input */
    if (!document.getElementById("mo-otp-lbl")) {
      var otpLbl = document.createElement("label");
      otpLbl.id = "mo-otp-lbl";
      otpLbl.setAttribute("for", "otpToken");
      otpLbl.innerHTML = tr("otp.field.label") + ' <span class="mo-req">*</span>';
      otpInput.parentNode.insertBefore(otpLbl, otpInput);
    }

    /* Placeholder */
    otpInput.setAttribute("placeholder", tr("otp.field.placeholder"));

    /* Verify button */
    var verifyBtn = document.getElementById("validate");
    if (verifyBtn) verifyBtn.value = tr("otp.verify.button") + " \u2192";

    /* Cancel button */
    var cancelBtn = document.querySelector(".btn-cancel");
    if (cancelBtn) cancelBtn.textContent = tr("otp.cancel.button");

    /* Mark done */
    var otpDone = document.createElement("span");
    otpDone.id = "mo-otp-done"; otpDone.style.display = "none";
    document.body.appendChild(otpDone);

    var isPageHasError = errorOnPage();
    if (isPageHasError) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
      $('#otpToken').after(
        '<div id="mo-userlogin-error" class="error-message text-start" style="color:red;">' + message + '</div>'
      );
      $('input').addClass('border border-danger')
      $('#error-alert-message').hide();
    }

  }

  /* ── CHANGE PASSWORD PAGE (/moas/idp/changepassword) ── */
  function applyChangePasswordPage() {
    if (!checkIsChangePass()) return;

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
        "padding:20px 15px!important;max-width:560px!important;width:100%!important;" +
        "margin:40px auto!important;box-sizing:border-box!important;" +
        "}" +

        /* Title styling */
        "#login-wrapper .login-header{" +
        "display:flex!important;justify-content:space-between!important;align-items:center!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:24px!important;" +
        "font-weight:800!important;color:#0d1b2a!important;text-transform:uppercase!important;" +
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
        "width:auto!important;margin:10px auto 10px 0!important;align-self:flex-start!important;" +
        "}" +
        "#validate:hover,#submit:hover{background:#0844b0!important;background-color:#0844b0!important;}" +

        /* Hide Go Back to Login link */
        "#passwordform a.btn-link,#back-link{display:none!important;}";

      var cpSt = document.createElement("style");
      cpSt.id = "mo-cp-css"; cpSt.textContent = cpCss;
      document.head.appendChild(cpSt);
      $('#login-body').addClass('d-flex justify-content-center align-items-center')
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
        titleTextNode.nodeValue = tr("reset.password");
      } else {
        h3.insertBefore(document.createTextNode(tr("reset.password")), h3.firstChild);
      }
      
      if (!document.getElementById("mo-cp-close")) {
        var closeBtn = document.createElement("a");
        closeBtn.id = "mo-cp-close";
        closeBtn.href = "login";
        closeBtn.innerHTML = "&times;";
        closeBtn.style.color = "#a0aab6";
        closeBtn.style.textDecoration = "none";
        closeBtn.style.fontSize = "24px";
        closeBtn.style.fontWeight = "400";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.lineHeight = "1";
        h3.appendChild(closeBtn);
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
        eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      wrap.appendChild(eyeBtn);
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
        eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      wrap.appendChild(eyeBtn);
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
      helper.style.color = "#6b7a8d";
      helper.style.lineHeight = "1.6";
      helper.style.marginTop = "-6px";
      helper.style.marginBottom = "16px";
      helper.style.paddingLeft = "18px";
      helper.style.textAlign = "left";
      helper.style.display = "block";
      var moReqKeys = [
        "changepw.req.min",
        "changepw.req.max",
        "changepw.req.number",
        "changepw.req.uppercase",
        "changepw.req.symbol",
        "changepw.req.firstname",
        "changepw.req.lastname",
        "changepw.req.username",
        "changepw.req.email"
      ];
      moReqKeys.forEach(function (k) {
        var li = document.createElement("li");
        li.textContent = tr(k);
        helper.appendChild(li);
      });
      
      newPasswordWrap.parentNode.insertBefore(errorText, newPasswordWrap.nextSibling);
      newPasswordWrap.parentNode.insertBefore(helper, newPasswordWrap.nextSibling);
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

    /* Bind events for dynamic updates */
    if (newPasswordInput && !newPasswordInput.dataset.moListener) {
      newPasswordInput.dataset.moListener = "true";
      newPasswordInput.addEventListener("input", updatePasswordRequirementsAndStrength);
      newPasswordInput.addEventListener("input", clearCpError);
      updatePasswordRequirementsAndStrength();
    }
    if (confirmPasswordInput && !confirmPasswordInput.dataset.moListener) {
      confirmPasswordInput.dataset.moListener = "true";
      confirmPasswordInput.addEventListener("input", clearCpError);
    }

    /* Update button text to NEXT → */
    var saveBtn = document.getElementById("validate") || document.getElementById("submit");
    if (saveBtn) {
      if (saveBtn.tagName === "INPUT") {
        saveBtn.value = tr("next.button") + " \u2192";
      } else {
        saveBtn.innerHTML = tr("next.button") + ' <span style="margin-left: 6px;">&rarr;</span>';
      }
    }

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

      // Show message (requirements list stays visible at all times)
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = "block";
      }
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

      // Remove the server-rendered error message (once user edits)
      var serverErr = document.getElementById("mo-cp-server-error");
      if (serverErr) serverErr.remove();

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

        var invalidItems = document.querySelectorAll("#listcontent li.mo-invalid");
        if (invalidItems.length > 0) {
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
        }
      }

      $(confirmPasswordInput).on("blur", checkMatch);

      /* Re-run check live once mismatch is already flagged */
      $(newPasswordInput).add(confirmPasswordInput).on("input", function () {
        if ($(confirmPasswordInput).hasClass("border-danger")) { checkMatch(); }
      });
    }
    bindPasswordMatchCheck();

    /* Server-rendered error banner -> show below the new password field.
       Guarded by #mo-cp-server-error so it appends ONCE (otherwise the
       observer re-runs this block and stacks duplicate messages). */
    var isPageHasError = errorOnPage();
    if (isPageHasError && !document.getElementById("mo-cp-server-error")) {
      console.log('IN ERROR SECTION ');
      var message = $('#error-alert-message .errorMessage li span').text().trim();
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

    getLocale();

    var isLogin = checkIsLogin();
    var isRedirectToIdpLogin = checkIsRedirectToIdpLogin();
    var isForgot = checkIsForgot();
    var isOtp = checkIsOtp();
    var isChangePass = checkIsChangePass();
    var isEnduserDashboard = checkIsEnduserDashboard();

    if (!isLogin && !isRedirectToIdpLogin && !isForgot && !isOtp && !isChangePass && !isEnduserDashboard) return;

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
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"]
  });

}());
