import plugin from "../plugin.json";
let AppSettings = acode.require("settings");

class AcodePlugin {
  constructor() {
    this.name_language_type = "java"
    this.languageserver = "/data/data/com.termux/files/home/LANGUAGE-SERVER/jdtls/jdtls/bin/jdtls"
    this.standart_args = []
    this.initializeOptions = {
      initializationOptions: {}
    }
  }

  async init($page, cacheFile, cacheFileUrl) {
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
          prompt: "Change the serverPath before running.",
          text: "JDTLS Executable File Path",
          value: this.settings.serverPath,
        },
        {
          index: 1,
          key: "arguments",
          promptType: "text",
          info: "For multiple arguments, please use comma ','<br>Example: --stdio, -v, -vv",
          prompt: "Argument Of Language Server",
          text: "JDTLS Argument",
          value: this.settings.arguments.join(", ")
        },
      ],

      cb: (key, value) => {
        switch (key) {
          case 'arguments':
            value = value ? value.split(",").map(item => item.trim()) : [];
            break;
        }
        AppSettings.value[plugin.id][key] = value;
        AppSettings.update();
      },
    };
  }

  get defaultSettings() {
    return {
      serverPath: this.languageserver,
      arguments: this.standart_args,
      languageClientConfig: this.initializeOptions
    };
  }

  async setupLanguageClient(acodeLanguageClient) {
    let socket = acodeLanguageClient.getSocketForCommand(
      this.settings.serverPath,
      this.settings.arguments,
    );


    let JavaClient = new acodeLanguageClient.LanguageClient({
      type: "socket",
      socket,
      initializationOptions: this.settings.languageClientConfig.initializationOptions
    });
    acodeLanguageClient.registerService(this.name_language_type, JavaClient);


    let handler = () => {
      JavaClient.connection.onNotification("window/showMessage", ({ params }) => {
        console.log("ShowMessage: " + params.message)
      });
      JavaClient.connection.onNotification("workspace/configuration", params => {
        const deb = "Initilizing Progress " + this.languageserver
        console.log(deb + `${params.message}`)

      });
      JavaClient.connection.onRequest("window/workDoneProgress/create", params => {
        const deb = "Initializing WorkDone Progress " + this.languageserver
        console.log(deb + `${params.message}`)

      });
    }
    socket.addEventListener("open", () => {
      if (JavaClient.isInitialized) handler();
      else JavaClient.requestsQueue.push(() => handler());
      console.log("OPEN CONNECTION")
    });

    acode.registerFormatter(plugin.name, [this.name_language_type], () =>
      acodeLanguageClient.format(),
    );

  }

  async destroy() {
    if (AppSettings.value[plugin.id]) {
      delete AppSettings.value[plugin.id];
      AppSettings.update();
    }
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(
    plugin.id,
    async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      acodePlugin.baseUrl = baseUrl;
      await acodePlugin.init($page, cacheFile, cacheFileUrl);
    },
    acodePlugin.settingsMenuLayout,
  );

  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });

}
