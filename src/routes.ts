import { Request, Response, Router } from "express";
import { Readable } from "stream";
import readline from "readline";
import multer from "multer";
require('dotenv').config();
const multerConfig = multer();

const router = Router();
interface Product {
    code_bar: string; 
    description: string;
    price: string;
    quantity: string;
}

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

        const products: Product [] = [];
        const rtsp = [];
        const intelbras = process.env.INTELBRAS;

        for await(let line of productsLine ) {
            const row = line.split(",");
           
            rtsp.push(`${row[7]}:${row[8]}@${row[5]}:${row[6]}/${intelbras?.replace("$CH","${row[10]}")}`)
        }
        return response.json(rtsp);

    }
);

export { router };