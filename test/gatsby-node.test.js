/* eslint-env node, jest */

const plugin = require('../src/gatsby-node')

describe('calculateDirs', () => {
  test('true', () => {
    // console.log(plugin)
    expect(true).toBe(true)
  })
})

describe('generateCacheDirectoryNames', () => {
  test('public/', () => {
    const res = plugin.generateCacheDirectoryNames('../', 'cache', 'public')
    expect(res.cachePath).toMatch(
      /\/gatsby-plugin-netlify-cache\/cache\/gatsby-plugin-netlify-cache--public/
    )
    expect(res.humanName).toEqual('gatsby-plugin-netlify-cache/public')
  })

  test('public/index.html', () => {
    const res = plugin.generateCacheDirectoryNames(
      '../',
      'cache',
      'public/index.html'
    )
    expect(res.cachePath).toMatch(
      /\/gatsby-plugin-netlify-cache\/cache\/gatsby-plugin-netlify-cache--public\/index.html/
    )
    expect(res.humanName).toEqual(
      'gatsby-plugin-netlify-cache/public/index.html'
    )
  })

  test('.cache/foo.json', () => {
    const res = plugin.generateCacheDirectoryNames(
      '../',
      'cache',
      '.cache/foo.json'
    )
    expect(res.cachePath).toMatch(
      /\/gatsby-plugin-netlify-cache\/cache\/gatsby-plugin-netlify-cache--.cache\/foo.json/
    )
    expect(res.humanName).toEqual('gatsby-plugin-netlify-cache/.cache/foo.json')
  })
})
