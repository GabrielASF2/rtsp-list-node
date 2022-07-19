import { Request, Response, Router } from "express";
import { Readable } from "stream";
import readline from "readline";
import multer from "multer";
require('dotenv').config();
const multerConfig = multer();
const xl = require('excel4node');

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

        

        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Worksheet Name');

        const headingColumnNames =["GID", "URL", "SID", "STATE", "CAMS" ];
        
        let headingColumnIndex = 1;
        headingColumnNames.forEach(heading => {ws.cell(1, headingColumnIndex++).string(heading)});
        
        let rowIndex =2;
        let columnIndex = 1;
        for await(let line of productsLine ) {
            const row = line.split(",");
           
            rtspA.push(`${row[0]}-${row[8]} ${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeA} ${row[0]} 2 ${row[9]} `);
            rtspB.push(`${row[0]}-${row[8]} ${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeB} ${row[0]} 2 ${row[9]} `);
            
            ws.cell(rowIndex, 1).string(`${row[0]}-${row[8]}`);
            ws.cell(rowIndex, 2).string(`${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeA}`);
            ws.cell(rowIndex, 3).string(`${row[0]}`);
            ws.cell(rowIndex, 4).string(`2`);
            ws.cell(rowIndex, 5).string(`${row[9]}`);
            rowIndex = rowIndex +1;
        }


        wb.write('rtsp.xlsx');



        return response.json(rtspA);

    }
);

export { router };