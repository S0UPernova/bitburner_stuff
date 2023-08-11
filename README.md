# getting started
- open settings.json and add
```
{
  "bitburner.authToken": "token from the game",
  "bitburner.scriptRoot": "./typescript-template/dist",
  "bitburner.fileWatcher.enable": true,
  "bitburner.showPushSuccessNotification": true,
  "bitburner.showFileWatcherEnabledNotification": true,
  "javascript.preferences.importModuleSpecifier": "non-relative",
    "files.exclude": {
        "jsconfig.json": true,
        "NetscriptDefinitions.d.ts": true,
    },
}
```