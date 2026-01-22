
const apiKey = "AIzaSyCNkPdH3Jnq2LFdX95QGO_oNdIPxN9juug";
import fs from 'fs';

async function run() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        let output = "--- Available Models ---\n";
        if (data.models) {
            data.models.forEach(m => {
                // Log everything to be sure
                output += `${m.name} (Supported: ${m.supportedGenerationMethods?.join(', ')})\n`;
            });
        } else {
            output += "No models found or error: " + JSON.stringify(data);
        }
        fs.writeFileSync('models.txt', output);
        console.log("Written to models.txt");
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

run();
