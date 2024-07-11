import path from 'path'
import os from 'os'
import fs from 'fs-extra'

const getMinecraftPath = () =>
  path.join(
    os.homedir(),
    process.platform === 'win32' ? 'AppData/Roaming/.minecraft' : '.minecraft'
  )

const getJuanPath = () =>
  path.join(os.homedir(), process.platform === 'win32' ? 'AppData/Roaming/.juan' : '.juan')

export const copyGameSettings = async () => {
  const minecraftPath = getMinecraftPath()
  const juanPath = getJuanPath()

  try {
    await fs.copy(path.join(minecraftPath, 'options.txt'), path.join(juanPath, 'options.txt'), {
      overwrite: true
    })
    return { success: true, message: 'Game settings copied successfully' }
  } catch (error) {
    console.error('Error copying game settings:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while copying game settings'
    }
  }
}

export const copyResourcePacks = async () => {
  const minecraftPath = getMinecraftPath()
  const juanPath = getJuanPath()

  try {
    const resourcePacksSource = path.join(minecraftPath, 'resourcepacks')
    const resourcePacksDestination = path.join(juanPath, 'resourcepacks')

    await fs.ensureDir(resourcePacksDestination)

    const files = await fs.readdir(resourcePacksSource)
    for (const file of files) {
      const sourcePath = path.join(resourcePacksSource, file)
      const destPath = path.join(resourcePacksDestination, file)

      if (!(await fs.pathExists(destPath))) {
        await fs.copy(sourcePath, destPath)
      }
    }

    return { success: true, message: 'Resource packs copied successfully' }
  } catch (error) {
    console.error('Error copying resource packs:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while copying resource packs'
    }
  }
}
