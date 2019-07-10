const fs = require('fs')
const JSONReader = require('./')
require('jest')

const testPath = './test.json'

describe('jsonReader', () =>
{
	afterEach(() =>
	{
		if(fs.existsSync(testPath)) // If exists
			fs.unlinkSync(testPath) // Delete
	})

	test('sync-write', () =>
	{
		// Set variables
		let reader = JSONReader(testPath, { synchronous: true })
		let testString = 'testing1234'

		// Execute test
		reader.testData = testString
		reader.save()

		// Check data
		let readValue = JSON.parse(fs.readFileSync(testPath)).testData

		expect(readValue).toBeDefined()
		expect(readValue).toMatch(testString)
	})

	test('sync-read', () =>
	{
		// Setup
		let testString = 'synchronous24'
		fs.writeFileSync(testPath, `{"testReadData": "${testString}"}`)

		let reader = JSONReader(testPath, { synchronous: true })

		// Check data (JSONReader reads within constructor, no need to execute)
		expect(reader.testReadData).toBeDefined()
		expect(reader.testReadData).toMatch(testString)
	})

	test('async-write', done =>
	{
		expect.hasAssertions()

		// Variables
		let reader = JSONReader(testPath, { synchronous: false })
		let testString = 'async_12'

		reader.testData = testString

		// Execute
		return reader.save()
				.then(() =>
				{
					let readValue = JSON.parse(fs.readFileSync(testPath)).testData

					expect(readValue).toBeDefined()
					expect(readValue).toMatch(testString)
					done()
				})
	})

	test('async-read', done =>
	{
		expect.hasAssertions()

		// Setup
		let testString = 'async_24'
		fs.writeFileSync(testPath, `{"testReadData": "${testString}"}`)

		let reader = JSONReader(testPath, { synchronous: false })

		// Execute
		return reader.read()
				.then(() =>
				{
					expect(reader.testReadData).toMatch(testString)
					done()
				})
	})
})
