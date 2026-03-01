/**
 * 钱包窗口桥接服务
 *
 * 负责管理 Ming 与外部钱包页面（如 AnDaoWallet）之间的窗口引用，
 * 统一消息发送目标与响应来源匹配逻辑。
 *
 * 设计目标：
 * - 支持同页联调（target = window）
 * - 支持跨窗口联调（target = wallet popup/tab）
 * - 不强依赖弹窗一定成功（保留回退）
 */

const DEFAULT_WALLET_WINDOW_NAME = 'AnDaoWalletBridge';
const DEFAULT_WALLET_WINDOW_FEATURES =
  'popup=yes,width=460,height=840,resizable=yes,scrollbars=yes';

export class WalletWindowBridge {
  private walletWindow: Window | null = null;
  private readonly debugEnabled =
    import.meta.env.VITE_WALLET_BRIDGE_DEBUG === 'true' ||
    import.meta.env.VITE_WALLET_BRIDGE_DEBUG === '1';

  private readonly walletAppUrl = import.meta.env.VITE_WALLET_APP_URL?.trim() || '';
  private readonly walletWindowName =
    import.meta.env.VITE_WALLET_WINDOW_NAME?.trim() || DEFAULT_WALLET_WINDOW_NAME;

  private readonly targetOrigin =
    import.meta.env.VITE_WALLET_TARGET_ORIGIN?.trim() || window.location.origin;

  private debug(message: string, context?: Record<string, unknown>): void {
    if (!this.debugEnabled) {
      return;
    }
    if (context) {
      console.debug(`[WalletWindowBridge] ${message}`, context);
      return;
    }
    console.debug(`[WalletWindowBridge] ${message}`);
  }

  private getActiveWalletWindow(): Window | null {
    if (this.walletWindow && !this.walletWindow.closed) {
      return this.walletWindow;
    }
    return null;
  }

  isExternalWalletConfigured(): boolean {
    return this.walletAppUrl.length > 0;
  }

  hasActiveWalletWindow(): boolean {
    return this.getActiveWalletWindow() !== null;
  }

  getTargetOrigin(): string {
    return this.targetOrigin;
  }

  /**
   * 获取请求发送目标窗口：
   * - 若外部钱包窗口可用：发往外部钱包窗口
   * - 否则：发往当前窗口（同页联调）
   */
  getRequestTargetWindow(): Window {
    return this.getActiveWalletWindow() || window;
  }

  /**
   * 获取期望的响应来源窗口。
   */
  getExpectedResponseSource(): Window {
    return this.getActiveWalletWindow() || window;
  }

  /**
   * 校验响应来源是否匹配当前请求目标。
   */
  isExpectedResponseSource(
    source: MessageEventSource | null,
    expected: Window
  ): boolean {
    return source === expected;
  }

  /**
   * 打开（或复用）外部钱包窗口。
   * 若未配置钱包URL，则返回 null 并继续同页模式。
   */
  openWalletWindow(): Window | null {
    if (!this.walletAppUrl) {
      this.debug('skip open wallet window: walletAppUrl is empty');
      return null;
    }

    const active = this.getActiveWalletWindow();
    if (active) {
      this.debug('reuse existing wallet window');
      try {
        active.focus();
      } catch (_error) {
        // noop
      }
      return active;
    }

    const opened = window.open(
      this.walletAppUrl,
      this.walletWindowName,
      DEFAULT_WALLET_WINDOW_FEATURES
    );

    if (opened && !opened.closed) {
      this.walletWindow = opened;
      this.debug('opened wallet window', {
        walletAppUrl: this.walletAppUrl,
        walletWindowName: this.walletWindowName,
      });
      try {
        opened.focus();
      } catch (_error) {
        // noop
      }
      return opened;
    }

    this.debug('failed to open wallet window', {
      walletAppUrl: this.walletAppUrl,
      walletWindowName: this.walletWindowName,
    });

    return null;
  }

  clearWalletWindowReference(): void {
    this.walletWindow = null;
  }
}

export const walletWindowBridge = new WalletWindowBridge();
