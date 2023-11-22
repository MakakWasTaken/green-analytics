// Get random Material Design color
export const getRandomColor = (numberOfColors: number): string[] => {
  // List of Material Design colors
  const colors: { [key: string]: string } = {
    red: '#f44336',
    pink: '#e91e63',
    purple: '#9c27b0',
    deeppurple: '#673ab7',
    indigo: '#3f51b5',
    blue: '#2196f3',
    lightblue: '#03a9f4',
    cyan: '#00bcd4',
    teal: '#009688',
    green: '#4caf50',
    lightgreen: '#8bc34a',
    lime: '#cddc39',
    yellow: '#ffeb3b',
    amber: '#ffc107',
    orange: '#ff9800',
    deeporange: '#ff5722',
    brown: '#795548',
  }

  // Get random color and then slice it to get the number of colors we want
  const getColor = () => {
    const color = Object.keys(colors)[0]

    const actualColor = colors[color]
    delete colors[color]

    return actualColor
  }

  const randomColor = []
  for (let i = 0; i < numberOfColors; i++) {
    randomColor.push(getColor())
  }

  // Return random color
  return randomColor
}

/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The converted string
 */
export const toTitleCase = (str: string): string => {
  const s = str.trim()
  return s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const titleToMarkdownId = (str: string) => {
  return str
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll(/[^\w-]/g, '')
}
