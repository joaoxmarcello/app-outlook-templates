import { useState, useEffect, useCallback } from 'react';

export function useOffice() {
  const [isOfficeReady, setIsOfficeReady] = useState(false);
  const [isOfficeAvailable, setIsOfficeAvailable] = useState(false);

  useEffect(() => {
    if (typeof Office !== 'undefined') {
      Office.onReady(() => {
        setIsOfficeAvailable(true);
        setIsOfficeReady(true);
      });
    } else {
      // Fora do Outlook (ex: browser durante desenvolvimento)
      setIsOfficeAvailable(false);
      setIsOfficeReady(true);
    }
  }, []);

  /**
   * Insere o template no email que está sendo composto.
   * @param {string} subject - Assunto (vazio = não altera o assunto)
   * @param {string} body    - Corpo em HTML
   * @param {'replace'|'prepend'|'append'} mode - Como inserir o corpo
   */
  const insertTemplate = useCallback(async (subject, body, mode = 'replace') => {
    if (!isOfficeAvailable) {
      // Modo de desenvolvimento: exibe prévia em alerta
      alert(
        `[Prévia — fora do Outlook]\n\nAssunto: ${subject || '(não definido)'}\n\nCorpo:\n${body?.replace(/<[^>]*>/g, '') || ''}`
      );
      return { success: true };
    }

    try {
      const item = Office.context.mailbox.item;

      // Define o assunto, se fornecido
      if (subject) {
        await new Promise((resolve, reject) => {
          item.subject.setAsync(subject, (result) => {
            result.status === Office.AsyncResultStatus.Failed
              ? reject(new Error(result.error.message))
              : resolve();
          });
        });
      }

      // Define o corpo conforme o modo escolhido
      if (body) {
        const coercionType = Office.CoercionType.Html;

        if (mode === 'replace') {
          await new Promise((resolve, reject) => {
            item.body.setAsync(body, { coercionType }, (result) => {
              result.status === Office.AsyncResultStatus.Failed
                ? reject(new Error(result.error.message))
                : resolve();
            });
          });
        } else if (mode === 'prepend') {
          await new Promise((resolve, reject) => {
            item.body.prependAsync(body, { coercionType }, (result) => {
              result.status === Office.AsyncResultStatus.Failed
                ? reject(new Error(result.error.message))
                : resolve();
            });
          });
        } else if (mode === 'append') {
          await new Promise((resolve, reject) => {
            item.body.appendOnSendAsync(body, { coercionType }, (result) => {
              result.status === Office.AsyncResultStatus.Failed
                ? reject(new Error(result.error.message))
                : resolve();
            });
          });
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isOfficeAvailable]);

  return { isOfficeReady, isOfficeAvailable, insertTemplate };
}
