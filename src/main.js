import plugin from '../plugin.json';
let AppSettings = acode.require("settings")

class AcodePlugin {

  async init() {
    // your plugin codes goes here
    let acodeLanguageClient = acode.require("acode-language-client");

    if (acodeLanguageClient) {
      await this.setupLanguageClient(acodeLanguageClient);
    } else {
      window.addEventListener("plugin.install", ({ detail }) => {
        if (detail.name === "acode-language-client") {
          acodeLanguageClient = acode.require("acode-language-client");
          this.setupLanguageClient(acodeLanguageClient);
        }
      });
    }

  }

  get defaultSettings() {
    return {
      serverPath: "/data/data/com.termux/files/home/.local/share/nvim/mason/bin/jdtls",
      args: [
        "-configuration /data/data/com.termux/files/home/.cache/jdtls/config",
        "-data /data/data/com.termux/files/home/.cache/jdtls/workspace"],
    }
  }
  async setupLanguageClient(acodeLanguageClient) {
    let JDTLSsocket = acodeLanguageClient.getSocketForCommand(
      this.settings.serverPath,
      this.settings.args,
    );
    let JDTLSClient = new acodeLanguageClient.LanguageClient({
      type: "socket",
      socket: JDTLSsocket,
    });

    acodeLanguageClient.registerService("java", JDTLSClient);

    acode.registerFormatter(plugin.name, ["java"], () =>
      acodeLanguageClient.format(),
    );

  }
  get settings() {
    // UPDATE SETTING SAAT RESTART ACODE
    if (!window.acode) return this.defaultSettings;
    let value = AppSettings.value[plugin.id];
    if (!value) {
      //Menjadikan Method defaultSettings sebagai nilai Default
      value = AppSettings.value[plugin.id] = this.defaultSettings;
      AppSettings.update();
    }
    return value;
  }
  get settingsMenuLayout() {
    return {
      list: [
        {
          index: 0,
          key: "serverPath",
          promptType: "text",
          info: "Set the JDTLS executable file Path",
          prompt: "Set the JDTLS executable file Path",
          text: "JDTLS Executable File Path",
          value: this.settings.serverPath,
        },
        {
          index: 1,
          key: "args",
          promptType: "text",
          info: "JDTLS Argument",
          prompt: "JDTLS Args",
          text: "JDTLS Argument",
          value: this.settings.args.join(", ")
        },
      ],
      cb: (key, value) => {

        switch (key) {
          case 'args':
            value = value ? value.split(",").map(item => item.trim()) : [];
            break;
        }
        AppSettings.value[plugin.id][key] = value;
        AppSettings.update();
      },

    };
  }
  async destroy() {
    // Add your cleanup code here
    if (AppSettings.value[plugin.id]) {
      delete AppSettings.value[plugin.id];
      AppSettings.update();
    }
  }

}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    acodePlugin.baseUrl = baseUrl;
    await acodePlugin.init($page, cacheFile, cacheFileUrl);
  }, acodePlugin.settingsMenuLayout);

  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}
