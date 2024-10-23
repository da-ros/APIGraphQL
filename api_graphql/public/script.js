
async function fetchProducts() {
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                {
                products {
                    id
                    name
                    value
                }
                }
            `,
        }),
    });

    if (!response.ok) {
        console.error('Error en la solicitud GraphQL:', response.statusText);
        mostrar_no_data();
        return;
    }

    const data = await response.json();
    console.log(data);
    const products = data.data.products;

    if (Array.isArray(products) && products.length > 0 ) {
        poblar_tabla(products);        
    } else {
        mostrar_no_data();
    }
    
}

function mostrar_no_data() {
    var listado = document.getElementById("product-list");
    listado.parentNode.removeChild(listado);
    var div = document.createElement("div");
    div.id = "product-list";
    div.className = "hit-the-floor";
    div.innerHTML = "<text> SIN PRODUCTOS REGISTRADOS </text>"
    document.body.appendChild(div)
}

function poblar_tabla(productos) {
    var listado = document.getElementById("product-list");        
    listado.parentNode.removeChild(listado);
    
    if (listado) {
        var div = document.createElement("div");
        div.id = "product-list";
        div.className = "listado_usuario"
        
        var tabla = document.createElement("table"); 
        tabla.appendChild(agregar_cabecera_tabla());
        tabla.appendChild(agregar_detalle_tabla(productos));        

        div.appendChild(tabla);
        document.body.appendChild(div)
    };    
}

function crear_celda(texto_celda, tipo) {
    var celda = document.createElement(tipo);
    var texto = document.createTextNode(texto_celda);
    celda.appendChild(texto);
    return celda;
}

function agregar_cabecera_tabla(){
    var cabecera = document.createElement("thead");
    var fila = document.createElement("tr");    
    var tituloTabla = document.createElement("th");
    var texto = document.createTextNode("Información de Productos");
    tituloTabla.setAttribute("colspan","4")    
    tituloTabla.appendChild(texto);    
    fila.appendChild(tituloTabla)
    cabecera.appendChild(fila);  

    fila = document.createElement("tr");    
    fila.appendChild(crear_celda("ID", "th"));
    fila.appendChild(crear_celda("Nombre", "th"));
    fila.appendChild(crear_celda("Valor", "th"));    
    fila.appendChild(crear_celda("", "th"));    
    
    cabecera.appendChild(fila);    
    return cabecera
}

function agregar_detalle_tabla(products) {
    var body = document.createElement("tbody");

    products.forEach(product => {
        var fila = document.createElement("tr");
        fila.appendChild(crear_celda(product["id"], "td"));
        fila.appendChild(crear_celda(product["name"], "td"));
        fila.appendChild(crear_celda(product["value"], "td"));
        
        var celda_modificar = document.createElement("td");
        var boton_modificar = document.createElement("button");        
        boton_modificar.id = `btn_actualizar_${product["id"]}`;
        boton_modificar.textContent = "MODIFICAR"
        boton_modificar.onclick = () => actualizar_producto(product);
        celda_modificar.appendChild(boton_modificar);
        fila.appendChild(celda_modificar);        
                        
        body.appendChild(fila);    
    });    
        
    return body
}


function actualizar_producto(product) {    
    document.getElementById('id').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('value').value = product.value;
    document.getElementById("form_producto").style.display  = "block";
}

function crear_producto() {
    document.getElementById('id').value = ""    
    document.getElementById("form_producto").style.display  = "block";
}


function cancelar_form() {
    document.getElementById('id').value = "" ;
    document.getElementById('name').value = "" ;
    document.getElementById('value').value = "";
    document.getElementById("form_producto").style.display  = "none";    
}

function validar_inputs() {
    let value = parseFloat(document.getElementById('value').value);
    return (
        document.getElementById('name').value === "" || 
        isNaN(value)
    );
}

async function guardar_producto() {

    if (validar_inputs()) {
        alert("Por favor rellene ambos campos");
        return;
    }
    let mensaje = "Producto actualizado con éxito";    
    let accion = "UPDATE";
    
    if (document.getElementById("id").value === "") {
        mensaje = "Producto creado con éxito";                
        accion = "CREAR";
    }         
    const mutation = buildMutation(accion);        

    await saveProduct(mutation)   
        
    await fetchProducts();
    cancelar_form();  //clear and hidde the form
    alert(mensaje);
}

function buildMutation(accion) {    
    const name = document.getElementById('name').value.replace(/"/g, '\\"');
    const value = parseFloat(document.getElementById('value').value);  

    if (accion === "CREAR") {
        return `addProduct(name: "${name}", value: ${value})`
    } else {
        const id = document.getElementById("id").value;
        return `updateProduct(id: "${id}", name: "${name}", value: ${value})`
    }
}

async function saveProduct(mutation) {    
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        query: `
            mutation {
                ${mutation} {
                    id
                    name
                    value
                }
            }
        `,
        }),
    }); 
}
