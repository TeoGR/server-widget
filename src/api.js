const parseString = require('xml2js').parseString;

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
                console.log(referencia)
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
                } else {
                    console.log('linea 60')
                    //enviar info por el socket
                    socket.emit('FromAPI', referencia)

                    return res.send(200, 'exito')
                }
            }
        })
    } catch (error) {
        console.log('linea 72')
        console.log(error)
    }

}

module.exports = {
    listenPasarela
}