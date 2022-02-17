const path = require('path')
const express = require("express");
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const parseString = require('xml2js').parseString;

//const listenPasarela = require('./src/api')
app.use(cors())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "X-Total-Count, Content-Range");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

//settings
app.set('port', process.env.PORT || 3100);

//static files
app.use(express.static(path.join(__dirname, 'public')));

//start the server
const server = app.listen(app.get('port'), () => {
    console.log("El servidor está inicializado en el puerto", app.get('port'));
});

const socketio = require('socket.io');
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
//const io = SocketIO(server);
/*
io.on('connection', (socket) => {
    console.log('new connection', socket.id)
    socket.on('chat:message', (data) => {
        console.log('llego', data)
        io.sockets.emit('chat:data', data);
    });

    socket.on('chat:write', (data) => {
        socket.broadcast.emit('chat:userWrite', data);
    });
})
*/

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));

async function listenPasarela(req, res) {
    try {
        //req.body = "multicash=<Multicash>  <BoletaPago>    <NumeroReferencia>120380833</NumeroReferencia>    <FechaEmision>2017-11-30T00:00:00</FechaEmision>    <FechaVencimiento>2017-12-04T00:00:00</FechaVencimiento>    <FechaPago>2017-11-30T00:00:00-05:00</FechaPago>    <ImporteTotal>338100.00</ImporteTotal>    <ImporteNeto>338100.00</ImporteNeto>    <ImporteImpuesto>0.00</ImporteImpuesto>    <CanalPago>EF</CanalPago>    <Emisor>      <TipoIdentificacion>1</TipoIdentificacion>      <NumeroIdentificacion>1015448115</NumeroIdentificacion>      <Nombre>jair+andres+diaz+puentes</Nombre>      <Email>jdiaz@transfiriendo.com</Email>    </Emisor>    <TotalDocumentos>1</TotalDocumentos>    <CodigoCompania>1345</CodigoCompania>  </BoletaPago>  <Banco>    <CodigoBanco>1647</CodigoBanco>    <NumeroCuenta>1647</NumeroCuenta>  </Banco>  <DetallePago>    <Pago>      <MedioPago>EF</MedioPago>      <Importe>338100.00</Importe>    </Pago>  </DetallePago>  <Documentos>    <Documento>      <IdentificadorDocRecaudado>120001100</IdentificadorDocRecaudado>      <ImporteRecaudado>338100.00</ImporteRecaudado>      <SaldoDocRecaudado>0.00</SaldoDocRecaudado>    </Documento>  </Documentos>  <Suscripcion>    <Cobro>      <NumeroCobro>0</NumeroCobro>    </Cobro>  </Suscripcion></Multicash>"
        console.log(req.body.multicash)
        var multicash;
        var today = new Date();
        var xml = req.body.multicash;
        xml = xml.substring(0, xml.length);
        var responsemulticash;
        var referencia;
        var referenciaorigen;
        var tipoidentificacion;
        var numeroidentificacion;
        var montorecaudo;
        var datos;
        var resp1 = {}
        var si_movimiento = false
        let error = false;

        parseString(xml, function (err, result) {
            if (err) {
                console.log('linea 23', err)
                multicash = null;
                responsemulticash = {
                    "message": "Multicash no interpretado",
                    "timestamp": today.toISOString(),
                    "multicash": xml,
                    "detalle": {},
                    "estado": "pendiente"
                };
                res.send(400, error.message);
            } else {
                console.log('linea 33')
                multicash = result;
                responsemulticash = {
                    "message": "Multicash procesado",
                    "timestamp": today.toISOString(),
                    "multicash": multicash
                }
                referencia = multicash.Multicash.BoletaPago[0].NumeroReferencia[0];
                referenciaorigen = multicash.Multicash.Documentos[0].Documento[0].IdentificadorDocRecaudado[0].toString();
                montorecaudo = multicash.Multicash.DetallePago[0].Pago[0].Importe[0];
                console.log('linea 44')

                // leo datos de datos del presupuesto y poder devoler datos de emision
                //dbxx2.collection('movimientos').find({npresupuesto: parseInt(referenciaorigen)}).toArray(function(error, data) {

                if (error) {
                    console.log('linea 49')
                    console.log(error);
                    responsemulticash = {
                        "message": "Multicash no procesado, error consultando presupuesto",
                        "timestamp": today.toISOString(),
                        "multicash": multicash,
                        "detalle": {},
                        "estado": "pendiente"
                    };
                    res.send(400, error.message);
                }
                //se borra el else para que si o si pase por aca
                let nombreCanal = "closeModal_" + referenciaorigen;
                console.log(nombreCanal)
                io.on('connection', (socket) => {
                    console.log('new connection', socket.id)
                    //el nombre del canal es el mismo numero de referencia para que sea unico 
                    io.emit(referenciaorigen, responsemulticash);
                    io.emit(nombreCanal, true);
                    // socket.disconnect();

                    // socket.on('disconnect', () => {
                    //     console.log('entre al disconnect')
                    //     console.log('ya pase por el disconnect')

                    // })
                })
                res.send(200, 'exito')
            }
            console.log('linea 130: ', responsemulticash)
            console.log('referencia:', referenciaorigen, "response:", responsemulticash)
            return res;
        })
    } catch (error) {
        console.log('linea 72')
        console.log(error)
    }

}

app.post('/listenPasarela', listenPasarela);