const { glob, globSync, globStream, globStreamSync, Glob } = require('glob')

const g = glob.sync('src/assets/**/*', {})
console.log(g)
