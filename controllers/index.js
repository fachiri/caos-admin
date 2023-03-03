const { readdirSync } = require('fs');

const files = readdirSync(__dirname);
let modules = {}

files.forEach(e => {
  const name = e.split(".")[0]
  const type = e.split(".")[1]
  if(type == "controller") {
    modules[`${name}Controller`] = require(`./${name}.${type}.js`)
  }
})

module.exports = modules