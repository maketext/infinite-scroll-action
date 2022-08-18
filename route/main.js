//process.env.NODE_ENV = 'production'

const events = require('events')
const express = require('express')
const app = express()
const axios = require('axios')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const querystring = require('querystring')


let baseURL = '127.0.0.1'
const port = 8888

function log(str)
{
	console.log(str)
}

app.use((req, res, next) => {
	log(`\n\n새 라우팅 ${req.path}`)

	res.on("finish", function() {
		log("응답메시지 전송됨.")
	})
	// 직렬화/역직렬화, 캐싱확인용 컴포넌트 들어갈 자리.
	next()
})

app.use(express.static(path.join(__dirname, '..', 'res')))
app.use(cors())
app.use(bodyParser.json())

app.listen(port, () => {
	log("HTTP 네트워크 소켓 리스닝 중...")
})

	
app.set('view engine', 'pug')
app.set('views', path.join(__dirname,'..', 'pug'))


app.get('/favicon.ico', (req, res, next) => { //favicon.ico 404, 302 리다이렉트 오류나 경고 뜨면 브라우저 로딩 속도 느려진다.
	log("파비콘")
	//res.sendFile('/img/favicon.png')
	res.redirect('/img/favicon.png')
	next()
})
app.all("/error", (req, res, next) => {
	res.render('error', {axiosAddr: 'http://127.0.0.1:8888'})
	next()
})
app.get(['/'], (req, res, next) => {
	res.render('index', {axiosAddr: baseURL})
	next()
})
let common = path.join(__dirname, '..', "res/img/")

app.get('/img/:img', (req, res, next) => {
	let im = querystring.unescape(req.params.img)
	if(im.includes('img'))
		im = 'img'
	let newfile = `${common}${im}.jpg`
	console.log(`im=${im}`)

	if(im == 'error') 
	{
		res.writeHead(200)
		res.end('')
	}

	log("그림 다운로드")
	log(newfile)
	fs.readFile(newfile, (err, data) => {
		if(err)
		{
			log(err)
			fs.readFile(newfile.replace('jpg', 'png'), (err, data) => {
				if(err)
				{
					fs.readFile(`${common}x.jpg`, (err, data) => {
						res.writeHead(200, {"Content-Type": "img/jpeg"})
						res.end(data)
					})
				}
				else
				{
					res.writeHead(200, {"Content-Type": "img/png"})
					res.end(data)
				}
			})

		}
		else
		{
			res.writeHead(200, {"Content-Type": "img/jpeg"})
			res.end(data)
		}
		
	})
})