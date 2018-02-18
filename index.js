const config = require('./config.json')
const http = require('http')
const auth = require('http-auth')
const mailin = require('mailin')
const mcapi = require('mailchimp-api-v3')
const mc = new mcapi(config.mcapi)
const winston = require('winston')

const basic = auth.basic(
	{ realm: "BC2MC Logs" },
	(username, password, callback) => { 
		callback(username === config.authuser && password === config.authpassword)
	}
)

winston.add(winston.transports.File, { filename: 'emails.log' })

mailin.start({
	port: 25,
 	disableWebhook: true // Disable the webhook posting.
})

mailin.on('message', (connection, data, content) => {
	return new Promise((resolve, reject) => {
		// Bandcamp purchase emails always start with "Cha-Ching!" in the email
		const subjectRegex = /Cha-Ching/i.test(data.subject)
		if (subjectRegex !== true) {
			reject(new Error('Invalid subject parsed'))
		}

		const person = new RegExp('Greetings ' + config.bandcampname + ',\n\n(.*) (.*) \((.*)\)').exec(data.text)

		if (person) {
			winston.info(`${person[1]}, ${person[2]}, ${person[3]}`)
			mc.post(`lists/${config.mclist}/members`, {
				email_address: person[3],
				merge_fields: {
					FNAME: person[1],
					LNAME: person[2]
				},
				status: "subscribed"
			})
				.then(results => {
					resolve(`Successfully added ${person[1]} ${person[2]}`)
				})
				.catch(err => {
					reject(new Error(`Failed to add ${person[1]} ${person[2]}. Because ${JSON.stringify(err)}`))
				})
		} else {
			reject(new Error(`WARNING: Received invalid email: "${data.subject}" - "${data.text.substring(0, 128)}"`))
		}
	})
	.then(success => winston.info(success))
	.catch(err => winston.error(err.message))
})

if (config.enablehttplog !== undefined && config.enablehttplog !== null && config.enablehttplog === true) {

const server = http.createServer(basic, (request, response) => {
	var options = {
		from: new Date() - 24 * 7 * 60 * 60 * 1000,
		until: new Date(),
		limit: 128,
		start: 0,
		order: 'desc',
		fields: [ 'message','timestamp' ]
	}

	winston.query(options, (err, results) => {
		response.setHeader('Content-Type', 'text/html')

		if (err) return response.end(`Error<br/><code>${JSON.stringify(err, null, 4)}</code>`)

		let out_str = `<style>body{font-family:"Helvetica Neue", sans-serif;}p{margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #555;}</style><h1>Log:</h1>`;

		for (var i = 0; i < results.file.length; i++) {
			out_str += `<p><strong>${results.file[i].message}</strong><br/>${results.file[i].timestamp}</p>`;
		}

		return response.end(out_str)
	})
})

server.listen(config.port, (err) => {  
	if (err) return winston.info(`The server could not start. ${JSON.stringify(err, null, 2)}`)

	console.log(`server is listening on port ${config.port}`)
})
}
