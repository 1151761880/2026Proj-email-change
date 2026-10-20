import { app, Menu, type MenuItemConstructorOptions } from "electron";

const PRODUCT_NAME = "十组邮件小助手";

export function configureDesktopApplicationMenu({
  checkForUpdates,
  createWindow,
  recordDiagnostics,
  updateReady = false,
  downloadPercent = null,
  platform = process.platform,
}: {
  checkForUpdates: () => void;
  createWindow: () => void;
  recordDiagnostics: () => void;
  updateReady?: boolean;
  downloadPercent?: number | null;
  platform?: NodeJS.Platform;
}) {
  app.setAboutPanelOptions({
    applicationName: PRODUCT_NAME,
    applicationVersion: app.getVersion(),
  });

  const checkForUpdatesItem: MenuItemConstructorOptions = {
    label: updateMenuLabel(updateReady, downloadPercent),
    click: checkForUpdates,
  };
  const recordDiagnosticsItem: MenuItemConstructorOptions = {
    label: "记录诊断信息…",
    click: recordDiagnostics,
  };
  const helpSubmenu: MenuItemConstructorOptions[] =
    platform === "darwin"
      ? [recordDiagnosticsItem]
      : [
          checkForUpdatesItem,
          recordDiagnosticsItem,
          { type: "separator" },
          {
            label: `关于 ${PRODUCT_NAME}`,
            click: () => app.showAboutPanel(),
          },
        ];
  const template: MenuItemConstructorOptions[] = [
    ...(platform === "darwin"
      ? [
          {
            label: PRODUCT_NAME,
            submenu: [
              { label: `关于 ${PRODUCT_NAME}`, role: "about" },
              { type: "separator" },
              checkForUpdatesItem,
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { label: `隐藏 ${PRODUCT_NAME}`, role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { label: `退出 ${PRODUCT_NAME}`, role: "quit" },
            ],
          } satisfies MenuItemConstructorOptions,
        ]
      : []),
    {
      label: "文件",
      submenu: [
        {
          label: "新建窗口",
          accelerator: "CommandOrControl+N",
          click: createWindow,
        },
        { role: "close" },
        ...(platform === "darwin"
          ? []
          : [{ type: "separator" as const }, { role: "quit" as const }]),
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    { role: "help", submenu: helpSubmenu },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function updateMenuLabel(updateReady: boolean, downloadPercent: number | null) {
  if (updateReady) return "重启并更新";
  if (downloadPercent === null) return "检查更新…";
  return `正在下载更新… ${downloadPercent}%`;
}
