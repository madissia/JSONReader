const fs = require('fs')

const DefaultOptions = {
	whitespace: '\t',
	synchronous: true
}

checkDirectoryExists = (file) =>
{
	let directories = /.*(\/|\\)/g.exec(file
							.replace('\\', '/')
							.replace('//', '/')
						)
	if(!directories) // local directory or error
		return
	if(!fs.existsSync(directories[0]))
		fs.mkdirSync(directories[0])
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
		this._options.whitespace = this._options.whitespace != undefined ? this._options.whitespace : DefaultOptions.whitespace
		this._options.synchronous = this._options.synchronous != undefined ? this._options.synchronous : DefaultOptions.synchronous

		checkDirectoryExists(path)
		this.refresh()
	}

	// Re-reads the file into 'this.data'
	refresh()
	{
		if(this._options.synchronous)
			this.data = this.read()
		else
			this.read()
					.then((data) => this.data = data)
	}

	// Returns file without overriding 'this.data'
	read()
	{
		let path = this._path
		if(!fs.existsSync(path))
			fs.writeFileSync(path, '{}') // write a default .json file
		// Read file
		if(this._options.synchronous) // Synchronous
			return JSON.parse(fs.readFileSync(path))
		else
			return new Promise((resolve, reject) =>
			{
				fs.readFile(path, (err, data) =>
				{
					if(err) return reject(err)
					try { resolve(JSON.parse(data)) }
					catch(e) { reject(e.message) }
				})
			})
	}

	// Write file
	save()
	{
		let path = this._path
		let json = JSON.stringify(this.data, undefined, this._options.whitespace)
		if(this._options.synchronous)
			fs.writeFileSync(path, json)
		else
			return new Promise((resolve, reject) =>
			{
				fs.writeFile(path, json, (err) =>
				{
					if(err) return reject(err)
					resolve()
				})
			})
	}
}

// Proxy so users can omit 'data'. e.g. 'this.config.id' instead of 'this.config.data.id' (code reduction and easier to read)
module.exports = (path, options = DefaultOptions) => new Proxy(new JSONReader(path, options), {
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
