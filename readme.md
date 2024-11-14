# JDTLS Java Language Server

This Plugin for Java Language Server with support **Args** and **Dynamic Executable file Jdtls**.

The default configuration is taken from Nvim **customization**

with:
  - **Executable File Path**: _/data/data/com.termux/files/home/.local/share/nvim/mason/bin/jdtls_
  - **Arguments**: _-configuration /data/data/com.termux/files/home/.cache/jdtls/config -data /data/data/com.termux/files/home/.cache/jdtls/workspace_

Change it if you want to change it.

## Setup
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
        "serverPath": "your/path/bin/jdtls",
        "args": []
      }
        ```