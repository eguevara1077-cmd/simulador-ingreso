/*
 * Email chooser for "3. Comprar por correo".
 * Progressive enhancement: without JavaScript the button stays a plain mailto: link.
 * No third-party code, no network requests, no HTML string injection.
 */
(function () {
    'use strict';

    var TO = 'proyectostecnologicosgf@gmail.com';
    var SUBJECT = 'Compra de licencia del Simulador';
    var BODY = 'Hola, quiero comprar la licencia del Simulador para Ingreso a Universidades (6 meses, $20 USD).\n' +
        'Mi nombre completo es: \n' +
        'Mi código de máquina es: ';

    var enc = encodeURIComponent;

    var URLS = {
        gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + enc(TO) + '&su=' + enc(SUBJECT) + '&body=' + enc(BODY),
        outlook: 'https://outlook.live.com/mail/0/deeplink/compose?to=' + enc(TO) + '&subject=' + enc(SUBJECT) + '&body=' + enc(BODY),
        yahoo: 'https://compose.mail.yahoo.com/?to=' + enc(TO) + '&subject=' + enc(SUBJECT) + '&body=' + enc(BODY),
        mailto: 'mailto:' + TO + '?subject=' + enc(SUBJECT) + '&body=' + enc(BODY)
    };

    function init() {
        var dialog = document.getElementById('mail-dialog');
        if (!dialog || typeof dialog.showModal !== 'function') {
            return; // Old browser: keep the mailto: links working as they are.
        }

        var triggers = document.querySelectorAll('.js-email-cta');
        var closeBtn = dialog.querySelector('.js-mail-close');
        var copyBtn = dialog.querySelector('.js-mail-copy');
        var status = document.getElementById('mail-copy-status');
        var address = document.getElementById('mail-address');
        var lastTrigger = null;
        var statusTimer = null;

        var options = dialog.querySelectorAll('.mail-option[data-provider]');
        for (var i = 0; i < options.length; i++) {
            var url = URLS[options[i].getAttribute('data-provider')];
            if (url) {
                options[i].setAttribute('href', url);
            }
        }

        function setStatus(text, isError) {
            status.textContent = text;
            status.classList.toggle('is-error', !!isError);
            if (statusTimer) {
                clearTimeout(statusTimer);
            }
            statusTimer = setTimeout(function () {
                status.textContent = '';
                status.classList.remove('is-error');
            }, 5000);
        }

        function openDialog(event) {
            event.preventDefault();
            lastTrigger = event.currentTarget;
            status.textContent = '';
            dialog.removeAttribute('hidden');
            dialog.showModal();
        }

        for (var j = 0; j < triggers.length; j++) {
            triggers[j].setAttribute('aria-haspopup', 'dialog');
            triggers[j].addEventListener('click', openDialog);
        }

        closeBtn.addEventListener('click', function () {
            dialog.close();
        });

        // Click on the backdrop (outside the inner panel) closes the dialog.
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) {
                dialog.close();
            }
        });

        dialog.addEventListener('close', function () {
            dialog.setAttribute('hidden', '');
            if (lastTrigger && typeof lastTrigger.focus === 'function') {
                lastTrigger.focus();
            }
        });

        function legacyCopy() {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(address);
            selection.removeAllRanges();
            selection.addRange(range);
            var ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (e) {
                ok = false;
            }
            return ok;
        }

        copyBtn.addEventListener('click', function () {
            var done = function () { setStatus('Dirección copiada: ' + TO, false); };
            var fail = function () {
                if (legacyCopy()) {
                    done();
                } else {
                    setStatus('No se pudo copiar. Selecciona la dirección y cópiala manualmente.', true);
                }
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(TO).then(done, fail);
            } else {
                fail();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
