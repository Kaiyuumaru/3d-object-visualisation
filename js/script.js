const CLIENT_ID = "610360161050-u6mui0vi08g5dqf0hfb4h2cac02iur8r.apps.googleusercontent.com";
const SPREADSHEET_ID = "1cmX7E6XYlYB2olC7Qn_arwoDPOzJYyvqpeIiCvWYcsc";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

let tokenClient;
let accessToken = null;

window.onload = function(){
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SHEETS_SCOPE,
        callback: handleAuthorization
    })
}

document.getElementById("google-signin").onclick = function(){
    console.log("Requesting Google Sheets authorization");
    document.getElementById("status").textContent = "Verifying access to the Google spreadsheet...";
    tokenClient.requestAccessToken({
        prompt: "consent"
    });
};


function handleAuthorization(response){
    if(response.error){
        console.error("Authorization failed: ", response);
        document.getElementById("status").textContent = "Authorization failed.";
        return;
    }

    accessToken = response.access_token;
    console.log("Google Sheets authorization successful");
    document.getElementById("status").textContent = "Google Sheets authorization successful.";
    verifySheetAccess();
}


async function verifySheetAccess(){
    console.log("Testing Google Sheets API...");
    document.getElementById("status").textContent = "Reading Google Sheets content...";

    const range = "A:Z";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
    //const url = "https://sheets.googleapis.com/v4/spreadsheets/" + SPREADSHEET_ID + "/values/" + encodeURIComponent(range);

    try{
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
                //Authorization: "Bearer " + accessToken
            }
        });

        if(!response.ok){
            const errorText = await response.text();
            console.error("Google Sheets API error: ", response.status, errorText);

            document.getElementById("status").textContent = "Google Sheets access denied.";
            return;
        }

        const data = await response.json();
        console.log("Google Sheets data: ", data);
        document.getElementById("status").textContent = "Google Sheets access successful.";
        sessionStorage.setItem("sheetData", JSON.stringify(data, null, 2));
        sessionStorage.setItem("loggedIn", "true");
        loading();
    }

    catch(error){
        console.error("Failed to access Google Sheets: ", error);
        document.getElementById("status").textContent = "Failed to access Google Sheets.";
    }
}


function loading(){
    window.location.href = "loading.html";
}