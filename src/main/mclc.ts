import { Client, IUser } from 'minecraft-launcher-core'
import { Auth } from 'msmc'
import { DownloaderHelper } from 'node-downloader-helper'
import os from 'os'
import path from 'path'
import fs from 'fs'

const launcher = new Client()
const rootPath = path.join(
  os.homedir(),
  process.platform === 'win32' ? 'AppData/roaming/.juan' : '.juan'
)

type releasesData = [
  {
    tag_name: string
    assets: [
      {
        browser_download_url: string
        name
      }
    ]
  }
]

export const launch = async () => {
  const req = await fetch('https://api.github.com/repos/timothyhilton/juanclient/releases')
  const releasesData: releasesData = await req.json()

  console.log(`getting juan client ${releasesData[0].tag_name}`)

  const latestRelease = releasesData[0].assets[0]
  const fileUrl = latestRelease.browser_download_url
  const filePath = path.join(rootPath, 'releasezips')
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath)
  }

  const dl = new DownloaderHelper(fileUrl, filePath)

  dl.start()
  dl.on('end', () => {
    console.log('download completed, launching game')
    unzipVersion(path.join(filePath, latestRelease.name))
  })
}

export const unzipVersion = (filePath: string) => {
  launchGame()
}

const launchGame = async () => {
  const authManager = new Auth('select_account')
  const xboxManager = await authManager.launch('electron')
  const token = await xboxManager.getMinecraft()

  const opts = {
    authorization: token.mclc() as IUser,
    root: rootPath,
    version: {
      number: '1.8.8',
      type: 'release'
    },
    memory: {
      max: '6G',
      min: '4G'
    }
  }

  console.log('Starting!')
  launcher.launch(opts)

  launcher.on('debug', (e) => console.log(e))
  launcher.on('data', (e) => console.log(e))
}
