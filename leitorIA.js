const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_GEMINIAI_KEY);

function fileToGenerativePart(path, mimeType){
    return{
         inlineData:{
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
         },
    };
}
//   MODELO DE LEITURA 1 a 1
async function run(caminho){
    
        const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"});

        const prompt = "Analise a imagem e retorne com as palavras em formato JSON, retorne apenas o as palavras de NF-e e o numero seguinte. Retorne apenas o codigo. nao insira ```json  ```";
        
        const imageParts = [fileToGenerativePart(caminho, "image/jpeg")        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        const cutText = JSON.parse(text)
        const NFe = cutText["NF-e"]
        console.log(NFe)
        console.log(text)
        return NFe
}
// FUNCAO PARA RENOMAR DE ACORDO COM OS NOMES RETORNADOS
function renomeandoArquivos(antigo, novo){
     fs.rename(antigo, novo, (err) => {
                if (err) throw err;
                console.log('Renameação completa!');
              });
}

//   MODELO DE LEITURA 1 a 1
// run();
fs.readdir('images/', async (error, files) => {
    if (error) {
        console.error('Error reading directory:', error); // More informative error handling
    } else {
        let awaitTime = 1
        for (const filename of files) {
            if (awaitTime >= 15) {
              console.log("Limite alcançado, espere 1 minuto para continuar...");
              await new Promise((resolve) => setTimeout(resolve, 60000)); // 1-minute delay
              awaitTime = 1; // Reset counter
            }
        
            console.log(`Encontrando arquivo: ${filename}`);
            const renameCanhoto = await run(`images/${filename}`);
            console.log(awaitTime);
            renomeandoArquivos(`images/${filename}`, `images/${renameCanhoto}.jpg`);
            console.log(`Arquivo renomeado para: [${renameCanhoto}.jpg] seguindo para o próximo...`);
            awaitTime++;
          }
        }
    }
  );