const childProcess = require('child_process');
const os = require('os');

/**
 * A simple wrapper for the Aseprite executable -- finds the Aseprite binary on your
 * local machine and executes the desired command in a shell.
 *
 * I use Aseprite to take all my images and push out a spritesheet. The slick thing to do
 * would be to go release this as its own module, but for now I just copy and paste it
 * into each year's project :\o/:.
 */
const AsepriteCli = {
  asepritePath: undefined,

  exec(argString, options) {
    const customPath = options && options.customPath;

    return AsepriteCli._rawExec(AsepriteCli._findAseprite(customPath), argString);
  },

  _findAseprite(customPath) {
    if (AsepriteCli.asepritePath) {
      return AsepriteCli.asepritePath;
    }

    const platform = os.platform();
    let options = [];

    if (customPath) {
      options.push(customPath);
    }

    if (platform === 'darwin') {
      options.push(`/Applications/Aseprite.app/Contents/MacOS/aseprite`);
      options.push(`${process.env.HOME}/Applications/Aseprite.app/Contents/MacOS/aseprite`);
      options.push(`aseprite`);
    } else if (platform === 'win32') {
      options.push(`C:\\Program Files (x86)\\Aseprite\\Aseprite.exe`);
      options.push(`C:\\Program Files\\Aseprite\\Aseprite.exe`);
      options.push(`Aseprite`);
    }

    for (let option of options) {
      try {
        AsepriteCli._rawExec(option, '--version');
        AsepriteCli.asepritePath = option;
        return option;
      } catch (e) { }
    }

    throw new Error('Unable to find Aseprite binary. Searched in: ' + JSON.stringify(options, undefined, 2));
  },

  _rawExec(asepritePath, argString) {
    const command = asepritePath + ' ' + argString;
    const result = childProcess.execSync(command);
    return result.toString('utf8');
  }
}

module.exports = AsepriteCli;
