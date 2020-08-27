import * as fs from "fs";

export class FileUtils {
    public static removeAll(filePaths: Array<string>) {
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                console.log(`remove file : ${filePath}`);
                fs.unlinkSync(filePath);
            }
        });
    }
}
