# Node SFTP Server

This is a very basic implementation of an Secure File Transfer Protocol (SFTP) server. You can interact with it using your favourite SFTP application.
Some applications include [WinSCP](https://winscp.net/eng/download.php).

## Setup
Add a `.env` file to your root directory.

Paste these contents

```
USERNAME=
PASSWORD=
```

Put in the respective username and password credentials for the server.

### Generate an RSA-Key file
Use Puttygen or a similar tool to generate a rsa-key file. A sample is file is provided [here](ssh_host_rsa_key_sample).
The file you generate should be named `ssh_host_rsa_key` and placed under your root directory.

### Installing
```
npm install
```

## Running
```
npm run dev
```

Connect to the SFTP server using any SFTP client on port **3001**.
