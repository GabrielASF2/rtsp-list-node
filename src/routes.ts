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

        const ws2 = fileSystem.createWriteStream("data.csv");
        const csvStream = csv.format({ headers: ["GID", "URL", "SID", "STATE", "CAMS" ] });

        for await(let line of productsLine ) {
            const row = line.split(",");

           
           
            rtspA.push(`${row[0]}-${row[8]} ${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeA} ${row[0]} 2 ${row[9]} `);
            rtspB.push(`${row[0]}-${row[8]} ${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeB} ${row[0]} 2 ${row[9]} `);
            
            csvStream.write({
                GID: `${row[0]}-${row[8]}`, 
                URL: `rtsp://${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeB}`, 
                SID: `${row[0]}`, 
                STATE: '2', 
                CAMS: `${row[9]}` });
        }
        csvStream.pipe(ws2).on('end', () => process.exit());
        csvStream.end();

      return response.json(rtspB);

    }
);

export { router };