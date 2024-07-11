import { Client, IUser } from 'minecraft-launcher-core'
import { Auth } from 'msmc'
import { DownloaderHelper } from 'node-downloader-helper'
import os from 'os'
import path from 'path'
import fs from 'fs'
import unzipper from 'unzipper'

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
  const latestRelease = releasesData[0].assets[0]
  const filePath = path.join(rootPath, 'releasezips')

  const zipPath = path.join(filePath, latestRelease.name)

  if (fs.existsSync(filePath)) {
    console.log('latest release zip already downloaded, skipping')
    unzipVersion(zipPath, latestRelease.name.replace('.zip', ''))
  } else {
    downloadRelease(releasesData)
  }
}

const unzipVersion = async (zipPath: string, releaseName) => {
  const versionsDir = path.join(rootPath, 'versions')

  if (!fs.existsSync(versionsDir)) {
    fs.mkdirSync(versionsDir)
  }

  fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: path.join(rootPath, 'versions') }))
    .on('close', () => {
      console.log('files unzipped successfully, launching game')
      launchGame(releaseName)
    })
}

const downloadRelease = async (releasesData: releasesData) => {
  const latestRelease = releasesData[0].assets[0]
  const downloadDir = path.join(rootPath, 'releasezips')

  console.log(`downloading juan client ${releasesData[0].tag_name}`)

  const fileUrl = latestRelease.browser_download_url
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir)
  }

  const dl = new DownloaderHelper(fileUrl, downloadDir)

  dl.start()
  await dl.on('end', () => {
    console.log('download completed, unzipping download')
    unzipVersion(path.join(downloadDir, latestRelease.name), latestRelease.name.replace('.zip', ''))
  })
}

const launchGame = async (releaseName: string) => {
  const authManager = new Auth('select_account')
  const xboxManager = await authManager.launch('electron')
  const token = await xboxManager.getMinecraft()

  const opts = {
    authorization: token.mclc() as IUser,
    root: rootPath,
    version: {
      number: '1.8.8',
      type: 'release',
      custom: releaseName
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
