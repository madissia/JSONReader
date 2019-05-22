const fs = require('fs')

const DefaultOptions = {
	whitespace: '\t'
}

checkDirectoryExists = (file) =>
{
	let directory = /.*(\/|\\)/g.exec(file)[0]
	if(!fs.existsSync(directory))
		fs.mkdirSync(directory)
}

class JSONReader
{
	constructor(path, options = DefaultOptions)
	{
		if(!path)
		{
			console.log('Invalid path in constructor of JSONReader!')
			return
		}
		this._path = path
		this.data = {}

		this._options = options
		this._options.whitespace = this._options.whitespace || DefaultOptions.whitespace

		checkDirectoryExists(path)
		this.refresh()
	}

	// Re-reads the file into 'this.data'
	refresh() { this.data = this.read() }

	// Returns file without overriding 'this.data'
	read()
	{
		if(!fs.existsSync(this._path))
			fs.writeFileSync(this._path, '{}') // write a default .json file
		// Read file
		return JSON.parse(fs.readFileSync(this._path))
	}

	// Write file
	save() { fs.writeFileSync(this._path, JSON.stringify(this.data, undefined, this._options.whitespace)) }
}

// Proxy so users can call e.g. 'this.config.id' instead of 'this.config.data.id' (code reduction and easier to read)
module.exports = (path) => new Proxy(new JSONReader(path), {
	get: (target, name) =>
	{
		if(name in target)
			return target[name]
		if(name in target.data)
			return target.data[name]
		return undefined
	},

	set: (target, name, value) =>
	{
		if(name in target)
			target[name] = value
		else if(name in target.data)
			target.data[name] = value
		else
			target.data[`${name}`] = value
		return true
	}
})
