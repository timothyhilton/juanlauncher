import { Client, IUser } from 'minecraft-launcher-core'
import { Auth } from 'msmc'
import { DownloaderHelper } from 'node-downloader-helper'
import os from 'os'
import path from 'path'
import fs from 'fs'
import unzipper from 'unzipper'
import { BrowserWindow } from 'electron'

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
        name: string
      }
    ]
  }
]

export const launch = async (selectedVersion: string, accountId: string, window: BrowserWindow) => {
  const isDownloaded = checkBuildDownloaded(selectedVersion)
  if (!isDownloaded) {
    throw new Error('Selected version is not downloaded')
  }

  const zipPath = path.join(rootPath, 'releasezips', `juanclient-${selectedVersion}.zip`)
  await unzipVersion(zipPath, selectedVersion)
  await launchGame(selectedVersion, accountId, window)
}

export const unzipVersion = async (zipPath: string, releaseName: string): Promise<void> => {
  const versionsDir = path.join(rootPath, 'versions')

  if (!fs.existsSync(versionsDir)) {
    fs.mkdirSync(versionsDir, { recursive: true })
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: path.join(rootPath, 'versions') }))
      .on('close', () => {
        console.log('Files unzipped successfully')
        resolve()
      })
      .on('error', reject)
  })
}

export const downloadRelease = async (release: releasesData[0]): Promise<string> => {
  const latestRelease = release.assets[0]
  const downloadDir = path.join(rootPath, 'releasezips')

  console.log(`Downloading juan client ${release.tag_name}`)

  const fileUrl = latestRelease.browser_download_url
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true })
  }

  const dl = new DownloaderHelper(fileUrl, downloadDir)

  return new Promise((resolve, reject) => {
    dl.on('end', () => {
      console.log('Download completed')
      resolve(path.join(downloadDir, latestRelease.name))
    })
    dl.on('error', reject)
    dl.start()
  })
}

export const launchGame = async (
  releaseName: string,
  accountId: string,
  window: BrowserWindow
): Promise<void> => {
  const authManager = new Auth('select_account')
  const xboxManager = await authManager.launch('electron')
  const token = await xboxManager.getMinecraft()

  const opts = {
    authorization: token.mclc() as IUser,
    root: rootPath,
    version: {
      number: '1.8.8',
      type: 'release',
      custom: `juanclient-${releaseName}`
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
  launcher.on('data', (e) => {
    if (e.includes('LWJGL Version:')) {
      console.log('Game has launched, closing Electron window')
      window.close()
    }
  })
}

export const checkBuildDownloaded = (selectedVersion: string): boolean => {
  const zipPath = path.join(rootPath, 'releasezips', `juanclient-${selectedVersion}.zip`)
  try {
    fs.accessSync(zipPath)
    return true
  } catch {
    return false
  }
}

export const downloadBuild = async (selectedVersion: string): Promise<void> => {
  const req = await fetch('https://api.github.com/repos/timothyhilton/juanclient/releases')
  const releasesData: releasesData = await req.json()
  const selectedRelease = releasesData.find((release) => release.tag_name === selectedVersion)

  if (!selectedRelease) {
    throw new Error('Selected version not found')
  }

  await downloadRelease(selectedRelease)
}
