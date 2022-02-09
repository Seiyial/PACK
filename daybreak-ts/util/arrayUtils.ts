export const dkMapify = <T>(arr: T[], keyFactory: (item: T) => string) => {
    return arr.reduce((acc, item) => {
        acc[keyFactory(item)] = item
        return acc
    }, { } as { [key: string]: T })
}

export const dkSpliceFirstWhere = <T>(arr: T[], condition: (item: T) => boolean): T | null => {
    const idx = arr.findIndex(condition)
    if (idx === -1) {
        return null
    } else {
        return arr.splice(idx, 1)[0]
    }
}

