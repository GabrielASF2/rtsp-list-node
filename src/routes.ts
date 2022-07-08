import { Request, Response, Router } from "express";
import { Readable } from "stream";
import readline from "readline";
import multer from "multer";



const multerConfig = multer();

const router = Router();

interface Product {
    code_bar: string; 
    description: string;
    price: string;
    quantity: string;
}

router.post(
    "/products", 
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

        for await(let line of productsLine ) {
            const row = line.split(",");
           
            rtsp.push(`${row[7]}:${row[8]}@${row[5]}:${row[6]}`)
        }


        
        return response.json(rtsp);

    }
);

export { router };