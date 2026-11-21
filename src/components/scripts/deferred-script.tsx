import React from 'react';
import Script, { type ScriptProps } from 'next/script';

/**
 * Deferred Third-Party Script Wrapper (Item 21)
 * 
 * Enforces non-blocking script loading for external analytics, chats, pixels, and tracking.
 * Uses Next.js `strategy="lazyOnload"` by default, loading scripts only during idle browser time.
 */

export interface DeferredScriptProps extends Omit<ScriptProps, 'strategy'> {
  /**
   * Loading strategy. Defaults to 'lazyOnload' (idle time after page is interactive).
   * Can be 'afterInteractive' for high-priority analytics.
   */
  strategy?: 'lazyOnload' | 'afterInteractive';
}

export function DeferredThirdPartyScript({
  strategy = 'lazyOnload',
  ...props
}: DeferredScriptProps) {
  return <Script strategy={strategy} {...props} />;
}
