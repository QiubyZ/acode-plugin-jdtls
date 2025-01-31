# JDTLS Java Language Server

This Plugin for Java Language Server with support **Args** and **Dynamic Executable file Jdtls**.

The default configuration is taken from Nvim **customization**

with:
  - **Executable File Path**: _/data/data/com.termux/files/home/.local/share/nvim/mason/bin/jdtls_
  - **Arguments**: _-configuration /data/data/com.termux/files/home/.cache/jdtls/config -data /data/data/com.termux/files/home/.cache/jdtls/workspace_

Change it if you want to change it.

  **Please Support Me** 🥺

  <a href="https://trakteer.id/qiubyzhukhi/tip" target="_blank"><img id="wse-buttons-preview" src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png?date=18-11-2023" height="40" style="border:0px;height:40px;" alt="Trakteer Saya"></a>

## Acode Plugin Requiriment Installed
  1. [Acode Language Client](https://acode.app/plugin/acode.language.client) 
  2. Follow the instructions there to run the Language Server.
  3. you can watch my video to install *Acode Language Client* [Click Here](https://youtu.be/Rc-jvCWHG9E?si=VuY0VCMD2jnn3ptE), 
     Preview JDTLS Plugin of [Click Here](https://youtube.com/shorts/UD7bmRErgiE?si=O_dQ3uSSaf2EgRpC).
## How To Run Gradle Project with CodeRunner?
  This is a video tutorial reference on how to run a Gradle Project.
  [Click Here](https://youtube.com/shorts/tc4U8FwaEnA?si=5OUDtd8OavP3rf1K)

## Setup JDTLS executable for PLUGIN
  1. If you don't have **JDTLS**, you can download on [jdt-language-server-1.41.tar.gz](https://www.eclipse.org/downloads/download.php?file=/jdtls/milestones/1.41.0/jdt-language-server-1.41.0-202410311350.tar.gz)
  2. Extract the file on your Termux
  3. Open the Folder 
  4. Search executable file in `bin/jdtls`
  5. Copy FullDirectoryPath of `jdtls` executable 
  6. And paste on Plugin **JDTLS Java Language Server** Settings
  7. Remove Default Text of Argument or edit your settings.json to `args: []`
     
      example:
        ```json
      "acode.plugin.jdts": {
        "serverPath": "/data/data/com.termux/files/home/LANGUAGE-SERVER/jdtls/jdtls/bin/jdtls",
        "args": []
      }
        ```