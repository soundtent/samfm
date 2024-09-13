var statusUrl = "https://locus.creacast.com:9443/status-json.xsl";

async function getStatus() {
    try {
        const response = await fetch(statusUrl);
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}

getStatus();