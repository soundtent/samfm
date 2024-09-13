var statusUrl = "https://locus.creacast.com:9443/status-json.xsl";

async function getStatus() {
    try {
        const response = await fetch(statusUrl);
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        const serverUrls = json.icestats.source.map((x) => x.listenurl.replace("http://locus.creacast.com:9001", "https://locus.creacast.com:9443") );
        const dashboardUrls = $(".dashboard__stream-url");

        dashboardUrls.each(function(index, element) {
            if (serverUrls.includes(element.href) ) {
                $(element).closest("tr").addClass("bold");
            }
        });
    } catch (error) {
        console.error(error.message);
    }
}

getStatus();