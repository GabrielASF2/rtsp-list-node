import { Request, Response, Router } from "express";
import { Readable } from "stream";
import readline from "readline";
import multer from "multer";
require('dotenv').config();
const multerConfig = multer();

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

        for await(let line of productsLine ) {
            const row = line.split(",");
           
            rtspA.push(`${row[0]}-${row[8]} ${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeA?.replace("$CH",`${row[9]}`)} ${row[0]} 2 ${row[9]} `);
            rtspB.push(`${row[0]}-${row[8]} ${row[6]}:${row[7]}@${row[4]}:${row[5]}/${typeB?.replace("$CH",`${row[9]}`)} ${row[0]} 2 ${row[9]} `);

        }
        return response.json(rtspB);

    }
);

export { router };