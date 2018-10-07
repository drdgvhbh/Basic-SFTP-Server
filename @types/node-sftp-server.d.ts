declare module 'node-sftp-server' {
  import { WriteStream } from 'fs';

  class Responder {
    on(event: 'dir', cb: () => number);
    on(event: 'end', cb: () => void);
    file(
      file: string,
      attr: {
        mode?: number;
        size?: number;
        atime?: number;
        mtime?: number;
      },
    );
    end();
  }

  class SFTPSession {
    on(event: 'readdir', cb: (path: string, responder: Responder) => void);
    on(event: 'readfile', cb: (path: string, writeStream: WriteStream) => void);
    on(
      event: 'writefile',
      cb: (path: string, writeStream: WriteStream) => void,
    );
    on(event: 'delete', cb: (path: string, responder: Responder) => void);
  }

  class Auth {
    method: string;
    username: string;
    password: string;
    reject(fields: string[], bool: boolean);
    accept(cb: (session: SFTPSession) => void);
  }

  class SFTPServer {
    listen(port: number);
    on(event: 'connect', cb: (auth: Auth, info: Object) => any);
    on(event: 'error' | 'end', cb: (error: Error) => void);
    on(event: 'end', cb: () => void);
  }

  export = SFTPServer;
}
