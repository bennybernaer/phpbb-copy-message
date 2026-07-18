(() => {
    'use strict';

    const config = document.getElementById('copy-message-config');
    const buttonTemplate = document.querySelector('#copy-message-template .copy-message-button');

    if (!config || !buttonTemplate) {
        return;
    }

    const initCopyButton = (textarea) => {
        if (!(textarea instanceof HTMLTextAreaElement) || textarea.dataset.copyMessageReady === 'true') {
            return;
        }

        textarea.dataset.copyMessageReady = 'true';

        const wrapper = document.createElement('div');
        const toolbar = document.createElement('div');
        const button = buttonTemplate.cloneNode(true);
        const copyIcon = button.querySelector('.copy-message-icon-copy');
        const copiedIcon = button.querySelector('.copy-message-icon-copied');

        wrapper.className = 'copy-message-editor';
        toolbar.className = 'copy-message-toolbar';

        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(textarea);
        toolbar.appendChild(button);
        textarea.classList.add('copy-message-textarea');

        let resetTimer = 0;

        const setCopiedState = (copied) => {
            button.classList.toggle('is-copied', copied);
            button.setAttribute('aria-label', copied ? config.dataset.copiedLabel : config.dataset.copyLabel);
            button.title = copied ? config.dataset.copiedLabel : config.dataset.copyLabel;

            if (copyIcon && copiedIcon) {
                copyIcon.hidden = copied;
                copiedIcon.hidden = !copied;
            }
        };

        const updateState = () => {
            const hasText = textarea.value.trim().length > 0;

            wrapper.classList.toggle('has-text', hasText);
            button.disabled = !hasText;
            button.tabIndex = hasText ? 0 : -1;
            button.setAttribute('aria-disabled', hasText ? 'false' : 'true');

            if (!hasText) {
                window.clearTimeout(resetTimer);
                setCopiedState(false);
            }
        };

        const copyText = async () => {
            if (!textarea.value) {
                return;
            }

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textarea.value);
                } else {
                    const selectionStart = textarea.selectionStart;
                    const selectionEnd = textarea.selectionEnd;

                    textarea.focus();
                    textarea.select();
                    document.execCommand('copy');
                    textarea.setSelectionRange(selectionStart, selectionEnd);
                }

                window.clearTimeout(resetTimer);
                setCopiedState(true);
                resetTimer = window.setTimeout(() => setCopiedState(false), 1600);
            } catch (error) {
                console.error('Copy Message Text: copying the message failed.', error);
            }
        };

        textarea.addEventListener('input', updateState);
        button.addEventListener('click', copyText);

        setCopiedState(false);
        updateState();
    };

    const initMessageTextareas = (root = document) => {
        if (root instanceof HTMLTextAreaElement && root.matches('textarea[name="message"]')) {
            initCopyButton(root);
            return;
        }

        if (root.querySelectorAll) {
            root.querySelectorAll('textarea[name="message"]').forEach(initCopyButton);
        }
    };

    initMessageTextareas();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element) {
                    initMessageTextareas(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
