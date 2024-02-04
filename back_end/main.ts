import express from 'express'
import multer from 'multer'
import FormData from 'form-data'
import cors from 'cors'
import bodyParser from 'body-parser'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import mysql from 'mysql'
import mysqlConfig from './config/mysql.json'
import fs from 'fs'

import { JWTPayload } from './config/interface/main'
import { getAccessToken , checkPayload, isSqlSafe, getSelectionNavType,
getEnrouteQuery, 
parseDate,
getRandomString,
urlizeBase64,
unUrlizeBase64,
getWptType,
parseRunway,
getAppType} from './tools/tools'
import { dataDecrypt, dataEncrypt } from './tools/crypto'

process.title = 'efb-api'

const app = express()
const upload = multer({ dest: 'data/userdocs/' })
app.use(cors())
app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}))
app.use(express.json())
app.set('x-powered-by',false)
const pool = mysql.createPool(mysqlConfig)
const provider = 'CloudFlare/_protected_resource'

//JWT密钥
const public_key = `your public_key`

const private_key = `your private_key`

//一些错误提示
const missingQuery = {code:403,msg:'mising required querys' }  // 403
const invalidToken = {code:401,msg:'invalid token or expired token'}  //401
const invalidInput = {code:401,msg:'your input is illegal and it has been blocked by server'}  //401
const errorProcess = {code:403,msg:'An error occurs when processing your request'}  //403
const noResult = {code:404,msg:'no result', data: []}  //404
const requestTooHigh = {code: 403, msg: 'request level too high'}
const chartAuthFail = {code: 401, msg:'unauthorized'}
const chartSignFail = {code: 401, msg:'signature is not match with your token'}

//AIRAC期数
app.get('/efb-v2/config/airac', (req, res) => {
    const b = fs.readFileSync(__dirname + '/config/airac/airac.json')
    res.json(JSON.parse(b.toString()))
})

//航路图数据
app.get('/efb-v2/enroute/nav/:chunk',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('enroute')){
            return res.json(requestTooHigh)
        }
        const f = fs.readFileSync(`./data/navdata/${req.params.chunk}.db`)
        return res.send(f.toString())
    })
})

app.get('/efb-v2/enroute/aip/:theme/:z/:x/:y',(req, res) => {
    // if (!req.cookies){
    //     return res.status(401).send()
    // }
    // const token: string | undefined = req.cookies['SKYline-Authorization']
    //jwt.verify(token ? token : '', public_key, (err, payload) => {
        //if (err) return res.status(401).send()
        const z = req.params.z
        const x = req.params.x
        const y = req.params.y
        const theme = req.params.theme
        if (!z || !x || !y){
            return res.status(404).send()
        }
        const dir = __dirname + `/data/${theme === 'night' ? 'enroute_tiles_n' : 'enroute_tiles'}/${z}/${x}/${y}.png`
        res.sendFile(dir,(err) => {
            return res.status(404).send()
        })
    //})
})

app.post('/efb-v2/enroute/query/',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('navdata')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['type', 'ident'])){
            return res.json(missingQuery)
        }
        const type = req.body.type
        const ident = req.body.ident
        if (!isSqlSafe(type) || !isSqlSafe(ident)){
            return res.json(invalidInput)
        }
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            switch (type) {
                case 'airport':
                    return con.query(`SELECT * FROM airports WHERE icao = '${ident}' LIMIT 1`, (err, raws) => {
                        con.release()
                        try {
                            const d = raws[0]
                            if (!d){
                                return res.json(noResult)
                            }
                            return res.json({
                                code: 200,
                                refresh: Date.now(),
                                msg: 'enroute navdata query success',
                                data: getEnrouteQuery('airport', d)
                            })
                        } catch (error) {
                            return res.json(errorProcess)
                        }
                        
                    })
                case 'navaid':
                    return con.query(`SELECT * FROM navaids WHERE nav_ident = '${ident}'`, (err, raws) => {
                        con.release()
                        try {
                            //const d = raws
                            if (!raws){
                                return res.json(noResult)
                            }
                            let data: any[] = []
                            for (let i = 0; i < raws.length; i++){
                                const d = raws[i]
                                data.push(getEnrouteQuery('navaid',d))
                            }
                            return res.json({
                                code: 200,
                                refresh: Date.now(),
                                msg: 'enroute navdata query success',
                                data
                            })
                        } catch (error) {
                            return res.json(errorProcess)
                        }
                        
                    })
                default:
                    return res.json(noResult)
            }
        })
    })
})


app.get('/efb-v2/enroute/search',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('navdata')){
            return res.json(requestTooHigh)
        }
        let lat: number
        let lng: number
        try {
            let _lat = req.query.lat
            let _lng= req.query.lng
            if (!_lat || !_lng){
                return res.json(missingQuery)
            }
            lat = parseFloat(_lat as string)
            lng = parseFloat(_lng as string)
            if (Number.isNaN(lat) || Number.isNaN(lng)){
                return res.json(missingQuery)
            }
        } catch (error) {
            return res.json(missingQuery)
        }
        try {
            let queryCount = 0
            interface TempResult {
                airports: any[],
                vors: any[],
                ndbs: any[],
                otherNavids:[],
                waypoints: any[]
            }
            const result: TempResult = {
                airports: [],
                vors:[],
                ndbs:[],
                otherNavids:[],
                waypoints:[]
            }
            pool.getConnection((err, con) => {
                if (err) return res.json(errorProcess)
                con.query(`SELECT * FROM airports 
                WHERE latitude BETWEEN ${lat} - 0.2 AND ${lat} + 0.2 
                AND longitude BETWEEN ${lng} - 0.2 AND ${lng} + 0.2;
                `,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    for (let i = 0; i < raws.length; i++){
                        const d = raws[i]
                        result.airports.push(getEnrouteQuery('airport', d))
                    }
                    queryCount++
                    if (queryCount === 3){
                        //全部完成
                        con.release()
                        res.send({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })
                con.query(`SELECT * FROM navaids 
                WHERE latitude BETWEEN ${lat} - 0.2 AND ${lat} + 0.2 
                AND longitude BETWEEN ${lng} - 0.2 AND ${lng} + 0.2;
                `,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    for (let i = 0; i < raws.length; i++){
                        const d = raws[i]
                        //@ts-ignore
                        result[getSelectionNavType(d.Type)].push(getEnrouteQuery('navaid',d))
                    }
                    queryCount++
                    if (queryCount === 3){
                        con.release()
                        res.send({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })
                con.query(`SELECT * FROM waypoints 
                WHERE latitude BETWEEN ${lat} - 0.2 AND ${lat} + 0.2 
                AND longitude BETWEEN ${lng} - 0.2 AND ${lng} + 0.2;
                `,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    for (let i = 0; i < raws.length; i++){
                        const d = raws[i]
                        result.waypoints.push(getEnrouteQuery('waypoint',d))
                    }
                    queryCount++
                    if (queryCount === 3){
                        con.release()
                        res.send({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })

            })
        } catch (error) {
            
        }
    })
})

app.get('/efb-v2/navdata/search',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('navdata')){
            return res.json(requestTooHigh)
        }
        let query = req.query.t as string | undefined
        if (!query) return res.json(missingQuery)
        if (!isSqlSafe(query)) return res.json(invalidInput)
        try {
            let queryCount = 0
            interface TempQuery {
                airports: any[],
                vors: any[],
                ndbs: any[],
                otherNavids: any[],
                airways: any[],
                waypoints: any[]
            }
            let result: TempQuery = {
                airports:[],
                vors:[],
                ndbs:[],
                otherNavids:[],
                airways:[],
                waypoints:[]
            }
            pool.getConnection((err, con) => {
                if (err) return res.json(errorProcess)
                con.query(`SELECT * FROM airports
                WHERE icao LIKE '%${query}%'
                OR airport_name_english LIKE '%${query}%';
                `,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    for (let i = 0; i < raws.length; i++){
                        const d = raws[i]
                        result.airports.push(getEnrouteQuery('airport', d))
                    }
                    queryCount++
                    if (queryCount === 4){
                        con.release()
                        return res.json({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })
                con.query(`SELECT * FROM navaids
                WHERE ident LIKE '%${query}%'
                OR nav_name_english LIKE '%${query}%';
                `,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    for (let i = 0; i < raws.length; i++){
                        const d = raws[i]
                        //@ts-ignore
                        result[getSelectionNavType(d.Type)].push(getEnrouteQuery('navaid', d))
                    }
                    queryCount++
                    if (queryCount === 4){
                        con.release()
                        return res.json({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })
                con.query(`SELECT * FROM waypoints
                WHERE ident LIKE '%${query}%'
                `,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    for (let i = 0; i < raws.length; i++){
                        const d = raws[i]
                        result.waypoints.push(getEnrouteQuery('waypoint', d))
                    }
                    queryCount++
                    if (queryCount === 4){
                        con.release()
                        return res.json({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })
                con.query(`SELECT * FROM airwaysegments WHERE segment_airway_ident = '${query}' LIMIT 1`,(err, raws) => {
                    if (err) return res.json(errorProcess)
                    if (raws[0]){
                        const awy = raws[0]
                        // temp中保存全部的航路信息，同一个航路名不同航路保存于此
                        // e.g.  A1有4条航路，则temp[1]为第一条，temp[2]为第二条
                        result.airways.push({...awy})
                    }
                    queryCount++
                    if (queryCount === 4){
                        con.release()
                        return res.json({
                            code: 200,
                            data: result,
                            refresh: Date.now()
                        })
                    }
                })
            })
        } catch (error) {
            return res.json(errorProcess)
        }
    })
})

app.get('/efb-v2/database/getWeather',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            return con.query(`SELECT * FROM weathers WHERE icao = '${icao}'`, (err, raws) => {
                con.release()
                const d = raws[0]
                return res.json({
                    code: 200,
                    data: d
                })
            })
        })
    })
})

app.get('/efb-v2/database/getNOTAM',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            return con.query(`SELECT * FROM notams WHERE icao = '${icao}'`, (err, raws) => {
                con.release()
                return res.json({
                    code: 200,
                    data: raws
                })
            })
        })
    })
})

app.get('/efb-v2/database/getAirport',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`SELECT * FROM airports WHERE icao = '${icao}' LIMIT 1`,(e, raws) => {
                con.release()
                if (e) return res.json(errorProcess)
                const d = raws[0]
                if (!d) return res.json(errorProcess)
                try {
                    return res.json({
                        code: 200,
                        data: getEnrouteQuery('airport', d),
                        refresh: Date.now()
                    })
                } catch (error) {
                    return res.json(noResult)
                }
            })
        })
    })
})
app.get('/efb-v2/database/getAircraftConfig',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        fs.readFile(__dirname + '/data/other/aircraft.json', (err, buffer) => {
            if (err) return res.status(403).send()
            res.send({
                code: 200,
                config: dataEncrypt(buffer.toString())
            })
        })
    })
})
app.get('/efb-v2/database/getRunways',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) {
                con.release()
                return res.json(errorProcess)
            }
            con.query(`SELECT * FROM airport_runways WHERE airport_icao = ${icao}`,(e, raws) => {
                con.release()
                if (e) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    data: parseRunway(raws)
                })
            })
        })
    })
})

app.get('/efb-v2/database/getProcedures',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        const type = req.query.type as string
        if (!icao || !type) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        if (!isSqlSafe(type)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) {
                con.release()
                return res.json(errorProcess)
            }
            con.query(`SELECT * FROM procedures WHERE airport_icao = ${icao} AND procedure_type = ${type}`,(e, raws) => {
                con.release()
                if (e) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    data: raws
                })
            })
        })
    })
})

app.get('/efb-v2/database/getAPPs',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        const runway = req.query.runway as string
        if (!icao || !runway) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        if (!isSqlSafe(runway)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) {
                con.release()
                return res.json(errorProcess)
            }
            con.query(`SELECT * FROM approach_procedures WHERE airport_icao = ${icao} AND runwayident = ${runway}`,(e, raws) => {
                con.release()
                if (e) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    data: raws
                })
            })
        })
    })
})

app.get('/efb-v2/charts/jeppesen/chartList',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('charts')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        fs.readFile(`../efbdata/v2/charts/config/${icao.toUpperCase()}.json`,(err, buffer) => {
            try {
                if (err) return res.json(noResult)
                const data = JSON.parse(buffer.toString())
                return res.json({
                    code: 200,
                    data
                })
            } catch (error) {
                return res.json(errorProcess)
            }
        })
    })
})

app.get('/efb-v2/charts/aip/chartList',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('charts')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        fs.readFile(`../efbdata/v2/aips/config.json`,(err, buffer) => {
            try {
                if (err) return res.json(noResult)
                const data = JSON.parse(buffer.toString())
                for (let i = 0; i < data.length; i++){
                    if (data[i].icao === icao.toUpperCase()){
                        return res.json({
                            code: 200,
                            icao: icao.toUpperCase(),
                            data: data[i].data
                        })
                    }
                }
                return res.json(noResult)
            } catch (error) {
                return res.json(errorProcess)
            }
        })
    })
})

app.post('/efb-v2/charts/jeppesen/charturl',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('charts')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['airport_icao', 'chart_id','airport_chart_id', 'ident'])){
            return res.json(missingQuery)
        }
        const icao = req.body.airport_icao as string
        const id = req.body.airport_chart_id as number
        const random = getRandomString(16)
        const time = Date.now()
        const signature = urlizeBase64(dataEncrypt(`charts+${icao}+charts-id+${id}+random-payload=${random}+time=${time}`))
        return res.json({
            code: 200,
            data: {
                // link provided to CloudFlare, auto-server check-up
                // 只需要按照与CloudFlare配置一样的签名方法(也就是上面的signature)即可，使用时需要自己解密获取数据匹配
                url: `https://api.skylineflyleague.cn/efb-v2/${provider}/jeppesen/v2/charts?CloudFlare-Token=${random}&Signature=${signature}&Sign_at=${time}&Expire_at=${time + 15000}`
            },
            '_b': 'This URL is generated by CloudFlare, valid time is 15s'
        })
    })
})

app.post('/efb-v2/charts/aip/charturl',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('charts')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['display_name', 'file_id','token'])){
            return res.json(missingQuery)
        }
        const icao = req.body.display_name.split('-')[0]
        const id = req.body.file_id as number
        const random = getRandomString(16)
        const time = Date.now()
        const signature = urlizeBase64(dataEncrypt(`charts+${icao}+charts-id+${id}+random-payload=${random}+time=${time}`))
        return res.json({
            code: 200,
            data: {
                // link provided to CloudFlare, auto-server check-up
                // 只需要按照与CloudFlare配置一样的签名方法(也就是上面的signature)即可，使用时需要自己解密获取数据匹配
                url: `https://api.skylineflyleague.cn/efb-v2/${provider}/aip/charts?CloudFlare-Token=${random}&Signature=${signature}&Sign_at=${time}&Expire_at=${time + 15000}`
            },
            '_b': 'This URL is generated by CloudFlare, valid time is 15s'
        })
    })
})

app.get(`/efb-v2/${provider}/jeppesen/v2/charts`,(req, res) => {
    const token = req.query['CloudFlare-Token'] as string
    const _signature = req.query.Signature as string
    const sign = req.query['Sign_at'] as string
    const expire = req.query['Expire_at'] as string
    if (!token || !_signature || !sign || !expire){
        return res.json(chartAuthFail)
    }
    let signature: string
    try {
        signature = dataDecrypt(unUrlizeBase64(_signature))
    } catch (error) {
        return res.json(chartAuthFail)
    }
    if (!signature){
        return res.json(chartAuthFail)
    }
    //必须与CloudFlare后台配置的算法一样
    const icao = signature.split('charts+')[1].split('+charts-id')[0]
    const id = signature.split('charts-id+')[1].split('+random-payload')[0]
    const random = signature.split('random-payload=')[1].split('+time')[0]
    const time = signature.split('+time=')[1]
    try {
        if (time !== sign || Math.abs(parseInt(expire) - parseInt(time)) !== 15000 || random !== token){
            return res.json(chartSignFail)
        }
    } catch (error) {
        return res.json(chartSignFail)
    }
    if (Date.now() > parseInt(time) + 15000){
        return res.status(401).json({
            code: 401,
            msg: 'expired url'
        })
    }
    //全部签名和参数校验完成，可以开始获取航图
    fs.readFile(`../efbdata-charts/JeppView/${icao}/${id}.png`,(err, buffer) => {
        if (err) return res.status(403).json(errorProcess)
        res.setHeader('Content-Type', 'image/png')
        res.send(buffer)
    })
})

app.get(`/efb-v2/${provider}/aip/charts`,(req, res) => {
    const token = req.query['CloudFlare-Token'] as string
    const _signature = req.query.Signature as string
    const sign = req.query['Sign_at'] as string
    const expire = req.query['Expire_at'] as string
    if (!token || !_signature || !sign || !expire){
        return res.json(chartAuthFail)
    }
    let signature: string
    try {
        signature = dataDecrypt(unUrlizeBase64(_signature))
    } catch (error) {
        return res.json(chartAuthFail)
    }
    if (!signature){
        return res.json(chartAuthFail)
    }
    //必须与CloudFlare后台配置的算法一样
    const icao = signature.split('charts+')[1].split('+charts-id')[0]
    const id = signature.split('charts-id+')[1].split('+random-payload')[0]
    const random = signature.split('random-payload=')[1].split('+time')[0]
    const time = signature.split('+time=')[1]
    try {
        if (time !== sign || Math.abs(parseInt(expire) - parseInt(time)) !== 15000 || random !== token){
            return res.json(chartSignFail)
        }
    } catch (error) {
        return res.json(chartSignFail)
    }
    if (Date.now() > parseInt(time) + 15000){
        return res.status(401).json({
            code: 401,
            msg: 'expired url'
        })
    }
    //全部签名和参数校验完成，可以开始获取航图
    fs.readFile(`../efbdata-charts/ATMB/aips_eaip/${icao}/${id}.png`,(err, buffer) => {
        if (err) return res.status(403).json(errorProcess)
        res.setHeader('Content-Type', 'image/png')
        res.send(buffer)
    })
})

app.get('/efb-v2/database/getCommunication',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('database')){
            return res.json(requestTooHigh)
        }
        const icao = req.query.icao as string
        if (!icao) return res.json(missingQuery)
        if (!isSqlSafe(icao)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`SELECT * FROM communication_gens WHERE icao = '${icao}'`,(err1, raws) => {
                con.release()
                if (err1) return res.json(missingQuery)
                try {
                    let result: any[] = []
                    for (let d of raws){
                        result.push({
                            type: d.com_type,
                            frequency: d.frequency_common,
                            usage: d.usage_level,
                            callsign: d.communicati === 'ATIS' ? `${icao.toUpperCase()} ATIS`: d.callsign,
                            display_coord: [d.longitude, d.latitude]
                        })
                    }
                    return res.json({
                        code: 200,
                        data: result,
                        refresh: Date.now()
                    })
                } catch (error) {
                    return res.json(errorProcess)
                }
                
            })
        })
    })
})

app.post('/efb-v2/route/findRoute',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('routes')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['dep', 'arr'])) return res.json(missingQuery)
        const {dep, arr} = req.body
        // 查询航路功能涉及Trish API，咱不公开提供
    })
})

app.post('/efb-v2/route/selfRoute',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('routes')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['dep', 'arr', 'route'])) return res.json(missingQuery)
        const route = req.body.route
        const dep = req.body.dep
        const arr = req.body.arr
        if (!route || !dep || !arr) return res.json(missingQuery)
        if (!isSqlSafe(route)) return res.json(invalidInput)
        // 自定义航点查询航路功能涉及Trish API，咱不公开提供
    })
})

app.get('/efb-v2/user/getFlights',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`SELECT * FROM userflights WHERE usercid = '${(<JWTPayload>payload).cid}'`,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                const flights: any[] = []
                try {
                    for (let d of raws){
                        flights.unshift(JSON.parse(d.flights))
                    }
                } catch (error) {
                    
                }
                return res.json({
                    code: 200,
                    data: flights
                })
            })
        })
    })
})

app.post('/efb-v2/user/updateFlights',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['flights'])){
            return res.json(missingQuery)
        }
        let route = req.body.flights
        try {
            route = JSON.stringify(route)
        } catch (error) {
            return res.json(errorProcess)
        }
        if (!route) return res.json(missingQuery)
        if (!isSqlSafe(route)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.release()
            con.query(`INSERT INTO userflights VALUES ('${(<JWTPayload>payload).cid}', '${route}')`,(err, raws) => {
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    msg: 'upload success'
                })
            })
        })
    })
})

app.post('/efb-v2/user/upload',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['flight'])){
            return res.json(missingQuery)
        }
        let route = req.body.flight
        try {
            route = JSON.stringify(route)
        } catch (error) {
            return res.json(errorProcess)
        }
        if (!route) return res.json(missingQuery)
        if (!isSqlSafe(route)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            let sql = `INSERT INTO flightsdata (usercid, tempflights) VALUES (?, ?) ON DUPLICATE KEY UPDATE tempflights = ?`;
            let values = [(<JWTPayload>payload).cid, route, route];
            con.query(sql, values ,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    msg: 'upload success'
                })
            })
        })
    })
})

app.get('/efb-v2/user/getTempFlights',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err) return res.json(invalidToken)
        if (!(<JWTPayload>payload).scopes.includes('account')) return res.json(requestTooHigh)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`SELECT * FROM userflights WHERE usercid = '${(<JWTPayload>payload).cid}'`,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    data: raws[0] ? JSON.parse(raws[0].tempflights) : null
                })
            })
        })
    })
})

app.post('/efb-v2/user/unloadFlights',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`DELETE FROM userflights WHERE usercid = '${(<JWTPayload>payload).cid}'`,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    msg: 'success'
                })
            })
        })
    })
})

app.post('/efb-v2/user/deleteFlight',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['flight'])){
            return res.json(missingQuery)
        }
        const id = req.body.flight.id
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`DELETE FROM userflights WHERE flights LIKE '%${id}%'`,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    msg: 'success'
                })
            })
        })
    })
})

app.get('/efb-v2/user/getPinboard',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`SELECT * FROM userpinboard WHERE usercid = '${(<JWTPayload>payload).cid}'`,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                if (!raws || !raws[0] || !raws[0].pinboard){
                    return res.json({
                        code: 200,
                        data: []
                    })
                }
                try {
                    return res.json({
                        code: 200,
                        data: JSON.parse(raws[0].pinboard)
                    })
                } catch (error) {
                    return res.json({
                        code: 200,
                        data: []
                    })
                }
                
            })
        })
    })
})

app.post('/efb-v2/user/pinboardEvent',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['pinboard'])){
            return res.json(missingQuery)
        }
        let pinboard = req.body.pinboard
        try {
            pinboard = JSON.stringify(pinboard)
        } catch (error) {
            return res.json(errorProcess)
        }
        if (!pinboard) return res.json(missingQuery)
        if (!isSqlSafe(pinboard)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            let sql = `INSERT INTO userpinboard (usercid, pinboard) VALUES (?, ?) ON DUPLICATE KEY UPDATE pinboard = ?`;
            let values = [(<JWTPayload>payload).cid, pinboard, pinboard];
            con.query(sql, values ,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    msg: 'upload success'
                })
            })
        })
    })
})

app.post('/efb-v2/user/waypoint',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        if (!checkPayload(req.body, ['ident', 'type', 'location'])){
            return res.json(missingQuery)
        }
        let ident = req.body.ident
        let name = req.body.name
        let type = req.body.type
        let location = req.body.location
        let frequency = req.body.frequency
        if (!isSqlSafe(ident) || !isSqlSafe(type) || !isSqlSafe(location)) return res.json(invalidInput)
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            let sql = `INSERT INTO userwaypoints VALUES (?,?,?,?,?,?,?)`;
            let values = [(<JWTPayload>payload).cid, ident, type, location[1], location[0], frequency, name];
            con.query(sql, values ,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    msg: 'upload success'
                })
            })
        })
    })
})

app.get('/efb-v2/user/getWaypoint',(req, res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        pool.getConnection((err, con) => {
            if (err) return res.json(errorProcess)
            con.query(`SELECT * FROM userwaypoints WHERE usercid = '${(<JWTPayload>payload).cid}'` ,(err, raws) => {
                con.release()
                if (err) return res.json(errorProcess)
                return res.json({
                    code: 200,
                    data: raws
                })
            })
        })
    })
})

app.get('/efb-v2/user/useUserIntegral',(req, res) => {
    // 涉及用户部分，暂不提供。可以自定义积分规则
})

app.get('/efb-v2/user/navlink',(req,res) => {
    jwt.verify(getAccessToken(req), public_key, (err, payload) => {
        if (err){
            return res.json(invalidToken)
        }
        if (!(<JWTPayload>payload).scopes.includes('account')){
            return res.json(requestTooHigh)
        }
        const cid = (<JWTPayload>payload).cid
        // navlink功能涉及Trish API，咱不公开提供
        axios.get(`Trish_api?cid=${cid}`).then(r => {
            if (r.data.error){
                return res.json({
                    code: 200,
                    data: null
                })
            }
            return res.json({
                code: 200,
                data: r.data
            })
        }).catch(() => res.json(errorProcess))
    })
})

app.post('/efb-v2/OAuth2.0/authorize',(req, res) => {
    // 涉及用户部分，暂不提供。可以自定义积分规则
})

app.get('/efb-v2/airac',(req, res) => {
    fs.readFile('./config/airac/airac.json',(err, buffer) => {
        return res.json(JSON.parse(buffer.toString()))
    })
})

// 测试使用
app.get('/efb-v2/occ/get',(req, res) => {
    return res.json({
        code: 200,
        ticket: getRandomString(36),
        valid_time: 1800
    })
})


app.get('/efb-v2/', (req, res) => {
    // https://dev.skylineflyleague.cn TODO 尚未开放
    res.send(`
    <h1 style="color:orangered">Welcome to the SKYline EFB API Center! </h1>
    <h3>For development docs please visit: https://dev.skylineflyleague.cn</h3>
    <h3>If you have any questions, feel free to contact us for help</h3>
    <h3>Happy developing!</h3>
    `)
})

app.listen(8087, () => {
    console.log('SKYline EFB API is running on port 8087~')
})