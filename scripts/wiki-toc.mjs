import path from 'path'
import fs from 'fs/promises'

async function generateTableOfContents(dir) {
  const processDirectory = async (directory) => {
    const files = await fs.readdir(directory)
    const section = {
      name: path.basename(directory),
      items: [],
    }

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        // If it is a directory, perform regression.
        section.items?.push(await processDirectory(filePath, false))
      } else {
        const fileName = path.basename(filePath, path.extname(filePath))
        const formattedPath = filePath
          .replaceAll('\\', '/') // Fix bug on windows with backwards slashes
          .replaceAll('pages', '') // Remove pages as this folder is not included in the link.

        section.items?.push({
          name: fileName.replaceAll('-', ' ').replaceAll('index', 'overview'),
          link: formattedPath
            .replace(/\..*/, '') // Remove line ending.
            .replaceAll(/\/index\/?$/g, ''), // index should be ignored
        })
      }
    }

    section.items = section.items.sort((a) => (a.name === 'overview' ? -1 : 1))

    return section
  }

  return await processDirectory(dir)
}

const main = async () => {
  // Load the structure from pages/app/docs
  const content = await generateTableOfContents('./pages/docs')

  await fs.writeFile('./public/docs-toc.json', JSON.stringify(content), {
    encoding: 'utf-8',
  })

  process.exit(0)
}

main()
