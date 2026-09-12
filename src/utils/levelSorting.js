const numeric = value => Number(value) || 0

// Position is the maintained difficulty order: #1 is hardest.
export function sortLevels(levels, sort) {
  return [...levels].sort((a, b) => {
    const position = numeric(a.position) - numeric(b.position)
    const victories = numeric(b.victoryCount) - numeric(a.victoryCount)

    switch (sort) {
      case 'beaten':
        return victories || position
      case 'easiest':
        return -position || victories
      case 'hardest':
      default:
        return position || victories
    }
  })
}
