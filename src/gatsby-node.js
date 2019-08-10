const { resolve, relative } = require(`path`)
const { ensureDir, readdir, copy } = require(`fs-extra`)

///////////////////////////////////////////////////////////////////////////////////////////////////////
async function calculateDirs(store, { extraDirsToCache = [], cachePublic = false }) {
  const program       = store.getState().program
  const rootDirectory = program.directory

  const dirsToCache   = [
    cachePublic && resolve(rootDirectory, `public`),
    resolve(rootDirectory, `.cache`),
    ...extraDirsToCache.map(dirToCache => resolve(rootDirectory, dirToCache))
  ].filter(Boolean)

  for (const dir of dirsToCache) {
    await ensureDir(dir)
  }

  const netlifyCacheDir = resolve(process.env.NETLIFY_BUILD_BASE, `cache`, `gatsby`)

  await ensureDir(netlifyCacheDir)

  return { rootDirectory, dirsToCache, netlifyCacheDir }
}

exports.calculateDirs = calculateDirs

///////////////////////////////////////////////////////////////////////////////////////////////////////
function generateCacheDirectoryNames(rootDirectory, netlifyCacheDir, dirPath) {
  const relativePath = relative(rootDirectory, dirPath)
  const dirName      = relativePath.replace('/', '--')

  return { 
    cachePath: resolve(netlifyCacheDir, dirName),
    humanName: relativePath
  }
}

exports.generateCacheDirectoryNames = generateCacheDirectoryNames

///////////////////////////////////////////////////////////////////////////////////////////////////////
exports.onPreInit = async function({ store }, { extraDirsToCache, cachePublic }) {
  console.log(`plugin-netlify-cache: onPreInit`)
  if (!process.env.NETLIFY_BUILD_BASE) { return }

  const { dirsToCache, netlifyCacheDir, rootDirectory } = await calculateDirs(store, { extraDirsToCache, cachePublic })

  for (const dirPath of dirsToCache) {
    const { cachePath, humanName } = generateCacheDirectoryNames(rootDirectory, netlifyCacheDir, dirPath)

    await ensureDir(cachePath)

    const dirFiles = await readdir(dirPath)
    const cacheFiles = await readdir(cachePath)


    console.log(`plugin-netlify-cache: Restoring ${cacheFiles.length} cached files for ${humanName} directory with ${dirFiles.length} already existing files.`)
    console.log(cacheFiles)

    await copy(cachePath, dirPath)
  }

  console.log(`plugin-netlify-cache: Netlify cache restored`)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
exports.onPostBuild = async function({ store }, { extraDirsToCache, cachePublic }) {
  console.log(`plugin-netlify-cache: onPostBuild`)
  if (!process.env.NETLIFY_BUILD_BASE) { return }

  const { dirsToCache, netlifyCacheDir, rootDirectory } = await calculateDirs(store, { extraDirsToCache, cachePublic })

  for (const dirPath of dirsToCache) {
    const { cachePath, humanName } = generateCacheDirectoryNames(rootDirectory, netlifyCacheDir, dirPath)

    console.log(`plugin-netlify-cache: Caching ${humanName}...`)

    await copy(dirPath, cachePath)
  }

  console.log(`plugin-netlify-cache: Netlify cache refilled`)
}
