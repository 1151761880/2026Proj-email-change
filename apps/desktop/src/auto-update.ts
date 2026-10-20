import { app, dialog, Notification } from "electron";
import type { AppUpdater, UpdateInfo } from "electron-updater";
import { captureDesktopError } from "./sentry";
import { isTransientNetworkError } from "./network-errors";
import { getDesktopUpdateFeedUrl } from "./update-feed";

export const DESKTOP_UPDATE_INTERVAL_MS = 6 * 60 * 60 * 1000;

let downloadedVersion: string | null = null;
let updateEventsBound = false;
let reportDownloadProgress = false;
let lastReportedPercent: number | null = null;
let onUpdateReady: ((version: string) => void) | undefined;
let onDownloadProgress: ((percent: number | null) => void) | undefined;

export function logDesktopUpdateError(error: unknown) {
  console.error(
    error instanceof Error ? error.message : "Desktop update check failed",
  );
  if (!isTransientNetworkError(error)) {
    captureDesktopError(error, { area: "auto-update" });
  }
}

export function resetDesktopAutoUpdateForTests() {
  downloadedVersion = null;
  updateEventsBound = false;
  reportDownloadProgress = false;
  lastReportedPercent = null;
  onUpdateReady = undefined;
  onDownloadProgress = undefined;
}

export function isDesktopUpdateReady() {
  return downloadedVersion !== null;
}

export async function startDesktopAutoUpdate(
  isPackaged = app.isPackaged,
  handlers?: {
    onUpdateReady?: (version: string) => void;
    onDownloadProgress?: (percent: number | null) => void;
  },
): Promise<boolean> {
  if (!isPackaged) return false;

  try {
    const autoUpdater = await getDesktopAutoUpdater(handlers);
    scheduleDesktopUpdateChecks(autoUpdater);
    observeDownload(await autoUpdater.checkForUpdates());
    return true;
  } catch (error) {
    logDesktopUpdateError(error);
    return false;
  }
}

export async function installDownloadedDesktopUpdate(
  prepareToQuit: () => void,
): Promise<boolean> {
  if (!downloadedVersion) return false;

  const autoUpdater = await getDesktopAutoUpdater();
  prepareToQuit();
  autoUpdater.quitAndInstall(true, true);
  return true;
}

export async function checkForDesktopUpdatesManually(
  prepareToQuit: () => void,
  isPackaged = app.isPackaged,
): Promise<boolean> {
  if (!isPackaged) {
    await dialog.showMessageBox({
      type: "info",
      message: "开发版本不支持自动更新",
      detail: "安装十组邮件小助手正式版本后可接收更新。",
    });
    return false;
  }

  try {
    const autoUpdater = await getDesktopAutoUpdater();
    if (downloadedVersion) {
      return promptToInstallDownloadedUpdate(prepareToQuit, autoUpdater);
    }

    reportDownloadProgress = true;
    const result = await autoUpdater.checkForUpdates();
    if (!result) throw new Error("Desktop updater is unavailable");
    observeDownload(result, stopReportingDownloadProgress);

    if (downloadedVersion) {
      stopReportingDownloadProgress();
      return promptToInstallDownloadedUpdate(prepareToQuit, autoUpdater);
    }

    if (!result.isUpdateAvailable) {
      stopReportingDownloadProgress();
      await dialog.showMessageBox({
        type: "info",
        message: "已是最新版本",
        detail: `十组邮件小助手 ${app.getVersion()} 已是最新版本。`,
      });
      return true;
    }

    await dialog.showMessageBox({
      type: "info",
      message: `正在下载十组邮件小助手 ${result.updateInfo.version}`,
      detail:
        "可以继续使用十组邮件小助手。下载完成后，应用菜单将显示“重启并更新”。",
    });
    return true;
  } catch (error) {
    stopReportingDownloadProgress();
    logDesktopUpdateError(error);
    await dialog.showMessageBox({
      type: "error",
      message: "无法检查更新",
      detail: "请稍后重试。",
    });
    return false;
  }
}

async function getDesktopAutoUpdater(handlers?: {
  onUpdateReady?: (version: string) => void;
  onDownloadProgress?: (percent: number | null) => void;
}): Promise<AppUpdater> {
  if (handlers?.onUpdateReady) onUpdateReady = handlers.onUpdateReady;
  if (handlers?.onDownloadProgress) {
    onDownloadProgress = handlers.onDownloadProgress;
  }

  const { autoUpdater } = await import("electron-updater");
  autoUpdater.setFeedURL({
    provider: "generic",
    url: getDesktopUpdateFeedUrl(),
  });
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  bindUpdateDownloaded(autoUpdater);
  return autoUpdater;
}

function bindUpdateDownloaded(autoUpdater: AppUpdater) {
  if (updateEventsBound) return;
  updateEventsBound = true;
  autoUpdater.on("download-progress", (progress: { percent: number }) => {
    if (!reportDownloadProgress) return;
    const percent = Math.round(progress.percent);
    if (percent === lastReportedPercent) return;
    lastReportedPercent = percent;
    onDownloadProgress?.(percent);
  });
  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    if (downloadedVersion === info.version) return;
    downloadedVersion = info.version;
    stopReportingDownloadProgress();
    notifyUpdateReady(info.version);
    onUpdateReady?.(info.version);
  });
}

function stopReportingDownloadProgress() {
  if (!reportDownloadProgress && lastReportedPercent === null) return;
  reportDownloadProgress = false;
  lastReportedPercent = null;
  onDownloadProgress?.(null);
}

function notifyUpdateReady(version: string) {
  try {
    if (!Notification.isSupported()) return;
    new Notification({
      title: "更新已准备好",
      body: `重启十组邮件小助手以完成 ${version} 版本更新。`,
    }).show();
  } catch (error) {
    logDesktopUpdateError(error);
  }
}

async function promptToInstallDownloadedUpdate(
  prepareToQuit: () => void,
  autoUpdater: AppUpdater,
) {
  const { response } = await dialog.showMessageBox({
    type: "info",
    buttons: ["重启并更新", "稍后"],
    defaultId: 0,
    cancelId: 1,
    message: "更新已准备好安装",
    detail: `十组邮件小助手 ${downloadedVersion} 已下载，重启后完成更新。`,
  });
  if (response === 0) {
    prepareToQuit();
    autoUpdater.quitAndInstall(true, true);
  }
  return true;
}

function scheduleDesktopUpdateChecks(autoUpdater: AppUpdater) {
  const timer = setInterval(() => {
    autoUpdater
      .checkForUpdates()
      .then((result) => observeDownload(result))
      .catch(logDesktopUpdateError);
  }, DESKTOP_UPDATE_INTERVAL_MS);
  timer.unref();
}

function observeDownload(
  result: { downloadPromise?: Promise<unknown> | null } | null | undefined,
  onFailure?: () => void,
) {
  result?.downloadPromise?.catch((error: unknown) => {
    onFailure?.();
    logDesktopUpdateError(error);
  });
}
