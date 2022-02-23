const Client = require('@icetee/ftp')
const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn
const when = require('when')
const nodefn = require('when/node')
const sequence = require('when/sequence')

const BuildDir = path.resolve(__dirname, '..', 'build')

const FtpCredentials = {
  testcommand: {
    host: 'sportocoplayalong.com',
    user: 'testcommandyg9jhb@sportocoplayalong.com',
    password: 't76uyghj!KKii8yuhk',
  },
}

let credentials = FtpCredentials.testcommand

run('ls', ['-al'], { cwd: path.join(__dirname, '..') })
  .then(_ => run('ls', ['-al'], { cwd: path.join(__dirname, '..', 'build') }))
  .then(_ => {
    let list = walkSync(BuildDir)
    console.log(`Uploading compiled web app to the testcommand site`)
    return upload(credentials, list, '').then(_ =>
      console.log('Upload Successful')
    )
  })
  .then(_ => process.exit(0))
  .catch(err => {
    console.error(`Upload failed. Reason:\n${err}`)
    if (err.stack) {
      console.error(`::Stack\n${err.stack}`)
    }
    process.exit(1)
  })

//------------------------------------------------------------------------
function walkSync(dir, filelist) {
  if (!filelist) {
    filelist = []
  }

  const files = fs.readdirSync(dir)

  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist)
    } else {
      filelist.push(path.join(dir, file).replace(/\\/g, '/'))
    }
  })

  return filelist
}

//------------------------------------------------------------------------
function upload(cred, list, baseDir = '') {
  let defer = when.defer()
  let c = new Client()
  let ftp = nodefn.liftAll(c)

  ftp.on('ready', _ => {
    ftpRmdir(ftp, baseDir, true)
      .catch(err => {
        if (err.code === 501 && err.code === 550) {
          // Expected directory doesn't exist
          return
        }
        console.error(`Failed to delete remote directory. Reason: ${err}`)
        return defer.reject(err)
      })
      .then(_ => {
        // For each file create the remote dir, and push the file
        let acts = list.reduce((acts, file) => {
          let relative = path.posix.relative(
            BuildDir.replace(/\\/g, '/'),
            file.replace(/\\/g, '/')
          )
          let ftpDir = `${path.posix.join(baseDir, relative)}`

          let promise = when.resolve()

          let remoteParentDir = path.dirname(ftpDir)

          if (remoteParentDir !== '.') {
            promise = promise.then(_ => ftpMkdir(ftp, remoteParentDir, true))
          }

          promise = promise.then(_ => {
            return ftpPut(ftp, file, ftpDir).then(_ =>
              console.log(`Uploaded File: ${ftpDir}`)
            )
          })

          acts.push(_ => promise)
          return acts
        }, [])

        return sequence(acts)
      })
      .then(_ => {
        ftp.end()
        return defer.resolve()
      })
  })

  ftp.on('end', () => {
    process.stdout.write(`Pushing New Build: 100%  \n`)
    console.log('Upload Complete')
    defer.resolve()
  })

  ftp.on('error', e => {
    console.error(e)
    defer.reject(e)
  })

  ftp.on('greeting', msg => {
    console.log('Connection succesful.')
  })

  ftp.connect(cred)

  return defer.promise
}

//------------------------------------------------------------------------
function ftpRmdir(client, dir, recursive) {
  let defer = when.defer()

  client.rmdir(dir, recursive, err => {
    if (err.code != 501 && err.code != 550) {
      // Expected directory doesn't exist
      return defer.reject(err)
    }

    return defer.resolve()
  })

  return defer.promise
}

//------------------------------------------------------------------------
function ftpPut(client, localPath, remotePath) {
  let defer = when.defer()

  //console.log(`Uploading file:\n   ${localPath}\n   ${remotePath}`)
  client.put(localPath, './' + remotePath, err => {
    if (err) {
      return defer.reject(err)
    }
    return defer.resolve()
  })

  return defer.promise
}

//------------------------------------------------------------------------
function ftpMkdir(client, dir, recursive = true) {
  let defer = when.defer()

  client.mkdir(dir, recursive, err => {
    if (err) {
      return defer.reject(err)
    }
    return defer.resolve()
  })

  return defer.promise
}

/*------------------------------------------------------------------------
 * Runs a child process
 *
 * @param {any} command
 * @param {any} args
 * @param {any} options
 *          : cwd
 *          : env
 *          : shell {bool}
 *          : tapStdout {function(line)}
 *          : tapStderr {function(line)}
 * @returns
 *----------------------------------------------------------------------*/
function run(command, args, options) {
  return new Promise((resolve, reject) => {
    let opts = options || {}
    opts.env = opts.env || process.env
    opts.shell = opts.shell || false
    opts.tapStdout = opts.tapStdout || (_ => _)
    opts.tapStderr = opts.tapStderr || (_ => _)

    // Backwards compatibility with node 6.x -> 8.x
    if (opts.cwd == null) {
      if (typeof process.cwd === 'function') {
        opts.cwd = process.cwd()
      } else {
        opts.cwd = process.cwd
      }
    }

    // console.log(`Running:\n${command} ${args.join(' ')}`)
    // console.log(`cwd: ${opts.cwd}`)
    let proc = spawn(command, args, opts)

    proc.stdout.setEncoding('utf8')
    proc.stderr.setEncoding('utf8')

    proc.stdout.on('data', data => {
      let tokens = data.split('\n')
      tokens.forEach(line => opts.tapStdout(line))
      process.stdout.write(`${data}`)
    })

    proc.stderr.on('data', data => {
      let tokens = data.split('\n')
      tokens.forEach(line => opts.tapStderr(line))
      process.stderr.write(`${data}`)
    })

    proc.on('exit', code => {
      if (code == 0) {
        resolve(code)
      } else {
        reject(code)
      }
    })

    proc.on('error', err => {
      console.log('err')
      reject(err)
    })
  })
}
