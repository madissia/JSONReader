# JSONReader
A simple JSON reader and writer

## Usage
```javascript
// test.json
/*
{
	"timesRead": 0
}
*/
const JSONReader = require('@madissia/json-reader')

// Read JSON file
let json = JSONReader('test.json')

// Access data
if(!json.timesRead) // if data doesn't exist, create it
	json.timesRead = 0
console.log('"test.json" has been read ' + json.timesRead + ' times')

// Change data, doesn't affect file
json.timesRead += 1

// Write changes to file
json.save()
```
