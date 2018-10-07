import fs = require('fs');
import SFTPServer = require('node-sftp-server');
import debug = require('debug');
import * as fsJetpack from 'fs-jetpack';
import * as moment from 'moment';
import upath = require('upath');
import dotenv = require('dotenv');

dotenv.config();
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const server = new SFTPServer();

let currentPath: string = '.';

server.on('connect', (auth, info) => {
  debug('warn')(
    'authentication attempted, client info is: ' +
      JSON.stringify(info) +
      ', auth method is: ' +
      auth.method,
  );
  if (
    auth.method !== 'password' ||
    auth.username !== USERNAME ||
    auth.password !== PASSWORD
  ) {
    return auth.reject(['password'], false);
  }

  return auth.accept((session) => {
    debug('debug')('Authentication accepted');
    session.on('readdir', (directoryPath, responder) => {
      currentPath = directoryPath;
      const directoryFiles = fsJetpack.list(directoryPath);
      debug('debug')(directoryFiles);

      let i = 0;
      responder.on('dir', () => {
        if (directoryFiles && i < directoryFiles.length) {
          let mode = fs.constants.S_IFREG;

          const inspectedFile = fsJetpack.inspect(
            `${directoryPath}/${directoryFiles[i]}`,
            {
              mode: true,
              absolutePath: false,
            },
          );
          if (inspectedFile!.type === 'dir') {
            mode = fs.constants.S_IFDIR;
          }

          responder.file(directoryFiles[i], {
            mode,
            size: inspectedFile!.size || 0,
            atime: inspectedFile!.accessTime
              ? inspectedFile!.accessTime!.getTime() / 1000
              : undefined,
            mtime: inspectedFile!.modifyTime
              ? inspectedFile!.modifyTime!.getTime() / 1000
              : undefined,
          });
          i += 1;
          return i;
        }
        return responder.end();
      });
      return responder.on('end', () => {
        debug('debug')('Finish listing directory files');
      });
    });

    session.on('readfile', (filePath, writeStream) => {
      filePath = upath.normalizeSafe(filePath);
      const relativeFilePath = `.${filePath.substring(currentPath.length)}`;
      debug('debug')(`Reading ${relativeFilePath}`);
      return fsJetpack.createReadStream(relativeFilePath).pipe(writeStream);
    });

    session.on('writefile', (filePath, readStream) => {
      filePath = upath.normalizeSafe(filePath);
      const absoluteFilePath = `.${filePath}`;
      debug('info')(`Attempting to write file to ${absoluteFilePath}`);
      debug('info')(filePath);

      const fileDirectory = filePath.split('/');
      fileDirectory.pop();
      fsJetpack.dir(`.${fileDirectory.join('/')}`);

      const writeStream = fsJetpack.createWriteStream(absoluteFilePath);
      writeStream.on('open', () => {
        readStream.pipe(writeStream);
      });
      readStream.on('end', () => {
        debug('info')(`Writing to ${filePath} completed.`);
      });
    });

    session.on('delete', (filePath, responder) => {
      filePath = upath.normalizeSafe(filePath);
      fsJetpack.remove(filePath);
      responder.end();
    });
  });
});

server.on('error', (error) => {
  debug('error')('Server encountered an error', error);
});
server.on('end', () => {
  debug('info')(`User has disconnected at ${moment().toLocaleString()}`);
});

(async () => {
  const port = 3001;
  server.listen(port);
  debug('info')(`Server is listening on port ${port}`);
})();
