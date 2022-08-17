import { Request, Response, Router } from "express";
import { Readable } from "stream";
import readline from "readline";
import multer from "multer";
import { format } from "path";
import { arch } from "os";
import { url } from "inspector";
var bodyParser = require('body-parser');

/* -- Libs ---  */
require('dotenv').config();
const multerConfig = multer();
const fileSystem = require("fs");
const csv = require('fast-csv');
const router = Router();
const convert = require('json-2-csv');
let csvToJson = require('convert-csv-to-json');

/* -- Roter Use ---  */
router.use(bodyParser.raw());
router.use(bodyParser.json());
/*router.use(bodyParser.urlencoded({
    extended: true
  }));*/


/* -- Router Post '/csv' - Read a CSV file and Create a new Csv File ---  */
router.post(
    "/csv", 
    multerConfig.single("file"), 
    async (request: Request, response: Response) => {
        const { file } = request;
        const buffer = file?.buffer;

        const readableFile = new Readable();
        readableFile.push(buffer);
        readableFile.push(null);

        const productsLine = readline.createInterface({
            input: readableFile
        });

        const rtspA = [];
        const rtspB = [];
        const typeA = process.env.TYPE_A;
        const typeB = process.env.TYPE_B;
        
        var gidSufx ='';
        var tempSid = '';
        var indx = 0;

        const ws = fileSystem.createWriteStream("data.csv");
        const csvStream = csv.format({ headers: ["GID", "SID", "URL", "STATE", "CAMS"] });

        for await(let line of productsLine ) {
            const row = line.split(",");
            gidSufx = row[0].padStart(4, '0');
            
            if ('INTELBRAS' == row[2].toUpperCase()) {
                for (let idx = 0; idx < parseInt(row[9]); idx++) {
                    const channel = typeA?.replace('$CH', (idx+1).toString());
                    const sid = `${idx+1}02`;
                    const url = `rtsp://${row[6]}:${row[7]}@${row[4]}:${row[5]}/${channel}`;
                    //rtspA.push(`${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]} `);
                    rtspA.push(indx > 0 ? `${indx}-${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]}` : `${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]}`);
                    csvStream.write({
                        GID: indx > 0 ? `${indx}-${row[8]}-${gidSufx}` : `${row[8]}-${gidSufx}`, 
                        SID: sid, 
                        URL: url,
                        STATE: '2', 
                        CAMS: `${row[9]}` 
                    });
                    if (idx+1 == parseInt(row[9])) {
                        console.log(`${tempSid} - ${gidSufx}`);
                        if (tempSid == '' || tempSid == gidSufx) {
                            indx = indx+1;    
                        } else {
                            indx = 0;
                        }                        
                    };
                }    
            } else {
                for (let idx = 0; idx < parseInt(row[9]); idx++) {
                    const channel = typeB?.replace('$CH', (idx+1).toString());
                    const sid = String(channel?.split('/')[2]);
                    const url = `rtsp://${row[6]}:${row[7]}@${row[4]}:${row[5]}/${channel}`;
                    rtspB.push(indx > 0 ? `${indx}-${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]}` : `${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]}`);                 
                    csvStream.write({
                        GID: indx > 0 ? `${indx}-${row[8]}-${gidSufx}` : `${row[8]}-${gidSufx}`, 
                        SID: sid, 
                        URL: url,
                        STATE: '2', 
                        CAMS: `${row[9]}` 
                    });
                    if (idx+1 == parseInt(row[9])) {
                        console.log(`${tempSid} - ${gidSufx}`);
                        if (tempSid == '' || tempSid == gidSufx) {
                            indx = indx+1;    
                        } else {
                            indx = 0;
                        }                        
                    };    
                }
            }
            tempSid = gidSufx;

        }

        csvStream.pipe(ws).on('end', () => process.exit());
        csvStream.end();
        

       return response.jsonp(rtspA);

    }
);
/* -- Router Get - Download the file created in the route Post '/csv'   ---  */
router.get(
    "/download", 
    async (request, response) => {
        response.download('data.csv')
    }    
);
/* -- Router Post '/json' - Read a JSON and response a new Json File ---  */
router.post(
    "/json",
    async (req, res) => {
        const jsonRes = new Array();
        let dataIn = JSON.parse(JSON.stringify(req.body));

        for(let indx = 0; indx < dataIn.length; indx++) {
            var gidSufx = dataIn[indx].code.padStart(4, '0');
            
            const typeA = process.env.TYPE_A;
            const typeB = process.env.TYPE_B;
        
            if ('INTELBRAS' == dataIn[indx].brand.toUpperCase()) {
                for (let idx = 0; idx < parseInt(dataIn[indx].camerasAtivas); idx++) {
                    const channel = typeA?.replace('$CH', (idx+1).toString());
                    const sid = `${idx+1}02`;
                    const url = `rtsp://${dataIn[indx].user}:${dataIn[indx].pwd}@${dataIn[indx].addr}:${dataIn[indx].port}/${channel}`;
                        jsonRes.push({
                            GID: `${dataIn[indx].ctid}-${gidSufx}`,
                            SID: sid,
                            URL: url,
                        });
                    }    
            } else {
                for (let idx = 0; idx < parseInt(dataIn[indx].camerasAtivas); idx++) {
                    const channel = typeB?.replace('$CH', (idx+1).toString());
                    const sid = String(channel?.split('/')[2]);
                    const url = `rtsp://${dataIn[indx].user}:${dataIn[indx].pwd}@${dataIn[indx].addr}:${dataIn[indx].port}/${channel}`;
                        jsonRes.push({
                            GID: `${dataIn[indx].ctid}-${gidSufx}`,
                            SID: sid,
                            URL: url,
                        });                        
                    }
                }
        }

        return res.json(jsonRes)
    }


);
export { router };