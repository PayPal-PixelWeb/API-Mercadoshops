const express = require('express');
const request = require('request');
const rp      = require('request-promise');
const config  = require('./config');
const app = express();

const baseURL= 'https://api.mercadoshops.com/v1/shops';

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', (req, res) => {
    res.send('BEIA Y BONITA API');
})

/*
---versión ideal:
app.get('/api/v1/ordenes/:marca', (req,res)=>{

})
*/

app.get('/:marca', (req,res)=>{

    request(`${baseURL}/${config[req.params.marca].storeId}/orders/search?access_token=${config[req.params.marca].token}`, (err, response, body) => {
        let b = JSON.parse(body);
        let total = b.paging.total;
        let paging = total/50;
        let pagingTotal = paging.toFixed(0);
        console.log(pagingTotal)
        resultados = [];
        promesas = [];

        if(total%50 !== 0 || total%50 == 0){
            let offset = 0;

            //iteramos en la paginación
            for(let i = 0; i<=pagingTotal; i++ ){
               console.log("página:" +i)
               //hacemos get y lo almacenamos en variable
               let peticion =  rp.get(`${baseURL}/${config[req.params.marca].storeId}/orders/search?access_token=${config[req.params.marca].token}&offset=${offset}&limit=50`)
               //guardamos esa variable en un arreglo
                promesas.push(peticion);
                //subimos el offset
                offset += 50;
            }
        }

        //cuando ya acabó de hacer peticiones ejecutamos el promise.all
        //esto nos da la posibilidad de procesar los datos de todos los get juntos :D
        Promise.all(promesas)
            .then( (promesa) => {
                let arr = [];
                let r = promesa.map( (p, index) => {
                    let parce = JSON.parse(p);
                    return parce.results;
                })

                //convertimos el arreglo de dos dimensiones en una dimensión
                //iteramos las veces necesarias en el arreglo principal
                //luego iteramos en el arreglo dentro del arreglo para hacerle push a arr y sacar lo que hay dentro (if you know what i mean)
                for(let j = 0; j<r.length; j++){
                    for(let k =0; k<r[j].length; k++){
                        arr.push(r[j][k]);
                    }

                }

                console.log(arr.length)
                res.send({"result":arr})
            })
    })
})

/* app.listen(3030, () =>{
    console.log('Oh, hi Mark');
}) */
app.listen(process.env.PORT || 5000);
console.log('Magic on 5000');