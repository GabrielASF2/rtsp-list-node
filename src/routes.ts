import { Request, Response, Router } from "express";
import { Readable } from "stream";
import readline from "readline";
import multer from "multer";
import { format } from "path";

require('dotenv').config();

const multerConfig = multer();
const fileSystem = require("fs");
const csv = require('fast-csv');
const router = Router();
let csvToJson = require('convert-csv-to-json');



router.post(
    "/protocols", 
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
                    rtspA.push(`${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]} `);
                    csvStream.write({
                        GID: `${row[8]}-${gidSufx}`, 
                        SID: sid, 
                        URL: url,
                        STATE: '2', 
                        CAMS: `${row[9]}` 
                    });
                }    
            } else {
                for (let idx = 0; idx < parseInt(row[9]); idx++) {
                    const channel = typeB?.replace('$CH', (idx+1).toString());
                    const sid = String(channel?.split('/')[2]);
                    const url = `rtsp://${row[6]}:${row[7]}@${row[4]}:${row[5]}/${channel}`;
                    rtspB.push(`${row[8]}-${gidSufx} ${sid} ${url} 2 ${row[9]} `);                    
                    csvStream.write({
                        GID: `${row[8]}-${gidSufx}`, 
                        SID: sid, 
                        URL: url,
                        STATE: '2', 
                        CAMS: `${row[9]}` 
                    });    
                }
            }

        }

        csvStream.pipe(ws).on('end', () => process.exit());
        csvStream.end();

       return response.json(rtspA);

    }
);

router.get(
    "/download", 
    async (request, response) => {

        let fileInputName = 'data.csv';
        let fileOutputName = 'data.json';
        csvToJson.parseSubArray('*',',').generateJsonFileFromCsv(fileInputName,fileOutputName);


        response.download('data.csv', 'data.json');
    }

    
);

router.put(
    "/json",
    multerConfig.single("file"), 
     async (request: Request, response: Response) => {
       

       const { file } = request;
        const buffer = file?.buffer;

        //const readableFile = new Readable();
        //readableFile.push(buffer);
        console.log(buffer?.toString());
    }




);

router.put(
    "/json2",
    async (req, res) => {
        //req?.body;
        console.log(req.body);
    }
    




);
export { router };