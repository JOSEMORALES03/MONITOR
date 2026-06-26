let ip = "192.168.1.20";
let intervalo = 4000;
let timer;
let modoActual = "auto";

function encender(){
    fetch(`http://${ip}/relay?state=1`);
}

function apagar(){
    fetch(`http://${ip}/relay?state=0`);
}

function setMode(mode){

    fetch(`http://${ip}/mode?mode=${mode}`).catch(()=>{});

    const manualControls = document.getElementById("manualControls");

    if(!manualControls) return;

    if(mode === "manual"){

        manualControls.style.display = "block";

        document.getElementById("manualBtn")?.classList.add("activo");
        document.getElementById("manualBtn")?.classList.remove("inactivo");

        document.getElementById("autoBtn")?.classList.add("inactivo");
        document.getElementById("autoBtn")?.classList.remove("activo");

    }else{

        manualControls.style.display = "none";

        document.getElementById("autoBtn")?.classList.add("activo");
        document.getElementById("autoBtn")?.classList.remove("inactivo");

        document.getElementById("manualBtn")?.classList.add("inactivo");
        document.getElementById("manualBtn")?.classList.remove("activo");
    }
}

function guardarIP(){
    ip = document.getElementById("ipInput").value;
    actualizarDatos();
}

function obtenerColorTemp(valor){
    if(valor <= 30 && valor >= 18) return "verde";
    if((valor <= 45 && valor >= 31) || (valor < 18 && valor >= 10)) return "amarillo";
    return "rojo";
}

function obtenerColorHum(valor){
    if(valor >= 60 && valor <= 70) return "verde";
    if(valor >= 45 && valor <= 85) return "amarillo";
    return "rojo";
}

function obtenerColorSuelo(valor){
    if(valor >= 70 && valor <= 80) return "verde";
    if(valor >= 60 && valor <= 85) return "amarillo";
    return "rojo";
}

function obtenerColorLluvia(valor){
    return valor ? "Lloviendo" : "seco";
}

async function actualizarDatos(){

    const estado = document.getElementById("estado");

    try{

        const res = await fetch(`http://${ip}/datos`, {
            cache: "no-store"
        });

        const text = await res.text();
        console.log("RAW:", text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log("JSON inválido:", text);
            estado.textContent = "Sin conexión";
            estado.classList.add("desconectado");
            estado.classList.remove("conectado");
            return;
        }

        let temp = Number(data.temperatura);
        let hum = Number(data.humedad);
        let suelo = Number(data.suelo);
        let lluvia = Number(data.lluvia);

        document.getElementById("temperatura").textContent = temp + " °C";
        document.getElementById("humedad").textContent = hum + " %";
        document.getElementById("suelo").textContent = suelo + " %";
        document.getElementById("lluvia").textContent = lluvia ? "Lloviendo" : "No llueve";

        let cardT = document.getElementById("temperatura").parentElement;
        let cardH = document.getElementById("humedad").parentElement;
        let cardS = document.getElementById("suelo").parentElement;
        let cardL = document.getElementById("lluvia").parentElement;

        cardT.classList.remove("verde","amarillo","rojo");
        cardH.classList.remove("verde","amarillo","rojo");
        cardS.classList.remove("verde","amarillo","rojo");
        cardL.classList.remove("Lloviendo","seco");

        cardT.classList.add(obtenerColorTemp(temp));
        cardH.classList.add(obtenerColorHum(hum));
        cardS.classList.add(obtenerColorSuelo(suelo));
        cardL.classList.add(obtenerColorLluvia(lluvia));

        estado.textContent = "Conectado";
        estado.classList.add("conectado");
        estado.classList.remove("desconectado");

        modoActual = data.modo || "auto";

        const estadoModo = document.getElementById("modo");
        if(estadoModo){

            estadoModo.textContent = modoActual.toUpperCase();

            estadoModo.classList.remove("auto", "manual");
            estadoModo.classList.add(modoActual);
        }

    } catch(e){

        console.log("Error conexión:", e);

        document.getElementById("temperatura").textContent = "Sin conexión";
        document.getElementById("humedad").textContent = "Sin conexión";
        document.getElementById("suelo").textContent = "Sin conexión";
        document.getElementById("lluvia").textContent = "Sin conexión";

        estado.textContent = "Sin conexión";
        estado.classList.add("desconectado");
        estado.classList.remove("conectado");
    }
}

function iniciarLoop(){
    if(timer) clearInterval(timer);
    timer = setInterval(actualizarDatos, intervalo);
}

function cambiarIntervalo(){
    let seg = document.getElementById("intervalInput").value;
    intervalo = seg * 1000;
    iniciarLoop();
}

actualizarDatos();
iniciarLoop();

document.getElementById("autoBtn")?.classList.add("activo");
document.getElementById("manualBtn")?.classList.add("inactivo");